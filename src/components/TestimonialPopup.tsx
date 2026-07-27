import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, X, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PopupTestimonial } from "../types";
import { samplePopupTestimonials } from "../data/sampleTestimonials";

const getInitials = (name: string) => {
  return name.trim().substring(0, 2).toUpperCase();
};

const getRandomBgColor = (name: string) => {
  const colors = [
    "bg-emerald-600 text-white",
    "bg-sky-600 text-white",
    "bg-indigo-600 text-white",
    "bg-purple-600 text-white",
    "bg-amber-600 text-white",
    "bg-rose-600 text-white",
    "bg-teal-600 text-white",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getGenderForName = (name: string, content?: string): "female" | "male" | "neutral" => {
  const norm = name.trim().toLowerCase();
  
  const femaleNames = ["amara", "chioma", "fatima", "yetunde", "amina", "funmi", "blessing", "ngozi", "aisha", "sarah", "emma", "olivia", "sophia", "mia", "grace", "lily", "chloe", "ava", "isabella", "amelia", "charlotte", "ella", "harper", "evelyn", "clara"];
  const maleNames = ["tobi", "david", "babajide", "emeka", "chinedu", "osas", "kelechi", "tari", "ibrahim", "yusuf", "victor", "john", "michael", "james", "daniel", "noah", "ethan", "ryan", "lucas", "benjamin", "henry", "jack", "william", "mason", "sam", "samuel", "alex"];

  for (const fn of femaleNames) {
    if (norm.startsWith(fn)) return "female";
  }
  for (const mn of maleNames) {
    if (norm.startsWith(mn)) return "male";
  }

  const text = (content || "").toLowerCase();
  if (/\b(she|her|hers)\b/.test(text)) return "female";
  if (/\b(he|his|him)\b/.test(text)) return "male";

  return "neutral";
};

type PositionType = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";

const getPositionClasses = (pos: PositionType): string => {
  switch (pos) {
    case "top-left":
      return "top-5 left-5";
    case "top-right":
      return "top-5 right-5";
    case "bottom-left":
      return "bottom-5 left-5";
    case "top-center":
      return "top-5 left-1/2 -translate-x-1/2";
    case "bottom-center":
      return "bottom-5 left-1/2 -translate-x-1/2";
    case "bottom-right":
    default:
      return "bottom-5 right-5";
  }
};

export const TestimonialPopup: React.FC = () => {
  const { popupTestimonials } = useApp();
  const [currentReview, setCurrentReview] = useState<PopupTestimonial | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "showing" | "waiting">("idle");
  const [currentPosition, setCurrentPosition] = useState<PositionType>("bottom-right");
  
  const queueRef = useRef<PopupTestimonial[]>([]);
  const indexRef = useRef<number>(0);
  const lastShownIdRef = useRef<string | null>(null);

  // Filter to active reviews, fall back to sample dataset if database state is still fetching
  const activeReviews = popupTestimonials && popupTestimonials.length > 0
    ? popupTestimonials.filter(r => r.status === "enabled")
    : samplePopupTestimonials.filter(r => r.status === "enabled");

  const showNextPopup = () => {
    if (activeReviews.length === 0) return;

    // Rebuild and sort queue by gender (female, then male, then neutral)
    if (queueRef.current.length === 0 || indexRef.current >= queueRef.current.length) {
      const sorted = [...activeReviews].sort((a, b) => {
        const genA = getGenderForName(a.name, a.review || a.action);
        const genB = getGenderForName(b.name, b.review || b.action);
        if (genA !== genB) {
          return genA.localeCompare(genB);
        }
        return a.name.localeCompare(b.name);
      });
      
      queueRef.current = sorted;
      indexRef.current = 0;
    }

    const nextReview = queueRef.current[indexRef.current];
    indexRef.current += 1;
    lastShownIdRef.current = nextReview.id;

    // Pick random position
    const positions: PositionType[] = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "top-center",
      "bottom-center"
    ];
    const randPos = positions[Math.floor(Math.random() * positions.length)];
    setCurrentPosition(randPos);

    setCurrentReview(nextReview);
    setIsVisible(true);
  };

  // State-Machine Timing Controller
  useEffect(() => {
    if (activeReviews.length === 0) return;

    let timer: NodeJS.Timeout | null = null;

    if (status === "idle") {
      // First popup delay: 3 seconds after mounting
      timer = setTimeout(() => {
        showNextPopup();
        setStatus("showing");
      }, 3000);
    } else if (status === "showing") {
      // Remain visible for exactly 8 seconds, then hide and transition to waiting
      timer = setTimeout(() => {
        setIsVisible(false);
        setStatus("waiting");
      }, 8000);
    } else if (status === "waiting") {
      // Wait exactly 90 minutes (5400000 ms) before the next popup as strictly requested
      const delayMs = 90 * 60 * 1000;
      console.log(`[Social Proof] Scheduled next popup in exactly 90 minutes`);
      timer = setTimeout(() => {
        showNextPopup();
        setStatus("showing");
      }, delayMs);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, activeReviews.length]);

  const handleClose = () => {
    setIsVisible(false);
    setStatus("waiting");
  };

  if (activeReviews.length === 0 || !currentReview) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="social-proof-toast"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          // high z-index fixed to random positions on screen, with a compact glass-like small background
          className={`fixed z-[9999] w-[210px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-slate-200/85 dark:border-slate-800/85 p-2 select-none pointer-events-auto overflow-hidden ${getPositionClasses(currentPosition)}`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
            id="close-social-proof"
            aria-label="Close"
          >
            <X className="w-3 h-3" />
          </button>
 
          <div className="flex items-start gap-2 pb-0.5">
            {/* Always use initials for social proof popout as requested - made smaller (w-8 h-8) */}
            <div className="relative shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm uppercase ${getRandomBgColor(currentReview.name)}`}>
                {getInitials(currentReview.name)}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />
            </div>
 
            <div className="flex-1 min-w-0 pr-3">
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-[1px] text-amber-500">
                  {[...Array(currentReview.rating)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current text-amber-500" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-[1px] text-[7.5px] font-black font-mono tracking-wider text-emerald-700 uppercase bg-emerald-50 dark:bg-slate-950 px-1 py-0.5 rounded">
                  <Check className="w-2 h-2 stroke-[3]" /> Verified
                </span>
              </div>
 
              {/* Action content & time */}
              <p className="text-[10px] text-slate-900 dark:text-slate-100 leading-snug">
                {currentReview.name && !currentReview.action.includes(currentReview.name) && (
                  <span className="font-extrabold text-slate-950 dark:text-white mr-1">
                    {currentReview.name}
                  </span>
                )}
                {currentReview.action || "signed up"}
              </p>
              
              <span className="text-slate-500 dark:text-slate-400 text-[8px] font-bold font-mono block mt-0.5">
                {currentReview.timeText || "today"}
              </span>
 
              {/* Optional Trust message */}
              {currentReview.review && (
                <p className="text-[9px] text-slate-850 dark:text-slate-200 font-medium italic mt-1 border-l-2 border-slate-200 dark:border-slate-700 pl-1.5 leading-relaxed">
                  “{currentReview.review}”
                </p>
              )}
            </div>
          </div>

          {/* Progress bar timeline loader - matches 8s visibility period */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 rounded-b-xl overflow-hidden">
            <motion.div 
              key={currentReview.id}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
