import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import PageHero from "./PageHero";
import YouTubePlayer from "./video/YouTubePlayer";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  Search, Play, Star, Clock, Eye, Calendar, X, 
  Sparkles, RotateCcw, TrendingUp, Compass, CheckCircle2,
  Trash2, ChevronRight, HelpCircle, ExternalLink
} from "lucide-react";

// Video entity interface
interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
}

// Search History interface
interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: any;
}

// Favorite Video interface
interface FavoriteVideoItem {
  id: string; // firestore document id
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
}



export default function WorkoutVideos() {
  const { user } = useApp();
  
  // App view modes: "search" or "favorites"
  const [activeTab, setActiveTab] = useState<"search" | "favorites">("search");

  // Smoothly scroll to the top of the viewport whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Core search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);

  // Suggestions search list
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // History & Favorites state
  const [historyList, setHistoryList] = useState<SearchHistoryItem[]>([]);
  const [favoritesList, setFavoritesList] = useState<FavoriteVideoItem[]>([]);
  
  // UI Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Defined static filter groups
  const filterCategories = [
    { label: "Chest", value: "chest" },
    { label: "Back", value: "back" },
    { label: "Shoulders", value: "shoulders" },
    { label: "Arms", value: "arms" },
    { label: "Legs", value: "legs" },
    { label: "Abs", value: "abs" },
    { label: "Full Body", value: "full body" },
    { label: "Cardio", value: "cardio" },
    { label: "Fat Loss", value: "fat loss" },
    { label: "Muscle Gain", value: "muscle gain" },
    { label: "Strength", value: "strength" },
    { label: "Home Workouts", value: "home workouts" },
    { label: "Gym Workouts", value: "gym workouts" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" }
  ];

  // Quick popular search trigger cards
  const popularSearches = [
    { term: "Chloe Ting Six Pack", filter: "abs", subtitle: "Core Shaper" },
    { term: "Jeff Nippard Bench Science", filter: "chest", subtitle: "Pectoral Growth" },
    { term: "Athlean-X Wider Shoulders", filter: "shoulders", subtitle: "3D Deltoids" },
    { term: "Pamela Reif Fat Burn HIIT", filter: "cardio", subtitle: "EPOC Energy Boost" }
  ];

  // Show a snappy transient feedback banner
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---------------------------------------------------------
  // FIREBASE INTEGRATION ENGINE (Search History & Favorites)
  // ---------------------------------------------------------

  // Load User Search History
  const loadSearchHistory = async () => {
    if (!user) return;
    try {
      const historyRef = collection(db, "video_search_history");
      const q = query(historyRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list: SearchHistoryItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          query: data.query,
          timestamp: data.timestamp
        });
      });
      // Sort client-side is simpler than building complex composite indices on Firestore
      list.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setHistoryList(list.slice(0, 8)); // Display top 8 entries
    } catch (err) {
      console.warn("Could not query search history:", err);
    }
  };

  // Load User Favorited Videos
  const loadFavorites = async () => {
    if (!user) return;
    try {
      const favRef = collection(db, "favorite_videos");
      const q = query(favRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list: FavoriteVideoItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          videoId: data.videoId,
          title: data.title,
          channelTitle: data.channelTitle,
          thumbnail: data.thumbnail,
          duration: data.duration,
          viewCount: data.viewCount,
          publishedAt: data.publishedAt
        });
      });
      setFavoritesList(list);
    } catch (err) {
      console.warn("Could not query favorite videos:", err);
    }
  };

  // Add search term to history database
  const saveSearchToFirebase = async (term: string) => {
    if (!user || !term.trim()) return;
    try {
      // Avoid duplicate subsequent listings
      const isDuplicate = historyList.some(h => h.query.toLowerCase() === term.trim().toLowerCase());
      if (isDuplicate) return;

      const historyPath = "video_search_history";
      await addDoc(collection(db, historyPath), {
        userId: user.uid,
        query: term.trim(),
        timestamp: serverTimestamp()
      });
      loadSearchHistory();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "video_search_history");
    }
  };

  // Clear single search history item
  const deleteHistoryItem = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "video_search_history", docId));
      setHistoryList(prev => prev.filter(item => item.id !== docId));
      triggerToast("Deleted search entry.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `video_search_history/${docId}`);
    }
  };

  // Toggle saving/bookmarking a video in Firestore
  const toggleFavoriteVideo = async (video: YouTubeVideo) => {
    if (!user) {
      triggerToast("Sign in to favorite workouts and save lists!");
      return;
    }

    const exFav = favoritesList.find(f => f.videoId === video.id);

    if (exFav) {
      // Remove from favorites
      try {
        await deleteDoc(doc(db, "favorite_videos", exFav.id));
        setFavoritesList(prev => prev.filter(f => f.videoId !== video.id));
        triggerToast("Removed video from favorites.");
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `favorite_videos/${exFav.id}`);
      }
    } else {
      // Add to favorites
      try {
        const favPath = "favorite_videos";
        const newDoc = await addDoc(collection(db, favPath), {
          userId: user.uid,
          videoId: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnail: video.thumbnail,
          duration: video.duration,
          viewCount: video.viewCount,
          publishedAt: video.publishedAt,
          savedAt: new Date().toISOString()
        });
        setFavoritesList(prev => [
          ...prev, 
          {
            id: newDoc.id,
            videoId: video.id,
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnail: video.thumbnail,
            duration: video.duration,
            viewCount: video.viewCount,
            publishedAt: video.publishedAt
          }
        ]);
        triggerToast("Saved workout video to favorites!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "favorite_videos");
      }
    }
  };

  // Perform fetching search queries on component load
  useEffect(() => {
    // Fetch initial trending recommendation grid
    triggerSearch("", "", true);
    if (user) {
      loadSearchHistory();
      loadFavorites();
    }
  }, [user]);

  // Load suggestions as type-ahead autocomplete values
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        const res = await fetch(`/api/videos/suggestions?q=${encodeURIComponent(searchQuery)}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data && data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.warn("Suggestions error:", err);
      }
    }, 250); // debounce limit

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Execute actual videos search operation
  const triggerSearch = async (queryText: string, filterText: string, isTrending: boolean = false) => {
    setLoading(true);
    try {
      const finalQ = queryText === undefined ? searchQuery : queryText;
      const finalF = filterText === undefined ? selectedFilter : filterText;

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const url = `/api/videos/search?q=${encodeURIComponent(finalQ)}&filter=${encodeURIComponent(finalF)}&trending=${isTrending}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (data && data.success) {
        setVideos(data.videos);
        // Save search history on successful query
        if (finalQ.trim() && !isTrending) {
          saveSearchToFirebase(finalQ);
        }
      } else {
        triggerToast("Encountered an issue retrieving search data.");
      }
    } catch {
      triggerToast("Error accessing YouTube Search indexing proxy.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    triggerSearch(searchQuery, selectedFilter);
  };

  const handleSuggestionClick = (phrase: string) => {
    setSearchQuery(phrase);
    setShowSuggestions(false);
    triggerSearch(phrase, selectedFilter);
  };

  const handleFilterToggle = (val: string) => {
    const newVal = selectedFilter === val ? "" : val;
    setSelectedFilter(newVal);
    triggerSearch(searchQuery, newVal);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("");
    triggerSearch("", "", true);
  };

  const isPremium = user?.subscriptionStatus === "premium" || user?.role === "admin";

  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-sans">
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-radial-[circle_at_center,_rgba(16,185,129,0.04)_10%,_transparent_60%]" />
          
          <div className="h-14 w-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-red-500 uppercase tracking-widest">Premium Only Access</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Unlock Workout Video Guides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Unlock crystal-clear, high-definition instructional video workouts featuring perfect technique demonstrations by verified coaches and kinesiologists.
            </p>
          </div>

          {/* Premium Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2.5 text-xs text-slate-700 dark:text-slate-300 text-left">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Crystal-clear high definition streams</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Slow-motion technique and biomechanics coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full list of exercise variations for home and gym</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 min-h-screen">
      
      {/* Visual Header Banner */}
      <PageHero
        title="Workout Videos Library"
        subtitle="VOD Studio"
        description="Search, discover, and play along with premium fitness videos from world-leading coaches directly inside our application. Filters and bookmark lists save instantly to your personal cloud profile."
        imageUrl="https://cdn.muscleandstrength.com/sites/all/themes/mnsnew/images/taxonomy/exercises/equip/machine.jpg"
        category="VIDEO TUTORIALS"
      />

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-hidden">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-wider relative transition-all ${
            activeTab === "search"
              ? "text-blue-600 dark:text-blue-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Compass className="w-4 h-4" />
          Search Hub
          {activeTab === "search" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => {
            if (!user) {
              triggerToast("Connect your profile to access premium bookmarking!");
              return;
            }
            setActiveTab("favorites");
          }}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-wider relative transition-all ${
            activeTab === "favorites"
              ? "text-blue-600 dark:text-blue-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          My Saved Videos ({favoritesList.length})
          {activeTab === "favorites" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: SEARCH & DISCOVERY MODULE */}
      {activeTab === "search" && (
        <div className="space-y-10">
          
          {/* Main Controls Section (Search + Suggestions Panel) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              
              {/* Form Input Frame */}
              <form onSubmit={handleSearchSubmit} className="relative z-20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium shadow-md"
                      placeholder="Search dumbbell biceps routine, full body hiit, chest builder..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
                  >
                    Search Videos
                  </button>
                </div>

                {/* Live Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
                    {suggestions.map((item, id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSuggestionClick(item.replace("...", ""))}
                        className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-none text-xs font-semibold flex items-center gap-2.5 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Advanced Tags Ribbon */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Quick Targeted Filter Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {filterCategories.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => handleFilterToggle(f.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedFilter === f.value
                          ? "bg-blue-600 border-blue-600 text-white shadow-md font-extrabold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Search History panel (Right) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-start">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Recent History
              </h3>
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2">
                    Want to save your search log?
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Sign in to track your exercises trail.
                  </p>
                </div>
              ) : historyList.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 font-medium text-center">
                  Your recent search list is empty.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.query);
                        triggerSearch(item.query, selectedFilter);
                      }}
                      className="group/history inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-500/10 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 dark:hover:border-blue-500/20 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-605 dark:hover:text-blue-400 cursor-pointer select-none transition-all"
                    >
                      <span>{item.query}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(e, item.id)}
                        className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500"
                        title="Delete query log"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Categories Dashboard Grid */}
          {!searchQuery && !selectedFilter && (
            <div className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Popular Suggested Channels & Routines
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                  Discover Now
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularSearches.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(p.term);
                      setSelectedFilter(p.filter);
                      triggerSearch(p.term, p.filter);
                    }}
                    className="flex flex-col text-left p-5 rounded-2xl bg-white dark:bg-slate-950 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 hover:text-white border border-slate-150 dark:border-slate-850 hover:border-transparent transition-all group/pop relative overflow-hidden cursor-pointer shadow-sm shadow-black/[0.02]"
                  >
                    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 group-hover/pop:bg-white/10 blur-xl rounded-full translate-x-4 -translate-y-4" />
                    <span className="text-xs font-bold text-blue-500 dark:text-blue-400 group-hover/pop:text-blue-200 uppercase tracking-widest leading-none mb-1 block">
                      {p.filter}
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-gray-100 group-hover/pop:text-white line-clamp-1 mb-2">
                      {p.term}
                    </h4>
                    <span className="text-xs text-slate-450 dark:text-slate-400 group-hover/pop:text-slate-250 flex items-center gap-1.5 mt-auto">
                      {p.subtitle}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/pop:opacity-100 translate-x-[-4px] group-hover/pop:translate-x-0 transition-all" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos Grid Listing Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                {loading ? "Searching indices..." : searchQuery || selectedFilter ? "Search Matches" : "Trending Workout Videos"}
              </h2>
              {videos.length > 0 && (
                <span className="text-xs font-bold text-slate-450 dark:text-slate-400">
                  {videos.length} videos found
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-4 shadow-sm animate-pulse">
                    <div className="w-full h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-16 px-4">
                <Search className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto mb-4 stroke-1" />
                <h3 className="text-lg font-bold text-slate-805 dark:text-slate-105 mb-1">
                  No matching videos located
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  Verify your filter settings or spelling of items. Click clear to reload standard recommendations.
                </p>
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs"
                >
                  Reset Recommendations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                  const isSaved = favoritesList.some(f => f.videoId === video.id);
                  return (
                    <div
                      key={video.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-blue-500/30 hover:shadow-xl dark:hover:bg-slate-910 transition-all duration-300 relative"
                    >
                      {/* Image Box */}
                      <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-video mb-4 shadow">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <button
                            onClick={() => setCurrentVideo(video)}
                            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 transform scale-90 group-hover:scale-100 transition-all duration-300 cursor-pointer"
                          >
                            <Play className="w-5 h-5 ml-1 fill-white" />
                          </button>
                        </div>
                        
                        {/* Duration badge */}
                        <div className="absolute bottom-2.5 right-2.5 bg-black/75 px-2 py-1 rounded-md text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {video.duration}
                        </div>

                        {/* Favorite Star badge */}
                        <button
                          onClick={() => toggleFavoriteVideo(video)}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-full border border-black/10 shadow-md transition-all active:scale-90 ${
                            isSaved 
                              ? "bg-amber-400 text-slate-950 border-amber-300 fill-slate-950" 
                              : "bg-black/40 hover:bg-black/60 text-white hover:text-amber-400"
                          }`}
                          title="Favorite this workout"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info Area */}
                      <div className="flex-1 flex flex-col justify-start">
                        <h3
                          onClick={() => setCurrentVideo(video)}
                          className="text-sm font-extrabold tracking-tight text-slate-850 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-2 leading-snug cursor-pointer transition-colors"
                          title={video.title}
                        >
                          {video.title}
                        </h3>
                        <p className="text-xs text-slate-505 dark:text-slate-400 font-bold flex items-center gap-1 mb-3">
                          {video.channelTitle}
                          {(video.channelTitle.includes("Athlean-X") || video.channelTitle.includes("Nippard") || video.channelTitle.includes("Reif")) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 inline" />
                          )}
                        </p>
                      </div>

                      {/* Statistics Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {video.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {video.publishedAt}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY FAVORITES BOOKMARKS PANEL */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">
              My Saved Workout Videos
            </h2>
            <span className="text-xs font-bold text-slate-450 dark:text-slate-400">
              {favoritesList.length} total saved
            </span>
          </div>

          {favoritesList.length === 0 ? (
            <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-16 px-4">
              <Star className="w-12 h-12 text-amber-500 fill-amber-500/10 mx-auto mb-4 stroke-1" />
              <h3 className="text-lg font-bold text-slate-805 dark:text-slate-105 mb-1">
                Pinboard is clear
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                Save time by saving workout logs or guides that match your requirements. Simply tap the star icon on any video to bookmark it here.
              </p>
              <button
                onClick={() => setActiveTab("search")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold text-xs shadow"
              >
                Go to Search Hub
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesList.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-blue-500/30 hover:shadow-xl dark:hover:bg-slate-910 transition-all duration-300 relative"
                >
                  {/* Image Box */}
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100 aspect-video mb-4 shadow">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <button
                        onClick={() => setCurrentVideo(video as any)}
                        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-550 flex items-center justify-center text-white font-bold cursor-pointer transition-all scale-95 hover:scale-100"
                      >
                        <Play className="w-5 h-5 ml-1 fill-white" />
                      </button>
                    </div>

                    {/* Bookmarked label / delete overlay */}
                    <button
                      onClick={() => toggleFavoriteVideo(video as any)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-md active:scale-90 select-none cursor-pointer hover:bg-rose-500 hover:border-rose-400 hover:text-white"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Duration */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/75 px-2 py-1 rounded-md text-[10px] font-bold text-white">
                      {video.duration}
                    </div>
                  </div>

                  {/* Text area */}
                  <div className="flex-1 flex flex-col justify-start">
                    <h3
                      onClick={() => setCurrentVideo(video as any)}
                      className="text-sm font-extrabold tracking-tight text-slate-850 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-2 cursor-pointer transition-colors"
                    >
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3">
                      {video.channelTitle}
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {video.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {video.publishedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMBEDDED POPUP MODAL YOUTUBE OVERLAY */}
      {currentVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Backdrop screen filter lock */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setCurrentVideo(null)}
          />

          {/* Player Modal Shell */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden max-w-4xl w-full mx-auto aspect-video sm:aspect-auto sm:h-auto z-10 flex flex-col shadow-2xl animate-scale-up">
            
            {/* Top Close bar */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setCurrentVideo(null)}
                className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer transition-colors border border-white/15 shadow"
                title="Exit video player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Iframe Player */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center min-h-[220px] sm:min-h-[440px]">
              <YouTubePlayer
                videoId={currentVideo.id}
                title={currentVideo.title}
              />
            </div>

            {/* Bottom Title bar details */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 leading-snug line-clamp-1">
                  {currentVideo.title}
                </h2>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {currentVideo.channelTitle}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:self-center">
                <button
                  onClick={() => toggleFavoriteVideo(currentVideo)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                    favoritesList.some(f => f.videoId === currentVideo.id)
                      ? "bg-amber-400 text-slate-950 border-amber-300"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Star className={`w-4 h-4 ${favoritesList.some(f => f.videoId === currentVideo.id) ? "fill-slate-950" : ""}`} />
                  {favoritesList.some(f => f.videoId === currentVideo.id) ? "Favorited" : "Save Favorite"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Snappy Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl border border-slate-800 dark:border-slate-300 shadow-xl flex items-center gap-2 text-xs font-bold animate-slide-in">
          <Sparkles className="w-4 h-4 text-blue-400" />
          {toastMessage}
        </div>
      )}

    </div>
  );
}
