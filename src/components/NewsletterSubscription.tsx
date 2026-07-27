import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/mail/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("[Subscription Error] Network failure subscribing:", err);
      setStatus("error");
      setErrorMessage("Network error. Please verify your connection and try again.");
    }
  };

  return (
    <div id="newsletter-subscription-block" className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-[#C0392B] dark:text-[#C0392B] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Newsletter Dispatch
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          Sign up for weekly fitness tips, biomechanical calibration, and exclusive platform feature updates.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs space-y-1"
          >
            <div className="flex items-center gap-2 font-bold font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>You're in!</span>
            </div>
            <p className="font-medium text-slate-600 dark:text-slate-400 leading-snug">
              Check your inbox for a beautiful welcome newsletter. Let's conquer your health goals!
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubscribe}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "submitting"}
                className="w-full text-xs font-sans px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#C0392B] dark:focus:border-[#C0392B] transition-colors duration-200"
              />
            </div>

            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting"}
                  className="w-full text-xs font-sans pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#C0392B] dark:focus:border-[#C0392B] transition-colors duration-200"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <motion.button
                type="submit"
                disabled={status === "submitting"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-[#C0392B] hover:bg-[#B71C1C] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/10 border-0"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subscribing
                  </>
                ) : (
                  "Subscribe"
                )}
              </motion.button>
            </div>

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
