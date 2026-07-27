import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Shield, CheckCircle, ArrowRight, Zap, Flame, 
  Play, Users, X, HelpCircle, Clipboard, ChevronDown, Star, Lock, MessageCircle, ChevronLeft,
  Mail, Bell, Heart, Sparkles, Activity, Crown,
  Scale, Clock, Plus, TrendingUp, Droplet, ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { NewsletterSubscription } from "./NewsletterSubscription";
import Logo from "./Logo";

const workoutCategories = [
  {
    id: "chest",
    title: "Chest Isolation",
    desc: "Sculpt upper chest divisions using premium cable flyes & barbell press alignments.",
    exercises: "45 Drills",
    image: "https://workoutguru.fit/wp-content/uploads/2024/02/african-bodybuilder-posing-gym-1-edited.jpg",
    tag: "Upper Body",
  },
  {
    id: "back",
    title: "Lat & Back Columns",
    desc: "Build high flare lats and thick upper rhomboids with rows & pullup layouts.",
    exercises: "38 Drills",
    image: "https://generationiron.com/wp-content/uploads/2022/02/How-To-Do-Wide-grip-Lat-Pulldown-1200x675-1-1024x576.jpg",
    tag: "V-Taper",
  },
  {
    id: "biceps",
    title: "Bicep Peak Triggers",
    desc: "Engage peak brachialis fibers under supreme tension with seated dumbbell curls.",
    exercises: "24 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2024/06/HOW-TO-BICEPS.jpg",
    tag: "Hypertrophy",
  },
  {
    id: "triceps",
    title: "Tricep Horseshoe",
    desc: "Isolate lateral push heads utilizing heavy overhead rope extensions.",
    exercises: "28 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2021/09/MAIN-IMAGE.png",
    tag: "Push Power",
  },
  {
    id: "shoulders",
    title: "Deltoid Cap Boulder",
    desc: "Target anterior and posterior caps with scapular plane stability guides.",
    exercises: "35 Drills",
    image: "https://i.ytimg.com/vi/yS80o90nm_k/maxresdefault.jpg",
    tag: "Symmetry",
  },
  {
    id: "legs",
    title: "Quad & Leg Pillars",
    desc: "Stimulate depth hypertrophy using back squats and clean hamstring curls.",
    exercises: "50 Drills",
    image: "https://guycounseling.com/wp-content/uploads/2014/10/leg-workout.jpg",
    tag: "Lower Body",
  },
  {
    id: "abs",
    title: "Abdominal Shred",
    desc: "Slam abdominal walls utilizing leg raises and controlled core compression.",
    exercises: "22 Drills",
    image: "https://learn.athleanx.com/wp-content/uploads/2021/08/MAIN-MAGE.png",
    tag: "Core Core",
  }
];

const verifiedUserReviews = [
  {
    name: "Amara K.",
    location: "Lagos Resident",
    period: "12 Weeks",
    achievement: "Lost 18.6 KG • 34% to 21% Body Fat",
    content: "The 12-30-3 cardio walk saved my knees! Combined with the local diet calibrator to substitute yams for lean fish and egg whites, I lost substantial belly fat without going hungry. The AI coach guided my macros every single Sunday.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Tobi S.",
    location: "Abuja Athlete",
    period: "16 Weeks",
    achievement: "Lost 19.8 KG • 29% to 13% Body Fat",
    content: "My absolute objective was to expose my abdominal muscles and rebuild a deep chest alignment. Tracking slow eccentric sets and training compound lifts with the custom barbell routines helped me gain muscle while shredding 20 kg.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "David O.",
    location: "Port Harcourt",
    period: "8 Weeks",
    achievement: "Lost 9.5 KG • 26% to 17% Body Fat",
    content: "Needed to drop weight rapidly to secure a military physical fitness score. The targeted ab isolation guides and zero-fluff nutrition matrix got me there in only two months. Absolute clinical standard programs.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Chioma A.",
    location: "Enugu Executive",
    period: "10 Weeks",
    achievement: "Lost 12.1 KG • 30% to 18% Body Fat",
    content: "Balancing long corporate hours meant I needed extreme efficiency. Executing the 12% treadmill incline walks while tracking my routines kept me disciplined daily. Unbeatable layout and superb mobile-friendly flow.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Babajide Y.",
    location: "Ibadan Trainee",
    period: "6 Weeks",
    achievement: "Gained 4 KG Muscle • Re-composed Frame",
    content: "The local meal plans are the best part. Substituting high-carb processed foods with localized portions of beans, chicken breast, and green vegetables gave me constant energy for my compound lifts.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "Fatima B.",
    location: "Kano",
    period: "14 Weeks",
    achievement: "Lost 15.2 KG • Improved Cardio",
    content: "Highly safe and private home routines. I followed the bodyweight core plans in my living room. The step-by-step videos make correct forms incredibly easy to learn without standard gym stress.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Emeka N.",
    location: "Onitsha Strongman",
    period: "20 Weeks",
    achievement: "Bench Press +35 KG • Squat +50 KG",
    content: "Barbell coaching is pristine. Learning the correct biomechanics for progressive overload completely resolved my shoulder discomfort. The absolute gold standard of online strength tracking.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "Yetunde O.",
    location: "Lekki Practitioner",
    period: "12 Weeks",
    achievement: "Lost 14.0 KG • Shredded Obliques",
    content: "The interface is exceptionally polished! Tracking my water intake and following the low-carb guidelines was seamless. Lowered my resting heart rate significantly.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Chinedu E.",
    location: "Asaba Elite",
    period: "8 Weeks",
    achievement: "Lost 8.2 KG • Enhanced Stamina",
    content: "No unnecessary features or annoying popups. The plan builder lets me log custom repetitions and weight curves. My strength endurance has quadrupled over the past two months.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Amina U.",
    location: "Kaduna Scholar",
    period: "10 Weeks",
    achievement: "Lost 11.0 KG • Postpartum Recovery",
    content: "Perfect low-impact routines that didn't stress my joints. The customized advice and simple steps tracker helped me get back to my active weight safely and consistently.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Osas I.",
    location: "Benin Builder",
    period: "12 Weeks",
    achievement: "Gained 5.5 KG Muscle • Reduced Fat",
    content: "Simple instructions and highly realistic local diet advice without any expensive imported supplements. I highly recommend the high tension bicep isolation splits.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "Kelechi O.",
    location: "Owerri",
    period: "12 Weeks",
    achievement: "Lost 13.5 KG • Waist -5 Inches",
    content: "I love the clean, modern look of the app. Checking off daily water and step targets has become an automatic habit. Highly responsive UI and zero friction.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Funmi A.",
    location: "Akure Executive",
    period: "16 Weeks",
    achievement: "Blood Pressure Normalized • Lost 16 KG",
    content: "Helped me prioritize long term cardio health. The pacing guidelines for inclined walks and daily physical routine checks completely transformed my physical state.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Tari Q.",
    location: "Yenagoa Dancer",
    period: "6 Weeks",
    achievement: "Improved Mobility • Core Flex Strength",
    content: "The lateral delt and glute programs are extremely optimized. Every exercise has clear instruction targets that ensure absolute safety during eccentric movements.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Ibrahim M.",
    location: "Jos Runner",
    period: "12 Weeks",
    achievement: "5K Run time -6 Mins • Lost 10 KG",
    content: "Finally broke my fat loss plateau with progressive overload sets. The custom barbell routines are incredibly effective and perfectly timed for busy schedules.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Blessing E.",
    location: "Calabar Gymnast",
    period: "14 Weeks",
    achievement: "Gained Lean Definition • Flex Level Up",
    content: "The absolute focus on hamstring and knee health is amazing. My balance has improved, and I feel vastly stronger in daily functional movements.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "Yusuf T.",
    location: "Ilorin Athlete",
    period: "10 Weeks",
    achievement: "Lost 12.5 KG • Sculpted Deltoids",
    content: "I save thousands of Naira using these home barbell splits instead of paying for expensive gym coaches. The app serves as a perfect pocket personal trainer.",
    rating: 5,
    goal: "General Journey"
  },
  {
    name: "Ngozi P.",
    location: "Aba Retailer",
    period: "8 Weeks",
    achievement: "Lost 7.8 KG • Cardio Restored",
    content: "Excellent mobile view. I can easily log my daily steps and calorie count while on the move. Super clean layout and very encouraging flow.",
    rating: 5,
    goal: "Weight Loss"
  },
  {
    name: "Victor C.",
    location: "Warri Engineer",
    period: "12 Weeks",
    achievement: "Squat Depth Peak • Gained 6 KG Muscle",
    content: "Zero fluff. The local dietary guidelines actually fit the local foods I eat every day. Bench, squat, and curl isolation guides are top tier.",
    rating: 5,
    goal: "Muscle Building"
  },
  {
    name: "Aisha K.",
    location: "Sokoto Teacher",
    period: "18 Weeks",
    achievement: "Lost 17.5 KG • Body Fat -12%",
    content: "Excellent high-contrast design that is easy on the eyes. Following the structured body weight cardiorespiratory program has made me incredibly consistent.",
    rating: 5,
    goal: "Weight Loss"
  }
];

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

interface HomeViewProps {
  setView: (view: string) => void;
  onOpenAuth: () => void;
}

export default function HomeView({ setView, onOpenAuth }: HomeViewProps) {
  const { 
    user, 
    upgradeWithPaystack,
    weightLogs, 
    addWeightLogAction, 
    communityPosts, 
    addCommunityPost, 
    likePost, 
    commentOnPost 
  } = useApp();
  const [submittingPlan, setSubmittingPlan] = useState<"monthly" | "yearly" | "multi" | null>(null);
  const [activePaymentModal, setActivePaymentModal] = useState<"monthly" | "yearly" | "multi" | null>(null);

  const scrollToCheckout = () => {
    setTimeout(() => {
      const el = document.getElementById("activate-premium-access-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Public Interactive Preview Widgets state
  const [activeDemoTab, setActiveDemoTab] = useState<"trajectory" | "community" | "calibration" | "habits">(() => {
    if (typeof window !== "undefined" && (window as any).__activeDemoTab) {
      return (window as any).__activeDemoTab;
    }
    return "trajectory";
  });

  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && ["trajectory", "community", "calibration", "habits"].includes(detail)) {
        setActiveDemoTab(detail as any);
      }
    };
    window.addEventListener("set-demo-tab", handleSetTab);
    return () => {
      window.removeEventListener("set-demo-tab", handleSetTab);
    };
  }, []);
  
  // Weight Trajectory preview states
  const [localWeightLogs, setLocalWeightLogs] = useState<any[]>([]);
  const [publicNewWeight, setPublicNewWeight] = useState("");
  const [submittingPublicWeight, setSubmittingPublicWeight] = useState(false);
  const [weightToast, setWeightToast] = useState<string | null>(null);

  // Community preview states
  const [localPosts, setLocalPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingNewPost, setIsSubmittingNewPost] = useState(false);
  const [postToast, setPostToast] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Calibration Desk preview states
  const [publicGlasses, setPublicGlasses] = useState(() => parseInt(localStorage.getItem("alexfit_public_hydration") || "4"));
  const [publicCaloriesIn, setPublicCaloriesIn] = useState(2000);
  const [publicCaloriesOut, setPublicCaloriesOut] = useState(2500);
  const [publicRemTime, setPublicRemTime] = useState(() => localStorage.getItem("alexfit_public_reminder_time") || "08:00");
  const [calibrationToast, setCalibrationToast] = useState<string | null>(null);

  // Daily Habit Tracker preview states
  const [publicHabits, setPublicHabits] = useState<any[]>([
    { id: "h1", name: "Lemon & Cucumber Hydration Protocol", desc: "Consumed at least 8 glasses of cucumber/lemon ambient water", done: false },
    { id: "h2", name: "Lean Protein Target", desc: "Secure 1.6g to 2.2g of high quality protein per kg of body weight", done: false },
    { id: "h3", name: "8 Hours Growth Sleep", desc: "Optimal sleep hygiene for nocturnal growth hormone release", done: false },
    { id: "h4", name: "Daily Core Conditioning", desc: "Completed 5-10 minute specialized kinetic abdominal strengthening", done: false },
    { id: "h5", name: "Post-Workout Eccentric Stretch", desc: "3-5 sets of passive active stretch to release tissue micro-tears", done: false }
  ]);
  const [streakCount, setStreakCount] = useState(() => parseInt(localStorage.getItem("alexfit_public_streak") || "3"));
  const [habitToast, setHabitToast] = useState<string | null>(null);

  // Weight Trajectory state sync
  useEffect(() => {
    if (user && weightLogs && weightLogs.length > 0) {
      setLocalWeightLogs(weightLogs);
    } else {
      const saved = localStorage.getItem("alexfit_public_weight_logs");
      if (saved) {
        setLocalWeightLogs(JSON.parse(saved));
      } else {
        const defaultLogs = [
          { date: "07/15", weight: 85.2 },
          { date: "07/16", weight: 84.8 },
          { date: "07/17", weight: 84.1 },
          { date: "07/18", weight: 83.5 },
          { date: "07/19", weight: 82.9 },
          { date: "07/20", weight: 82.2 }
        ];
        setLocalWeightLogs(defaultLogs);
        localStorage.setItem("alexfit_public_weight_logs", JSON.stringify(defaultLogs));
      }
    }
  }, [user, weightLogs]);

  // Community posts state sync
  useEffect(() => {
    if (communityPosts && communityPosts.length > 0) {
      setLocalPosts(communityPosts.filter(p => p.status === "active").slice(0, 5));
    }
  }, [communityPosts]);

  // Weight Logging action
  const handlePublicWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(publicNewWeight);
    if (isNaN(parsed) || parsed <= 30 || parsed >= 250) {
      alert("Please specify a valid biometric weight value (30kg - 250kg).");
      return;
    }

    setSubmittingPublicWeight(true);
    try {
      if (user && addWeightLogAction) {
        await addWeightLogAction(parsed);
        setWeightToast("Successfully logged weight checkpoint to Firebase!");
      } else {
        const todayStr = new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
        const newLog = { date: todayStr, weight: parsed };
        const updated = [...localWeightLogs, newLog].slice(-10);
        setLocalWeightLogs(updated);
        localStorage.setItem("alexfit_public_weight_logs", JSON.stringify(updated));
        setWeightToast("Saved to browser preview! Sign In to persist on Cloud Run.");
      }
      setPublicNewWeight("");
      setTimeout(() => setWeightToast(null), 4000);
    } catch (err) {
      console.warn("Could not submit weight log:", err);
    } finally {
      setSubmittingPublicWeight(false);
    }
  };

  // Community post submit action
  const handlePublicPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmittingNewPost(true);
    try {
      if (user && addCommunityPost) {
        await addCommunityPost(newPostContent, "General Discussion");
        setPostToast("Post shared with the whole community!");
      } else {
        const tempId = `temp_post_${Date.now()}`;
        const newPostItem = {
          id: tempId,
          userDisplayName: "Visitor Pro",
          content: newPostContent,
          category: "General Discussion",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          status: "active"
        };
        const updated = [newPostItem, ...localPosts];
        setLocalPosts(updated);
        setPostToast("Shared to local preview! Sign In to post publicly.");
      }
      setNewPostContent("");
      setTimeout(() => setPostToast(null), 4000);
    } catch (err) {
      console.warn("Error posting:", err);
    } finally {
      setIsSubmittingNewPost(false);
    }
  };

  // Community like action
  const handlePublicLike = async (postId: string) => {
    if (user && likePost) {
      try {
        await likePost(postId);
      } catch (err) {
        console.warn("Could not like post:", err);
      }
    } else {
      setLocalPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const hasLiked = p.likes.includes("visitor_temp_uid");
          const nextLikes = hasLiked 
            ? p.likes.filter((id: string) => id !== "visitor_temp_uid")
            : [...p.likes, "visitor_temp_uid"];
          return { ...p, likes: nextLikes };
        }
        return p;
      }));
      setPostToast("Liked! Sign In to persist your engagement.");
      setTimeout(() => setPostToast(null), 3000);
    }
  };

  // Community comment action
  const handlePublicComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    if (user && commentOnPost) {
      try {
        await commentOnPost(postId, commentText);
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        setPostToast("Comment added successfully!");
      } catch (err) {
        console.warn("Could not comment on post:", err);
      }
    } else {
      setLocalPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const newComment = {
            id: `temp_comm_${Date.now()}`,
            userDisplayName: "Visitor Pro",
            content: commentText,
            createdAt: new Date().toISOString()
          };
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      setPostToast("Comment added to preview! Sign In to sync.");
    }
    setTimeout(() => setPostToast(null), 3500);
  };

  // Calibration water incrementer
  const handlePublicGlassChange = (diff: number) => {
    const next = Math.max(0, publicGlasses + diff);
    setPublicGlasses(next);
    localStorage.setItem("alexfit_public_hydration", String(next));
    if (next >= 10) {
      setCalibrationToast("⭐ Hydration targets fully met! Perfect cellular water balance.");
      setTimeout(() => setCalibrationToast(null), 4000);
    }
  };

  // Calibration time reminder
  const savePublicReminder = (time: string) => {
    setPublicRemTime(time);
    localStorage.setItem("alexfit_public_reminder_time", time);
    setCalibrationToast("⏰ Reminder scheduled successfully! Alert system initialized.");
    setTimeout(() => setCalibrationToast(null), 3500);
  };

  // Habits checkbox toggle
  const togglePublicHabit = (id: string) => {
    const updated = publicHabits.map(h => {
      if (h.id === id) {
        return { ...h, done: !h.done };
      }
      return h;
    });
    setPublicHabits(updated);
    
    const allChecked = updated.every(h => h.done);
    if (allChecked) {
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      localStorage.setItem("alexfit_public_streak", String(nextStreak));
      setHabitToast(`🏆 Compliance 100%! Growth streak increased to ${nextStreak} Days!`);
    } else {
      setHabitToast(null);
    }
  };

  // Sort the verified user reviews according to their name gender
  const sortedVerifiedReviews = React.useMemo(() => {
    return [...verifiedUserReviews].sort((a, b) => {
      const genA = getGenderForName(a.name, a.content);
      const genB = getGenderForName(b.name, b.content);
      if (genA !== genB) {
        return genA.localeCompare(genB); // Grouping females first, then males, then neutrals
      }
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Carousel slider state for Hero
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      eyebrow: "PHYSIQUE SPECIALIZATION",
      wordOne: "FORGE",
      wordTwo: "ATHLETICISM",
      desc: "Experience world-class body sculpting. Unified by certified clinical kinesiologists, interactive progress logs, and advanced multi-modal Gemini AI coaching. Track actual metric goals with absolute precision.",
      imageUrl: "https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/01/Young-Muscular-Fitness-Model-Near-Barbell-Bench.jpg?quality=86&strip=all"
    },
    {
      eyebrow: "NUTRITIONAL METRICS",
      wordOne: "SHRED",
      wordTwo: "PLATEAUS",
      desc: "Calibrate localized macronutrient diet plans tailored precisely for high protein staples, tracking absolute body weight goals daily with the assistance of interactive progress reports.",
      imageUrl: "https://img.magnific.com/free-photo/strong-bodybuilder-demonstrating-muscular-body-sports-gym_7502-10713.jpg"
    },
    {
      eyebrow: "AI POWERED SOLUTIONS",
      wordOne: "COMMAND",
      wordTwo: "INTELLIGENCE",
      desc: "Unlock server-side Gemini intelligence models to consult your lifting technique, optimize water ratios, and design recovery splits tailored for performance athletes.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcaCK8cFkIl7siMw7nHkiPhCfUj9Nzu_fURv1oSooC03cyOt1LpLTuG_2B&s=10"
    }
  ];

  // Auto-play interval for hero carousel (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (activePaymentModal) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activePaymentModal]);

  const [payEmail, setPayEmail] = useState(user?.email || "");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "volume" | "annual">("volume");

  // States for reviews/testimonials
  const [reviewFilter, setReviewFilter] = useState("All");
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Contact Form state engines
  const [contactName, setContactName] = useState(user?.displayName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactGoal, setContactGoal] = useState("hypertrophy");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);



  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) {
      alert("Please provide valid name and email targets.");
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSubmitted(true);
      setContactMessage("");
    }, 950);
  };

  useEffect(() => {
    if (user) {
      setPayEmail(user.email || "");
      setContactEmail(user.email || "");
      setContactName(user.displayName || user.email?.split("@")[0] || "");
    }
  }, [user]);

  const handleInitiatePayment = async (plan: "monthly" | "yearly" | "multi", customMonths?: number) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    
    setCheckoutError(null);
    setPayEmail(user.email || "");
    setActivePaymentModal(plan);
    setSubmittingPlan(plan);

    const activeMonths = customMonths || (plan === "multi" ? selectedMonths : undefined);

    try {
      // 1. Fetch active Paystack Public Key
      const configRes = await fetch("/api/payments/config");
      const configData = await configRes.json();
      const publicKey = configData.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
      
      if (!publicKey) {
        throw new Error("Paystack Public Key is not configured in backend or environment.");
      }

      // 2. Initialize checkout session on our server
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: user.email,
          userId: user.uid,
          months: activeMonths
        })
      });
      const data = await res.json();
      if (!data.success || !data.authorization_url) {
        throw new Error(data.error || "Unable to initialize secure transaction with Paystack.");
      }

      // 3. Directly redirect user to Paystack secure payment page
      console.log(`[Redirect Flow] Redirecting user ${user.uid} to secure Paystack payment URL: ${data.authorization_url}`);
      window.location.href = data.authorization_url;

    } catch (err: any) {
      console.error("Error initiating checkout:", err);
      setCheckoutError(err.message || "Failed to initialize secure checkout. Please contact admin.");
      setSubmittingPlan(null);
    }
  };

  const basePriceMonthly = 19999;
  const multiMonthTotal = basePriceMonthly * selectedMonths;
  const yearlyPriceAnnual = 215989;
  const yearlyNormalCost = basePriceMonthly * 12;
  const yearlySavingsAmt = yearlyNormalCost - yearlyPriceAnnual;

  const faqsList = [
    {
      q: "How does the Treadmill Walk 12-30-3 function?",
      a: "Treadmill Walk 12-30-3 is a globally verified protocol: 12% incline gradient, 3.0 mph speed pace, for 30 minutes continuous. This targets local fat oxidation directly, bypassing standard systemic glycogen burn while protecting knee joints from impact damage."
    },
    {
      q: "How secure is my subscription status and account data?",
      a: "All subscription and training history is securely saved within our cloud infrastructure using standard industrial AES-256 equivalent socket layers. We do not hold or process any billing credentials directly on our platforms. Your profile is kept entirely private and can be closed or cleared anytime."
    },
    {
      q: "What is the differences between Free and Premium memberships?",
      a: "Free members have standard access to base movements and basic progress logging. Premium members unlock our full 1,200+ scaled fitness database, complete HD anatomical movement loops with 0.5x Slow and 3s Eccentric coaching models, custom V-Taper curriculums, and unlimited AI coach calibrations."
    },
    {
      q: "Can I cancel or alter my multi-month selections?",
      a: "Absolutely. Standard multi-month selections are valid for the selected calendar span and are not bound by long-term legal liabilities. You can upgrade, downgrade, or return to the free athlete tier without any extra administrative penalties."
    },
    {
      q: "Are meal recommendation profiles customizable for local foods?",
      a: "Yes! Our intelligence systems understand regional food databases (including high-protein staples such as egg whites, plantains, lean beef, beans, local greens, and fish). The macros are calibrated dynamically onto your current biological weight targets."
    }
  ];

  return (
    <div id="home-view-root" className="bg-background text-foreground min-h-screen relative font-sans animate-fade-in">
      
      {/* 1. HERO SECTION - COMPELLING BRIGHT SOLO VISUAL BANNER */}
      <section id="hero-segment" className="relative h-[55vh] sm:h-[65vh] lg:h-[75vh] w-full overflow-hidden bg-background border-b border-border">
        
        {/* Cinematic Background Image - Ultra-Bright, High-Exposure & Clear */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://github.com/muzikmail2-arch/Git/blob/main/ChatGPT%20Image%20Jul%2018,%202026,%2006_59_52%20PM.png?raw=true" 
            alt="Alex Fitness Hub Elite Training Facility"
            className="w-full h-full object-cover object-center scale-100 filter brightness-125 contrast-110 saturate-105"
            referrerPolicy="no-referrer"
          />
          {/* Subtle light vignettes just to frame the layout gently while keeping everything bright and white-based */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/15 to-transparent" />
        </div>

        {/* Dynamic visual badge for the solo hero */}
        <div className="absolute bottom-6 right-6 z-10 bg-card/95 backdrop-blur-md border border-border rounded-full px-5 py-2 flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-mono font-black text-foreground tracking-widest uppercase">
            ALEX FIT CENTER • LIVE SESSION READY
          </p>
        </div>
      </section>

      {/* NEW PROMOTIONAL ADVERT BANNER - LIFESTYLE FITNESS ACADEMY */}
      <section id="academy-promo-advert" className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-8 text-left relative"
          >
            {/* Background absolute highlights */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full filter blur-xl pointer-events-none" />
            
            {/* Left side: Premium Image */}
            <div className="w-full md:w-1/3 h-52 sm:h-60 rounded-2xl overflow-hidden relative shadow-inner shrink-0 bg-slate-100 border border-slate-150">
              <img 
                src="https://github.com/muzikmail2-arch/Git/blob/main/ChatGPT%20Image%20Jul%2018,%202026,%2007_10_59%20PM.png?raw=true" 
                alt="Lifestyle Fitness Academy Stretching & Mobility Coaching"
                className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Coaching Course
              </div>
            </div>

            {/* Middle: Content */}
            <div className="flex-grow space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  FREE TRIAL AVAILABLE
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight leading-tight">
                  LIFESTYLE FITNESS ACADEMY
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed max-w-xl">
                  Learn to prevent and overcome modern health challenges. From <strong className="text-slate-900 uppercase font-bold">AI Desk Body Syndrome</strong> to <strong className="text-slate-900 uppercase font-bold">Sitting Disease</strong> and <strong className="text-slate-900 uppercase font-bold">Stress Burnout</strong>, build ironclad habits with Alex's structured corrective protocols.
                </p>
              </div>

              {/* Quick Perks Row */}
              <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                  <span>10 Core Wellness Programs</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                  <span>Interactive Habit Sync</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                  <span>Adaptive Training Plans</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                  <span>Stretching Routines</span>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="shrink-0 w-full md:w-auto flex flex-col items-center sm:items-start md:items-end gap-2">
              <button
                onClick={() => setView("lifestyle-academy")}
                className="w-full md:w-auto px-8 py-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-xs uppercase rounded-full shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition duration-200 cursor-pointer text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <span>ENTER THE ACADEMY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                First 2 challenges 100% Free
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW PROMOTIONAL ADVERT BANNER - IMMORTAL 90-DAY PREMIUM CHALLENGE */}
      <section id="immortal-challenge-promo-advert" className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-950 rounded-3xl border border-red-900/40 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-8 text-left relative"
          >
            {/* Background absolute highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full filter blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-red-500/10 rounded-full filter blur-2xl pointer-events-none" />
            
            {/* Left side: Premium Image */}
            <div className="w-full md:w-1/3 h-52 sm:h-60 rounded-2xl overflow-hidden relative shadow-inner shrink-0 bg-slate-900 border border-red-900/30">
              <img 
                src="https://github.com/muzikmail2-arch/Git/blob/main/ChatGPT%20Image%20Jul%2018,%202026,%2007_15_20%20PM.png?raw=true" 
                alt="Immortal 90-Day Challenge Athletic Training"
                className="w-full h-full object-cover object-center filter brightness-110 contrast-110 saturate-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                PREMIUM FLAGSHIP
              </div>
            </div>

            {/* Middle: Content */}
            <div className="flex-grow space-y-4 text-white">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  IMMORTAL ELITE BLUEPRINT
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-white">
                  Immortal 90-Day Challenge
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed max-w-xl">
                  Unlock our ultimate 90-day athletic transformation system. Complete with daily progressive overload kinesiologist guides, interactive biological metrics tracking, official trophy cabinets, and live personal coach assignment.
                </p>
              </div>

              {/* Quick Perks Row */}
              <div className="grid grid-cols-2 gap-3 max-w-md pt-1 text-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>90 Days Custom Workouts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Personal Coach Assigned</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Interactive Bio-Metrics</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Official Graduation PDF</span>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="shrink-0 w-full md:w-auto flex flex-col items-center sm:items-start md:items-end gap-2">
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                    return;
                  }
                  if (user.subscriptionStatus === "premium" || user.role === "admin") {
                    setView("challenges");
                  } else {
                    const el = document.getElementById("pricing");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
                className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-black text-xs uppercase rounded-full shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition duration-200 cursor-pointer text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <span>JOIN 90-DAY CHALLENGE</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                {user && (user.subscriptionStatus === "premium" || user.role === "admin") ? "Unlocked for Premium" : "Requires Premium Upgrade"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1.1 INTERACTIVE ENGINE & PREMIUM SLIDESHOW - PLACED DIRECTLY BELOW THE HERO */}
      <section id="hero-carousel-segment" className="py-12 sm:py-16 lg:py-20 bg-background border-b border-border relative overflow-hidden">
        {/* Decorative background visual accents */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-red-500/5 rounded-full filter blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none select-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center">
            
            {/* Premium bright high-contrast card ensuring absolutely no word is hidden */}
            <div className="w-full max-w-4xl bg-slate-50 rounded-[2.5rem] border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-xl flex flex-col justify-center items-center text-center text-slate-900 relative">
              <div className="relative min-h-[340px] sm:min-h-[260px] md:min-h-[220px] lg:min-h-[180px] w-full">
                {heroSlides.map((slide, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <div 
                      key={idx}
                      className={`transition-all duration-[350ms] ease-out space-y-5 flex flex-col items-center ${
                        isActive 
                          ? "opacity-100 translate-y-0 scale-100" 
                          : "opacity-0 translate-y-4 scale-98 absolute inset-0 pointer-events-none"
                      }`}
                    >
                      <span className="text-[10px] font-mono font-black tracking-[0.25em] text-white uppercase bg-[#D32F2F] px-4 py-1.5 rounded-full inline-block shadow-md">
                        {slide.eyebrow}
                      </span>
                      
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight leading-tight uppercase select-none">
                        <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                          {slide.wordOne}
                        </span>{" "}
                        <span className="text-slate-950">
                          {slide.wordTwo}
                        </span>
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed font-sans font-semibold">
                        {slide.desc}
                      </p>

                      <div className="flex flex-wrap justify-center gap-4 pt-1">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(211,47,47,0.4)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setView("library")}
                          className="px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-extrabold text-xs uppercase rounded-full shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          Start Training
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const el = document.getElementById("pricing");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-sans font-black text-xs uppercase rounded-full border border-slate-200 shadow-md transition-all duration-200 cursor-pointer"
                        >
                          View Pricing
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carousel Navigation Mechanics */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 w-full">
                
                {/* Pagination dots: active = red dot, inactive = slate-200 */}
                <div className="flex items-center gap-3">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`transition-all duration-300 cursor-pointer ${
                        idx === currentSlide 
                          ? "bg-[#D32F2F] w-8 h-2 rounded-full shadow-[0_0_10px_rgba(211,47,47,0.4)]" 
                          : "bg-slate-300 w-3 h-2 rounded-full hover:bg-slate-400"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Round arrow nav buttons: light circle, dark chevron */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    className="p-3 rounded-full bg-white text-slate-800 hover:bg-[#D32F2F] hover:text-white transition-colors duration-200 shadow-sm cursor-pointer border border-slate-200"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="p-3 rounded-full bg-white text-slate-800 hover:bg-[#D32F2F] hover:text-white transition-colors duration-200 shadow-sm cursor-pointer border border-slate-200"
                    aria-label="Next slide"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1.1 ELITE PERFORMANCE GALLERY & DEMONSTRATION */}
      <section id="elite-gallery-segment" className="py-16 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Premium High-Definition Video Player Container (Moved from Hero) */}
            <div className="lg:col-span-6 relative w-full flex flex-col justify-center">
              <div className="mb-4 text-left">
                <span className="text-[9px] font-mono font-black tracking-widest text-[#D32F2F] uppercase bg-red-50 px-2.5 py-1 rounded-full">
                  Elite Live Demonstration
                </span>
                <h3 className="text-xl font-sans font-black text-slate-900 uppercase mt-2">
                  Alex Fitness Hub Live Session
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Witness real-time training biomechanics and dynamic feedback in action.
                </p>
              </div>
              <div className="relative w-full aspect-[16/10] rounded-3xl p-2 bg-gradient-to-tr from-[#D4AF37] to-amber-500 shadow-xl group overflow-hidden border border-slate-200">
                <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-black relative">
                  <img
                    src="https://builtwithscience.com/wp-content/uploads/2026/01/F3-8.webp"
                    alt="Alex Fitness Hub Live Session"
                    className="w-full h-full object-cover opacity-100 scale-100 transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Glowing Premium Highlight Badges */}
                  <div className="absolute top-4 left-4 bg-[#D32F2F] text-white text-[9px] font-sans font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-10 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                    LIVE SESSIONS
                  </div>

                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[9px] font-mono tracking-widest px-3 py-1.5 rounded-lg border border-white/10 z-10">
                    HD 1080P | ACTIVE FORM RECON
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Dynamic Slide Imagery Showcase (Moved from Hero) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="mb-4 text-left">
                <span className="text-[9px] font-mono font-black tracking-widest text-[#D4AF37] uppercase bg-amber-50 px-2.5 py-1 rounded-full">
                  Specialization Spotlights
                </span>
                <h3 className="text-xl font-sans font-black text-slate-900 uppercase mt-2">
                  Training & Nutrition Curriculums
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Explore our core visual pillars from the active training guide programs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {heroSlides.map((slide, idx) => (
                  <motion.div 
                    whileHover={{ y: -4, scale: 1.03, boxShadow: "0 12px 24px -10px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    key={idx} 
                    className={`rounded-2xl overflow-hidden border transition-all duration-300 relative group bg-slate-100 h-40 cursor-pointer shadow-sm ${
                      idx === currentSlide 
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md" 
                        : "border-slate-200 opacity-85"
                    }`}
                    onClick={() => setCurrentSlide(idx)}
                  >
                    <img 
                      src={slide.imageUrl} 
                      alt={slide.eyebrow}
                      className="w-full h-full object-cover transition-transform duration-[700ms] filter brightness-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-white/95 backdrop-blur-xs border-t border-slate-100 text-left">
                      <p className="text-[8px] font-mono font-black tracking-widest text-[#D32F2F] uppercase">
                        {slide.wordOne}
                      </p>
                      <h4 className="text-[11px] font-sans font-black text-slate-900 uppercase mt-0.5 leading-tight">
                        {slide.wordTwo} Suite
                      </h4>
                    </div>

                    {idx === currentSlide && (
                      <span className="absolute top-2 right-2 text-[8px] font-mono font-black tracking-wider text-white bg-[#D4AF37] px-2 py-0.5 rounded-full uppercase">
                        Active
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Highlight card for currently active details */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-black text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded uppercase">
                    {heroSlides[currentSlide].eyebrow}
                  </span>
                  <span className="text-[8px] font-mono font-black tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    PRO CLINICAL TRACKER
                  </span>
                </div>
                <h4 className="text-sm font-sans font-black text-slate-900 uppercase mt-2">
                  {heroSlides[currentSlide].wordOne} {heroSlides[currentSlide].wordTwo}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {heroSlides[currentSlide].desc}
                </p>
              </div>

            </div>

          </div>
        </motion.div>
      </section>



      {/* 1.2 THE SPECTACULAR CORE HD WORKOUT COACHING STREAM */}
      <section id="hd-video-stream" className="py-20 bg-secondary border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-sans font-black tracking-[0.25em] text-[#D32F2F] uppercase bg-red-50 px-3.5 py-1.5 rounded-full inline-block">
              BRIGHT LIVE WORKOUT DEMO
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase">
              ALEXFITNESSHUB <span className="text-[#D32F2F]">HD TRAINING STREAM</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto leading-relaxed font-sans">
              Examine real-time biomechanics under perfect studio lighting. Learn correct hip hinge depth, chest contraction lines, and eccentric deceleration ratios.
            </p>
            <div className="h-1 w-16 bg-[#D32F2F] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* The Massive Bright HD Video View (7/12 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-4 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-100">
                  <img
                    src="https://manofmany.com/_next/image?url=https%3A%2F%2Fapi.manofmany.com%2Fwp-content%2Fuploads%2F2023%2F08%2F14-Best-Dumbbell-Workouts-and-Exercises-For-a-Full-Body-Workout.jpg&w=1200&q=75"
                    alt="AlexFitnessHub HD Training Stream"
                    className="w-full h-full object-cover opacity-100"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Absolute Bright Overlays */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-sans font-black tracking-widest px-3 py-1 rounded-full uppercase shadow flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-ping"></span>
                    ACTIVE INSTRUCTOR FEED
                  </div>

                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-[10px] space-y-1 text-left">
                    <p className="font-black uppercase tracking-wider text-white">CURRENT FOCUS: SLOW LATERAL SHIFT</p>
                    <div className="flex gap-4 font-mono text-[9px] text-gray-300">
                      <span>TIME: 00:14 / 00:30</span>
                      <span>TEMPO: 3-0-1-1</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-left space-y-2">
                  <h3 className="text-lg font-sans font-black text-[#D32F2F] uppercase">
                    ECCENTRIC TENSION OVERVIEW: LATERAL CARDIO KETTLEBELL
                  </h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                    Watch the hips shift backward cleanly to maximize hamstring leverage and posterior chain load distribution. This specific form safely locks the lumbar spine to target core stabilization while accelerating local heart-rate fat oxidation.
                  </p>
                </div>
              </div>

              {/* Form Calibration Markers */}
              <div className="mt-6 pt-5 border-t border-gray-150 grid grid-cols-3 gap-4">
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/50 text-left">
                  <span className="block text-[8px] font-sans font-black text-[#6B6B6B] uppercase tracking-wider">HEART RATE GOAL</span>
                  <p className="text-sm font-sans font-black text-[#D32F2F] uppercase">135 - 155 BPM</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-left">
                  <span className="block text-[8px] font-sans font-black text-[#6B6B6B] uppercase tracking-wider">TARGET MUSCLE</span>
                  <p className="text-sm font-sans font-black text-[#2E7D32] uppercase">VISCERAL GLUTE / CORES</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left">
                  <span className="block text-[8px] font-sans font-black text-[#6B6B6B] uppercase tracking-wider">EST. FAT SHRED RATIO</span>
                  <p className="text-sm font-sans font-black text-black uppercase">94% CAL / HR</p>
                </div>
              </div>

            </div>

            {/* Sidebar Lift Channel Guide (4/12 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-sans font-black uppercase text-[#D32F2F] tracking-wider pb-3 border-b border-gray-150 text-left">
                  RECOMMENDED HD LIFT CHANNELS
                </h4>
                
                {/* Channel List */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white shrink-0">
                      <Play className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-black uppercase text-[#2E7D32]">12-30-3 LIPOLYSIS WALK</p>
                      <p className="text-[10px] text-emerald-800 leading-none mt-0.5">Cardio Zone 2 | Target Belly Adipose</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 hover:border-red-200 bg-white flex items-center gap-3 text-left transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                      <Play className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-black uppercase text-black">CHEST FLYES ISOLATION</p>
                      <p className="text-[10px] text-[#6B6B6B] leading-none mt-0.5">Continuous Cable Tension | 3s Hold</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 hover:border-red-200 bg-white flex items-center gap-3 text-left transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                      <Play className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-black uppercase text-black">LAT COLUMNS DEEP ROW</p>
                      <p className="text-[10px] text-[#6B6B6B] leading-none mt-0.5">Rhomboid Flexion | Strict Elbow Sweep</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 hover:border-red-200 bg-white flex items-center gap-3 text-left transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                      <Play className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-sans font-black uppercase text-black">DEPTH SQUATS ALIGNMENT</p>
                      <p className="text-[10px] text-[#6B6B6B] leading-none mt-0.5">Full Hip Crease Clearance | Safe Quadriceps</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-150">
                <button
                  onClick={() => setView("workout-videos")}
                  className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-xs uppercase rounded-xl transition duration-200"
                >
                  EXPLORE FULL VIDEO ARCHIVE
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </section>

      {/* 1.3 INTERACTIVE LIFESTYLE & EXERCISE DIRECTORY */}
      <section id="lifestyle-exercise-directory" className="py-24 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              NAVIGATIONAL HUB
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase">
              CHOOSE YOUR <span className="text-[#D32F2F]">ATHLETIC PATHWAY</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto leading-relaxed">
              Click on any directory target below to instantly redirect to targeted training libraries, nutrition macro profiles, or physical video walkthroughs.
            </p>
            <div className="h-1 w-16 bg-[#D32F2F] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: EXERCISE LIBRARY */}
            <div 
              onClick={() => setView("library")}
              className="group relative rounded-3xl overflow-hidden border border-gray-200 bg-white h-[340px] flex flex-col cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="h-44 w-full overflow-hidden relative bg-slate-100 border-b border-gray-100">
                <img 
                  src="https://theathletesphysique.com/wp-content/uploads/2020/07/Athletes-Physique-Exercise-Database.jpg" 
                  alt="Elite Exercise Library"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex-1 bg-white text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-sans font-black tracking-widest text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded uppercase">
                    1,200+ DRILLS
                  </span>
                  <h3 className="text-sm font-sans font-black text-slate-900 uppercase mt-1">
                    EXERCISE LIBRARY
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">
                    Complete muscle contraction drills, equipment targets, and slow tempo setups.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D32F2F] font-bold uppercase mt-2 group-hover:translate-x-1.5 transition-transform">
                  EXPLORE DRILLS <ArrowRight className="w-3 h-3 text-[#D32F2F]" />
                </span>
              </div>
            </div>

            {/* CARD 2: MEAL PLANS & LIFESTYLE */}
            <div 
              onClick={() => setView("nutrition")}
              className="group relative rounded-3xl overflow-hidden border border-gray-200 bg-white h-[340px] flex flex-col cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="h-44 w-full overflow-hidden relative bg-slate-100 border-b border-gray-100">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRaMrGT8LyvfZbPnJafBlhFFt_2Uu7bSoic5qq0Mikg-SxnSqkOvlxAR_1&s=10" 
                  alt="Macro & Meal Planner"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex-1 bg-white text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-sans font-black tracking-widest text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    LOCAL INGREDIENTS
                  </span>
                  <h3 className="text-sm font-sans font-black text-slate-900 uppercase mt-1">
                    NUTRITION PORTAL
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">
                    Calibrate plantains, beans, egg whites, and clean fish for macro targets.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D32F2F] font-bold uppercase mt-2 group-hover:translate-x-1.5 transition-transform">
                  CALIBRATE DIET <ArrowRight className="w-3 h-3 text-[#D32F2F]" />
                </span>
              </div>
            </div>

            {/* CARD 3: BIOMECHANICAL VIDEOS */}
            <div 
              onClick={() => setView("workout-videos")}
              className="group relative rounded-3xl overflow-hidden border border-gray-200 bg-white h-[340px] flex flex-col cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="h-44 w-full overflow-hidden relative bg-slate-100 border-b border-gray-100">
                <img 
                  src="https://www.healthyads.com/wp-content/uploads/2025/10/Best-Gym-Advertisement-Examples-featured.webp" 
                  alt="Form Technique Videos"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex-1 bg-white text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-sans font-black tracking-widest text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded uppercase">
                    HD VISUALS
                  </span>
                  <h3 className="text-sm font-sans font-black text-slate-900 uppercase mt-1">
                    TECHNIQUE SHOWCASE
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">
                    0.5x slow-motion loops demonstrating exact eccentric biomechanics.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D32F2F] font-bold uppercase mt-2 group-hover:translate-x-1.5 transition-transform">
                  LAUNCH CHANNEL <ArrowRight className="w-3 h-3 text-[#D32F2F]" />
                </span>
              </div>
            </div>

            {/* CARD 4: GEMINI COACH CONSULT */}
            <div 
              onClick={() => setView("coach")}
              className="group relative rounded-3xl overflow-hidden border border-gray-200 bg-white h-[340px] flex flex-col cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="h-44 w-full overflow-hidden relative bg-slate-100 border-b border-gray-100">
                <img 
                  src="https://www.blenderbottle.com/cdn/shop/articles/Strategies_for_Success.jpg?v=1772976464&width=2048" 
                  alt="AI Coach Consultation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex-1 bg-white text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-sans font-black tracking-widest text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    GEMINI CALIBRATED
                  </span>
                  <h3 className="text-sm font-sans font-black text-slate-900 uppercase mt-1">
                    GEMINI AI CHAT
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">
                    Acquire direct posture tuning, customized cardio plans, and meal corrections instantly.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D32F2F] font-bold uppercase mt-2 group-hover:translate-x-1.5 transition-transform">
                  CHAT WITH COACH <ArrowRight className="w-3 h-3 text-[#D32F2F]" />
                </span>
              </div>
            </div>

          </div>

        </motion.div>
      </section>

      {/* 1.5 INTERACTIVE PLATFORM TECHNIQUE GUIDE */}
      <section id="technique-walkthrough" className="py-24 bg-secondary border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#C0392B] uppercase bg-[#C0392B]/10 px-3.5 py-1 rounded-full inline-block">
              MASTER YOUR MECHANICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              How to Use <span className="text-[#C0392B]">AlexFitnessHub</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto leading-relaxed font-sans">
              Unlock the secrets of perfect lifting technique and whole-body biomechanical accuracy in three simple steps.
            </p>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 relative shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 font-mono group-hover:text-[#C0392B]/10 transition-colors font-sans">01</div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C0392B]/5 text-[#C0392B] flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black uppercase text-[#1C1C1C] tracking-tight font-display">Search for Exercises</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                  Head over to our <strong>Workout Library</strong> to search and filter over 1,200+ specific kinesis exercises and muscle group isolation drills curated by our clinical experts.
                </p>
              </div>
              <button 
                onClick={() => setView("library")}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-[#C0392B] text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors font-mono cursor-pointer"
              >
                Go to Library
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 relative shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 font-mono group-hover:text-[#C0392B]/10 transition-colors font-sans">02</div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black uppercase text-[#1C1C1C] tracking-tight font-display">Study the Video Technique</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                  Watch ultra-clear, high-definition motion loops demonstrating exact physical setup, muscle activation points, and tempo rules on our dedicated video page.
                </p>
              </div>
              <button 
                onClick={() => setView("workout-videos")}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors font-mono cursor-pointer"
              >
                Watch Videos
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 relative shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 font-mono group-hover:text-[#C0392B]/10 transition-colors font-sans">03</div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black uppercase text-[#1C1C1C] tracking-tight font-display">Lock Form & Track Progress</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                  Apply advanced coaching tips during your lifting sessions. Save exercises, monitor slow eccentric phases, and track training targets in real-time.
                </p>
              </div>
              <button 
                onClick={() => setView("saved-exercises")}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-colors font-mono cursor-pointer"
              >
                Saved Exercises
              </button>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 2. ALTERNATING ROW SECTIONS: CLINICAL METHODOLOGY */}
      <section id="why-choose-us" className="py-24 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              CLINICAL STANDARDS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              REVOLUTIONIZING <span className="text-[#C0392B]">PERFORMANCE</span>
            </h2>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-3" />
          </div>

          <div className="space-y-20">
            {/* Row 1: Red Icon, Right Text */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-20 h-20 rounded-full bg-[#C0392B] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#C0392B]/10">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-xl font-display font-black text-[#1C1C1C] uppercase tracking-tight">
                  1,200+ <span className="text-[#C0392B]">Kinesis Blueprints</span>
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed font-sans">
                  Deploy targeted kinesis movements charted with high-resolution anatomical guides, custom equipment splits, and precise intensity thresholds. Perfect for breaking physical plateaus.
                </p>
              </div>
            </div>

            {/* Row 2: Dark Charcoal Icon, Left Text (Alternating) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
              <div className="w-20 h-20 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center shrink-0 shadow-lg">
                <Zap className="w-10 h-10 text-[#C0392B]" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-xl font-display font-black text-[#1C1C1C] uppercase tracking-tight">
                  Gemini <span className="text-[#C0392B]">Diet Calibration</span>
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed font-sans">
                  Our secure server-side systems understand localized African staples (plantains, boiled yams, beans, fish indexes) and calibrate them perfectly matching your physical weight targets.
                </p>
              </div>
            </div>

            {/* Row 3: Red Icon, Right Text (Alternating) */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-20 h-20 rounded-full bg-[#C0392B] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#C0392B]/10">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-xl font-display font-black text-[#1C1C1C] uppercase tracking-tight">
                  Industrial-Grade <span className="text-[#C0392B]">Account Security</span>
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed font-sans">
                  Seamless premium subscription activations guarded by standard enterprise security. Cancel, extend, or alter settings instantly with total transparent local management.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* 3. SHOWCASE OF CATEGORIES SECTION */}
      <section id="categories-segment" className="py-24 bg-secondary border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              PHYSIQUE INDEX
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              TRAINING <span className="text-[#C0392B]">SPECIALIZATION</span>
            </h2>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workoutCategories.map((cat) => (
              <div 
                key={cat.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[360px]"
              >
                 <div className="h-44 w-full overflow-hidden relative">
                   <img 
                     src={cat.image} 
                     alt={cat.title}
                     referrerPolicy="no-referrer"
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-110"
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = "https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2020/07/Muscular-Fitness-Model-With-A-Six-Pack.jpg?w=1109&h=614&crop=1&quality=86&strip=all";
                     }}
                   />
                   <span className="absolute top-3 left-3 bg-white/95 border border-slate-200 text-[#D32F2F] text-[9px] font-sans font-black tracking-wider px-2.5 py-1 rounded-md uppercase z-20 shadow-sm">
                     {cat.tag}
                   </span>
                   <span className="absolute bottom-3 right-3 bg-[#D32F2F] text-white text-[10px] font-sans font-black px-2.5 py-1 rounded-md z-20 shadow-sm">
                     {cat.exercises}
                   </span>
                 </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1 text-left">
                    <h4 className="font-display font-black text-sm text-[#1C1C1C] uppercase leading-snug">
                      {cat.title}
                    </h4>
                    <p className="text-xs text-[#6B6B6B] leading-normal line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setView("library")}
                    className="mt-4 w-full py-2.5 bg-[#1C1C1C] hover:bg-[#C0392B] text-white hover:text-white rounded-xl text-[10px] font-sans font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <span>Deploy Routine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* 4. PREMIUM INSTRUMENTS SECTION */}
      <section className="py-24 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              PREMIUM UTILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              HIGH PERFORMANCE <span className="text-[#C0392B]">FEATURES</span>
            </h2>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-[#F7F7F7] rounded-2xl border border-gray-200 hover:border-[#C0392B] transition-all duration-250 text-left">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white mb-5">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h4 className="font-display font-black text-sm uppercase text-[#1C1C1C] mb-2">0.5x Slow Biomechanics</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                Observe precision muscle insertions with ultra-slow performance playback. Lock perfect concentric angles easily.
              </p>
            </div>

            <div className="p-6 bg-[#F7F7F7] rounded-2xl border border-gray-200 hover:border-[#C0392B] transition-all duration-250 text-left">
              <div className="w-10 h-10 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white mb-5">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-display font-black text-sm uppercase text-[#1C1C1C] mb-2">3s Eccentric Guidance</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                Focus on high-tension eccentric phases with dynamic countdown tools. Maximize motor unit recruitment safely.
              </p>
            </div>

            <div className="p-6 bg-[#F7F7F7] rounded-2xl border border-gray-200 hover:border-[#C0392B] transition-all duration-250 text-left">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white mb-5">
                <Clipboard className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-display font-black text-sm uppercase text-[#1C1C1C] mb-2">Anatomical Guides</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                Prevent joints from heavy strain. See crystal clear muscle activation layouts for back, legs, and shoulder splits.
              </p>
            </div>

            <div className="p-6 bg-[#F7F7F7] rounded-2xl border border-gray-200 hover:border-[#C0392B] transition-all duration-250 text-left">
              <div className="w-10 h-10 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white mb-5">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-display font-black text-sm uppercase text-[#1C1C1C] mb-2">Secured Access System</h4>
              <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                Direct clearances with completely transparent renewals management. Start or change subscription terms instantly.
              </p>
            </div>
          </div>

        </motion.div>
      </section>

      {/* 4.6 THE SCIENCE OF BELLY FAT OXIDATION & WEIGHT REDUCTION */}
      <section id="fat-loss-blueprint" className="py-24 bg-secondary border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-sans font-black tracking-[0.25em] text-[#D32F2F] uppercase bg-red-50 px-3.5 py-1.5 rounded-full inline-block">
              SCIENTIFIC METABOLIC TRUTH
            </span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-slate-900 dark:text-white uppercase">
              HOW TO BURN BELLY FAT <span className="text-[#D32F2F]">& LOSE WEIGHT</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto leading-relaxed font-sans font-normal">
              Banish useless fitness myths. Explore the clinical biochemistry of lipid mobilization and learn exactly how to shred deep visceral belly fat safely.
            </p>
            <div className="h-1 w-16 bg-[#D32F2F] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: The 4 Step Lipolysis Formula */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 text-left space-y-8">
              <h3 className="text-xl font-sans font-black uppercase text-black pb-3 border-b border-gray-150">
                THE 4-PHASE LIPID MOBILIZATION PROTOCOL
              </h3>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shrink-0 text-xs font-sans font-black">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-black text-black uppercase">
                      Establish a Caloric Deficit Defensible Line
                    </h4>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                      Fat loss is governed by thermodynamics. You must consume 15% to 20% fewer calories than your Total Daily Energy Expenditure (TDEE). The server-side Gemini calibrator helps you customize this margin seamlessly using regional whole food staples.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shrink-0 text-xs font-sans font-black">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-black text-black uppercase">
                      Trigger Lipolysis with 12-30-3 Incline Cardio
                    </h4>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                      Walking at a 12% incline gradient, at 3.0 mph speed pace, for 30 minutes continuous, pushes your cardiovascular system into **Heart Rate Zone 2** (approx. 65% of max HR). This maximizes fat oxidation rates while preserving knee and joint cartilage.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shrink-0 text-xs font-sans font-black">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-black text-black uppercase">
                      Prioritize High Eccentric-Tension Compound Lifts
                    </h4>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                      Isolating abs does not "spot-reduce" belly fat. Spot reduction is a biological impossibility. Instead, deploy heavy rows, depth squats, and chest presses. These activate major skeletal muscle groups, keeping insulin sensitivity high and resting metabolic rate elevated.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shrink-0 text-xs font-sans font-black">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-sans font-black text-black uppercase">
                      Manage Cortisol, Satiety & Sleep Cycles
                    </h4>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                      High cortisol stress levels force the endocrine system to store visceral fat in the lower stomach area. Protect your sleep schedule, focus on high-volume high-satiety foods (spinach, local beans, lean beef, boiled plantains), and hydrate with 3.5L of water daily.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Visceral Fat Visual Guide Card */}
            <div className="lg:col-span-5 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 text-left flex flex-col justify-between relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D32F2F]/5 rounded-full blur-2xl" />
              
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-[#D32F2F]" />
                  <span className="font-sans font-black text-xs uppercase tracking-widest text-[#D32F2F]">FAT RECON PROFILE</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-sans font-black text-black uppercase leading-snug">
                    UNDERSTANDING VISCERAL ADIPOSE TISSUE
                  </h4>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-normal">
                    Visceral belly fat wraps around your inner organs. It is highly active metabolically but can be systematically metabolized by following a sustained deficit coupled with incline compound cardio. 
                  </p>
                </div>

                {/* Bio indicators */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-150 space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-sans font-normal">Cardio Incline Target:</span>
                    <span className="font-mono text-[#D32F2F] font-black">12% Gradient</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-t border-gray-250 pt-2">
                    <span className="text-gray-500 font-sans font-normal">Protein Intake Minimum:</span>
                    <span className="font-mono text-[#2E7D32] font-bold">2.0g per kg BW</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-t border-gray-250 pt-2">
                    <span className="text-gray-500 font-sans font-normal">Lifting Session Goal:</span>
                    <span className="font-mono text-black font-bold">3s Eccentric Sets</span>
                  </div>
                </div>
              </div>



            </div>

          </div>
        </motion.div>
      </section>

      {/* 4.5 SOCIAL PROOF TESTIMONIALS */}
      <section id="social-proof" className="py-24 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              SOCIAL PROOF • ATHLETE VERIFICATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Real Results From <span className="text-[#D32F2F]">Dedicated Athletes</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans max-w-lg mx-auto font-semibold">
              Join 3,400+ members who have successfully re-engineered their body weight, athletic stamina, and muscle definition.
            </p>
          </div>

          {/* Testimonial Filter Category Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 mb-10">
            {["All", "Weight Loss", "Muscle Building", "General Journey"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setReviewFilter(filter);
                  setShowAllReviews(false);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                  reviewFilter === filter
                    ? "bg-[#D32F2F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedVerifiedReviews
              .filter(r => reviewFilter === "All" || r.goal === reviewFilter)
              .slice(0, showAllReviews ? undefined : 6)
              .map((review, idx) => (
                <div
                  key={idx}
                  className="bg-[#F7F7F7] border border-gray-200 p-6 rounded-2xl flex flex-col justify-between space-y-6 hover:border-gray-300 transition duration-150"
                >
                  <div className="space-y-4">
                    {/* Stars & Location Banner */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 text-amber-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                        {review.goal}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-gray-600 font-sans leading-relaxed italic font-semibold">
                      "{review.content}"
                    </p>
                  </div>

                  {/* Profile Details footer */}
                  <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-black leading-tight">
                        {review.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-mono">
                        {review.location} • {review.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black text-[#D32F2F] uppercase block">
                        RESULT
                      </span>
                      <span className="text-[9px] font-sans font-bold text-gray-600 max-w-[150px] inline-block">
                        {review.achievement}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Load More Button */}
          {sortedVerifiedReviews.filter(r => reviewFilter === "All" || r.goal === reviewFilter).length > 6 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-3 bg-black hover:bg-gray-900 text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                {showAllReviews ? "SHOW FEWER STORIES" : "EXPLORE ALL VERIFIED STORIES"}
              </button>
            </div>
          )}

        </motion.div>
      </section>

      {/* 4.5 PREMIUM TRANSLATION SHOWCASE: 5-MONTH BELLY FAT SHRED PROGRAM */}
      <section className="py-24 bg-background border-b border-border overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-[#D32F2F] filter blur-[150px]" />
          <div className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full bg-amber-500 filter blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-[#D32F2F] uppercase bg-[#D32F2F]/10 border border-[#D32F2F]/20 px-4 py-1.5 rounded-full inline-block">
              👑 ELITE CORE TRANSFORMATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-slate-900 uppercase leading-none">
              5 Month <span className="text-[#D32F2F]">Belly Fat Shred</span> Program
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed font-sans font-semibold">
              Deploy our masterfully sequenced, science-first transformation suite. 
              Accelerate metabolic conditioning and target sustainable deep visceral fat loss.
            </p>
            <div className="h-1 w-20 bg-[#D32F2F] mx-auto mt-4" />
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Scientific Integrity Panel */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-6 text-left shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#D32F2F]/10 border border-[#D32F2F]/20 rounded-2xl flex items-center justify-center text-[#D32F2F] shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-slate-900 font-display">Biomechanical Fact Check</h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed font-semibold">
                    Spot reduction is a biological myth. Adipose tissue breakdown is systemic. 
                    Our program centers on maximizing full-body metabolic output, compound mechanical tension, and calorie-deficit preservation. 
                    As total body fat decreases, your midsection defines itself permanently.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Flame className="w-4 h-4 text-[#D32F2F]" />
                    <h4 className="text-xs font-black uppercase text-[#D32F2F]">Metabolic Conditioning</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Progressive core isolation mixed with compound calorie crushers (Day 1, 3, 5, 7).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Zap className="w-4 h-4 text-[#D32F2F]" />
                    <h4 className="text-xs font-black uppercase text-[#D32F2F]">Aerobic Runs (2-3x/Wk)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Sequenced 3-5 KM steady-state cardio to maximize lipid transport and oxidation.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase text-emerald-600">Thermal Post-Meal Walks</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Activating 10-20 minute walks after major meals to elevate immediate caloric dispersion.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <CheckCircle className="w-4 h-4 text-[#D32F2F]" />
                    <h4 className="text-xs font-black uppercase text-[#D32F2F]">Fluid Balance Ring</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Hourly calculated hydration targets combined with 3x weekly Lemon-Cucumber water infusions.
                  </p>
                </div>

              </div>
            </div>

            {/* Right: Immersive Product Preview and CTA Callout */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden group shadow-sm">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#D32F2F]/5 group-hover:bg-[#D32F2F]/10 transition-colors duration-500" />
              
              <div className="space-y-4 relative z-10 text-left">
                <span className="text-[8px] font-mono font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded uppercase border border-amber-200">
                  👑 PREMIUM GOLD LABEL
                </span>
                <h3 className="text-lg font-black uppercase text-slate-950 font-display">
                  Interactive Dashboard Included
                </h3>
                
                <p className="text-xs text-slate-700 leading-relaxed font-sans font-semibold">
                  Gain a persistent, premium dashboard to track your 20-week milestones, log weight/waist metrics, 
                  upload progress diaries, calculate daily scores, and configure alert schedules.
                </p>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase">
                    <span>Program Duration</span>
                    <span className="text-slate-900 font-black">5 Months (20 Weeks)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase">
                    <span>Target Frequency</span>
                    <span className="text-slate-900 font-black">3-4 Workouts / Week</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase">
                    <span>Nutrition Framework</span>
                    <span className="text-emerald-700 font-black">Caloric Deficit Matrix</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 relative z-10">
                {user && (user.subscriptionStatus === "premium" || user.role === "admin") ? (
                  <button
                    onClick={() => setView("belly-fat-shred")}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <span>LAUNCH MY TRANSFORMATION DASHBOARD</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const el = document.getElementById("pricing");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full py-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <Lock className="w-4 h-4 text-white" />
                    <span>UNLOCK WITH PREMIUM ACTIVE</span>
                  </button>
                )}
                <p className="text-[8px] text-slate-500 font-mono mt-3 uppercase font-semibold">
                  Zero additional cost for Premium Subscriptions.
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* PUBLIC INTERACTIVE PREVIEW HUB: DYNAMIC ATHLETE DESK */}
      <section id="public-live-desk" className="py-24 bg-background border-b border-border relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D32F2F]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#D32F2F] uppercase block">
              LIVE PREVIEW PLAYGROUND
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white uppercase">
              INTERACTIVE <span className="text-[#D32F2F]">ATHLETE WORKSPACE</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Test drive the core features of the premium AlexFitnessHub platform. Monitor kinesiologist weight charts, explore community boards, check calibrations, and log habits.
            </p>
            <div className="h-1 w-16 bg-[#D32F2F] mx-auto mt-3" />
          </div>

          {/* Tab Selection Row */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-12 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-inner">
            {[
              { id: "trajectory", label: "Weight Trajectory", icon: Scale, desc: "Biometric slopes" },
              { id: "community", label: "Community Feed", icon: Users, desc: "Live social board" },
              { id: "calibration", label: "Calibration Desk", icon: Clock, desc: "Physiological vitals" },
              { id: "habits", label: "Habit Tracker", icon: CheckCircle, desc: "Routine compliance" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDemoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemoTab(tab.id as any)}
                  className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-sans font-black text-[10px] uppercase tracking-wider transition-all duration-250 cursor-pointer border-0 ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-[#D32F2F] shadow-md" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE TAB CONTENT BOX */}
          <div className="bg-card rounded-[2.5rem] border border-border p-6 sm:p-10 lg:p-12 shadow-xl relative max-w-5xl mx-auto">
            {activeDemoTab === "trajectory" && (
              <div className="space-y-8 animate-fade-in" id="public-weight-trajectory">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-sans font-black uppercase text-slate-900 dark:text-white">
                      Weight Recomposition <span className="text-[#D32F2F]">Trajectory Index</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Plot your absolute biometric checkpoints, monitor recomposition slopes, and map target weights dynamically.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE PLOT MODEL ACTIVE
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Visual SVG Trajectory Trend (Last 6 Checkpoints) */}
                  <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner space-y-4">
                    <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Weight Slope Calibration Chart</h4>
                    
                    {localWeightLogs.length > 1 ? (
                      <div className="relative w-full overflow-hidden">
                        {/* SVG Custom Line Graph */}
                        {(() => {
                          const displayLogs = localWeightLogs.slice(-6);
                          const minW = Math.min(...displayLogs.map(l => l.weight)) - 1;
                          const maxW = Math.max(...displayLogs.map(l => l.weight)) + 1;
                          const diffW = maxW - minW || 1;
                          const width = 480;
                          const height = 180;
                          const padding = 25;

                          const points = displayLogs.map((l, i) => {
                            const x = padding + (i / (displayLogs.length - 1 || 1)) * (width - 2 * padding);
                            const y = height - padding - ((l.weight - minW) / diffW) * (height - 2 * padding);
                            return { x, y, weight: l.weight, date: l.date };
                          });

                          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
                          const areaPath = points.length > 0 
                            ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
                            : "";

                          return (
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-350 overflow-visible">
                              {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                                const y = padding + val * (height - 2 * padding);
                                const wVal = (maxW - val * diffW).toFixed(1);
                                return (
                                  <g key={idx}>
                                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                                    <text x={padding - 5} y={y + 3} textAnchor="end" className="text-[8px] font-mono font-bold fill-slate-400">{wVal}</text>
                                  </g>
                                );
                              })}

                              <path d={areaPath} fill="url(#gradAreaPublic)" />
                              <path d={linePath} fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                              {points.map((p, idx) => (
                                <g key={idx} className="group cursor-pointer">
                                  <circle cx={p.x} cy={p.y} r="4.5" fill="#D32F2F" stroke="white" strokeWidth="2" />
                                  <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] font-mono font-black fill-slate-800 dark:fill-white">{p.weight}kg</text>
                                  <text x={p.x} y={height - 8} textAnchor="middle" className="text-[7px] font-mono font-bold fill-slate-400">{p.date}</text>
                                </g>
                              ))}

                              <defs>
                                <linearGradient id="gradAreaPublic" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.18" />
                                  <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                            </svg>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-450">
                        <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider">Awaiting weight logs</p>
                      </div>
                    )}
                  </div>

                  {/* Weight checkpoint Submission Panel */}
                  <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner">
                    <div className="space-y-4">
                      <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Biometric Checkpoint</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Input your current body weight to calibrate the trajectory graph. Changes are modeled immediately on the preview chart.
                      </p>
                      <form onSubmit={handlePublicWeightSubmit} className="space-y-3">
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.1"
                            value={publicNewWeight}
                            onChange={(e) => setPublicNewWeight(e.target.value)}
                            placeholder="e.g. 82.5" 
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none focus:border-[#D32F2F]"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 uppercase">KG</span>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingPublicWeight}
                          className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-[10px] uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer border-0"
                        >
                          {submittingPublicWeight ? "Logging Metric..." : "Log Weight Checkpoint"}
                        </button>
                      </form>
                    </div>

                    {weightToast && (
                      <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-normal text-center animate-fade-in">
                        {weightToast}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "community" && (
              <div className="space-y-8 animate-fade-in" id="public-community">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-sans font-black uppercase text-slate-900 dark:text-white">
                      AlexFitnessHub Live <span className="text-[#D32F2F]">Community Feed</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Read dynamic transformation logs, share lifting results, and check active discussions with fellow athletes.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D32F2F]/10 border border-[#D32F2F]/20 rounded-full text-[10px] font-mono font-bold text-[#D32F2F] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-ping" />
                    LIVE SOCIAL BRIDGE ENGAGED
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create New Post Form */}
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner flex flex-col justify-between h-fit">
                    <div className="space-y-4">
                      <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Share an Achievement</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        What did you train today? Share a lifting achievement or ask the community a physiological question.
                      </p>
                      <form onSubmit={handlePublicPostSubmit} className="space-y-3">
                        <textarea 
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="My Bench Press is up 5kg today! Thanks to the 12-30-3 protocol..." 
                          rows={3}
                          className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-[#D32F2F] resize-none"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNewPost}
                          className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-[10px] uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer border-0"
                        >
                          {isSubmittingNewPost ? "Publishing..." : "Publish Post"}
                        </button>
                      </form>
                    </div>

                    {postToast && (
                      <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-normal text-center animate-fade-in">
                        {postToast}
                      </div>
                    )}
                  </div>

                  {/* Active Posts Feed */}
                  <div className="lg:col-span-2 space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
                    {localPosts.length > 0 ? (
                      localPosts.map((post) => {
                        const hasLiked = post.likes?.includes("visitor_temp_uid") || (user && post.likes?.includes(user.uid));
                        return (
                          <div 
                            key={post.id} 
                            className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/40 rounded-2xl shadow-sm space-y-3 animate-fade-in"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-sans font-black text-[10px] uppercase flex items-center justify-center shadow-inner">
                                  {post.userDisplayName ? post.userDisplayName.substring(0, 2).toUpperCase() : "VP"}
                                </div>
                                <div>
                                  <div className="text-xs font-black uppercase text-slate-900 dark:text-white leading-none">
                                    {post.userDisplayName}
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-400">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { hour: "2-digit", minute:"2-digit" })}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[8px] font-mono font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-slate-500 border border-slate-200/50 dark:border-slate-800/50">
                                {post.category || "General"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap break-words">
                              {post.content}
                            </p>

                            {post.imageUrl && (
                              <div className="w-full max-h-48 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-900 shadow-sm">
                                <img src={post.imageUrl} alt="Uploaded progress" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {/* Likes and comments display */}
                            <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-900/40 text-[10px] font-mono">
                              <button 
                                onClick={() => handlePublicLike(post.id)}
                                className={`flex items-center gap-1 cursor-pointer transition bg-transparent border-0 ${hasLiked ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-red-500'}`}
                              >
                                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{post.likes?.length || 0} Likes</span>
                              </button>
                              <span className="text-slate-400">{post.comments?.length || 0} Comments</span>
                            </div>

                            {/* Comment thread list */}
                            {post.comments && post.comments.length > 0 && (
                              <div className="space-y-2 mt-2 bg-slate-100 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-850/40">
                                {post.comments.slice(0, 3).map((comm: any, idx: number) => (
                                  <div key={idx} className="text-[10px] leading-relaxed">
                                    <strong className="text-slate-850 dark:text-white uppercase font-black mr-1">{comm.userDisplayName}</strong>
                                    <span className="text-slate-600 dark:text-slate-400 font-sans break-words">{comm.content}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add comment inline */}
                            <form onSubmit={(e) => handlePublicComment(post.id, e)} className="flex gap-2 pt-1">
                              <input 
                                type="text"
                                placeholder="Type a response..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#D32F2F]"
                              />
                              <button 
                                type="submit"
                                className="px-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-sans font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer transition border-0"
                              >
                                Send
                              </button>
                            </form>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-450 border border-dashed border-slate-150 dark:border-slate-900 rounded-2xl">
                        <MessageCircle className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-2 animate-pulse" />
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider">Feed is loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "calibration" && (
              <div className="space-y-8 animate-fade-in" id="public-calibration">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-sans font-black uppercase text-slate-900 dark:text-white">
                      Physiological <span className="text-[#D32F2F]">Calibration Desk</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Fine-tune metabolic multipliers, balance cellular hydration, and schedule active workout alerts.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    METRICS CALIBRATED
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Hydration Tracker Card */}
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Hydration Protocol</h4>
                      <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                    </div>
                    <div className="space-y-3 text-center">
                      <div className="text-3xl font-sans font-black text-slate-850 dark:text-white font-mono">
                        {publicGlasses} <span className="text-xs text-slate-400">/ 10 glasses</span>
                      </div>
                      
                      {/* Water Meter Progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, (publicGlasses / 10) * 100)}%` }} 
                        />
                      </div>

                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        Includes lemon infusion & cucumber mineral rounds to secure optimum glycogen re-synthesis.
                      </p>

                      <div className="flex gap-2 justify-center pt-2">
                        <button 
                          onClick={() => handlePublicGlassChange(-1)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        >
                          -1 Glass
                        </button>
                        <button 
                          onClick={() => handlePublicGlassChange(1)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition cursor-pointer shadow-sm border-0"
                        >
                          +1 Glass
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deficit Calorie Calibration Slider */}
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Calorie Deficit Slider</h4>
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                    </div>
                    <div className="space-y-4 font-sans text-xs">
                      {/* Intake Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500">Intake Calibration:</span>
                          <span className="font-mono text-slate-800 dark:text-white">{publicCaloriesIn} kcal</span>
                        </div>
                        <input 
                          type="range" 
                          min="1200" 
                          max="3500" 
                          step="50"
                          value={publicCaloriesIn}
                          onChange={(e) => setPublicCaloriesIn(parseInt(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none"
                        />
                      </div>

                      {/* Burn Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500">Active Metabolic Rate:</span>
                          <span className="font-mono text-emerald-500">{publicCaloriesOut} kcal</span>
                        </div>
                        <input 
                          type="range" 
                          min="1500" 
                          max="4000" 
                          step="50"
                          value={publicCaloriesOut}
                          onChange={(e) => setPublicCaloriesOut(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-900 rounded-lg appearance-none"
                        />
                      </div>

                      {/* Calorie Balance net result */}
                      {(() => {
                        const balance = publicCaloriesOut - publicCaloriesIn;
                        return (
                          <div className="border-t border-slate-200 dark:border-slate-900 pt-3 flex justify-between items-center">
                            <span className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-wider">NET DEFICIT BALANCE</span>
                            <span className={`text-sm font-mono font-black ${balance >= 400 ? 'text-emerald-500' : 'text-orange-500'}`}>
                              {balance} kcal
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Reminder Alarm Clock */}
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Compliance Alarm</h4>
                      <Clock className="w-5 h-5 text-[#D32F2F]" />
                    </div>
                    <div className="space-y-4 text-center">
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Configure kinesiologist check-in times. Active alerts prompt you with direct structural notifications.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <input 
                          type="time" 
                          value={publicRemTime}
                          onChange={(e) => savePublicReminder(e.target.value)}
                          className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#D32F2F] text-center"
                        />
                        <span className="text-xs text-slate-450 uppercase font-black">Daily Clock</span>
                      </div>
                      <div className="text-[9px] text-emerald-500 font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/15 py-1.5 rounded-lg">
                        ALERT CONTROLLER ACTIVE
                      </div>
                    </div>
                  </div>
                </div>

                {calibrationToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold text-center animate-fade-in">
                    {calibrationToast}
                  </div>
                )}
              </div>
            )}

            {activeDemoTab === "habits" && (
              <div className="space-y-8 animate-fade-in" id="public-habit-tracker">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-sans font-black uppercase text-slate-900 dark:text-white">
                      AlexFitnessHub Daily <span className="text-[#D32F2F]">Habit Tracker</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Check off essential biometric habits daily. Securing compliance increments your streak and locks in muscle recovery.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D32F2F]/10 rounded-full text-xs font-black text-[#D32F2F] uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-[#D32F2F] shrink-0" />
                    <span>Active Streak: {streakCount} Days</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Habits Checklist */}
                  <div className="lg:col-span-8 space-y-3">
                    {publicHabits.map((habit) => (
                      <div 
                        key={habit.id}
                        onClick={() => togglePublicHabit(habit.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                          habit.done 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-200' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight leading-none">{habit.name}</p>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{habit.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          habit.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}>
                          {habit.done && <CheckCircle className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Habit Metrics Stats Panel */}
                  <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900/60 shadow-inner space-y-4 text-center">
                    <h4 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Streak Level Metric</h4>
                    
                    {/* Ring Radial progress circle */}
                    {(() => {
                      const completedCount = publicHabits.filter(h => h.done).length;
                      const percent = Math.round((completedCount / publicHabits.length) * 100);
                      return (
                        <div className="space-y-4">
                          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200 dark:text-slate-800"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-emerald-500 transition-all duration-500"
                                strokeWidth="3"
                                strokeDasharray={`${percent}, 100`}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-2xl font-sans font-black text-slate-800 dark:text-white font-mono">{percent}%</span>
                              <span className="text-[8px] font-sans font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            {completedCount === publicHabits.length 
                              ? "Excellent! Perfect compliance locks in 24h anabolic recovery." 
                              : `Completed ${completedCount} out of ${publicHabits.length} daily habits. Securing the remaining habits locks in streak protection.`
                            }
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {habitToast && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center animate-fade-in">
                    {habitToast}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. PRICING PLANS */}
      <section id="pricing" className="py-24 bg-secondary border-b border-border transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase block">
              MEMBERSHIP TIERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white uppercase">
              CHOOSE YOUR <span className="text-[var(--accent-gold)]">TRAINING TIER</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Unlock the entire AlexFitnessHub ecosystem with premium slow-mo kinesiologist guides, macro calculations, and unlimited AI Coach calibrations.
            </p>
            <div className="h-1 w-16 bg-[var(--accent-gold)] mx-auto mt-3" />
          </div>

          {/* Plan Category Quick Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto mb-10 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all duration-300 ${
                selectedPlan === "monthly"
                  ? "bg-[#D32F2F] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Monthly Starter
            </button>
            <button
              onClick={() => setSelectedPlan("volume")}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all duration-300 ${
                selectedPlan === "volume"
                  ? "bg-[#D32F2F] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              2-6 Mo. Volume Selection
            </button>
            <button
              onClick={() => setSelectedPlan("annual")}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all duration-300 ${
                selectedPlan === "annual"
                  ? "bg-[var(--accent-gold)] text-[var(--gold-btn-text)] shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              VIP Elite Club (Annual)
            </button>
          </div>

          {/* Interactive Tier Selection Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-12">
            
            {/* TIER 1: MONTHLY */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                setSelectedPlan("monthly");
                scrollToCheckout();
              }}
              className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border flex flex-col justify-between cursor-pointer transition-all duration-350 relative ${
                selectedPlan === "monthly" 
                  ? "border-2 border-[#D32F2F] ring-4 ring-red-500/10 shadow-lg" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <div className="text-left">
                <span className="text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  MONTHLY STARTER
                </span>
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-slate-900 dark:text-white">₦19,999</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1">/ 1 Month</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed font-sans font-medium">
                  Perfect entry-level plan to experience kinesiologist routines and baseline macro plans.
                </p>
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-[10px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                    Complete Exercise Library
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                    Interactive Calorie Calibrator
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
                    <Lock className="w-3 h-3 shrink-0" />
                    Slow-mo Biomechanics (Locked)
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span className={`w-full block py-2.5 text-center font-sans font-bold text-[10px] uppercase rounded-full transition-all duration-200 ${
                  selectedPlan === "monthly"
                    ? "bg-[#D32F2F] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                }`}>
                  Select Monthly
                </span>
              </div>
            </motion.div>

            {/* TIER 2: VOLUME SELECTION (2 - 6 Months) */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                setSelectedPlan("volume");
                scrollToCheckout();
              }}
              className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border flex flex-col justify-between cursor-pointer transition-all duration-350 relative ${
                selectedPlan === "volume" 
                  ? "border-2 border-[#D32F2F] ring-4 ring-red-500/10 shadow-lg animate-[pulse-glow_2s_infinite]" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D32F2F] text-white text-[8px] font-sans font-black uppercase tracking-wider px-3 py-1 rounded-full z-10">
                DYNAMIC VOLUME SAVINGS
              </div>
              <div className="text-left">
                <span className="text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-[#D32F2F]">
                  FLEXIBLE VOLUME
                </span>
                
                {/* Dynamic Price Display */}
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
                    {selectedMonths === 2 && "₦35,999"}
                    {selectedMonths === 3 && "₦49,999"}
                    {selectedMonths === 4 && "₦63,999"}
                    {selectedMonths === 5 && "₦77,999"}
                    {selectedMonths === 6 && "₦89,999"}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1">/ {selectedMonths} Months</span>
                  
                  {/* Saving Badge */}
                  <div className="mt-1">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
                      {selectedMonths === 2 && "Save ₦3,999 (10% Off)"}
                      {selectedMonths === 3 && "Save ₦9,998 (17% Off)"}
                      {selectedMonths === 4 && "Save ₦15,997 (20% Off)"}
                      {selectedMonths === 5 && "Save ₦21,996 (22% Off)"}
                      {selectedMonths === 6 && "Save ₦29,995 (25% Off)"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed font-sans font-medium">
                  Unlock dynamic, high-volume duration plans with compounding package savings to match your exact goals.
                </p>

                {/* Interactive Dynamic Controls */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <span className="text-[9px] font-sans font-extrabold text-slate-500 dark:text-slate-400 uppercase block tracking-wider text-center">
                    SELECT DURATION CAPACITY
                  </span>
                  
                  {/* Row of Buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonths(m);
                          setSelectedPlan("volume");
                        }}
                        className={`py-2 rounded-xl text-xs font-sans font-black transition-all ${
                          selectedMonths === m && selectedPlan === "volume"
                            ? "bg-[#D32F2F] text-white shadow-sm scale-105"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>

                  {/* Range Slider */}
                  <div className="pt-1.5">
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={selectedMonths}
                      onChange={(e) => {
                        setSelectedMonths(parseInt(e.target.value));
                        setSelectedPlan("volume");
                      }}
                      className="w-full accent-[#D32F2F] cursor-pointer bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 mt-1">
                      <span>2 MONTHS</span>
                      <span>3 MONTHS</span>
                      <span>4 MONTHS</span>
                      <span>5 MONTHS</span>
                      <span>6 MONTHS</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-[10px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                    Complete Exercise Library
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                    Interactive Calorie Calibrator
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D32F2F] shrink-0" />
                    HD slow-mo guides & Eccentric models
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span className={`w-full block py-2.5 text-center font-sans font-bold text-[10px] uppercase rounded-full transition-all duration-200 ${
                  selectedPlan === "volume"
                    ? "bg-[#D32F2F] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                }`}>
                  Select Volume Plan
                </span>
              </div>
            </motion.div>

            {/* TIER 3: ANNUAL PLAN */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => {
                setSelectedPlan("annual");
                scrollToCheckout();
              }}
              className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border flex flex-col justify-between cursor-pointer transition-all duration-350 relative ${
                selectedPlan === "annual" 
                  ? "border-2 border-[var(--accent-gold)] ring-4 ring-yellow-500/10 shadow-lg" 
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
              }`}
            >
              <div className="absolute -top-3 right-4 bg-[var(--accent-gold)] text-[var(--gold-btn-text)] text-[8px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                10% DISCOUNT
              </div>
              <div className="text-left">
                <span className="text-[9px] font-sans font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/30 text-[var(--accent-gold)] font-extrabold">
                  VIP ELITE CLUB
                </span>
                <div className="mt-4">
                  <span className="text-3xl font-display font-black text-slate-900 dark:text-white">₦215,989</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1">/ 12 Months</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 leading-relaxed font-sans font-medium">
                  Uncapped premium access for serious athletes establishing permanent high performance.
                </p>
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-[10px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                    Complete Exercise Library
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                    All Current & Future Core Features
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                    VIP Digital Onboarding & Reports
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span className={`w-full block py-2.5 text-center font-sans font-bold text-[10px] uppercase rounded-full transition-all duration-200 ${
                  selectedPlan === "annual"
                    ? "bg-[var(--accent-gold)] text-[var(--gold-btn-text)]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                }`}>
                  Select Annual
                </span>
              </div>
            </motion.div>

          </div>

          {/* Dynamic Billing Summary & Secure Checkout Panel */}
          <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto mb-16 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-850 p-6 sm:p-8 shadow-xl transition-colors duration-300">
            
            {/* Left: Premium Benefits Checklist */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h4 className="text-base font-display font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[var(--accent-gold)]" />
                  Premium Elite Athlete Benefits
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Here is why upgrading to premium makes your physical transformation effortless:
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>1,200+ Guides</strong>: Anatomical, high-contrast, looping loops.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>0.5x Slow-Motion</strong>: Complete biomechanical visual feedback.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>3s Eccentric coaching</strong>: Maximum muscle fiber recruitment.</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>AI Nutrition Planner</strong>: High protein staple foods calibration.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Continuous AI Coach</strong>: Direct access to Chat calibrations.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Transformation Dashboard</strong>: Persistent metrics monitoring.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Billing Summary & Paystack Action */}
            <div id="activate-premium-access-section" className="lg:col-span-5 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <span className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                  ✓ SECURE SUBSCRIPTION CHECKOUT
                </span>
                <h4 className="text-sm font-sans font-black text-slate-900 dark:text-white uppercase mt-2">
                  Billing Summary
                </h4>
              </div>

              {/* Dynamic Summary Values */}
              <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Selected Plan:</span>
                  <span className="text-slate-900 dark:text-white font-extrabold uppercase">
                    {selectedPlan === "monthly" && "Monthly Starter (1 Month)"}
                    {selectedPlan === "volume" && `Volume Selection (${selectedMonths} Months)`}
                    {selectedPlan === "annual" && "VIP Elite Club (12 Months)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Cost:</span>
                  <span className="line-through text-slate-400">
                    {selectedPlan === "monthly" && "₦19,999"}
                    {selectedPlan === "volume" && `₦${(19999 * selectedMonths).toLocaleString()}`}
                    {selectedPlan === "annual" && "₦239,988"}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Package Discount:</span>
                  <span>
                    {selectedPlan === "monthly" && "₦0"}
                    {selectedPlan === "volume" && (() => {
                      if (selectedMonths === 2) return "-₦3,999";
                      if (selectedMonths === 3) return "-₦9,998";
                      if (selectedMonths === 4) return "-₦15,997";
                      if (selectedMonths === 5) return "-₦21,996";
                      if (selectedMonths === 6) return "-₦29,995";
                      return "₦0";
                    })()}
                    {selectedPlan === "annual" && "-₦23,999"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white text-sm font-black pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span>DUE TODAY:</span>
                  <span>
                    {selectedPlan === "monthly" && "₦19,999"}
                    {selectedPlan === "volume" && (() => {
                      if (selectedMonths === 2) return "₦35,999";
                      if (selectedMonths === 3) return "₦49,999";
                      if (selectedMonths === 4) return "₦63,999";
                      if (selectedMonths === 5) return "₦77,999";
                      if (selectedMonths === 6) return "₦89,999";
                      return "₦0";
                    })()}
                    {selectedPlan === "annual" && "₦215,989"}
                  </span>
                </div>
              </div>

              {/* Paystack Payment Notice */}
              <div className="flex items-center gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Billed securely via Paystack. Your details are encrypted with bank-level protocol protections. Complete payment to activate your premium benefits instantly.</span>
              </div>

              {/* Checkout CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectedPlan === "monthly") {
                    handleInitiatePayment("monthly", 1);
                  } else if (selectedPlan === "volume") {
                    handleInitiatePayment("multi", selectedMonths);
                  } else if (selectedPlan === "annual") {
                    handleInitiatePayment("yearly");
                  }
                }}
                disabled={submittingPlan !== null}
                className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
              >
                {submittingPlan ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>CONTACTING PAYSTACK CORE...</span>
                  </span>
                ) : (
                  <>
                    <span>ACTIVATE PREMIUM ACCESS NOW</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </motion.button>
              {checkoutError && (
                <p className="text-[10px] text-red-500 text-center font-bold">{checkoutError}</p>
              )}
            </div>

          </div>

          {/* Pricing Feature Comparison Grid */}
          <div className="max-w-5xl mx-auto mb-16 space-y-4">
            <h4 className="text-xs font-sans font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-center">
              PRICING PLAN COMPARISON
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-sans font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                    <th className="p-4">FEATURING PROTOCOLS</th>
                    <th className="p-4 text-center">FREE ATHLETE</th>
                    <th className="p-4 text-center text-red-600 dark:text-red-400">PREMIUM ELITE ATHLETE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                  <tr>
                    <td className="p-4 font-bold">1,200+ Visual Exercise Database</td>
                    <td className="p-4 text-center text-slate-400">Basic Guides Only</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Unrestricted Access</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">0.5x Slow-Motion Biomechanics</td>
                    <td className="p-4 text-center text-slate-400">❌ Locked</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Complete Loop Playback</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">3s Eccentric & Slow-Negative Guides</td>
                    <td className="p-4 text-center text-slate-400">❌ Locked</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ All Movements Enabled</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">AI Progressive Nutrient Calibrator</td>
                    <td className="p-4 text-center text-slate-400">Standard Calculator</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Daily Micro-Adjustments</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Uncapped Live AI Coach Chat</td>
                    <td className="p-4 text-center text-slate-400">❌ Locked</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Unlimited Calibrations</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Transformation Progress Dashboard</td>
                    <td className="p-4 text-center text-slate-400">❌ Locked</td>
                    <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">✓ Persistent Logs & Milestones</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Secure Shield Protection Callout */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center transition-colors duration-300">
            <Shield className="w-8 h-8 text-[var(--accent-gold)] mb-3 animate-pulse" />
            <h6 className="text-[10px] font-sans font-black uppercase tracking-wider text-slate-900 dark:text-white">100% Risk-Free 14-Day Refund Promise</h6>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
              Try premium with complete confidence. If our workout tracking or AI coaching does not upgrade your daily routine, request reimbursement within 14 days for rapid secure processing.
            </p>
          </div>

        </motion.div>
      </section>

      {/* 6. DYNAMIC ACCORDION FAQS SYSTEM */}
      <section id="faqs-segment" className="py-24 bg-background border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              GET RESPONSES
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              FREQUENTLY ASKED <span className="text-[#C0392B]">QUESTIONS</span>
            </h2>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-3" />
          </div>

          <div className="space-y-4">
            {faqsList.map((item, idx) => (
              <div 
                key={idx} 
                className="overflow-hidden rounded-xl border border-gray-200 bg-[#F7F7F7]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-sans font-extrabold text-[#1C1C1C] text-xs uppercase cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-[#C0392B] shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${openFAQ === idx ? "rotate-180" : ""}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFAQ === idx ? "max-h-[300px] border-t border-gray-200 p-5 bg-white" : "max-h-0"
                  }`}
                >
                  <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </section>

      {/* 7. CONTACT / PREMIUM CONSULTATION FORM */}
      <section id="contact" className="py-24 bg-secondary border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-sans font-black tracking-[0.2em] text-[#6B6B6B] uppercase block">
              SUPPORT CHANNELS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#1C1C1C] uppercase">
              CONNECT WITH <span className="text-[#C0392B]">COACHES</span>
            </h2>
            <div className="h-1 w-16 bg-[#C0392B] mx-auto mt-3" />
          </div>

          <div className="max-w-2xl mx-auto bg-white border border-gray-200 p-8 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-4 text-left">
                <div className="mx-auto w-12 h-12 bg-[#C0392B]/10 text-[#C0392B] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-display font-black text-[#1C1C1C] uppercase text-center">Inquiry Received</h4>
                <p className="text-xs text-[#6B6B6B] max-w-md mx-auto leading-relaxed text-center">
                  Thank you, <strong className="text-[#1C1C1C]">{contactName}</strong>! Your inquiry regarding <strong className="text-[#1C1C1C]">{contactGoal.toUpperCase()}</strong> has been captured. The coaching desk will evaluate your requirements and follow up via <span className="underline">{contactEmail}</span> within 24 working hours.
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-5 py-2.5 bg-[#1C1C1C] hover:bg-black text-white rounded-full text-[10px] font-sans font-black uppercase tracking-wider transition inline-block mx-auto text-center"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6 text-left">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-sans font-black text-[#6B6B6B] uppercase tracking-widest">YOUR FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F7F7] text-[#1C1C1C] focus:ring-2 focus:ring-[#C0392B]/20 focus:outline-none transition text-xs font-sans"
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-sans font-black text-[#6B6B6B] uppercase tracking-widest">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F7F7] text-[#1C1C1C] focus:ring-2 focus:ring-[#C0392B]/20 focus:outline-none transition text-xs font-sans"
                      placeholder="e.g. alex@domain.com"
                    />
                  </div>
                </div>

                {/* Goal category field */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-sans font-black text-[#6B6B6B] uppercase tracking-widest">PRIMARY PHYSICAL GOAL</label>
                  <select
                    value={contactGoal}
                    onChange={(e) => setContactGoal(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F7F7] text-[#1C1C1C] focus:ring-2 focus:ring-[#C0392B]/20 focus:outline-none transition text-xs font-sans uppercase font-bold"
                  >
                    <option value="hypertrophy">Hypertrophy (Anabolic Muscle Gain)</option>
                    <option value="fat_loss">Fat Shred Cycles (Metabolic Burn)</option>
                    <option value="calisthenics">Bodyweight Leverage stability</option>
                    <option value="rehabilitation">Joint Posture Rehabilitation</option>
                    <option value="nutrition">Custom Macronutrient profiling</option>
                  </select>
                </div>

                {/* Message details field */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-sans font-black text-[#6B6B6B] uppercase tracking-widest">SPECIFIC ATHLETIC ENQUIRY</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F7F7] text-[#1C1C1C] focus:ring-2 focus:ring-[#C0392B]/20 focus:outline-none transition text-xs leading-relaxed"
                    placeholder="Describe your current lifting stats, weekly training splits, and any dietary requirements..."
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 bg-[#C0392B] hover:bg-[#A82E22] text-white font-sans font-black text-xs uppercase cursor-pointer rounded-xl transition duration-200 flex items-center justify-center gap-2 tracking-widest shadow-md active:scale-98"
                >
                  {isSubmittingContact ? "TRANSMITTING INQUIRY..." : "SEND SIGNAL MESSAGE"}
                </button>
              </form>
            )}
          </div>

        </motion.div>
      </section>



      {/* 9. EMBEDDED PREMIUM ACTIVATION OVERLAY (PAYSTACK DISPLAY NAVIGATOR) */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl relative text-slate-900">
            
            {/* HUD portal header */}
            <div className="bg-slate-50 p-5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D32F2F] fill-[#D32F2F]" />
                <span className="font-display font-black tracking-wider text-xs uppercase text-slate-800">
                  PAYSTACK SECURE TRANSFORMATION GATEWAY
                </span>
              </div>
              {checkoutError && (
                <button 
                  onClick={() => {
                    setActivePaymentModal(null);
                    setSubmittingPlan(null);
                    setCheckoutError(null);
                  }} 
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors no-scroll-top border-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-6 text-xs font-sans">
              
              {checkoutError ? (
                <div className="space-y-4 py-4">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 leading-relaxed font-sans text-left font-semibold">
                    <strong className="text-sm font-bold block mb-1 text-red-700">Initialization Failed</strong>
                    {checkoutError}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentModal(null);
                      setSubmittingPlan(null);
                      setCheckoutError(null);
                    }}
                    className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-sans font-bold text-xs uppercase rounded-xl transition duration-200 no-scroll-top cursor-pointer border-0 shadow-sm"
                  >
                    Return to pricing plans
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Beautiful Loading Core Indicator */}
                  <div className="flex flex-col items-center justify-center space-y-4 text-center py-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D32F2F] border-t-transparent" />
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">
                        ALEXFITNESSHUB SECURE CONSOLE
                      </h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                        INITIALIZING PAYSTACK CHECKOUT GATEWAY
                      </p>
                    </div>
                  </div>
 
                  {/* Transaction Parameters */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-left shadow-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200 font-mono text-[10px] text-slate-500 font-bold">
                      <span>SECURE CONNECTION</span>
                      <span className="text-emerald-600 font-bold uppercase">● ESTABLISHED</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">ATHLETE PROFILE:</span>
                      <span className="font-bold text-slate-800">{user?.email}</span>
                    </div>
 
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">MEMBERSHIP LEVEL:</span>
                      <span className="font-bold text-[#D32F2F] uppercase">
                        {activePaymentModal === "yearly" 
                          ? "VIP Elite Club (12M)" 
                          : activePaymentModal === "multi" 
                          ? `Flexible Span (${selectedMonths}M)` 
                          : "Monthly Elite (1M)"}
                      </span>
                    </div>
 
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono text-[10px] uppercase font-semibold">DUE VALUE TODAY:</span>
                      <span className="font-black text-slate-900 text-sm">
                        ₦{(activePaymentModal === "yearly" 
                          ? yearlyPriceAnnual 
                          : activePaymentModal === "multi" 
                          ? multiMonthTotal 
                          : basePriceMonthly).toLocaleString()}
                      </span>
                    </div>
                  </div>
 
                  {/* Connection log terminal simulation */}
                  <div className="rounded-lg bg-slate-100 p-3.5 border border-slate-200 font-mono text-[9px] text-slate-600 space-y-1.5 text-left leading-normal">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D32F2F] font-bold">&gt;</span>
                      <span>Enabling SSL/TLS 1.3 socket tunnel...</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D32F2F] font-bold">&gt;</span>
                      <span>Requesting checkout redirect from paystack.co...</span>
                    </div>
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <span className="text-[#D32F2F] font-bold">&gt;</span>
                      <span className="text-slate-800 font-bold">Awaiting secure authorization handshakes...</span>
                    </div>
                  </div>
 
                  {/* Redirection Notice */}
                  <p className="text-[10px] text-slate-500 leading-normal text-center max-w-sm mx-auto font-semibold">
                    Please do not close, refresh, or navigate away. Redirection takes place automatically. After successful payment, your Premium account access will unlock instantly.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 10. SYSTEM FOOTER */}
      <footer className="bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800/80 py-16 font-sans text-left transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          <div className="space-y-4 col-span-1 sm:col-span-2 lg:col-span-1">
            <Logo size="sm" showSubtext={true} />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Deploying elite exercise kinesis benchmarks, absolute macronutrient nutrition tracking, and unified AI-powered consultation.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-[#C0392B] mb-3">Training Solutions</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
              <li><button onClick={() => setView("library")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Treadmill Walk 12-30-3</button></li>
              <li><button onClick={() => setView("library")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Chest Isolation Press</button></li>
              <li><button onClick={() => setView("library")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Home Shred Workouts</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-[#C0392B] mb-3">Premium Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
              <li><button onClick={() => setView("home")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Flexible Selectors</button></li>
              <li><button onClick={() => setView("daily-plan")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Daily Training Schedule</button></li>
              <li><button onClick={() => setView("coach")} className="hover:text-[#C0392B] dark:hover:text-[#C0392B] transition-colors cursor-pointer text-left">Gemini AI Assistant</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-sans font-black uppercase tracking-widest text-[#C0392B] mb-3">Customer Support</h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans space-y-2">
              <p>Have questions or transaction inquiries? Contact Coach Alex:</p>
              <div>
                <span className="font-bold text-[#C0392B] uppercase text-[9px] block">Email Address</span>
                <a href="mailto:alexfitnesshub@gmail.com" className="text-[10px] text-white bg-[#C0392B] px-2.5 py-1 rounded inline-block font-mono hover:bg-[#A82E22] transition-colors mt-0.5">alexfitnesshub@gmail.com</a>
              </div>
              <div className="pt-1">
                <span className="font-bold text-[#C0392B] uppercase text-[9px] block">WhatsApp / Phone</span>
                <a href="https://wa.me/2347073307875" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white bg-[#C0392B] px-2.5 py-1 rounded inline-block font-mono hover:bg-[#A82E22] transition-colors mt-0.5">+2347073307875</a>
              </div>

            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <NewsletterSubscription />
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200 dark:border-slate-800/80 text-left text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Alex Fitness Inc. All rights reserved.</p>
        </div>

      </footer>
    </div>
  );
}
