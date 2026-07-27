import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import PageHero from "./PageHero";
import { 
  MessageSquare, Heart, AlertTriangle, Send, ShieldAlert, Check,
  Sparkles, Filter, PlusCircle, CheckCircle, Tag, Image, Trash 
} from "lucide-react";

export default function CommunityView() {
  const { 
    user, 
    communityPosts, 
    addCommunityPost, 
    likePost, 
    commentOnPost, 
    reportPost, 
    moderatePost 
  } = useApp();

  const [filter, setFilter] = useState<string>("All");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<
    "Progress Picture" | "Workout Result" | "Transformation Story" | "Achievement" | "General Discussion" | "Challenge"
  >("General Discussion");
  const [newPostImage, setNewPostImage] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [successToast, setSuccessToast] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = [
    "All", "Progress Picture", "Workout Result", "Transformation Story", "Achievement", "General Discussion", "Challenge"
  ];

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await addCommunityPost(newPostContent, newPostCategory, newPostImage || undefined);
      setNewPostContent("");
      setNewPostImage("");
      setShowAddForm(false);
      setSuccessToast("Post shared to the AlexFitnessHub Athlete Feed!");
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = (postId: string) => {
    likePost(postId);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    commentOnPost(postId, commentText);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleReport = (postId: string) => {
    reportPost(postId);
    setSuccessToast("Content reported to administrators for strict review.");
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const filteredPosts = communityPosts.filter(post => {
    if (filter === "All") return post.status === "active";
    return post.category === filter && post.status === "active";
  });

  // Admin reported posts
  const reportedPosts = communityPosts.filter(post => post.status === "reported" || (post.reports && post.reports.length > 0));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER SECTION banner */}
      <PageHero
        title="Athlete Community Forum"
        subtitle="AlexFitnessHub Athle-Net"
        description="Discuss routines, share progress weights, motivate fellow warriors, and coordinate fitness challenges in real-time. Share your transformation journey with the world."
        imageUrl="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=600&auto=format&fit=crop"
        category="COMMUNITY ARENA"
      />

      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200/60 dark:border-slate-850">
        <div className="text-left">
          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white font-sans">Share your Progress</h3>
          <p className="text-[10px] text-slate-500 font-medium font-sans">Publish an update, post a lifting photo, or discuss training tips with elite athletes.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black font-mono uppercase tracking-widest flex items-center gap-2 transition duration-200 shadow-md shadow-emerald-900/10 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? "CLOSE PUBLISHER" : "SHARE UPDATE"}
        </button>
      </div>

      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 animate-pulse flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successToast}
        </div>
      )}

      {/* NEW POST FORM DRAWER */}
      {showAddForm && (
        <form onSubmit={handleCreatePost} id="community_publisher_form" className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-lg space-y-4 animate-slide-in">
          <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Vibe or Metric Updates
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Posting Category</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="General Discussion">General Discussion</option>
                <option value="Progress Picture">Progress Picture</option>
                <option value="Workout Result">Workout Result/Logged Set</option>
                <option value="Transformation Story">Transformation Journey</option>
                <option value="Achievement">Major Milestones/PRs</option>
                <option value="Challenge">Ecosystem Fitness Challenge</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Attach Image URL (Optional)</label>
              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="https://images.unsplash.com/your-athletic-photo"
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Update Message Content</label>
            <textarea
              required
              rows={4}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What compound lifts did you complete? Share raw thoughts or recovery protein smoothies recipes..."
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs font-black font-mono uppercase tracking-widest rounded-xl transition"
          >
            PUBLISH TO FEED
          </button>
        </form>
      )}

      {/* FILTER BUTTONS & MAIN FEED LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* FILTERS COLUMN */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-[10px] font-black uppercase font-mono tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter Category
            </h3>
            <div className="flex flex-row lg:flex-col flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-auto lg:w-full text-left px-3 py-2 text-xs rounded-xl transition font-mono ${
                    filter === cat
                      ? "bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-emerald-500/10 dark:text-emerald-450 font-bold border border-transparent"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* SYSTEM GUIDELINES */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-850 text-[10px] text-slate-500 space-y-2 leading-relaxed">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wide flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              FEED GUIDELINES
            </h4>
            <p>1. Highly motivational attitude expected. Hostile commentary is auto-reported.</p>
            <p>2. Share realistic nutritional stats, weights, and routine benchmarks.</p>
          </div>
        </div>

        {/* FEED COLUMN */}
        <div className="lg:col-span-9 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-950 rounded-3xl border border-slate-250 dark:border-slate-800 text-slate-500 text-xs font-mono">
              No matching community posts found for "{filter}". Click share to make the very first statement!
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = user && post.likes.includes(user.uid);
              return (
                <div 
                  key={post.id} 
                  id={`community_feed_post_${post.id}`} 
                  className="bg-white dark:bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  {/* Poster header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 bg-[#1E3A8A] text-white font-mono font-black rounded-xl flex items-center justify-center text-xs">
                        {post.userDisplayName ? post.userDisplayName.substring(0,2).toUpperCase() : "AT"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                          {post.userDisplayName}
                          <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-slate-500">{post.category}</span>
                        </div>
                        <span className="text-[9px] text-slate-450 font-mono mt-1 block">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { hour: "2-digit", minute:"2-digit" })}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleReport(post.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition"
                      title="Report Post for review"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap break-words">
                    {post.content}
                  </div>

                  {/* Post Image attachment */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-900 max-h-80">
                      <img 
                        src={post.imageUrl} 
                        alt="Community upload Attachment" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  {/* Likes, Report Counters */}
                  <div className="flex items-center gap-6 border-t border-b border-slate-100 dark:border-slate-900 py-2.5 text-xs text-slate-500">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors ${
                        hasLiked ? "text-rose-500 font-bold" : ""
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      <span>{post.likes.length} Likes</span>
                    </button>

                    <span className="flex items-center gap-1.5 font-mono">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length} Comments</span>
                    </span>
                  </div>

                  {/* Comments Stack */}
                  <div className="space-y-2.5">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-850 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-slate-800 dark:text-slate-205 text-[11px]">{comm.userDisplayName}</strong>
                          <span className="text-[8px] font-mono text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-sans break-words">{comm.content}</p>
                      </div>
                    ))}

                    {/* Write comment input bar */}
                    <form 
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="flex gap-2 items-center pt-2"
                    >
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Say something motivating to this athlete..."
                        className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                      />
                      <button 
                        type="submit"
                        className="p-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E40AF] transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>
              );
            })
          )}

          {/* ADMIN MODERATION BAR ONLY SHOWN IF CONTENT IS FLAGGED */}
          {user && user.role === "admin" && reportedPosts.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase font-mono tracking-widest text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Moderator Review Lab ({reportedPosts.length} Items)
              </h3>
              
              <div className="space-y-3">
                {reportedPosts.map(p => (
                  <div key={p.id} className="p-4 bg-white dark:bg-slate-950 border border-rose-500/25 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{p.userDisplayName}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 font-bold px-1.5 rounded">{p.reports?.length || 0} Flags</span>
                      </div>
                      <p className="text-slate-500 font-sans italic">"{p.content.substring(0,80)}..."</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => moderatePost(p.id, "approve")}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold font-mono tracking-wider hover:bg-emerald-600 transition"
                      >
                        APPROVE
                      </button>
                      <button 
                        onClick={() => moderatePost(p.id, "delete")}
                        className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold font-mono tracking-wider hover:bg-rose-600 transition flex items-center gap-1"
                      >
                        <Trash className="w-3 h-3" />
                        PURGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
