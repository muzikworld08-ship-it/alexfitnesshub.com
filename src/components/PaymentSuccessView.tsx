import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";

const VIEW_TO_PATH_MAP: Record<string, string> = {
  "home": "/",
  "payment-success": "/payment/success",
  "library": "/premium/library",
  "workout-generator": "/premium/workout-generator",
  "workout-videos": "/premium/workout-videos",
  "saved-exercises": "/premium/saved-exercises",
  "coach": "/premium/coach",
  "nutrition": "/premium/nutrition",
  "daily-plan": "/premium/daily-plan",
  "challenges": "/premium/challenges",
  "community": "/premium/community",
  "weekly-reports": "/premium/weekly-reports",
  "daily-habit-tracker": "/premium/daily-habit-tracker",
  "daily-calibration-desk": "/premium/daily-calibration-desk",
  "handbook": "/premium/handbook",
  "weight-trajectory": "/premium/weight-trajectory",
  "dashboard": "/premium/dashboard",
  "belly-fat-shred": "/premium/belly-fat-shred",
  "lifestyle-academy": "/lifestyle-academy",
};

export default function PaymentSuccessView() {
  const { user, upgradeWithPaystack } = useApp();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref") || "";
    setReference(ref);

    if (!ref) {
      setStatus("error");
      setErrorMessage("No payment reference found in the callback URL.");
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log(`[PaymentSuccessView] Launching direct verification for reference: ${ref}`);
        await upgradeWithPaystack(ref);
        setStatus("success");
      } catch (err: any) {
        console.error("[PaymentSuccessView Verification Error]", err);
        setStatus("error");
        setErrorMessage(err.message || "We were unable to verify your payment reference. Please contact support.");
      }
    };

    // Wait until user is fully loaded before launching verification
    if (user) {
      verifyPayment();
    }
  }, [user]);

  // Automated premium redirect to original requested page
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        const attemptedView = localStorage.getItem("fit_attempted_view");
        localStorage.removeItem("fit_attempted_view");
        const path = attemptedView ? (VIEW_TO_PATH_MAP[attemptedView] || "/") : "/";
        window.location.assign(path);
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-100/50">
        
        {/* White Background, Red Header / Accent */}
        <div className="flex justify-center mb-6">
          <span className="text-sm font-mono tracking-widest text-[#D32F2F] uppercase font-bold">
            AlexFitnessHub Premium
          </span>
        </div>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <Loader2 className="h-16 w-16 text-[#D32F2F] animate-spin mb-6" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans mb-3">
              Verifying Your Payment
            </h1>
            <p className="text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">
              We are verifying your transaction securely with Paystack. Please do not close or refresh this window.
            </p>
            {reference && (
              <span className="mt-6 text-[11px] font-mono bg-slate-100 px-3 py-1 text-slate-500 rounded-md">
                Ref: {reference}
              </span>
            )}
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 relative">
              <CheckCircle2 className="h-12 w-12" />
              <motion.div 
                className="absolute inset-0 rounded-full border border-emerald-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans mb-3">
              Payment Confirmed!
            </h1>
            <p className="text-slate-700 font-medium text-sm mb-4">
              Your AlexFitnessHub Premium membership is now <span className="text-emerald-600 font-bold">ACTIVE</span>.
            </p>
            <p className="text-slate-500 text-xs max-w-xs mx-auto mb-8 leading-relaxed">
              Welcome to the elite tier! You now have unrestricted access to custom workout generation, AI nutrition planning, the daily coach workspace, and live progressive analytics.
            </p>

            <button
              onClick={() => {
                const attemptedView = localStorage.getItem("fit_attempted_view");
                localStorage.removeItem("fit_attempted_view");
                const path = attemptedView ? (VIEW_TO_PATH_MAP[attemptedView] || "/") : "/";
                window.location.assign(path);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-red-100 transition-all cursor-pointer group"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
              <XCircle className="h-10 w-10" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans mb-3">
              Verification Failed
            </h1>
            <p className="text-red-600 font-medium text-xs mb-6 max-w-xs mx-auto leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100">
              {errorMessage}
            </p>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed">
              If money has been deducted from your account, don't worry. Our backend processes Paystack webhook updates automatically. Click below to return home and check your status in a few moments.
            </p>

            <button
              onClick={() => {
                window.location.assign("/");
              }}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold py-4 px-6 rounded-2xl transition-all cursor-pointer"
            >
              Return Home
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
