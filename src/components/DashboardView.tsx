import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, Calendar, CheckCircle, Award, 
  BookOpen, ChevronRight, Play, Star, Plus, 
  Trash2, Bell, Sparkles, RefreshCw, Activity, 
  CheckCircle2, Info, ArrowRight, ShieldCheck,
  Flame, Droplet, Clock, Coffee, ChevronDown,
  ChevronUp, Scale, AlertCircle, Dumbbell,
  MessageSquare, ChefHat, Tv, Users, Menu, X,
  Timer, RotateCcw, Pause, Heart, Info as InfoIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Import other workspace views
import WorkoutLibrary from "./WorkoutLibrary";
import WorkoutVideos from "./WorkoutVideos";
import SavedExercisesView from "./SavedExercisesView";
import NutritionView from "./NutritionView";
import DailyPlanView from "./DailyPlanView";
import CoachView from "./CoachView";
import CommunityView from "./CommunityView";
import PageHero from "./PageHero";
import { useCentralizedExercises } from "../hooks/useCentralizedExercises";
import { UnifiedExerciseMedia } from "./UnifiedExerciseMedia";
import PersistentDashboardTabs from "./PersistentDashboardTabs";

interface DashboardProps {
  activeView?: string;
  setView: (view: string) => void;
}

export default function DashboardView({ activeView = "dashboard", setView }: DashboardProps) {
  const { 
    user, 
    loading,
    weightLogs, 
    addWeightLogAction,
    vitalsLogs,
    addVitalsLogAction,
    updateProfilePicture,
    weeklyReports,
    loadWeeklyReports,
    triggerWeeklyReportGeneration,
    activityLogs,
    theme,
    setTheme
  } = useApp();

  const isPremium = user && (user.subscriptionStatus === "premium" || user.role === "admin");

  const getSubscriptionExpiryDays = () => {
    if (!user || !user.subscriptionExpiry || user.subscriptionStatus !== "premium") return null;
    const expiry = new Date(user.subscriptionExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const expiryDays = getSubscriptionExpiryDays();
  const showExpiryAlert = expiryDays !== null && expiryDays >= 0 && expiryDays <= 7;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image must be smaller than 800KB. Please compress your image first.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          try {
            await updateProfilePicture(reader.result);
          } catch (err) {
            console.error("Failed to update profile picture:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Local state for sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active workspace tab out of the 13 sections
  // Defaulting to "workouts"
  const [activeTab, setActiveTab] = useState<string>("workouts");

  // Smoothly scroll to the top of the viewport whenever the dashboard active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Auto-redirect and guard for non-premium users removed to support Free Dashboard with in-tab locks
  useEffect(() => {
    // If navigating directly from the Navbar, align the active tab with the clicked view ID
    if (activeView === "weekly-reports") setActiveTab("reports");
    else if (activeView === "daily-habit-tracker") setActiveTab("habits");
    else if (activeView === "daily-calibration-desk") setActiveTab("calibration");
    else if (activeView === "handbook") setActiveTab("handbook");
    else if (activeView === "weight-trajectory") setActiveTab("trajectory");
    else if (activeView === "workouts") setActiveTab("workouts");
    else if (activeView === "routines-sets") setActiveTab("routines");
    else if (activeView === "videos") setActiveTab("videos");
    else if (activeView === "saved-exercises") setActiveTab("saved");
    else if (activeView === "nutrition") setActiveTab("nutrition");
    else if (activeView === "my-plan") setActiveTab("plan");
    else if (activeView === "ai-coach") setActiveTab("coach");
    else if (activeView === "community") setActiveTab("community");
  }, [activeView]);

  // Load weekly reports on mount
  useEffect(() => {
    if (user && isPremium) {
      loadWeeklyReports().catch(err => console.warn("Failed to load reports:", err));
    }
  }, [user, isPremium]);

  // Navigation Items defined with strict categories matching the 13 required sections
  const menuCategories = [
    {
      title: "Physical Performance",
      items: [
        { id: "workouts", label: "Workouts Library", icon: Dumbbell, desc: "Gym & Home Programs" },
        { id: "routines", label: "Routines & Sets", icon: Activity, desc: "Progressive Overload" },
        { id: "plan", label: "My Daily Plan", icon: Calendar, desc: "Splits & Recovery" },
        { id: "saved", label: "Saved Exercises", icon: Star, desc: "Personal Catalog" },
      ]
    },
    {
      title: "Active Coaching",
      items: [
        { id: "coach", label: "AI Sports Coach", icon: MessageSquare, desc: "24/7 Personal Guidance" },
        { id: "nutrition", label: "Nutrition Planner", icon: ChefHat, desc: "Macros & Caloric Targets" },
        { id: "videos", label: "Workout Videos", icon: Tv, desc: "Premium Form Catalog" },
        { id: "handbook", label: "Science Handbook", icon: BookOpen, desc: "Hypertrophy Guides" },
      ]
    },
    {
      title: "Biometrics & Analytics",
      items: [
        { id: "reports", label: "Weekly Audits", icon: Award, desc: "AI Progress Insights" },
        { id: "calibration", label: "Calibration Desk", icon: Clock, desc: "Physiological Metrics" },
        { id: "trajectory", label: "Weight Trajectory", icon: Scale, desc: "Recomposition Slopes" },
        { id: "habits", label: "Habit Tracker", icon: CheckCircle, desc: "Routine Compliance" },
      ]
    },
    {
      title: "Social Interaction",
      items: [
        { id: "community", label: "Athlete Community", icon: Users, desc: "Group Training Hub" },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen text-slate-900 dark:text-white">
      
      {/* Main Workspace Layout (Sidebar Left, Workspace Content Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* ==========================================
            DESKTOP SIDEBAR / MOBILE SLIDE-OUT PANEL
            ========================================== */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 border-r border-slate-100 shadow-2xl transition-transform duration-300 transform lg:transform-none lg:static lg:z-auto lg:shadow-none lg:p-0 lg:border-r-0 lg:bg-transparent lg:col-span-3
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Close button for Mobile Sidebar */}
          <div className="lg:hidden flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D32F2F]" />
              <span className="text-xs font-sans font-black text-slate-900 uppercase tracking-wider">MASTER DESK</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-slate-500 hover:text-black cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Miniature Active User Profile Container */}
          <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-250 mb-6 flex items-center gap-3 shadow-sm">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePicUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-10 h-10 rounded-full group cursor-pointer overflow-hidden shadow-md flex items-center justify-center shrink-0 border border-slate-250 bg-slate-100"
              title="Click to upload/change profile photo"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#D32F2F] to-[#B71C1C] flex items-center justify-center text-white font-black text-sm uppercase">
                  {user?.displayName ? user.displayName[0] : "A"}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-black uppercase tracking-wider transition-opacity duration-150">
                Edit
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black truncate uppercase tracking-tight font-sans leading-none text-slate-900">
                {user?.displayName || "Elite Athlete"}
              </h4>
              <p className="text-[9px] text-slate-500 truncate mt-1 leading-none font-mono">
                {user?.email}
              </p>
              {isPremium ? (
                <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-md mt-2">
                  👑 Premium Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-slate-700 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded-md mt-2">
                  ⭐ Free Plan
                </span>
              )}

              {/* Theme Selector inside settings card */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[8px] font-sans font-black uppercase tracking-wider text-slate-400">Theme</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer transition-all ${
                      theme === "light" 
                        ? "bg-white text-[#D32F2F] shadow-xs" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer transition-all ${
                      theme === "dark" 
                        ? "bg-[#D32F2F] text-white shadow-xs" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Navigation Sidebar List */}
          <div className="space-y-5 overflow-y-auto max-h-[70vh] scrollbar-none pr-1">
            {menuCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[8px] font-sans font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block px-2">
                  {cat.title}
                </span>
                
                <div className="space-y-1">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false); // Close sidebar on mobile select
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border cursor-pointer transition-all duration-150 ${
                          isActive
                            ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md scale-[1.01]"
                            : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-850 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-sans font-black uppercase tracking-wide leading-none">
                            {item.label}
                          </p>
                          <p className={`text-[8px] mt-0.5 truncate ${isActive ? "text-white/80" : "text-slate-400"}`}>
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backdrop overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ==========================================
            MAIN ACTIVE WORKSPACE CONTENT COLUMN
            ========================================== */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Expiry Notification Banner */}
          {showExpiryAlert && (
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-sans font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Premium Subscription Expiring Soon
                  </h4>
                  <p className="text-[11px] text-amber-700/95 dark:text-amber-500/90 mt-1 leading-relaxed font-semibold">
                    Your premium subscription is expiring in <strong className="font-extrabold">{expiryDays === 0 ? "today" : expiryDays === 1 ? "1 day" : `${expiryDays} days`}</strong> on {new Date(user!.subscriptionExpiry!).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}. Renew now to preserve full access to elite training library, custom nutritional splits, active AI coaching, and biometrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setView("home");
                  setTimeout(() => {
                    const el = document.getElementById("pricing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-sans font-black uppercase tracking-wider rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
              >
                Renew Premium Now
              </button>
            </div>
          )}

          {/* Persistent sub-navigation tabs */}
          <PersistentDashboardTabs 
            activeTab={activeTab}
          />

          {/* Main workspace section renderer */}
          <div className="transition-all duration-300 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-900 shadow-sm min-h-[75vh]">
            <AnimatePresence mode="wait">
              {!isPremium && ["plan", "coach", "nutrition", "videos", "handbook", "reports", "calibration", "trajectory", "habits", "community"].includes(activeTab) ? (
                <motion.div
                  key="lock-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <PremiumLockCard 
                    setView={setView}
                    tabLabel={
                      activeTab === "plan" ? "Athletic Daily Plan" :
                      activeTab === "coach" ? "AI Personal Coach" :
                      activeTab === "nutrition" ? "Nutrition Macro Planner" :
                      activeTab === "videos" ? "Technique Video Guides" :
                      activeTab === "handbook" ? "Science Handbook" :
                      activeTab === "reports" ? "Weekly Biometric Audits" :
                      activeTab === "calibration" ? "Physiological Calibration Desk" :
                      activeTab === "trajectory" ? "Weight Recomposition Trajectory" :
                      activeTab === "habits" ? "Habit Compliance Tracker" :
                      "Athlete Community Hub"
                    } 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* 1. Workouts Section */}
                  {activeTab === "workouts" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Specialized <span className="text-[#D32F2F]">Workout Library</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Select elite sports science programs, custom splits, and home resistance sessions.
                        </p>
                      </div>
                      <WorkoutLibrary setView={setView} />
                    </div>
                  )}

                  {/* 2. Routines & Sets (Custom Dynamic Suite) */}
                  {activeTab === "routines" && <RoutinesAndSetsView />}

                  {/* 3. Daily Plan */}
                  {activeTab === "plan" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          My Daily <span className="text-[#D32F2F]">Athletic Plan</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Your dynamic, fully integrated split generator and custom daily exercise checklist.
                        </p>
                      </div>
                      <DailyPlanView />
                    </div>
                  )}

                  {/* 4. Saved Exercises */}
                  {activeTab === "saved" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Personalized <span className="text-[#D32F2F]">Catalog</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Browse, log, and access workouts saved specifically for your current fitness trajectory.
                        </p>
                      </div>
                      <SavedExercisesView setView={setView} />
                    </div>
                  )}

                  {/* 5. AI Sports Coach */}
                  {activeTab === "coach" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Elite <span className="text-[#D32F2F]">AI Personal Coach</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Get instant bio-mechanical form feedback, metabolic calculators, and tailored routine optimization tips.
                        </p>
                      </div>
                      <CoachView />
                    </div>
                  )}

                  {/* 6. Nutrition Planner */}
                  {activeTab === "nutrition" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Macro <span className="text-[#D32F2F]">Caloric Targets</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Configure meals, macro targets, dynamic metabolic calculations, and macro guidelines.
                        </p>
                      </div>
                      <NutritionView />
                    </div>
                  )}

                  {/* 7. Workout Videos */}
                  {activeTab === "videos" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Form <span className="text-[#D32F2F]">Video Guides</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Stream crystal-clear, high-definition instructional video workouts featuring perfect technique demonstrations.
                        </p>
                      </div>
                      <WorkoutVideos />
                    </div>
                  )}

                  {/* 8. Handbook */}
                  {activeTab === "handbook" && <HandbookView />}

                  {/* 9. Weekly Audits */}
                  {activeTab === "reports" && <WeeklyReportsView reports={weeklyReports} onGenerate={triggerWeeklyReportGeneration} />}

                  {/* 10. Calibration Desk */}
                  {activeTab === "calibration" && <CalibrationDeskView />}

                  {/* 11. Weight Trajectory */}
                  {activeTab === "trajectory" && <TrajectoryView logs={weightLogs} onLog={addWeightLogAction} userWeight={user?.weight || 80} />}

                  {/* 12. Habit Tracker */}
                  {activeTab === "habits" && <HabitTrackerView />}

                  {/* 13. Athlete Community */}
                  {activeTab === "community" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
                          Athlete <span className="text-[#D32F2F]">Community Hub</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Connect, share splits, and discuss sports science breakthroughs with other elite members.
                        </p>
                      </div>
                      <CommunityView />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function PremiumLockCard({ tabLabel, setView }: { tabLabel: string; setView: (view: string) => void }) {
  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center animate-fade-in">
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-250 dark:border-slate-800 shadow-md space-y-4">
        <div className="h-12 w-12 bg-[#D32F2F]/10 text-[#D32F2F] rounded-full flex items-center justify-center mx-auto border border-[#D32F2F]/20">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-sm font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
          {tabLabel} Locked
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          This feature requires an active Alex Fitness Hub Premium subscription. Unlock our complete sports science training protocols, macro nutrition planners, 24/7 AI personal coaching, and progressive biometric tracking.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setView("home");
              setTimeout(() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 150);
            }}
            className="w-full py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-[10px] font-sans font-black uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
          >
            Unlock Premium Access
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// CUSTOM INTERACTIVE ROUTINES & SETS SUBVIEW (ROUTINES)
// =========================================================
interface LoggedSet {
  id: string;
  weight: number;
  reps: number;
  type: "Standard" | "Superset" | "Drop Set";
  done: boolean;
}

interface RoutineExercise {
  id: string;
  name: string;
  sets: LoggedSet[];
}

function RoutinesAndSetsView() {
  const { exercises } = useCentralizedExercises();
  // Available Workout Splits templates
  const splitsTemplates: Array<{ id: string; name: string; desc: string; exercises: RoutineExercise[] }> = [
    {
      id: "ppl",
      name: "Push / Pull / Legs Split",
      desc: "Optimized 3-day frequency split targeting specific muscle groups with maximum recovery.",
      exercises: [
        { id: "1", name: "Incline Barbell Bench Press", sets: [{ id: "s1", weight: 80, reps: 8, type: "Standard", done: false }] },
        { id: "2", name: "Seated Dumbbell Shoulder Press", sets: [{ id: "s2", weight: 24, reps: 10, type: "Standard", done: false }] },
        { id: "3", name: "Dumbbell Lateral Raises", sets: [{ id: "s3", weight: 12, reps: 15, type: "Superset", done: false }] },
        { id: "4", name: "Cable Chest Flyes", sets: [{ id: "s4", weight: 25, reps: 12, type: "Drop Set", done: false }] }
      ]
    },
    {
      id: "arnold",
      name: "Arnold Hypertrophy Split",
      desc: "High volume aesthetic split pairing antagonistic muscle groups for massive pumps.",
      exercises: [
        { id: "1", name: "Weighted Chest Dips", sets: [{ id: "s1", weight: 20, reps: 8, type: "Standard", done: false }] },
        { id: "2", name: "Weighted Pull-Ups", sets: [{ id: "s2", weight: 15, reps: 8, type: "Standard", done: false }] },
        { id: "3", name: "Incline Dumbbell Press", sets: [{ id: "s3", weight: 32, reps: 10, type: "Standard", done: false }] },
        { id: "4", name: "Barbell Rows", sets: [{ id: "s4", weight: 70, reps: 10, type: "Standard", done: false }] }
      ]
    },
    {
      id: "strength",
      name: "5x5 Athletic Power Lift",
      desc: "Focused barbell strength program centering central nervous system efficiency.",
      exercises: [
        { id: "1", name: "Barbell Back Squats", sets: [{ id: "s1", weight: 120, reps: 5, type: "Standard", done: false }] },
        { id: "2", name: "Barbell Flat Bench Press", sets: [{ id: "s2", weight: 95, reps: 5, type: "Standard", done: false }] },
        { id: "3", name: "Conventional Barbell Deadlifts", sets: [{ id: "s3", weight: 140, reps: 5, type: "Standard", done: false }] }
      ]
    }
  ];

  const [activeSplitId, setActiveSplitId] = useState("ppl");
  const [activeExercises, setActiveExercises] = useState<RoutineExercise[]>(splitsTemplates[0].exercises);

  // Switch template
  const handleSelectTemplate = (id: string) => {
    setActiveSplitId(id);
    const templ = splitsTemplates.find(t => t.id === id);
    if (templ) {
      setActiveExercises(JSON.parse(JSON.stringify(templ.exercises)));
    }
  };

  // Rest Timer State
  const [timerPreset, setTimerPreset] = useState(90); // default 90 seconds
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timerDoneFlash, setTimerDoneFlash] = useState(false);

  // Play rest timer audio / flash
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setTimerActive(false);
            setTimerDoneFlash(true);
            setTimeout(() => setTimerDoneFlash(false), 4000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  const handleStartTimer = (seconds: number) => {
    setTimerPreset(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
    setTimerDoneFlash(false);
  };

  const handleToggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimeLeft(timerPreset);
    setTimerDoneFlash(false);
  };

  // Add a custom exercise to active list
  const [customExName, setCustomExName] = useState("");
  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) return;
    const newEx: RoutineExercise = {
      id: "cust_" + Date.now(),
      name: customExName.trim(),
      sets: [{ id: "set_" + Date.now(), weight: 0, reps: 10, type: "Standard", done: false }]
    };
    setActiveExercises([...activeExercises, newEx]);
    setCustomExName("");
  };

  // Set-level management
  const handleAddSet = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        const weight = lastSet ? lastSet.weight : 40;
        const reps = lastSet ? lastSet.reps : 10;
        const type = lastSet ? lastSet.type : "Standard";
        return {
          ...ex,
          sets: [...ex.sets, { id: "set_" + Math.random().toString(36).substring(2, 9), weight, reps, type, done: false }]
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const handleUpdateSetField = (exerciseId: string, setId: string, field: "weight" | "reps" | "type", value: any) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, [field]: value };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const handleToggleSetComplete = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const nextDone = !s.done;
              if (nextDone) {
                // Instantly trigger rest timer preset
                handleStartTimer(timerPreset);
              }
              return { ...s, done: nextDone };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const totalLoggedSets = activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedLoggedSets = activeExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
  const completionPercentage = totalLoggedSets > 0 ? Math.round((completedLoggedSets / totalLoggedSets) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Routines & <span className="text-[#D32F2F]">Set Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build athletic splits, log standard/drop/supersets, and monitor progressive intensity.
          </p>
        </div>

        {/* Dynamic overall progression circle */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative w-9 h-9">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#E2E8F0" strokeWidth="3" className="dark:stroke-slate-800" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#D32F2F" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - completionPercentage} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-black">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-400 leading-none">Workout Compliance</p>
            <p className="text-xs font-black text-slate-850 dark:text-white mt-1 leading-none">{completedLoggedSets} / {totalLoggedSets} Sets Done</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* =========================================================
            LEFT WORKSPACE: SPLIT TEMPLATES & PROGRESSIVE OVERLOAD COACH
            ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Workout split template selectors */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Workout Split Templates</h3>
            <div className="space-y-2">
              {splitsTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  className={`w-full p-3.5 rounded-xl text-left border cursor-pointer transition-all ${
                    activeSplitId === t.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                      : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 hover:border-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="text-xs font-sans font-black uppercase tracking-wider">{t.name}</p>
                  <p className="text-[9px] mt-1 text-slate-400 dark:text-slate-500 leading-relaxed font-medium">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Rest Timer Visual Block */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
            timerDoneFlash 
              ? "bg-red-500 text-white border-red-500 animate-bounce" 
              : "bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-900 shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-sans font-black uppercase tracking-wider ${timerDoneFlash ? "text-white" : "text-slate-400"}`}>Rest Interval Timer</h3>
              <Timer className={`w-5 h-5 ${timerDoneFlash ? "text-white animate-spin" : "text-[#D32F2F]"}`} />
            </div>

            {/* Countdown layout */}
            <div className="py-6 text-center space-y-3">
              <div className={`text-4xl font-mono font-black tracking-tight ${timerDoneFlash ? "text-white" : "text-slate-800 dark:text-white"}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </div>
              <p className={`text-[9px] font-sans uppercase font-black tracking-widest ${timerDoneFlash ? "text-white/80" : "text-slate-400"}`}>
                {timerActive ? "REST IN PROGRESS - STAY OXYGENATED" : timerDoneFlash ? "REST COMPLETED - BEGIN NEXT SET" : "TIMER IDLE"}
              </p>

              {/* Pre-sets */}
              <div className="flex flex-wrap justify-center gap-1 pt-2">
                {[45, 60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleStartTimer(sec)}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-black uppercase tracking-wider transition cursor-pointer ${
                      timerPreset === sec && !timerDoneFlash
                        ? "bg-[#D32F2F] text-white"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-center pt-3">
                <button
                  onClick={handleToggleTimer}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-sans font-extrabold uppercase tracking-wide flex items-center gap-1 hover:opacity-90 cursor-pointer shadow-xs"
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{timerActive ? "Pause" : "Resume"}</span>
                </button>
                <button
                  onClick={handleResetTimer}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-450 text-xs font-sans font-extrabold uppercase tracking-wide flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Progressive Overload Sports Science Coach Advice */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 dark:text-emerald-400 space-y-2.5">
            <h4 className="text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Progressive Overload Coach
            </h4>
            <p className="text-[10px] leading-relaxed font-semibold">
              To trigger myofibrillar muscular hypertrophy, you must enforce mechanical tension. Every workout, aim to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[9px] font-medium leading-relaxed">
              <li>Increase load (weight) by 1-2.5kg once target rep range is conquered.</li>
              <li>Or execute extra reps with identical load (volume expansion).</li>
              <li>Maximize mechanical micro-tears using slow 3s eccentric negatives.</li>
              <li>Log set types correctly: supersets trigger metabolic stress, drop sets maximize motor unit recruitment.</li>
            </ul>
          </div>

        </div>

        {/* =========================================================
            RIGHT WORKSPACE: DYNAMIC EXERCISE SETS LOGGER
            ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active set builder list */}
          <div className="space-y-4">
            
            {/* Header row to append custom exercises */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-widest leading-none">Active Routine Matrix</h3>
                <p className="text-[9px] text-slate-500 mt-1">Configure logs, modify types, and complete reps below.</p>
              </div>

              {/* Add Custom Exercise Form */}
              <form onSubmit={handleAddCustomExercise} className="flex gap-2 max-w-sm w-full">
                <input
                  type="text"
                  placeholder="Add custom exercise..."
                  value={customExName}
                  onChange={(e) => setCustomExName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-[#D32F2F] text-slate-950 dark:text-white"
                />
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-[10px] font-black uppercase rounded-lg cursor-pointer shrink-0 transition"
                >
                  Add Ex
                </button>
              </form>
            </div>

            {/* List of active exercises */}
            <div className="space-y-4">
              {activeExercises.map((ex, exIdx) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-900 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] font-mono font-black text-slate-400 shrink-0">
                        {exIdx + 1}
                      </span>
                      <UnifiedExerciseMedia
                        exerciseName={ex.name}
                        className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                        fallbackType="dumbbell"
                      />
                      <h4 className="text-xs font-sans font-black uppercase text-slate-800 dark:text-slate-100">
                        {ex.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleAddSet(ex.id)}
                      className="flex items-center gap-1 text-[9px] font-sans font-black uppercase tracking-wider text-[#D32F2F] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Set</span>
                    </button>
                  </div>

                  {/* Sets table/grid layout */}
                  {ex.sets.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic py-2 text-center">No sets added to this exercise. Add a set using the option above.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Grid Header labels */}
                      <div className="grid grid-cols-12 gap-2 text-[8px] font-mono font-black uppercase text-slate-400 px-3">
                        <div className="col-span-2">SET</div>
                        <div className="col-span-3">TYPE</div>
                        <div className="col-span-3">WEIGHT (KG)</div>
                        <div className="col-span-2">REPS</div>
                        <div className="col-span-2 text-right">STATUS</div>
                      </div>

                      {/* Set row inputs */}
                      {ex.sets.map((set, setIdx) => (
                        <div 
                          key={set.id}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-colors ${
                            set.done 
                              ? "bg-emerald-500/5 border-emerald-500/15" 
                              : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900"
                          }`}
                        >
                          {/* Set number/delete combo */}
                          <div className="col-span-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-550">
                              #{setIdx + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveSet(ex.id, set.id)}
                              className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                              title="Delete set"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Set type selector */}
                          <div className="col-span-3">
                            <select
                              value={set.type}
                              onChange={(e) => handleUpdateSetField(ex.id, set.id, "type", e.target.value)}
                              disabled={set.done}
                              className="w-full text-[9px] font-mono font-bold p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Superset">Superset</option>
                              <option value="Drop Set">Drop Set</option>
                            </select>
                          </div>

                          {/* Weight parameter */}
                          <div className="col-span-3 relative">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => handleUpdateSetField(ex.id, set.id, "weight", parseFloat(e.target.value) || 0)}
                              disabled={set.done}
                              className="w-full text-[10px] font-mono font-bold p-1 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none text-center"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-400">kg</span>
                          </div>

                          {/* Reps parameter */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleUpdateSetField(ex.id, set.id, "reps", parseInt(e.target.value) || 0)}
                              disabled={set.done}
                              className="w-full text-[10px] font-mono font-bold p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:outline-none text-center"
                            />
                          </div>

                          {/* Log complete checkbox */}
                          <div className="col-span-2 text-right">
                            <button
                              onClick={() => handleToggleSetComplete(ex.id, set.id)}
                              className={`p-1 px-2.5 rounded text-[8px] font-sans font-black uppercase tracking-wider transition cursor-pointer border ${
                                set.done
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-150"
                              }`}
                            >
                              {set.done ? "Logged" : "Log"}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ==========================================
// 1. WEEKLY REPORTS (PREMIUM AUDITS) SUBVIEW
// ==========================================
function WeeklyReportsView({ reports, onGenerate }: { reports: any[]; onGenerate: () => Promise<void> }) {
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await onGenerate();
    } catch (err: any) {
      setError(err.message || "Failed to trigger report. Verify you have logged workouts or weights.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150 dark:border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Weekly Performance <span className="text-[#D32F2F]">Audits</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and browse your comprehensive multi-check biometrics and activity audits.
          </p>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-400 text-white px-5 py-3 rounded-xl text-xs font-sans font-extrabold uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Audit...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Weekly Audit
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-center gap-3 text-xs font-bold leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800">
          <Award className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-sans font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-tight">No Biometric Audits Available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Generate your first official Weekly Performance Report using the button above to aggregate all your logged exercises, sets, reps, and biometric changes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <div 
                key={report.id}
                className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm overflow-hidden"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 font-sans leading-snug pr-4">
                      {report.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase font-bold text-[8px] tracking-wide">
                        Verified Audit
                      </span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 transition">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Content Section */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-5">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exercises Logged</p>
                        <p className="text-base font-black mt-1 text-slate-850 dark:text-white font-sans">{report.totalWorkouts || 0} Sets</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Est. Active Time</p>
                        <p className="text-base font-black mt-1 text-slate-850 dark:text-white font-sans">{report.totalWorkoutTimeMinutes || 0} Min</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Milestones Met</p>
                        <p className="text-base font-black mt-1 text-slate-850 dark:text-white font-sans">{report.milestones?.length || 0} Achieved</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Audit Frequency</p>
                        <p className="text-base font-black mt-1 text-[#D32F2F] font-sans">Weekly</p>
                      </div>
                    </div>

                    {/* Milestones Bullet Cards */}
                    {report.milestones && report.milestones.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">Achieved Progress Milestones</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {report.milestones.map((m: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                              <span className="font-extrabold text-[11px] leading-tight font-sans">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clean report text block */}
                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-inner font-sans leading-relaxed text-[11px] whitespace-pre-wrap">
                      {report.reportContent}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. DAILY HABIT TRACKER SUBVIEW
// ==========================================
function HabitTrackerView() {
  const [habits, setHabits] = useState<Array<{ id: string; name: string; desc: string; done: boolean }>>([
    { id: "hydration", name: "Lemon & Cucumber Hydration Protocol", desc: "Consumed at least 8 glasses of cucumber/lemon ambient water", done: false },
    { id: "protein", name: "Lean Protein Target", desc: "Secure 1.6g to 2.2g of high quality protein per kg of body weight", done: false },
    { id: "sleep", name: "8 Hours Growth Sleep", desc: "Optimal sleep hygiene for nocturnal growth hormone release", done: false },
    { id: "core", name: "Daily Core Conditioning", desc: "Completed 5-10 minute specialized kinetic abdominal strengthening", done: false },
    { id: "mobility", name: "Post-Workout Eccentric Stretch", desc: "3-5 sets of passive active stretch to release tissue micro-tears", done: false }
  ]);

  const [history, setHistory] = useState<Record<string, number>>({});
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedHabits = localStorage.getItem(`alexfit_habits_status_${todayStr}`);
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {}
    }
    const savedHistory = localStorage.getItem("alexfit_habits_streak");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  const handleToggleHabit = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) return { ...h, done: !h.done };
      return h;
    });
    setHabits(updated);
    localStorage.setItem(`alexfit_habits_status_${todayStr}`, JSON.stringify(updated));

    // Update overall streak database count
    const completedCount = updated.filter(h => h.done).length;
    const nextHistory = { ...history, [todayStr]: completedCount };
    setHistory(nextHistory);
    localStorage.setItem("alexfit_habits_streak", JSON.stringify(nextHistory));
  };

  const streakDays = Object.keys(history).filter(k => history[k] >= 3).length;

  return (
    <div className="space-y-6 text-left">
      <PageHero
        title="Daily Athletic Habits"
        subtitle="Bulletproof Compliance Engine"
        description="Build bulletproof athletic compliance and support testosterone or physical transformation goals by logging your priority baseline daily behaviors."
        imageUrl="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600&auto=format&fit=crop"
        category="ATHLETIC COMPLIANCE"
      />

      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200/60 dark:border-slate-850">
        <div className="text-left">
          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white font-sans">Streak Checkpoint</h3>
          <p className="text-[10px] text-slate-500 font-medium">Log 3 or more daily habits to retain your active streak.</p>
        </div>
        {/* Continuous Active Streak indicators */}
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-2xl border border-amber-500/15 flex items-center gap-2">
          <Flame className="w-5 h-5 fill-amber-500/20 shrink-0 animate-pulse" />
          <div className="text-left">
            <p className="text-[8px] font-mono uppercase text-amber-600 leading-none">Compliance Streak</p>
            <p className="text-xs font-black mt-1 leading-none">{streakDays} Active Days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Habit Checks Column */}
        <div className="md:col-span-3 space-y-3.5">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`p-4 border rounded-2xl cursor-pointer transition flex items-start gap-4 select-none ${
                habit.done 
                  ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-800 dark:text-emerald-400"
                  : "bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-900 text-slate-800 hover:border-slate-200"
              }`}
            >
              <div className="mt-0.5">
                {habit.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-800" />
                )}
              </div>
              <div className="flex-1 space-y-0.5 min-w-0">
                <h4 className="text-xs font-sans font-black uppercase tracking-wide leading-snug">{habit.name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">{habit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Streak details column */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 space-y-3.5">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Compliance Rules</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              We enforce strict metabolic and tissue compliance protocols. Completing at least <span className="font-bold text-slate-800 dark:text-white">3 of 5 baseline habits</span> secures your day's verified active streak checkpoint.
            </p>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] leading-relaxed font-sans font-semibold">
              ⭐ Habit tracking resets every midnight according to active system clocks. Maintain your compliance!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. DAILY CALIBRATION DESK (LIVE DESK)
// ==========================================
function CalibrationDeskView() {
  const { vitalsLogs, addVitalsLogAction, theme } = useApp();
  const [remTime, setRemTime] = useState(() => localStorage.getItem("alexfit_reminder_time") || "08:00");
  const [glasses, setGlasses] = useState(() => parseInt(localStorage.getItem("alexfit_hydration_today") || "0"));
  const [caloriesIn, setCaloriesIn] = useState(2100);
  const [caloriesOut, setCaloriesOut] = useState(2550);

  // Vitals form inputs
  const [heartRateInput, setHeartRateInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");
  const [logDateInput, setLogDateInput] = useState(() => new Date().toISOString().split("T")[0]);
  const [loggingInProgress, setLoggingInProgress] = useState(false);

  const saveReminder = (time: string) => {
    setRemTime(time);
    localStorage.setItem("alexfit_reminder_time", time);
  };

  const handleGlassChange = (diff: number) => {
    const next = Math.max(0, glasses + diff);
    setGlasses(next);
    localStorage.setItem("alexfit_hydration_today", String(next));
  };

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const rhr = parseInt(heartRateInput);
    const sleep = parseFloat(sleepInput);
    if (isNaN(rhr) || rhr < 30 || rhr > 200) {
      alert("Please enter a valid resting heart rate between 30 and 200 bpm.");
      return;
    }
    if (isNaN(sleep) || sleep < 0 || sleep > 24) {
      alert("Please enter a valid sleep duration between 0 and 24 hours.");
      return;
    }
    setLoggingInProgress(true);
    try {
      await addVitalsLogAction(rhr, sleep, logDateInput);
      setHeartRateInput("");
      setSleepInput("");
    } catch (err) {
      console.error("Failed to log vitals:", err);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const hydrationGoal = 10;
  const hydPercent = Math.min(100, Math.round((glasses / hydrationGoal) * 100));
  const deficit = caloriesOut - caloriesIn;

  // Format Recharts data
  const chartData = vitalsLogs.map(log => ({
    date: log.date,
    "Heart Rate (bpm)": log.restingHeartRate,
    "Sleep (hours)": log.sleepDuration
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Live Daily <span className="text-[#D32F2F]">Calibration Desk</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your real-time physiological outputs, hydration metrics, and set push reminder triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hydration Tracker Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Hydration Protocol</h3>
            <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/20" />
          </div>
          <div className="space-y-3 text-center">
            <div className="text-3xl font-sans font-black text-slate-850 dark:text-white font-mono">
              {glasses} <span className="text-xs text-slate-400">/ {hydrationGoal} glasses</span>
            </div>
            
            {/* Water Meter */}
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${hydPercent}%` }} />
            </div>

            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
              Includes lemon infusion & cucumber mineral rounds to secure optimum glycogen re-synthesis.
            </p>

            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => handleGlassChange(-1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                -1 Glass
              </button>
              <button 
                onClick={() => handleGlassChange(1)}
                className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition cursor-pointer shadow-sm"
              >
                +1 Glass
              </button>
            </div>
          </div>
        </div>

        {/* Deficit Deficit Balance Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Deficit Index Calibration</h3>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Today's Intake (Meal Config)</span>
              <span className="font-mono">{caloriesIn} kcal</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Active Metabolic Rate (Burn)</span>
              <span className="font-mono text-emerald-500">{caloriesOut} kcal</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex justify-between items-center">
              <span className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-wider">NET DEFICIT</span>
              <span className={`text-sm font-mono font-black ${deficit >= 400 ? 'text-emerald-500' : 'text-orange-500'}`}>
                {deficit} kcal
              </span>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[9px] text-orange-600 dark:text-orange-400 leading-relaxed font-sans font-semibold">
              ⭐ Aim for a net negative calorie deficit of 400-500 kcal to maximize subcutaneous fat burn while preserving myofibrillar integrity.
            </div>
          </div>
        </div>

        {/* Reminder Settings Frame */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Reminder Control</h3>
            <Clock className="w-5 h-5 text-[#D32F2F]" />
          </div>
          <div className="space-y-4 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Schedule your daily athletic compliance reminders. Our system triggers a browser chime or push alerts on active training blocks.
            </p>
            <div className="flex items-center justify-center gap-3">
              <input 
                type="time" 
                value={remTime}
                onChange={(e) => saveReminder(e.target.value)}
                className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#D32F2F] text-center"
              />
              <span className="text-xs text-slate-400 uppercase font-black">Daily Clock</span>
            </div>
            <div className="text-[9px] text-emerald-500 font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/15 py-1.5 rounded-lg">
              SYSTEM ALERTS ENGAGED
            </div>
          </div>
        </div>

      </div>

      {/* BIOMETRIC TRACKER AND RECHARTS LINE CHART PROTOCOL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Manual Logging Form */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-2">
            <Activity className="w-5 h-5 text-[#D32F2F]" />
            <h3 className="text-xs font-sans font-black text-slate-850 dark:text-white uppercase tracking-wider">Log Bio-Metrics</h3>
          </div>
          <form onSubmit={handleLogVitals} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-sans font-black text-slate-400 uppercase tracking-wider block">Date Checkpoint</label>
              <input 
                type="date"
                required
                value={logDateInput}
                onChange={(e) => setLogDateInput(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-sans font-black text-slate-400 uppercase tracking-wider block">Resting Heart Rate (BPM)</label>
              <input 
                type="number"
                required
                min="30"
                max="200"
                placeholder="e.g. 62"
                value={heartRateInput}
                onChange={(e) => setHeartRateInput(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-sans font-black text-slate-400 uppercase tracking-wider block">Sleep Duration (Hours)</label>
              <input 
                type="number"
                required
                min="0"
                max="24"
                step="0.1"
                placeholder="e.g. 7.5"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingInProgress}
              className="w-full py-2 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-300 text-white text-[10px] font-sans font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm text-center"
            >
              {loggingInProgress ? "Syncing..." : "Log Metrics"}
            </button>
          </form>
        </div>

        {/* Biometrics Visualization */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Biometric Recovery Slope (Recharts API)</h3>
            <span className="text-[9px] text-emerald-500 font-mono font-black uppercase">Live Synchronization Active</span>
          </div>

          <div className="w-full h-[300px] flex items-center justify-center">
            {chartData.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No biometric logs logged. Register a checkpoint on the left form.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#1F2937" : "#e2e8f0"} className="opacity-40" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#D32F2F" fontSize={9} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={9} tickLine={false} domain={[0, 12]} />
                  <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#111827" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a", borderRadius: '12px', border: theme === "dark" ? "1px solid #1f2937" : "1px solid #e2e8f0", fontSize: '10px' }} />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                  <Line yAxisId="left" name="Heart Rate (bpm)" type="monotone" dataKey="Heart Rate (bpm)" stroke="#D32F2F" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                  <Line yAxisId="right" name="Sleep (hours)" type="monotone" dataKey="Sleep (hours)" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Daily System Alerts Frame */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 space-y-4">
        <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Biometric Alerts & Compliance Checks</h3>
        <div className="space-y-2.5">
          {glasses < hydrationGoal ? (
            <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-700 dark:text-blue-400 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-500" />
                <span className="text-[11px] font-bold font-sans">Hydration deficit: Log {hydrationGoal - glasses} more glasses of water to complete today's cellular hydration protocol.</span>
              </div>
              <button onClick={() => handleGlassChange(1)} className="text-[10px] uppercase font-black tracking-wider text-blue-500 hover:underline cursor-pointer shrink-0">Log 1 Now</button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="text-[11px] font-bold font-sans">Perfect Cellular Hydration locked! Lemon and cucumber mineral rounds are active.</span>
            </div>
          )}

          {deficit < 450 ? (
            <div className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/5 text-orange-700 dark:text-orange-400 flex items-center gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-orange-500" />
              <span className="text-[11px] font-bold font-sans">Training suggestion: Target {450 - deficit} extra active burn calories by executing a routine from our Workout Videos or Workout Generator.</span>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="text-[11px] font-bold font-sans">Target metabolic caloric deficit locked in! Perfect fat burn trajectory active.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// 4. ALEX FITNESS HUB HANDBOOK SUBVIEW
// ==========================================
function HandbookView() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "eccentric",
      title: "Eccentric Overload & Hypertrophy",
      category: "BIOMECHANICS",
      summary: "Optimize micro-tears and muscle tissue recovery with 3-second negative pacing.",
      content: `Eccentric training focuses on decelerating or lowering a load. Research indicates that the eccentric phase of a contraction triggers substantially higher levels of mechanical tension and muscular micro-tears than the concentric (lifting) phase.

HOW TO APPLY ECCENTRIC OVERLOAD:
1. PACE THE NEGATIVE: On movements like the Barbell Bench Press or Squat, lower the barbell over a strict 3-second countdown.
2. CONTROL THE STRETCH: Do not bounce the weight off your chest or joint ligaments. Pause for 0.5 seconds at the absolute peak stretch to dissipate kinetic elasticity.
3. EXPLODE UPWARDS: Complete the concentric lifting movement with maximum biomechanical acceleration.

By enforcing strict eccentric negative tracking, athlete muscle spindles register up to 14% higher myofibrillar protein synthesis triggers over typical rapid pacing splits.`
    },
    {
      id: "overload",
      title: "The Law of Progressive Tension",
      category: "METHODOLOGY",
      summary: "The definitive formula for steady muscle and athletic power growth over time.",
      content: `The human muscular skeletal structure will only adapt and undergo cellular growth when subjected to a stimulus greater than what it has previously experienced. This is the physiological Law of Progressive Overload.

METHODS OF ENFORCING PROGRESSIVE OVERLOAD:
- ABSOLUTE LOAD: Increase the resistance (adding 1.25kg to 2.5kg to the barbell).
- REPETITIVE VOLUME: Execute additional repetitions with identical resistance.
- WORK DENSITY: Reduce rest interval periods (resting 90s instead of 120s between identical sets).
- CONTRACTION DENSITY: Introduce specialized sets like supersets (completing back-to-back muscle antagonists) and drop sets (reducing load instantly after failure to extend the effective hypertrophy window).

Ensure you track every single set, rep, and load. Never train blindly. A standardized log is your primary weapon for biological recomposition.`
    },
    {
      id: "recovery",
      title: "Sleep Hygiene & Growth Hormones",
      category: "RECOVERY SCIENCE",
      summary: "Maximize deep sleep cycles to promote natural muscle recovery.",
      content: `While mechanical overload triggers muscle tissue breakdown, physical growth occurs exclusively during systemic rest. The primary nocturnal growth hormone release spikes during deep non-rapid eye movement (NREM) sleep.

GROWTH REST PROTOCOLS:
1. TEMPERATURE CALIBRATION: Keep your bedroom environment cool (between 16-19°C) to facilitate core metabolic drop.
2. CIRCADIAN BLUE-LIGHT BLOCKING: Disengage from high-intensity digital screens (phones, TVs) at least 60 minutes prior to sleep.
3. GLYCOGEN RE-SYNTHESIS: Ensure optimal post-workout cellular hydration with minerals to prevent overnight cellular dehydration and cramping.`
    }
  ];

  const activeSec = sections.find(s => s.id === selectedSection) || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Sports Science <span className="text-[#D32F2F]">Handbook</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review elite-level biomechanical research, progressive intensity guidelines, and sleep protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Handbook Left Index */}
        <div className="lg:col-span-5 space-y-3.5">
          {sections.map((sec) => (
            <div 
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={`p-4 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                selectedSection === sec.id 
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950 dark:border-white"
                  : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 hover:border-slate-200 text-slate-800"
              }`}
            >
              <div>
                <span className="text-[8px] font-mono font-black uppercase tracking-wider text-[#D32F2F]">{sec.category}</span>
                <h4 className="text-xs font-sans font-black uppercase mt-1 leading-snug">{sec.title}</h4>
                <p className={`text-[10px] mt-1 leading-relaxed ${selectedSection === sec.id ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                  {sec.summary}
                </p>
              </div>
              <div className="mt-3.5 flex justify-end">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Reader pane */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 min-h-[400px]">
          {activeSec ? (
            <div className="space-y-4 animate-fade-in">
              <span className="text-[8px] font-mono font-black uppercase bg-[#D32F2F] text-white px-2 py-0.5 rounded tracking-widest">{activeSec.category}</span>
              <h3 className="text-base font-sans font-black uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-3 leading-snug">
                {activeSec.title}
              </h3>
              
              <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap font-sans">
                {activeSec.content}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 py-20 text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs font-sans font-extrabold uppercase tracking-wider">Awaiting Handbook Selection</p>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed font-medium">
                Select one of our premium sports science handbooks from the left menu index to review the scientific guidelines in our dynamic reader pane.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 5. WEIGHT TRAJECTORY INDEX SUBVIEW
// ==========================================
function TrajectoryView({ 
  logs, 
  onLog, 
  userWeight 
}: { 
  logs: any[]; 
  onLog: (w: number, bf?: number) => Promise<void>; 
  userWeight: number;
}) {
  const [newWeight, setNewWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newWeight);
    if (isNaN(parsed) || parsed <= 30 || parsed >= 250) {
      alert("Please specify a valid biometric weight value (30kg - 250kg).");
      return;
    }

    setSubmitting(true);
    try {
      await onLog(parsed);
      setNewWeight("");
    } catch (err) {
      console.warn("Could not submit weight log:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const displayLogs = logs.slice(-6);
  const minW = displayLogs.length > 0 ? Math.min(...displayLogs.map(l => l.weight)) - 1 : 70;
  const maxW = displayLogs.length > 0 ? Math.max(...displayLogs.map(l => l.weight)) + 1 : 90;
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sans font-black uppercase tracking-tight text-slate-900 dark:text-white">
          Weight Trajectory <span className="text-[#D32F2F]">Index</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor biometric weight fluctuations, target recomposition slopes, and log body checkpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trajectory Plot visualization */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
          <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Visual Trajectory Trend (Last 6 Checkpoints)</h3>
          
          {displayLogs.length > 1 ? (
            <div className="relative w-full overflow-hidden">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-350 overflow-visible">
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const y = padding + val * (height - 2 * padding);
                  const wVal = (maxW - val * diffW).toFixed(1);
                  return (
                    <g key={idx}>
                      <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="text-slate-150 dark:text-slate-900" />
                      <text x={padding - 5} y={y + 3} textAnchor="end" className="text-[8px] font-mono font-bold fill-slate-400">{wVal}</text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#gradArea)" />
                <path d={linePath} fill="none" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="4" fill="#D32F2F" stroke="white" strokeWidth="1.5" />
                    <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] font-mono font-black fill-slate-800 dark:fill-white">{p.weight}kg</text>
                  </g>
                ))}

                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-450 border border-dashed border-slate-150 dark:border-slate-900 rounded-xl">
              <Scale className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider">Awaiting biometric data points</p>
              <p className="text-[9px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed font-medium">Log at least 2 checkpoints using the form to map a visual weight trajectory slope graph.</p>
            </div>
          )}
        </div>

        {/* Trajectory Checkpoint Submissions Panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Log Weight Checkpoint</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1.5">Weight (kilograms)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="e.g. 79.5"
                    className="w-full p-3 border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#D32F2F] text-slate-850 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">KG</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-400 text-white font-sans font-extrabold uppercase text-[10px] tracking-wider py-3.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                {submitting ? "Saving checkpoint..." : "Save Biometric Checkpoint"}
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm space-y-3.5 max-h-56 overflow-y-auto">
            <h3 className="text-xs font-sans font-black text-slate-400 uppercase tracking-wider">Historical Checkpoints</h3>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-medium">No biometric weights logged yet.</p>
              ) : (
                [...logs].reverse().map((log) => (
                  <div key={log.id || log.date} className="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 dark:border-slate-900/40 pb-2">
                    <span className="text-slate-550 dark:text-slate-400 font-mono">{log.date}</span>
                    <span className="font-mono text-slate-850 dark:text-white">{log.weight} kg</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
