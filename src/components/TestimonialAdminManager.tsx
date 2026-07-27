import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PopupTestimonial } from "../types";
import { 
  Plus, Edit2, Trash2, Check, X, ShieldAlert, Calendar, Star, Search, RotateCcw, HelpCircle 
} from "lucide-react";
import { samplePopupTestimonials } from "../data/sampleTestimonials";

export const TestimonialAdminManager: React.FC = () => {
  const { 
    popupTestimonials, 
    addPopupTestimonial, 
    updatePopupTestimonial, 
    deletePopupTestimonial 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [country, setCountry] = useState("United States");
  const [avatar, setAvatar] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [membershipPlan, setMembershipPlan] = useState("Premium Monthly");
  const [createdAt, setCreatedAt] = useState("");
  const [status, setStatus] = useState<"enabled" | "disabled">("enabled");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress("Preparing upload...");

    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("../lib/firebase");
      
      const fileRef = ref(storage, `testimonials/${Date.now()}_${file.name}`);
      setUploadProgress("Uploading file...");
      const snapshot = await uploadBytes(fileRef, file);
      
      setUploadProgress("Getting download URL...");
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setAvatar(downloadURL);
      setUploadProgress("Upload successful!");
      setTimeout(() => setUploadProgress(""), 2000);
    } catch (error: any) {
      console.error("Storage upload error:", error);
      setErrorMsg("Failed to upload to Firebase Storage: " + (error.message || error));
      setUploadProgress("");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCountry("United States");
    setAvatar("");
    setRating(5);
    setReview("");
    setMembershipPlan("Premium Monthly");
    setCreatedAt(new Date().toISOString().substring(0, 16)); // Current local ISO timestamp
    setStatus("enabled");
    setEditingId(null);
    setErrorMsg("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: PopupTestimonial) => {
    setEditingId(item.id);
    setName(item.name);
    setCountry(item.country);
    setAvatar(item.avatar);
    setRating(item.rating);
    setReview(item.review);
    setMembershipPlan(item.membership_plan);
    
    // Parse ISO date to datetime-local string
    try {
      const d = new Date(item.created_at);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      setCreatedAt(localDate.toISOString().substring(0, 16));
    } catch {
      setCreatedAt(new Date().toISOString().substring(0, 16));
    }

    setStatus(item.status);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Customer name is required.");
      return;
    }
    if (!review.trim()) {
      setErrorMsg("Review content is required.");
      return;
    }

    const isoDate = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();

    const data: Omit<PopupTestimonial, "id"> = {
      name: name.trim(),
      country: country.trim(),
      avatar: avatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      rating,
      review: review.trim(),
      membership_plan: membershipPlan,
      created_at: isoDate,
      status
    };

    try {
      if (editingId) {
        await updatePopupTestimonial(editingId, { ...data, id: editingId });
        setSuccessMsg("Testimonial updated successfully!");
      } else {
        await addPopupTestimonial(data);
        setSuccessMsg("Testimonial added successfully!");
      }
      setIsFormOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save testimonial.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer review?")) {
      try {
        await deletePopupTestimonial(id);
        setSuccessMsg("Review deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err: any) {
        setErrorMsg("Failed to delete review.");
      }
    }
  };

  const toggleStatus = async (item: PopupTestimonial) => {
    const nextStatus = item.status === "enabled" ? "disabled" : "enabled";
    try {
      await updatePopupTestimonial(item.id, { status: nextStatus });
    } catch (err) {
      console.error("Error toggling status", err);
    }
  };

  const handleBulkReseed = async () => {
    if (window.confirm("Are you sure you want to re-seed the default 30 reviews? This will add any missing default reviews.")) {
      try {
        let count = 0;
        for (const item of samplePopupTestimonials) {
          if (!popupTestimonials.some(t => t.id === item.id)) {
            const { id, ...rest } = item;
            await addPopupTestimonial(rest);
            count++;
          }
        }
        setSuccessMsg(`Successfully re-seeded default testimonials! Added ${count} missing records.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } catch (err) {
        setErrorMsg("Reseeding failed.");
      }
    }
  };

  // Filter list
  const filtered = popupTestimonials.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.review.toLowerCase().includes(q) ||
      item.membership_plan.toLowerCase().includes(q)
    );
  });

  return (
    <div id="testimonial-manager" className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Customer Reviews & Popup Testimonial Hub
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
              Live Popups Enabled
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Configure live customer testimonials, enable/disable popups, delete reviews, and schedule publication timestamps.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleBulkReseed}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer"
            title="Bulk reseed standard 30 reviews to the database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore 30 Defaults
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="grid sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reviews by name, country, review text, or membership..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="sm:col-span-4 flex justify-between sm:justify-end gap-4 text-xs font-mono font-bold text-slate-500">
          <span>Total: {popupTestimonials.length}</span>
          <span>Enabled: {popupTestimonials.filter(t => t.status === "enabled").length}</span>
          <span>Disabled: {popupTestimonials.filter(t => t.status === "disabled").length}</span>
        </div>
      </div>

      {/* List / Table Grid */}
      <div className="border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              No testimonials match your filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-900">
              {filtered.map((item) => {
                const isScheduledFuture = new Date(item.created_at) > new Date();
                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 mt-1"
                        referrerPolicy="no-referrer"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            {item.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({item.country})
                          </span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-mono font-bold">
                            {item.membership_plan}
                          </span>

                          {/* Future scheduled indicator */}
                          {isScheduledFuture && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider">
                              <Calendar className="w-2.5 h-2.5" />
                              Scheduled
                            </span>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < item.rating ? "fill-current" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>

                        {/* Review text */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans max-w-xl leading-relaxed italic">
                          "{item.review}"
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Publish Time: {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                      {/* Enable/Disable button */}
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border cursor-pointer uppercase tracking-wider transition ${
                          item.status === "enabled"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {item.status === "enabled" ? "Active" : "Disabled"}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition cursor-pointer"
                        title="Edit testimonial"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Customer Testimonial" : "Add New Customer Testimonial"}
              </h4>
              <p className="text-[11px] text-slate-500">
                Populate verified customer feedback fields below. Keep coordinates accurate to maintain premium trust signals.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Country/Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Profile Photo URL <span className="font-normal text-slate-400">(Unsplash, raw link, or upload file)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center shrink-0 transition-all active:scale-95">
                    {uploading ? (
                      <span className="animate-pulse">Uploading...</span>
                    ) : (
                      <span>Upload to Storage</span>
                    )}
                    <input
                      type="file"
                      accept="image/*,image/gif"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploadProgress && (
                  <p className="text-[10px] font-mono text-emerald-600 mt-1">{uploadProgress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Membership Tier Badge</label>
                  <select
                    value={membershipPlan}
                    onChange={(e) => setMembershipPlan(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Premium Monthly">Premium Monthly</option>
                    <option value="Premium Yearly">Premium Yearly</option>
                    <option value="VIP Club Elite">VIP Club Elite</option>
                    <option value="Core Clinic Trial">Core Clinic Trial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Star Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium text-amber-500 font-bold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Schedule / Post Time
                  </label>
                  <input
                    type="datetime-local"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[9px] text-slate-400">
                    Specify future date to schedule publication (review is hidden until scheduled time is reached).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="enabled">Enabled (Active in Popups)</option>
                    <option value="disabled">Disabled (Do Not Show)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Review Message</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Type customer testimonial review here..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 leading-normal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
