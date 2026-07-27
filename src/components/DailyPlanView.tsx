import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { auth } from "../lib/firebase";
import { 
  Sparkles, Check, CheckCircle2, RotateCcw, Flame, Dumbbell, Droplet, 
  Clock, Coffee, Utensils, Moon, HelpCircle, Activity, Award, Scale, RefreshCw, 
  Trash2, Bell, MessageSquare, AlertTriangle, ArrowUpRight, TrendingUp, Info, ShieldAlert
} from "lucide-react";
import PersistentDashboardTabs from "./PersistentDashboardTabs";

interface DailyPlanSchema {
  wakeUpTime: string;
  bedTime: string;
  morningRoutine: string;
  breakfastRecommendation: string;
  waterIntakeSchedule: string;
  workoutRecommendation: string;
  lunchRecommendation: string;
  snackRecommendation: string;
  dinnerRecommendation: string;
  eveningRoutine: string;
  sleepReminder: string;
  dailyCalories: number;
  proteinTarget: number;
  carbohydrateTarget: number;
  fatTarget: number;
  fiberTarget: number;
  waterTargetMl: number;
  recommendedFruits: string[];
  recommendedVegetables: string[];
  cardioRecommendation: string;
  injuryRestoration: string;
  workoutExercises: {
    name: string;
    sets: number;
    reps: number;
    rest: number;
    desc: string;
  }[];
  workoutDurationMinutes: number;
  dailyStepGoal: number;
  recoveryActivities: string;
  weeklyGoal: string;
  monthlyGoal: string;
}

// Local Meal Item Logged by User
interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function DailyPlanView() {
  const { user, activityLogs, logWorkoutCompletion, updateWaterIntake, addWeightLogAction } = useApp();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DailyPlanSchema | null>(null);
  const [method, setMethod] = useState("");
  const [scaleDaysState, setScaleDaysState] = useState<"Normal" | "Easier Alternative" | "Intensify Training">("Normal");
  
  // Tracking inputs
  const [newWeight, setNewWeight] = useState("");
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [loggedCalories, setLoggedCalories] = useState<number>(0);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [mealName, setMealName] = useState("");
  const [mealCals, setMealCals] = useState("");
  const [mealProt, setMealProt] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");

  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [weightLogsCount, setWeightLogsCount] = useState<number>(0);
  
  // Interactive notifications state
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<string>("");

  // Setup initial mock log / seed logs
  useEffect(() => {
    if (user?.waterIntakeToday) {
      setWaterAmount(user.waterIntakeToday);
    }
  }, [user?.waterIntakeToday, user?.uid]);

  // Load / Generate actual plan
  const fetchDailyPlan = async (intensityOverride?: "Normal" | "Easier Alternative" | "Intensify Training") => {
    if (!user) return;
    setLoading(true);
    const mode = intensityOverride || scaleDaysState;
    try {
      const token = auth.currentUser 
        ? await auth.currentUser.getIdToken() 
        : (localStorage.getItem("fit_active_uid") || "mock-token");
      const response = await fetch("/api/gemini/generate-plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          profile: user,
          scaleDaysState: mode
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error("[DailyPlan AI Generation Failed] API returned status:", response.status, "Error payload:", data);
      }
      if (data.success && data.plan) {
        setPlan(data.plan);
        setMethod(data.method);
      }
    } catch (err) {
      console.error("[DailyPlan Error] Plan retrieval broke, falling back to client logic:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyPlan();
  }, [user?.uid, user?.subscriptionStatus]);

  // Handle Water increment
  const handleAddHydration = async (amount: number) => {
    setWaterAmount(prev => prev + amount);
    await updateWaterIntake(amount);
    triggerGoalNotification("Water Reminder");
  };

  // Handle weight change submission
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newWeight);
    if (!wt || isNaN(wt)) return;
    await addWeightLogAction(wt);
    setWeightLogsCount(prev => prev + 1);
    setNewWeight("");
    alert(`Weight logged successfully: ${wt} kg! Your plan balances will recalibrate on your next refresh.`);
    fetchDailyPlan();
  };

  // Custom User Meal Logger
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName) return;
    const c = parseInt(mealCals) || 0;
    const p = parseInt(mealProt) || 0;
    const cb = parseInt(mealCarbs) || 0;
    const f = parseInt(mealFat) || 0;

    const newItem: LoggedMeal = {
      id: Math.random().toString(36).substring(7),
      name: mealName,
      calories: c,
      protein: p,
      carbs: cb,
      fat: f
    };

    setLoggedMeals(prev => [...prev, newItem]);
    setLoggedCalories(prev => prev + c);
    setMealName("");
    setMealCals("");
    setMealProt("");
    setMealCarbs("");
    setMealFat("");
    triggerGoalNotification("Meal Reminder");
  };

  const handleRemoveMeal = (id: string, calories: number) => {
    setLoggedMeals(prev => prev.filter(m => m.id !== id));
    setLoggedCalories(prev => Math.max(0, prev - calories));
  };

  // Completing routine exercises
  const toggleExerciseCheck = (name: string, index: number) => {
    setCompletedExercises(prev => {
      const isDone = !prev[name];
      if (isDone) {
        // Log this set completion to general exercises stats
        logWorkoutCompletion(
          `ex_sub_${index}`,
          plan?.workoutExercises[index].reps || 10,
          user?.weight ? Math.round(user.weight * 0.5) : 35,
          `Completed during daily dynamic plan checklist`
        );
      }
      return { ...prev, [name]: isDone };
    });
  };

  // Smart personalized notifications scheduler based on goals
  const triggerGoalNotification = (triggerName: string) => {
    setNotificationType(triggerName);
    const goal = user?.fitnessGoals || "General Fitness";
    const userName = user?.displayName || "Athlete";
    
    let text = "";

    switch (triggerName) {
      case "Morning Motivation":
        if (goal.includes("Fat") || goal.includes("Loss")) {
          text = `Good morning ${userName}! Today's goal is 10,000 steps, ${plan?.waterTargetMl ? (plan.waterTargetMl/1000).toFixed(1) : "3.0"} liters of clean water, and a 45-minute high density fat burning push protocol. Let's shred!`;
        } else if (goal.includes("Gain") || goal.includes("Muscle")) {
          text = `Good morning ${userName}! Focus on hitting your protein target of ${plan?.proteinTarget || "150"}g today and complete your hyper-trophic compound lifts! Progressive overload is king.`;
        } else {
          text = `Good morning ${userName}! Today is about supreme premium consistency. Stretch well, stay hydrated, and complete your cardiovascular threshold protocol.`;
        }
        break;
      case "Water Reminder":
        text = `💧 Pure Hydration Check: Keep drinking! Aim for 500ml now to support metabolic rate and optimal muscle density.`;
        break;
      case "Meal Reminder":
        text = `🍗 Nutrition Adherence Check: Stick to regional whole-foods, keeping food allergens fully out! Try incorporating fruits: ${plan?.recommendedFruits?.join(", ") || "Apples"}.`;
        break;
      case "Workout Reminder":
        text = `🏋️‍♂️ Focus Window: Standardized duration is ${plan?.workoutDurationMinutes || "45"} minutes. Remember to take care post-injury to safeguard: ${user?.healthRestrictions || "joints"}.`;
        break;
      case "Sleep Reminder":
        text = `🌙 Circadian Winddown: Establish complete solid rest. Sleep targets: ${plan?.bedTime || "10:00 PM"}. This optimizes cell repair and muscle recovery.`;
        break;
      default:
        text = `Consistency is our superpower today! Let's crush our goals.`;
    }

    setActiveNotification(text);
    // Auto-dim after 7 seconds
    setTimeout(() => {
      setActiveNotification(null);
    }, 8500);
  };

  // Adaptive adjustments triggers
  const executeAdherenceRegeneration = (mode: "Normal" | "Easier Alternative" | "Intensify Training") => {
    setScaleDaysState(mode);
    fetchDailyPlan(mode);
    alert(`AI Coach has recalibrated! Recalculating targets to: "${mode}".`);
  };

  // Helper macro sum
  const sumMacros = () => {
    return loggedMeals.reduce((acc, current) => {
      return {
        protein: acc.protein + current.protein,
        carbs: acc.carbs + current.carbs,
        fat: acc.fat + current.fat
      };
    }, { protein: 0, carbs: 0, fat: 0 });
  };

  const currentMacros = sumMacros();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 font-sans transition-all text-left">
      
      {/* Persistent sub-navigation tabs */}
      <PersistentDashboardTabs />

      {/* Dynamic Alerts Banner */}
      {activeNotification && (
        <div id="alert_notification_bar" className="fixed top-24 left-4 right-4 md:left-auto md:right-10 md:w-[420px] z-50 p-4 bg-slate-900 border-2 border-emerald-500 text-white rounded-2xl shadow-2xl animate-bounce flex gap-3 items-start">
          <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-mono text-emerald-400 uppercase font-black tracking-widest block mb-1">
              AI SMART ALERT: {notificationType}
            </span>
            <p className="font-bold leading-normal text-slate-200">
              {activeNotification}
            </p>
          </div>
        </div>
      )}

      {/* Greeting Header */}
      <div id="plan_header_block" className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-emerald-500" /> My Daily Plan
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-2xl">
            Welcome, <span className="font-extrabold text-slate-900 dark:text-white">{user?.displayName}</span>! This dashboard is your daily personal trainer, expert nutritionist, and lifestyle coach, fully synced to your physical limits, regional profile setup, and dietary preferences.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => triggerGoalNotification("Morning Motivation")}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-500" />
            TEST MORNING ALARM
          </button>

          <button
            onClick={() => fetchDailyPlan()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-mono text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            REFRESH AI PLAN
          </button>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: THE MASTER PLAN & NOTIFICATION DESK */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TODAY'S PLAN TIMELINE ROUTINE */}
          <div id="todays_plan_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden transition-all shadow-sm">
            
            {loading ? (
              <div className="min-h-[400px] flex flex-col justify-center items-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-bold text-slate-500 animate-pulse uppercase tracking-wider font-mono">
                  Formulating personalized circadian plan...
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Today's Circular Schedule
                    </h2>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {method || "Adaptive Baseline Engine"}
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  
                  {/* Wake up */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">
                          {plan?.wakeUpTime || "06:00 AM"}
                        </span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Wake Up & Reset</strong>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{plan?.morningRoutine || "Hydrate, perform 5 minutes dynamic joint activation stretching."}</p>
                    </div>
                  </div>

                  {/* Breakfast */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Coffee className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">BREAKFAST</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Fulfilling Nutritional Intake</strong>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic font-medium">
                        "{plan?.breakfastRecommendation || "High-protein egg white scramble & whole grains."}"
                      </p>
                    </div>
                  </div>

                  {/* Hydration */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">HYDRATION</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Fluid Balance Reminders</strong>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">{plan?.waterIntakeSchedule || "Drink 500ml upon arising, 1L during activity."}</p>
                    </div>
                  </div>

                  {/* Workout */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Dumbbell className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">WORKOUT</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Physical Drill Focus</strong>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-semibold text-purple-600 dark:text-purple-400">
                        {plan?.workoutRecommendation || "Full-body compound lifting routine."}
                      </p>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">LUNCH</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Anabolic Energy Midpoint</strong>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 italic">
                        "{plan?.lunchRecommendation || "Oven roasted chicken breast with brown rice & spinach."}"
                      </p>
                    </div>
                  </div>

                  {/* Snack */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Coffee className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">MID-DAY SNACK</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Metabolism Replenishment</strong>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                        "{plan?.snackRecommendation || "High-protein Greek yogurt blended with berries."}"
                      </p>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">DINNER</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Nighttime Re-synthesis Food</strong>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 italic">
                        "{plan?.dinnerRecommendation || "Flaked white fish with baked yam wedges and avocado."}"
                      </p>
                    </div>
                  </div>

                  {/* Evening Routine */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-slate-500/10 border border-slate-500/30 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Moon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">WINDDOWN</span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Parasympathetic Activation</strong>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">{plan?.eveningRoutine || "Dim artificial lights, cease screen exposure."}</p>
                    </div>
                  </div>

                  {/* Sleep */}
                  <div className="flex gap-4 relative">
                    <div className="w-7.5 h-7.5 rounded-full bg-blue-900/20 border border-blue-900/40 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-slate-900">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-400">
                          {plan?.bedTime || "10:00 PM"}
                        </span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">Sleep Activation & Healing</strong>
                      </div>
                      <p className="text-xs text-rose-500 dark:text-rose-400 font-bold mt-1">
                        💤 Sleep reminder: {plan?.sleepReminder || "Sleep at least 8 hours for maximum muscle cell repair cycles."}
                      </p>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* WORKOUT LIST SECTION */}
          <div id="exercise_list_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Workout Session Movements
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 font-mono block">EST. TIME</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{plan?.workoutDurationMinutes || "45"} MINS</span>
              </div>
            </div>

            {/* Health restrictions note */}
            {user?.healthRestrictions && user.healthRestrictions !== "None" && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-950 dark:text-rose-300">
                  <span className="font-extrabold block">Health restrictions adaptation:</span>
                  {plan?.injuryRestoration || `Bypassing biomechanical stresses that trigger your ${user.healthRestrictions}. Monitor strain levels carefully.`}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {plan?.workoutExercises ? (
                plan.workoutExercises.map((ex, index) => {
                  const isChecked = !!completedExercises[ex.name];
                  return (
                    <div 
                      key={ex.name} 
                      onClick={() => toggleExerciseCheck(ex.name, index)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        isChecked 
                          ? "border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" 
                          : "border-slate-100 hover:border-slate-200 dark:border-slate-850 dark:hover:border-slate-800 bg-slate-50 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className={`text-xs font-black uppercase tracking-tight ${isChecked ? "text-emerald-500 line-through" : "text-slate-900 dark:text-white"}`}>
                            {ex.name}
                          </h4>
                          <span className="text-[10px] font-mono font-extrabold text-[#10B981] dark:text-emerald-400 mt-0.5 block">
                            {ex.sets} SETS &bull; {ex.reps} REPS &bull; {ex.rest}s REST
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            {ex.desc}
                          </p>
                        </div>
                        <div className={`w-5 h-5 border-2 rounded-md shrink-0 flex items-center justify-center transition-all ${
                          isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-xs text-slate-400 font-mono">
                  No customized movements loaded. Initiate onboarding or click refresh.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1">
                CARDIO RECOMMENDATION TODAY:
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                🚀 {plan?.cardioRecommendation || "15-20 min post-lifting steady walk or jog."}
              </p>
            </div>
          </div>

          {/* DYNAMIC MEAL CALCULATOR & TRACKER */}
          <div id="meal_tracker_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Daily Meal Tracker & Log
                </h2>
              </div>
              <span className="text-[10px] font-black font-mono text-emerald-500">
                {user?.dietaryPreference || "Standard"} ARCHE-TYPE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form log a custom meal */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 mb-3">
                  Log What You Ate Today
                </h3>
                <form onSubmit={handleAddMeal} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
                    placeholder="Meal Name e.g. Oatmeal Swallow & Fish"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={mealCals}
                      onChange={(e) => setMealCals(e.target.value)}
                      className="p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
                      placeholder="Cals (kcal)"
                    />
                    <input
                      type="number"
                      value={mealProt}
                      onChange={(e) => setMealProt(e.target.value)}
                      className="p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
                      placeholder="Protein (g)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(e.target.value)}
                      className="p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
                      placeholder="Carbs (g)"
                    />
                    <input
                      type="number"
                      value={mealFat}
                      onChange={(e) => setMealFat(e.target.value)}
                      className="p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
                      placeholder="Fat (g)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-black text-[10px] uppercase rounded-xl tracking-widest transition-all shadow"
                  >
                    ADD MEAL TO LOGS
                  </button>
                </form>
              </div>

              {/* Logged meals list */}
              <div className="flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 mb-3 block">
                  Logged Food List ({loggedMeals.length})
                </h3>
                <div className="flex-1 max-h-[175px] overflow-y-auto pr-1 space-y-1.5 border border-slate-100 dark:border-slate-850 rounded-xl p-2.5 bg-slate-50/50 dark:bg-slate-950/20">
                  {loggedMeals.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-400 font-mono">
                      No foods logged yet. Fill out the form above.
                    </div>
                  ) : (
                    loggedMeals.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="max-w-[70%] text-left">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {m.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {m.calories} kcal &bull; P: {m.protein}g F: {m.fat}g
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(m.id, m.calories)}
                          className="p-1 hover:text-rose-500 text-slate-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CORE METRICS TRACKING, ADHERENCE ENGINE, PREMIUM STATS */}
        <div className="space-y-6">

          {/* DYNAMIC NUTRITION TARGETS AND METABOLIC BALANCES */}
          <div id="nutrition_balances_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm text-left">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Target Calorie Balance
            </h2>

            <div className="relative p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl mb-6 text-center">
              <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest block mb-1">
                CALORIES ALLOWED TODAY
              </span>
              <div className="text-4xl font-mono font-black text-slate-900 dark:text-white">
                {loggedCalories} <span className="text-xs text-slate-400">/ {plan?.dailyCalories || "2200"}</span>
              </div>
              <p className="text-[10px] text-emerald-500 font-bold mt-2">
                Goal calibration is: <span className="uppercase">{user?.fitnessGoals || "Body Recomposition"}</span>
              </p>
              
              {/* Simple progress metric */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedCalories / (plan?.dailyCalories || 2200)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Macros Subdivision grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 block font-mono">PROTEIN GOAL</span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {currentMacros.protein}g / {plan?.proteinTarget || "150"}g
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 block font-mono">CARBOHYDRATE GOAL</span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {currentMacros.carbs}g / {plan?.carbohydrateTarget || "220"}g
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 block font-mono">FAT GOAL</span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {currentMacros.fat}g / {plan?.fatTarget || "65"}g
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black text-slate-400 block font-mono">FIBER TARGET</span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {plan?.fiberTarget || "25"}g
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-mono">RECOMMENDED FRUITS:</span>
                <strong className="text-slate-900 dark:text-white">{plan?.recommendedFruits?.join(", ") || "Apples, Papaya"}</strong>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-mono">RECOMMENDED VEGGIES:</span>
                <strong className="text-slate-900 dark:text-white">{plan?.recommendedVegetables?.join(", ") || "Broccoli, Spinach"}</strong>
              </div>
            </div>
          </div>


          {/* DYNAMIC REGENERATION DECISION ENGINE & ACTIVE FEEDBACK */}
          <div id="dynamic_regeneration_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm text-left">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500" /> Adaptive Regeneration
            </h2>
            <p className="text-[11px] text-slate-500 mb-4 leading-normal">
              If things are too difficult today, or if you logged massive completions, trigger an immediate AI adaptation.
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => executeAdherenceRegeneration("Easier Alternative")}
                className="w-full text-left p-3 rounded-xl border border-amber-200 hover:border-amber-300 bg-amber-500/10 text-amber-800 dark:text-amber-400 transition-all flex justify-between items-center"
              >
                <div>
                  <span className="font-extrabold block uppercase tracking-wide font-mono text-[10px]">
                    I'm Missing Goals
                  </span>
                  <span className="text-[10px] text-slate-500">Provide easier alternatives & reduce workload.</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-500 shrink-0 rotate-90" />
              </button>

              <button
                onClick={() => executeAdherenceRegeneration("Intensify Training")}
                className="w-full text-left p-3 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-500/10 text-[#047857] dark:text-emerald-400 transition-all flex justify-between items-center"
              >
                <div>
                  <span className="font-extrabold block uppercase tracking-wide font-mono text-[10px]">
                    Progressing Fast
                  </span>
                  <span className="text-[10px] text-slate-500">Increase training load & nutritional targets.</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-555 shrink-0" />
              </button>
            </div>
          </div>

          {/* LOG BODY WEIGHT WEIGHT LOG ATOM */}
          <div id="body_weight_logs_card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all shadow-sm text-left">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-500" /> Biometrics Progress
            </h2>
            <p className="text-[11px] text-slate-500 mb-4 leading-normal">
              Report your bodyweight metrics today to track weight progress and update structural coefficients.
            </p>

            <form onSubmit={handleWeightSubmit} className="flex gap-2">
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                placeholder="Weight today (KG) (e.g. 78.5)"
              />
              <button
                type="submit"
                className="px-4 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-mono font-black text-[10px] uppercase rounded-xl tracking-widest transition-all shadow"
              >
                LOG WEIGHT
              </button>
            </form>
          </div>

          {/* GUIDANCE HUB: HOW TO USE THE HUB */}
          <div id="premium_guidance_card" className="bg-slate-900 text-slate-100 rounded-3xl p-6 transition-all relative overflow-hidden text-left border border-slate-800">
            {/* Ambient Background Glow inside guidelines */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
                Alex's Premium Insights
              </h3>
            </div>

            <p className="text-[11px] text-slate-300 leading-normal mb-4">
              Welcome to the premium hub! Here are high-fidelity capabilities designed exclusively for you:
            </p>

            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                <p className="text-[11px] leading-snug">
                  <span className="font-extrabold text-white block">520+ Exercise Database</span>
                  Access video-guided movement tutorials on the main library segment with absolute target sets.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                <p className="text-[11px] leading-snug">
                  <span className="font-extrabold text-white block">Dynamic AI Regeneration Daily</span>
                  Utilize feedback triggers to automatically loosen or tighten calories parameters and target protocols.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
