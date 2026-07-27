import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Star, MessageSquare, Plus, Award, Shield, Check, Image, Trash,
  TrendingDown, TrendingUp, Sparkles, Filter, ShieldCheck, Heart
} from "lucide-react";

export default function SuccessView() {
  const { 
    user, 
    testimonials, 
    submitTestimonial, 
    approveTestimonial, 
    deleteTestimonial 
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New Testimonial Form variables
  const [category, setCategory] = useState<"Weight Loss" | "Muscle Building" | "General Journey" | "Transformation Story">("Weight Loss");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await submitTestimonial(category, rating, content, beforeImage || undefined, afterImage || undefined);
      setContent("");
      setBeforeImage("");
      setAfterImage("");
      setShowSubmitModal(false);
      setToastMessage("Story submitted successfully! To maintain pristine authentic guidelines, it is currently in admin queue.");
      setTimeout(() => setToastMessage(""), 4500);
    } catch (err) {
      console.error(err);
    }
  };

  // Only show approved stories to public
  const publicStories = testimonials.filter(t => {
    const isApproved = t.approved;
    if (activeCategoryFilter === "All") return isApproved;
    return isApproved && t.category === activeCategoryFilter;
  });

  // Admin pending queue
  const adminPendingQueue = testimonials.filter(t => !t.approved);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      
      {/* EXQUISITE HEADER HERO */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-radial-[circle_at_center,_rgba(16,185,129,0.03)_15%,_transparent_60%]" />
        
        <div>
          <span className="text-[10px] font-bold text-emerald-500 font-mono uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
            ALEXFITNESSHUB HALL OF FAME
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3 leading-none tracking-tight">
            Success Stories & Transformations
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-lg leading-relaxed">
            Real athlete results with verified before & after indices and rating logs. True results from AlexFitnessHub program schedules.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(!showSubmitModal)}
          className="py-3 px-5 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-black font-mono uppercase tracking-widest flex items-center gap-2 transition duration-200 shadow"
        >
          <Plus className="w-4 h-4" />
          {showSubmitModal ? "CLOSE SUBMISSION" : "WRITE MY STORY"}
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          {toastMessage}
        </div>
      )}

      {/* BEFORE / AFTER SUBMISSION BOX */}
      {showSubmitModal && (
        <form onSubmit={handleTestimonialSubmit} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-lg space-y-4 animate-slide-in">
          <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
            <Award className="w-4 h-4 text-emerald-500" />
            File Testimonial Log Form
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Focus Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Weight Loss">Weight Loss & Shred</option>
                <option value="Muscle Building">Muscle Building Bulking</option>
                <option value="General Journey">General Journey</option>
                <option value="Transformation Story">Transformation Story</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Star Rating Metric</label>
              <div className="flex gap-1 py-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star className={`w-5 h-5 ${num <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Before Picture URL (Optional)</label>
              <input
                type="url"
                value={beforeImage}
                onChange={(e) => setBeforeImage(e.target.value)}
                placeholder="https://images.unsplash.com/before-photo"
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">After Picture URL (Optional)</label>
              <input
                type="url"
                value={afterImage}
                onChange={(e) => setAfterImage(e.target.value)}
                placeholder="https://images.unsplash.com/after-photo"
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <span className="text-[9px] text-slate-400 mb-1 font-mono">Note: Accurate descriptions provide immense motivation to the ecosystem.</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">My Comprehensive Journey Feedback</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What specifically changed? Address meals, strength increases, weight shifts, and AI coach interactions..."
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black font-mono uppercase tracking-widest rounded-xl transition"
          >
            SUBMIT TO PENDING QUEUE
          </button>
        </form>
      )}

      {/* FILTER BUTTONS & STORY FEED */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-3">
          <span className="text-xs font-bold text-slate-500 font-mono uppercase">Verified Testimonial Feeds</span>
          
          <div className="flex gap-1.5 bg-slate-150 dark:bg-slate-900 p-1 rounded-xl">
            {["All", "Weight Loss", "Muscle Building", "General Journey", "Transformation Story"].map(tFilter => (
              <button
                key={tFilter}
                onClick={() => setActiveCategoryFilter(tFilter)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase font-black transition-all ${
                  activeCategoryFilter === tFilter
                    ? "bg-white dark:bg-slate-950 text-emerald-500 font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tFilter}
              </button>
            ))}
          </div>
        </div>

        {/* STORIES GRID */}
        {publicStories.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-mono">
            No verified success stories available in this category. Be the first to share your glorious progress!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {publicStories.map((story) => (
              <div key={story.id} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  
                  {/* Rating Stars Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < story.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>

                    <span className="text-[9px] font-black uppercase font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {story.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed italic font-sans whitespace-pre-line">
                    "{story.content}"
                  </div>

                  {/* Before & After Image Attachment Side-by-Side if available */}
                  {(story.beforeImageUrl || story.afterImageUrl) && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {story.beforeImageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 bg-slate-100 max-h-48 flex flex-col">
                          <img 
                            src={story.beforeImageUrl} 
                            alt="Before program" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded">BEFORE</span>
                        </div>
                      )}
                      {story.afterImageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-100 max-h-48 flex flex-col">
                          <img 
                            src={story.afterImageUrl} 
                            alt="After program peak form" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-white font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded">AFTER</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Author profile tag */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-900 pt-3 mt-4 text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center text-[10px]">
                      {story.userDisplayName ? story.userDisplayName[0].toUpperCase() : "A"}
                    </div>
                    <strong>{story.userDisplayName}</strong>
                  </div>
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADMIN LEVEL TESTIMONIAL APPROVALS QUEUE */}
      {user && user.role === "admin" && adminPendingQueue.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-[#10B981] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Admin Pending Testimonials Hub ({adminPendingQueue.length} Queue Logs)
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {adminPendingQueue.map(item => (
              <div key={item.id} className="p-4 bg-white dark:bg-slate-950 border border-emerald-500/25 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 dark:text-white font-bold">{item.userDisplayName} ({item.userEmail})</strong>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono font-bold px-1.5 rounded">{item.category}</span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 font-sans italic">"{item.content}"</p>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => approveTestimonial(item.id)}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black font-mono uppercase tracking-wider rounded-lg transition"
                  >
                    APPROVE STORY
                  </button>
                  <button
                    onClick={() => deleteTestimonial(item.id)}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black font-mono uppercase tracking-wider rounded-lg transition"
                  >
                    PURGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
