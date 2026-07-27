import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Flame, Droplets, Trophy, CheckSquare, LineChart, Shield, Calendar, Play, 
  ChevronRight, Dumbbell, Activity, Compass, Info, Check, Plus, AlertCircle, 
  Trash2, Upload, Sparkles, RefreshCw, ChevronLeft, ArrowRight, Heart, Zap, Clock, Footprints, Settings, Bell, Apple, Ban,
  Pause, Award, Home, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, isMockFirebase, auth } from "../lib/firebase";
import { queueBellyFatShredReminderEmail } from "../lib/mailTriggers";
import WorkoutVisual from "./WorkoutVisual";
import { useCentralizedExercises } from "../hooks/useCentralizedExercises";
import { UnifiedExerciseMedia } from "./UnifiedExerciseMedia";
import { bellyFatCardioCircuit } from "../data/homeWorkouts";
import HomeWorkoutPlayer from "./HomeWorkoutPlayer";
import GlobalSkeletonLoader, { DashboardSkeleton } from "./SkeletonLoader";

// High-fidelity local types
interface WeightEntry {
  date: string;
  value: number;
}

interface WaistEntry {
  date: string;
  value: number;
}

interface PhotoEntry {
  date: string;
  url: string;
  note: string;
}

interface DailyHabits {
  workout: boolean;
  run: boolean;
  water: boolean;
  lemonCucumber: boolean;
  mealWalks: { breakfast: boolean; lunch: boolean; dinner: boolean };
  healthyMeals: boolean;
  sleep: boolean;
  stretch: boolean;
}

interface BellyFatShredProgress {
  userId: string;
  currentWeek: number;
  currentDay: number;
  completedWorkouts: string[]; // e.g. "week_1_day_1"
  completedRuns: string[]; // e.g. "week_1_run_1"
  waterIntake: number; // in Liters, resets daily
  lastHydrationReset: string; // ISO date string
  hydrationHistory: Record<string, number>; // dateStr -> liters
  walkingHistory: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>; // dateStr -> walkStates
  nutritionChecklist: Record<string, { eatenHealthy: boolean; limitedAvoidFoods: boolean }>; // dateStr -> mealState
  weightHistory: WeightEntry[];
  waistHistory: WaistEntry[];
  progressPhotos: PhotoEntry[];
  achievements: string[];
  streaks: {
    workoutStreak: number;
    hydrationStreak: number;
    runningStreak: number;
  };
  lemonCucumberCompleted: string[]; // array of "week_W_L_D" or "dateStr"
  dailyChecklistHistory: Record<string, DailyHabits>; // dateStr -> habits
  reminders: {
    workout: boolean;
    water: boolean;
    running: boolean;
    meal: boolean;
    walk: boolean;
    hydration: boolean;
    lemonCucumber: boolean;
  };
}

// Helper to calculate daily score from habits
const calculateHabitScore = (habits: DailyHabits, isRunScheduled: boolean, isLemonScheduled: boolean): number => {
  let score = 0;
  let totalTasks = 6; // Workout, Water, MealWalks, HealthyMeals, Sleep, Stretch
  
  if (habits.workout) score += 15;
  if (habits.water) score += 15;
  if (habits.healthyMeals) score += 15;
  if (habits.sleep) score += 15;
  if (habits.stretch) score += 10;
  
  // Meal walks (3 meals)
  let walkCount = 0;
  if (habits.mealWalks.breakfast) walkCount++;
  if (habits.mealWalks.lunch) walkCount++;
  if (habits.mealWalks.dinner) walkCount++;
  score += walkCount * 5; // 15 max
  
  if (isRunScheduled) {
    totalTasks++;
    if (habits.run) score += 10;
  }
  
  if (isLemonScheduled) {
    totalTasks++;
    if (habits.lemonCucumber) score += 5;
  }
  
  // Scale to 100 max
  const maxPossible = 70 + (isRunScheduled ? 10 : 0) + (isLemonScheduled ? 5 : 0) + 15;
  return Math.round((score / maxPossible) * 100);
};

const mapDrillToLibraryName = (drill: string): string => {
  let name = drill;
  if (drill.includes(":")) {
    name = drill.split(":")[0].trim();
  } else if (drill.includes("—")) {
    name = drill.split("—")[0].trim();
  }
  name = name.replace(/\(.*\)/g, "").trim();
  const lower = name.toLowerCase();

  if (lower.includes("plank hold")) return "Plank";
  if (lower.includes("side plank hold")) return "Side Plank";
  if (lower.includes("rope jump")) return "Rope Jump";
  if (lower.includes("treadmill walk") || lower.includes("12-3-30")) return "12-3-30 Treadmill Walk";
  if (lower.includes("push-up") || lower.includes("push up")) return "Push-ups";
  if (lower.includes("squat")) return "Squats";
  if (lower.includes("lunges") || lower.includes("lunge")) return "Lunges";
  if (lower.includes("mountain climber")) return "Mountain Climbers";
  if (lower.includes("burpee")) return "Burpees";
  if (lower.includes("jumping jack")) return "Jumping Jacks";
  if (lower.includes("high knee")) return "High Knees";
  if (lower.includes("bear crawl")) return "Bear Crawl";
  if (lower.includes("reverse crunch")) return "Reverse Crunch";
  if (lower.includes("russian twist")) return "Russian Twist";
  if (lower.includes("bicycle crunch")) return "Bicycle Crunch";
  if (lower.includes("dead bug")) return "Dead Bug";
  if (lower.includes("arm circles")) return "Active Arm Circles & Core Bracing";
  if (lower.includes("hip opener")) return "90/90 Active Hip Opener";
  if (lower.includes("cat-cow")) return "Primal Cat-Cow Spinal Waves";
  if (lower.includes("cobra pose")) return "Prone Cobra Chest Opener";
  if (lower.includes("hamstring stretch")) return "Full Posterior Muscle Release Stretch";
  if (lower.includes("child's pose")) return "Deep Diaphragmatic Box Breathing";

  return name;
};

// Generate high-fidelity workouts progression for weeks 1 to 20
const getWorkoutForWeekAndDay = (week: number, dayNum: number) => {
  // Muscle groups & themes progression
  const phase = week <= 4 ? "Phase 1: Foundational Core & Metabolic Prep" 
              : week <= 8 ? "Phase 2: HIIT Acceleration & Strength Base" 
              : week <= 12 ? "Phase 3: Progressive Resistance & Caloric Deficit Focus" 
              : week <= 16 ? "Phase 4: High-Velocity Metabolic Conditioning" 
              : "Phase 5: Peak Fat Shred & Sculpt Definition";

  const isBeginner = week <= 4;
  const isIntermediate = week > 4 && week <= 12;
  const difficulty = isBeginner ? "Beginner" : isIntermediate ? "Intermediate" : "Advanced";
  
  const durationMap = [45, 50, 60, 75, 90];
  const duration = durationMap[Math.min(4, Math.floor((week - 1) / 4))] + " mins";
  const calMap = [350, 480, 620, 750, 920];
  const calBurn = calMap[Math.min(4, Math.floor((week - 1) / 4))] + " kcal estimated";

  // Customize based on week phase & day
  let title = `Full-Body fat loss focus - Day ${dayNum}`;
  let exercises: string[] = [];
  let strengthReps = week <= 4 ? "3 sets x 12 reps (Bodyweight)" : (week <= 12 ? "4 sets x 10 reps (Moderate Weight)" : "4 sets x 8 reps (Progressive Overload)");
  
  if (dayNum === 1) {
    title = `HIIT Intervals & Midsection Stability`;
    exercises = ["High Knees", "Plank", "Russian Twist", "Mountain Climbers", "Bicycle Crunch"];
  } else if (dayNum === 2) {
    title = `Compound Calorie Crusher & Legs`;
    exercises = ["Squats", "Burpees", "Lunges", "12-3-30 Treadmill Walk", "Dead Bug"];
  } else if (dayNum === 3) {
    title = `Upper Body Sculpt & Metabolic Circuit`;
    exercises = ["Push-ups", "Jumping Jacks", "Side Plank", "Bear Crawl", "Reverse Crunch"];
  } else {
    title = `Elite Midsection Melt & Endurance`;
    exercises = ["Rope Jump", "Russian Twist", "Plank", "Mountain Climbers", "Squats"];
  }

  return {
    phase,
    difficulty,
    duration,
    calBurn,
    title,
    warmup: [
      "Arm circles & torso twists — 3 mins",
      "Dynamic hip openers — 2 mins",
      "Light jumping jacks or marching — 3 mins",
      week > 8 ? "Spidermans with chest rotations — 2 mins" : "Cat-Cow stretching — 1 min"
    ],
    core: [
      `Plank Hold: ${week <= 4 ? "3 sets x 30s" : week <= 12 ? "4 sets x 45s" : "4 sets x 60s (Weighted)"}`,
      `Dead Bug: 3 sets x ${week <= 4 ? "12 reps" : "16 reps with control"}`,
      `Side Plank Hold: 3 sets x ${week <= 4 ? "20s" : "45s per side"}`
    ],
    hiit: [
      `Mountain Climbers: 4 rounds x ${week <= 8 ? "30s work / 15s rest" : "45s work / 15s rest"}`,
      `Burpees: 3 rounds x ${week <= 4 ? "10 reps" : week <= 12 ? "15 reps" : "20 reps with push-up"}`,
      `Rope Jump intervals: ${week <= 8 ? "3 mins continuous" : "5 mins high intensity double-unders"}`
    ],
    strength: [
      `Squats: ${strengthReps}`,
      `Push-ups (Knee or Full): 3 sets x ${week <= 4 ? "8 reps" : "15 reps with slow negatives"}`,
      `Reverse Lunges: 3 sets x 12 reps per side ${week > 8 ? "(Hold dumbbells)" : ""}`
    ],
    fullBodyCircuit: [
      `Bear Crawl: 3 sets x 40 seconds`,
      `12-3-30 Treadmill Walk: ${week <= 4 ? "15 mins" : week <= 12 ? "30 mins" : "45 mins"} at 12% incline, 3.0 mph`
    ],
    cooldown: [
      "Cobra pose stretch — hold 30s x 2",
      "Kneeling hamstring stretch — 1 min per side",
      "Child's pose deep breathing — 2 mins"
    ],
    modifications: {
      beginner: "Scale cardio work-to-rest ratio (e.g. 20s work / 20s rest). Use elevated pushups. Do standard bodyweight air squats.",
      intermediate: "Add light dumbbells. Maintain 12-3-30 incline at full duration. Perform classic pushups.",
      advanced: "Increase dumbbell weights. Replace standard squats with jump squats. Perform 12-3-30 walk with a 5kg weighted vest."
    },
    exercisesList: exercises
  };
};

export default function BellyFatShredView() {
  const { user, setView, theme } = useApp();
  const { exercises: centralizedExercises } = useCentralizedExercises();
  const [activeTab, setActiveTab] = useState<"dashboard" | "workouts" | "home-workouts" | "running" | "nutrition" | "analytics" | "coaching">("dashboard");
  const [isPlayingHomeWorkout, setIsPlayingHomeWorkout] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("alex_fitness_favorite_home_exercises");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCircuitFavorited, setIsCircuitFavorited] = useState(() => {
    try {
      return localStorage.getItem("alex_fitness_circuit_favorited") === "true";
    } catch {
      return false;
    }
  });

  const toggleFavoriteExercise = (id: string) => {
    let next;
    if (favoriteExercises.includes(id)) {
      next = favoriteExercises.filter((x) => x !== id);
    } else {
      next = [...favoriteExercises, id];
    }
    setFavoriteExercises(next);
    localStorage.setItem("alex_fitness_favorite_home_exercises", JSON.stringify(next));
  };

  const toggleCircuitFavorite = () => {
    const next = !isCircuitFavorited;
    setIsCircuitFavorited(next);
    localStorage.setItem("alex_fitness_circuit_favorited", next ? "true" : "false");
  };

  // Smoothly scroll to the top of the viewport whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);
  const [progress, setProgress] = useState<BellyFatShredProgress | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [savingDb, setSavingDb] = useState(false);
  const [logWeightVal, setLogWeightVal] = useState("");
  const [logWaistVal, setLogWaistVal] = useState("");
  const [logPhotoUrl, setLogPhotoUrl] = useState("");
  const [logPhotoNote, setLogPhotoNote] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentDayTimer, setCurrentDayTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [premiumProgramContent, setPremiumProgramContent] = useState<any>(null);
  const [fetchingPremiumContent, setFetchingPremiumContent] = useState(false);

  // Interactive Daily Shred Guide Companion states
  const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);
  const [guideTimerSeconds, setGuideTimerSeconds] = useState<number>(0);
  const [guideTimerRunning, setGuideTimerRunning] = useState<boolean>(false);
  const [completedGuideDrills, setCompletedGuideDrills] = useState<Record<string, boolean>>({});

  // Default weight / waist if history empty
  const defaultWeight = user?.weight || 80;
  const defaultWaist = 90;

  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSendBellyFatShredReminder = async () => {
    if (!user) return;
    setEmailSending(true);
    setEmailSuccess(null);
    setEmailError(null);
    try {
      await queueBellyFatShredReminderEmail(
        user.email,
        user.displayName || "Athlete",
        progress?.currentWeek || 1,
        progress?.currentDay || 1
      );
      setEmailSuccess("Success! An automated Belly Fat Shred reminder email has been queued in Firestore. The Mail Extension will dispatch it shortly.");
    } catch (err: any) {
      console.error("Error sending belly fat shred reminder email:", err);
      setEmailError(err.message || "Could not queue reminder email. Please check internet connection.");
    } finally {
      setEmailSending(false);
    }
  };

  const fetchProgramContent = async () => {
    if (!user) return;
    setFetchingPremiumContent(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) return;
      const res = await fetch("/api/premium/belly-fat-shred/content", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPremiumProgramContent(data);
        }
      }
    } catch (e) {
      console.error("Error fetching premium program content:", e);
    } finally {
      setFetchingPremiumContent(false);
    }
  };

  useEffect(() => {
    if (user && (user.subscriptionStatus === "premium" || user.role === "admin")) {
      fetchProgramContent();
    }
  }, [user]);

  // Interactive Daily Shred Guide Companion stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (guideTimerRunning) {
      interval = setInterval(() => {
        setGuideTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [guideTimerRunning]);

  // Generate today date string key
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    const uid = user?.uid || "guest";
    setLoadingDb(true);
    
    // 1. Local Fallback baseline
    const localKey = `belly_fat_shred_progress_${uid}`;
    const cached = localStorage.getItem(localKey);
    let initialProgress: BellyFatShredProgress = {
      userId: uid,
      currentWeek: 1,
      currentDay: 1,
      completedWorkouts: [],
      completedRuns: [],
      waterIntake: 0,
      lastHydrationReset: todayStr,
      hydrationHistory: {},
      walkingHistory: {},
      nutritionChecklist: {},
      weightHistory: [
        { date: "2026-07-01", value: defaultWeight },
        { date: "2026-07-08", value: defaultWeight - 0.8 }
      ],
      waistHistory: [
        { date: "2026-07-01", value: defaultWaist },
        { date: "2026-07-08", value: defaultWaist - 0.5 }
      ],
      progressPhotos: [
        { date: "2026-07-01", url: "https://github.com/muzikmail2-arch/bb/blob/main/ChatGPT%20Image%20Jul%2017,%202026,%2011_49_31%20AM.png?raw=true", note: "Initial transformation baseline" }
      ],
      achievements: ["welcomed_to_shred"],
      streaks: {
        workoutStreak: 0,
        hydrationStreak: 0,
        runningStreak: 0
      },
      lemonCucumberCompleted: [],
      dailyChecklistHistory: {},
      reminders: {
        workout: true,
        water: true,
        running: true,
        meal: true,
        walk: true,
        hydration: true,
        lemonCucumber: true
      }
    };

    if (cached) {
      try {
        initialProgress = JSON.parse(cached);
      } catch (e) {
        console.warn("Could not parse cached program progress", e);
      }
    }

    // 2. Firestore integration load
    if (!isMockFirebase && user) {
      try {
        const docRef = doc(db, "belly_fat_shred_progress", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dbData = docSnap.data() as BellyFatShredProgress;
          initialProgress = { ...initialProgress, ...dbData };
        }
      } catch (err) {
        console.error("Firestore progress load error:", err);
      }
    }

    // Apply daily resets for hydration
    if (initialProgress.lastHydrationReset !== todayStr) {
      // Archive yesterday's water to history
      if (initialProgress.waterIntake > 0) {
        initialProgress.hydrationHistory[initialProgress.lastHydrationReset] = initialProgress.waterIntake;
      }
      initialProgress.waterIntake = 0;
      initialProgress.lastHydrationReset = todayStr;
      
      // Calculate hydration streak
      const targetWater = user?.gender?.toLowerCase() === "male" ? 4 : 3;
      let perfectStreak = initialProgress.streaks?.hydrationStreak || 0;
      // If yesterday was met, streak increment, else reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const yesterdayAmount = initialProgress.hydrationHistory?.[yesterdayStr] || 0;
      if (yesterdayAmount >= targetWater) {
        perfectStreak += 1;
      }
      if (!initialProgress.streaks) {
        initialProgress.streaks = { workoutStreak: 0, hydrationStreak: 0, runningStreak: 0 };
      }
      initialProgress.streaks.hydrationStreak = perfectStreak;
    }

    setProgress(initialProgress);
    setLoadingDb(false);
  };

  const syncProgress = async (updated: BellyFatShredProgress) => {
    if (!user) return;
    setProgress(updated);
    localStorage.setItem(`belly_fat_shred_progress_${user.uid}`, JSON.stringify(updated));

    if (!isMockFirebase) {
      setSavingDb(true);
      try {
        const docRef = doc(db, "belly_fat_shred_progress", user.uid);
        await setDoc(docRef, updated);
      } catch (err) {
        console.error("Error syncing belly fat progress:", err);
        handleFirestoreError(err, OperationType.WRITE, `belly_fat_shred_progress/${user.uid}`);
      } finally {
        setSavingDb(false);
      }
    }
  };

  const handleCompleteHomeWorkout = async (caloriesBurned: number, durationMinutes: number) => {
    if (!progress || !user) return;
    
    // Create copy of progress
    const updated = { ...progress };
    
    // Add workout completion key
    const wKey = `home_circuit_week_${progress.currentWeek}_day_${progress.currentDay}_${Date.now()}`;
    if (!updated.completedWorkouts.includes(wKey)) {
      updated.completedWorkouts.push(wKey);
    }
    
    // Update workout streaks
    if (!updated.streaks) {
      updated.streaks = { workoutStreak: 0, hydrationStreak: 0, runningStreak: 0 };
    }
    let currentStreak = updated.streaks.workoutStreak || 0;
    currentStreak += 1;
    updated.streaks.workoutStreak = currentStreak;
    
    // Unlock achievement badge
    if (!updated.achievements.includes("cardio_circuit_champion")) {
      updated.achievements.push("cardio_circuit_champion");
    }
    
    // Set daily checklist habit to completed
    const dayKey = todayStr;
    const currentHabits = updated.dailyChecklistHistory[dayKey] || {
      workout: false,
      run: false,
      water: false,
      lemonCucumber: false,
      mealWalks: { breakfast: false, lunch: false, dinner: false },
      healthyMeals: false,
      sleep: false,
      stretch: false,
    };
    currentHabits.workout = true;
    updated.dailyChecklistHistory[dayKey] = currentHabits;
    
    // Trigger progress update and synchronize to Firestore/LocalStorage
    setProgress(updated);
    await syncProgress(updated);
    
    setIsPlayingHomeWorkout(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-[#D32F2F] mx-auto animate-bounce" />
          <h2 className="text-xl font-bold font-sans uppercase">Please Sign In</h2>
          <p className="text-xs text-slate-400">
            You must be logged in to view the Belly Fat Shred program.
          </p>
        </div>
      </div>
    );
  }

  if (loadingDb || !progress) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <RefreshCw className="w-8 h-8 text-[#D32F2F] animate-spin" />
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          Synthesizing Transformational Matrix...
        </p>
      </div>
    );
  }

  // Active workout definition
  const workoutInfo = getWorkoutForWeekAndDay(progress.currentWeek, progress.currentDay);

  // Check if today is Run Day (typically 3 times/week e.g. Days 2, 4, 6)
  const isRunScheduled = progress.currentDay % 2 === 0;
  // Check if Lemon Water is scheduled (3 times/week e.g. Days 1, 3, 5)
  const isLemonScheduled = progress.currentDay % 2 !== 0 && progress.currentDay <= 5;

  // Get current day's checklist state
  const dailyHabitState = progress.dailyChecklistHistory[todayStr] || {
    workout: progress.completedWorkouts.includes(`week_${progress.currentWeek}_day_${progress.currentDay}`),
    run: progress.completedRuns.includes(`week_${progress.currentWeek}_run_${progress.currentDay}`),
    water: progress.waterIntake >= (user.gender?.toLowerCase() === "male" ? 4 : 3),
    lemonCucumber: progress.lemonCucumberCompleted.includes(`week_${progress.currentWeek}_day_${progress.currentDay}`),
    mealWalks: progress.walkingHistory[todayStr] || { breakfast: false, lunch: false, dinner: false },
    healthyMeals: progress.nutritionChecklist[todayStr]?.eatenHealthy || false,
    sleep: false,
    stretch: false
  };

  const dailyScore = calculateHabitScore(dailyHabitState, isRunScheduled, isLemonScheduled);

  // Overall calculations
  const totalWeeks = 20;
  const totalDays = 140; // 20 weeks * 7 days
  const elapsedDays = ((progress.currentWeek - 1) * 7) + progress.currentDay - 1;
  const daysRemaining = totalDays - elapsedDays;
  const totalCompletedWorkouts = progress.completedWorkouts.length;
  const totalCompletedRuns = progress.completedRuns.length;
  const completionPercentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  // Hydro limit
  const waterTarget = user.gender?.toLowerCase() === "male" ? 4 : 3;
  const hydrationPercentage = Math.min(100, Math.round((progress.waterIntake / waterTarget) * 100));

  // Run stats
  const totalKmCompleted = totalCompletedRuns * 5; // assumes 5km run average

  // Achievements evaluation
  const checkStreaksAndUnlock = (current: BellyFatShredProgress) => {
    const updatedAchievements = [...current.achievements];
    const totalDone = current.completedWorkouts.length;
    
    if (totalDone >= 7 && !updatedAchievements.includes("7_day_shredder")) {
      updatedAchievements.push("7_day_shredder");
    }
    if (totalDone >= 30 && !updatedAchievements.includes("30_day_shredder")) {
      updatedAchievements.push("30_day_shredder");
    }
    if (totalDone >= 60 && !updatedAchievements.includes("60_day_shredder")) {
      updatedAchievements.push("60_day_shredder");
    }
    if (totalDone >= 90 && !updatedAchievements.includes("90_day_shredder")) {
      updatedAchievements.push("90_day_shredder");
    }
    if (totalDone >= 120 && !updatedAchievements.includes("120_day_shredder")) {
      updatedAchievements.push("120_day_shredder");
    }
    if (totalDone >= 150 && !updatedAchievements.includes("150_day_veteran")) {
      updatedAchievements.push("150_day_veteran");
    }

    return updatedAchievements;
  };

  // Workout Completion
  const handleToggleWorkout = () => {
    const wKey = `week_${progress.currentWeek}_day_${progress.currentDay}`;
    let nextWorkouts = [...progress.completedWorkouts];
    let isCompleted = false;

    if (nextWorkouts.includes(wKey)) {
      nextWorkouts = nextWorkouts.filter(w => w !== wKey);
    } else {
      nextWorkouts.push(wKey);
      isCompleted = true;
    }

    // Update Daily habits
    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    todayHabits.workout = isCompleted;
    habitsHistory[todayStr] = todayHabits;

    // Workout Streaks Logic
    let nextWorkoutStreak = progress.streaks.workoutStreak;
    if (isCompleted) {
      nextWorkoutStreak += 1;
    } else if (nextWorkoutStreak > 0) {
      nextWorkoutStreak -= 1;
    }

    const updated = {
      ...progress,
      completedWorkouts: nextWorkouts,
      dailyChecklistHistory: habitsHistory,
      streaks: {
        ...progress.streaks,
        workoutStreak: nextWorkoutStreak
      }
    };
    updated.achievements = checkStreaksAndUnlock(updated);
    syncProgress(updated);
  };

  // Run Completion
  const handleToggleRun = () => {
    const rKey = `week_${progress.currentWeek}_run_${progress.currentDay}`;
    let nextRuns = [...progress.completedRuns];
    let isCompleted = false;

    if (nextRuns.includes(rKey)) {
      nextRuns = nextRuns.filter(r => r !== rKey);
    } else {
      nextRuns.push(rKey);
      isCompleted = true;
    }

    // Update Daily habits
    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    todayHabits.run = isCompleted;
    habitsHistory[todayStr] = todayHabits;

    // Running Streak
    let nextRunningStreak = progress.streaks.runningStreak;
    if (isCompleted) nextRunningStreak += 1;

    const updated = {
      ...progress,
      completedRuns: nextRuns,
      dailyChecklistHistory: habitsHistory,
      streaks: {
        ...progress.streaks,
        runningStreak: nextRunningStreak
      }
    };
    syncProgress(updated);
  };

  // Lemon Water toggling
  const handleToggleLemonWater = () => {
    const lKey = `week_${progress.currentWeek}_day_${progress.currentDay}`;
    let nextLemons = [...progress.lemonCucumberCompleted];
    let isCompleted = false;

    if (nextLemons.includes(lKey)) {
      nextLemons = nextLemons.filter(l => l !== lKey);
    } else {
      nextLemons.push(lKey);
      isCompleted = true;
    }

    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    todayHabits.lemonCucumber = isCompleted;
    habitsHistory[todayStr] = todayHabits;

    const updated = {
      ...progress,
      lemonCucumberCompleted: nextLemons,
      dailyChecklistHistory: habitsHistory
    };
    syncProgress(updated);
  };

  // Water Drink Action
  const logWater = (amount: number) => {
    const nextWater = Math.max(0, parseFloat((progress.waterIntake + amount).toFixed(1)));
    
    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    todayHabits.water = nextWater >= waterTarget;
    habitsHistory[todayStr] = todayHabits;

    const hydroHistory = { ...progress.hydrationHistory };
    hydroHistory[todayStr] = nextWater;

    const updated = {
      ...progress,
      waterIntake: nextWater,
      hydrationHistory: hydroHistory,
      dailyChecklistHistory: habitsHistory
    };
    syncProgress(updated);
  };

  // Reset progress entirely to baseline
  const handleRestartProgram = () => {
    if (window.confirm("WARNING: Are you absolutely certain you want to reset all your 5-Month Belly Fat Shred program logs, stats, and achievements? This cannot be undone.")) {
      const restarted: BellyFatShredProgress = {
        userId: user.uid,
        currentWeek: 1,
        currentDay: 1,
        completedWorkouts: [],
        completedRuns: [],
        waterIntake: 0,
        lastHydrationReset: todayStr,
        hydrationHistory: {},
        walkingHistory: {},
        nutritionChecklist: {},
        weightHistory: [{ date: todayStr, value: defaultWeight }],
        waistHistory: [{ date: todayStr, value: defaultWaist }],
        progressPhotos: [],
        achievements: ["welcomed_to_shred"],
        streaks: { workoutStreak: 0, hydrationStreak: 0, runningStreak: 0 },
        lemonCucumberCompleted: [],
        dailyChecklistHistory: {},
        reminders: {
          workout: true,
          water: true,
          running: true,
          meal: true,
          walk: true,
          hydration: true,
          lemonCucumber: true
        }
      };
      syncProgress(restarted);
    }
  };

  // Interactive Daily Shred Guide Companion Handlers
  const handleNextGuideStep = () => {
    if (activeGuideStep === null || !progress) return;
    
    if (activeGuideStep < 5) {
      setActiveGuideStep(activeGuideStep + 1);
    } else if (activeGuideStep === 5) {
      // Complete today's session
      const wKey = `week_${progress.currentWeek}_day_${progress.currentDay}`;
      if (!progress.completedWorkouts.includes(wKey)) {
        handleToggleWorkout();
      }
      setGuideTimerRunning(false);
      setActiveGuideStep(6);
    }
  };

  const handlePrevGuideStep = () => {
    if (activeGuideStep === null || activeGuideStep === 0) return;
    setActiveGuideStep(activeGuideStep - 1);
  };

  const handleToggleGuideDrill = (drillId: string) => {
    setCompletedGuideDrills(prev => ({
      ...prev,
      [drillId]: !prev[drillId]
    }));
  };

  // Daily Habits toggle
  const toggleDailyHabit = (key: keyof Omit<DailyHabits, "mealWalks">) => {
    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    
    // Toggle
    (todayHabits as any)[key] = !(todayHabits as any)[key];
    
    // Handle specific dual states
    if (key === "healthyMeals") {
      const nutritionMap = { ...progress.nutritionChecklist };
      nutritionMap[todayStr] = {
        eatenHealthy: todayHabits.healthyMeals,
        limitedAvoidFoods: nutritionMap[todayStr]?.limitedAvoidFoods || false
      };
      progress.nutritionChecklist = nutritionMap;
    }

    habitsHistory[todayStr] = todayHabits;
    const updated = {
      ...progress,
      dailyChecklistHistory: habitsHistory
    };
    syncProgress(updated);
  };

  // Meal Walks toggles
  const toggleMealWalk = (meal: "breakfast" | "lunch" | "dinner") => {
    const habitsHistory = { ...progress.dailyChecklistHistory };
    const todayHabits = habitsHistory[todayStr] || { ...dailyHabitState };
    
    const mealWalks = { ...todayHabits.mealWalks };
    mealWalks[meal] = !mealWalks[meal];
    todayHabits.mealWalks = mealWalks;

    const walkingMap = { ...progress.walkingHistory };
    walkingMap[todayStr] = mealWalks;

    habitsHistory[todayStr] = todayHabits;
    const updated = {
      ...progress,
      dailyChecklistHistory: habitsHistory,
      walkingHistory: walkingMap
    };
    syncProgress(updated);
  };

  // Next Day Progression
  const handleNextDay = () => {
    let nextDay = progress.currentDay + 1;
    let nextWeek = progress.currentWeek;
    
    if (nextDay > 7) {
      // Must complete 3 workouts of the week before unlocking the next week
      const currentWeekWorkouts = progress.completedWorkouts.filter(w => w.startsWith(`week_${progress.currentWeek}_`));
      if (currentWeekWorkouts.length < 3) {
        alert(`🔒 Progression Locked: You must complete at least 3 workouts from Week ${progress.currentWeek} before advancing to the next week.`);
        return;
      }
      nextDay = 1;
      nextWeek += 1;
    }

    if (nextWeek > 20) {
      alert("🏆 Incredibly job! You have fully finished the 5-Month Belly Fat Shred Program. Revisit any week to maintain your definition!");
      return;
    }

    const updated = {
      ...progress,
      currentWeek: nextWeek,
      currentDay: nextDay
    };
    syncProgress(updated);
  };

  const handlePrevDay = () => {
    let prevDay = progress.currentDay - 1;
    let prevWeek = progress.currentWeek;

    if (prevDay < 1) {
      if (prevWeek > 1) {
        prevWeek -= 1;
        prevDay = 7;
      } else {
        return; // already at week 1 day 1
      }
    }

    const updated = {
      ...progress,
      currentWeek: prevWeek,
      currentDay: prevDay
    };
    syncProgress(updated);
  };

  // Add weight
  const handleLogWeight = () => {
    const parsed = parseFloat(logWeightVal);
    if (isNaN(parsed) || parsed <= 0) return;
    const nextWeightHistory = [...progress.weightHistory, { date: todayStr, value: parsed }];
    const updated = {
      ...progress,
      weightHistory: nextWeightHistory
    };
    syncProgress(updated);
    setLogWeightVal("");
    alert("Weight successfully logged to trajectory index!");
  };

  // Add waist
  const handleLogWaist = () => {
    const parsed = parseFloat(logWaistVal);
    if (isNaN(parsed) || parsed <= 0) return;
    const nextWaistHistory = [...progress.waistHistory, { date: todayStr, value: parsed }];
    const updated = {
      ...progress,
      waistHistory: nextWaistHistory
    };
    syncProgress(updated);
    setLogWaistVal("");
    alert("Waist measurement successfully logged to metrics!");
  };

  // Simulate progress photo uploading
  const handleLogPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logPhotoUrl) return;
    const nextPhotos = [
      ...progress.progressPhotos,
      {
        date: todayStr,
        url: logPhotoUrl,
        note: logPhotoNote || "Transformation update"
      }
    ];
    const updated = {
      ...progress,
      progressPhotos: nextPhotos
    };
    syncProgress(updated);
    setLogPhotoUrl("");
    setLogPhotoNote("");
    setShowPhotoModal(false);
  };

  // Toggle Reminder Checkboxes
  const toggleReminder = (key: keyof BellyFatShredProgress["reminders"]) => {
    const nextReminders = { ...progress.reminders };
    nextReminders[key] = !nextReminders[key];
    const updated = {
      ...progress,
      reminders: nextReminders
    };
    syncProgress(updated);
  };

  // Static motivation messages matching current elapsed week
  const getMotivationalMessage = () => {
    const messages = [
      "Small actions every day create extraordinary results. Embrace the baseline phase.",
      "You are stronger than yesterday. Compound movements are training your metabolic engine.",
      "Discipline beats motivation. Sweat is just fat crying in silence.",
      "Consistency is the magic key. Spot reduction is a myth, but overall definition is inevitable.",
      "Caloric deficit combined with heavy resistance creates deep muscle tone.",
      "Hydration is fuel. Clean cucumber water optimizes hepatic detoxification pathways.",
      "Your abs are starting to tighten. Keep logging your steps and core compressions.",
      "Midpoint milestones! Complete every run to elevate aerobic threshold.",
      "Patience. Visceral fat is the first to form, but consistent deficit melts it permanently.",
      "Stay relentless. Your weekly performance score is setting high-altitude benchmarks.",
      "No shortcuts. Every burpee and treadmill step compounds into absolute luxury physics.",
      "Lean protein builds the scaffolding. Eliminate processed sugars, defend your discipline.",
      "70 days of deep commitment. Your waist measurements reflect supreme physical control.",
      "Sleep and recovery are non-negotiable. 8 hours of sleep regulates ghrelin and leptin.",
      "Advanced phase initiated. High power output intervals are pushing peak definitions.",
      "Defeat fatigue. You have unlocked ultimate cardiac resilience.",
      "The finish line is glowing. Your consistency score is elite.",
      "A complete abdominal sculpture is appearing. Keep drinking pure water and walking post-meal.",
      "Unbelievable stamina. You are operating at professional coach levels of performance.",
      "The 5-Month transformation is absolute. A testament to deep athletic discipline!"
    ];
    return messages[Math.min(messages.length - 1, progress.currentWeek - 1)];
  };

  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-200 text-slate-900 shadow-md";
  const secondaryCardBg = isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100/70 border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200";
  const btnSecondary = isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700";

  if (isPlayingHomeWorkout) {
    return (
      <HomeWorkoutPlayer 
        onClose={() => setIsPlayingHomeWorkout(false)}
        onComplete={(calories, duration) => handleCompleteHomeWorkout(calories, duration)}
      />
    );
  }

  if (!progress || loadingDb) {
    return (
      <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <div className="max-w-7xl mx-auto mt-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Luxury Header Card */}
      <div className={`max-w-7xl mx-auto mb-8 border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        {/* Cinematic Hero Image Background */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/src/assets/images/belly_shred_hero_1784283617530.jpg"
            alt="Belly Shred Program Hero Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-100 object-center md:object-right filter brightness-125 contrast-110 saturate-105"
          />
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-40 h-40 text-[#D32F2F] stroke-[1]" />
        </div>
        
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 backdrop-blur-md p-6 rounded-2xl border shadow-lg ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200"}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#D32F2F] tracking-widest uppercase bg-[#D32F2F]/10 border border-[#D32F2F]/20 px-3 py-1 rounded-full">
                ★ PREMIUM COACHING MODULE
              </span>
              <span className="text-[10px] font-mono font-black text-amber-600 tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
                👑 ACTIVE
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tight uppercase font-display ${isDark ? "text-white" : "text-slate-950"}`}>
              5 Month <span className="text-[#D32F2F]">Belly Fat Shred</span>
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              An elite, scientifically-validated program combining progressive whole-body metabolic conditioning, 
              hiit intervals, targeted core compression, post-meal thermal walks, and high-fidelity hydration tracking.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setView("dashboard")} 
              className={`px-4 py-2 border border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded-xl text-xs transition font-bold cursor-pointer ${isDark ? "bg-slate-900" : "bg-white"}`}
            >
              Main Dashboard
            </button>
            <button 
              onClick={handleRestartProgram} 
              className={`px-4 py-2 border rounded-xl text-xs transition font-mono uppercase cursor-pointer ${isDark ? "bg-slate-800 text-slate-300 border-slate-700 hover:text-[#D32F2F]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#D32F2F] hover:text-[#D32F2F]"}`}
            >
              Restart Program
            </button>
          </div>
        </div>

        {/* Horizontal Quick Progress Bar */}
        <div className={`mt-8 pt-6 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Current Period</span>
            <div className={`text-xl font-black uppercase mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              Week {progress.currentWeek} <span className="text-slate-500 text-xs font-normal">/ 20</span>
            </div>
            <p className="text-[10px] text-[#D32F2F] font-semibold uppercase mt-1">Day {progress.currentDay} of 7</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Program Completion</span>
            <div className={`text-xl font-black mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {completionPercentage}%
            </div>
            {/* Miniature progress bar */}
            <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
              <div className="bg-[#D32F2F] h-full" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Days Remaining</span>
            <div className={`text-xl font-black mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {daysRemaining} <span className="text-xs text-slate-500 font-normal">/ 140</span>
            </div>
            <p className="text-[10px] text-emerald-500 font-semibold uppercase mt-1">{elapsedDays} days completed</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800/50" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Daily Integrity</span>
            <div className={`text-xl font-black mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {dailyScore} <span className="text-slate-500 text-xs font-normal">/ 100</span>
            </div>
            <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
              <div className="bg-emerald-500 h-full" style={{ width: `${dailyScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Motivation Banner */}
      <div className="max-w-7xl mx-auto mb-8 bg-[#D32F2F]/5 border border-[#D32F2F]/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
        <div>
          <span className="text-[9px] font-mono font-black text-[#D32F2F] uppercase tracking-wider block">COACH BRIEFING:</span>
          <p className={`text-xs font-medium italic mt-1 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            "{getMotivationalMessage()}"
          </p>
        </div>
      </div>

      {/* Main Switchboard Navigation Tabs */}
      <div className={`max-w-7xl mx-auto mb-8 border-b overflow-x-auto flex gap-1 scrollbar-none ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        {[
          { id: "dashboard", label: "My Board", icon: Trophy },
          { id: "workouts", label: "Workouts", icon: Dumbbell },
          { id: "home-workouts", label: "Home Workout", icon: Home },
          { id: "running", label: "Cardio", icon: Footprints },
          { id: "nutrition", label: "Nutrition Guide", icon: Apple },
          { id: "analytics", label: "Analytics", icon: LineChart },
          { id: "coaching", label: "Reminders Desk", icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "border-[#D32F2F] text-[#D32F2F] bg-[#D32F2F]/5" 
                  : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Switchboard Content Container */}
      <div className="max-w-7xl mx-auto min-h-[500px]">
        
        {/* TAB 1: THE ACTIVE BOARD & DAILY CHECKLIST */}
        {activeTab === "dashboard" && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            
            {/* Left Column: Today's Action Center */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 5-Month Interactive Daily Shred Companion */}
              <div className={`border rounded-3xl p-6 shadow-lg relative overflow-hidden transition-all duration-300 ${
                activeGuideStep !== null ? "border-[#D32F2F]/40 ring-1 ring-[#D32F2F]/20" : ""
              } ${cardBg}`}>
                {/* Background glow when active */}
                {activeGuideStep !== null && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D32F2F]/5 rounded-full blur-3xl pointer-events-none select-none" />
                )}

                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-5 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#D32F2F]/10 text-[#D32F2F] animate-pulse">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black text-[#D32F2F] tracking-wider uppercase">
                          5-Month Daily Companion
                        </span>
                        {activeGuideStep !== null && (
                          <span className="flex items-center gap-1 text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Active Play
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black uppercase font-display tracking-tight text-slate-800 dark:text-slate-200 mt-0.5">
                        {activeGuideStep === null ? "Interactive Shred Assistant" : `Active Day Companion`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">Challenge Day:</span>
                    <span className="font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-[#D32F2F] border border-slate-200 dark:border-slate-800">
                      Day {((progress.currentWeek - 1) * 7) + progress.currentDay} of 140
                    </span>
                  </div>
                </div>

                {activeGuideStep === null ? (
                  /* STEP NULL: WELCOME SCREEN */
                  <div className="space-y-4">
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      Welcome to your interactive workout companion! This smart assistant tracks your 
                      progression day-by-day through the entire 5-month challenge, breaking down today's compound core drills 
                      into guided, easy-to-complete steps. Click start to activate real-time tracking, guide timers, and visual milestones.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Phase</span>
                        <span className="text-xs font-black truncate block mt-0.5 text-slate-700 dark:text-slate-300">
                          Month {Math.min(5, Math.ceil((((progress.currentWeek - 1) * 7) + progress.currentDay) / 28))} of 5
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Today's Focus</span>
                        <span className="text-xs font-black truncate block mt-0.5 text-slate-700 dark:text-slate-300">
                          {workoutInfo.title}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">Est. Calorie Burn</span>
                        <span className="text-xs font-black truncate block mt-0.5 text-slate-700 dark:text-slate-300">
                          {workoutInfo.calBurn}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveGuideStep(0);
                          setGuideTimerSeconds(0);
                          setGuideTimerRunning(true);
                          setCompletedGuideDrills({});
                        }}
                        className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#9E1B1B] text-white font-sans font-black text-xs uppercase tracking-widest shadow-lg shadow-[#D32F2F]/20 flex items-center justify-center gap-2 transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Day {((progress.currentWeek - 1) * 7) + progress.currentDay} Guided Shred</span>
                      </button>
                    </div>
                  </div>
                ) : activeGuideStep === 6 ? (
                  /* STEP 6: CHALLENGE DAY COMPLETED */
                  <div className="text-center py-6 space-y-5">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                      <Trophy className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-emerald-500 tracking-wider uppercase">
                        SESSION COMPLETED
                      </span>
                      <h4 className="text-xl font-black uppercase text-slate-800 dark:text-slate-100">
                        Day {((progress.currentWeek - 1) * 7) + progress.currentDay} Shredded!
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Incredible performance! You successfully navigated all 6 functional training sections of today's belly fat shred.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <span className="text-[8px] text-slate-500 block font-mono uppercase">Time Spent</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                          {Math.floor(guideTimerSeconds / 60)}m {guideTimerSeconds % 60}s
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block font-mono uppercase">Energy Burned</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                          {workoutInfo.calBurn.split(" ")[0]} kcal
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block font-mono uppercase">Progression</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                          {Math.round(((((progress.currentWeek - 1) * 7) + progress.currentDay) / 140) * 100)}% Done
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        onClick={() => {
                          handleNextDay();
                          setActiveGuideStep(null);
                        }}
                        className="flex-1 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Advance to Day {((progress.currentWeek - 1) * 7) + progress.currentDay + 1} ➜</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveGuideStep(0);
                          setGuideTimerSeconds(0);
                          setGuideTimerRunning(true);
                          setCompletedGuideDrills({});
                        }}
                        className="py-3 px-5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
                      >
                        Replay Session
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEPS 0 to 5: GUIDED COMPANION PLAYER */
                  <div className="space-y-5">
                    {/* Stepper progress indicator */}
                    <div className="grid grid-cols-6 gap-1 sm:gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      {[
                        "Warmup",
                        "Core",
                        "HIIT",
                        "Strength",
                        "Finisher",
                        "Cooldown"
                      ].map((name, index) => {
                        const isCurrent = activeGuideStep === index;
                        const isCompleted = activeGuideStep > index;
                        return (
                          <div key={index} className="text-center space-y-1">
                            <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                              isCurrent ? "bg-[#D32F2F]" : isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-850"
                            }`} />
                            <span className={`hidden sm:inline-block text-[8px] font-bold uppercase ${
                              isCurrent ? "text-[#D32F2F]" : isCompleted ? "text-emerald-500" : "text-slate-400"
                            }`}>
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Section title & timer display */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          SECTION 0{activeGuideStep + 1} OF 06
                        </span>
                        <h4 className="text-sm font-black uppercase text-slate-800 dark:text-white leading-tight mt-0.5">
                          {activeGuideStep === 0 && "01. Warm-Up Mobility"}
                          {activeGuideStep === 1 && "02. Midsection Compression"}
                          {activeGuideStep === 2 && "03. Metabolic HIIT"}
                          {activeGuideStep === 3 && "04. Compound Overload Strength"}
                          {activeGuideStep === 4 && "05. Full-Body Finisher & 12-3-30"}
                          {activeGuideStep === 5 && "06. Recovery Cooldown"}
                        </h4>
                        <span className="text-[10px] text-[#D32F2F] font-semibold mt-1 block">
                          {activeGuideStep === 0 && "Time target: 5-8 mins"}
                          {activeGuideStep === 1 && "Time target: 10 mins"}
                          {activeGuideStep === 2 && "Time target: 15-20 mins"}
                          {activeGuideStep === 3 && "Time target: 20 mins"}
                          {activeGuideStep === 4 && "Time target: 15-45 mins"}
                          {activeGuideStep === 5 && "Time target: 5 mins"}
                        </span>
                      </div>

                      {/* Active Stopwatch timer */}
                      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                        <Clock className="w-4 h-4 text-[#D32F2F]" />
                        <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-100 min-w-[50px] text-center">
                          {Math.floor(guideTimerSeconds / 60).toString().padStart(2, "0")}:
                          {(guideTimerSeconds % 60).toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => setGuideTimerRunning(!guideTimerRunning)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                          title={guideTimerRunning ? "Pause Timer" : "Start Timer"}
                        >
                          {guideTimerRunning ? (
                            <Pause className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-500 fill-current" />
                          )}
                        </button>
                        <button
                          onClick={() => setGuideTimerSeconds(prev => prev + 60)}
                          className="text-[9px] font-mono font-bold text-[#D32F2F] hover:underline"
                          title="Add 1 Minute"
                        >
                          +1M
                        </button>
                      </div>
                    </div>

                    {/* Drill Exercises checklist */}
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                        REQUIRED DRILLS (TAP TO CHECK OFF)
                      </span>

                      <div className="space-y-2">
                        {(activeGuideStep === 0 ? workoutInfo.warmup :
                          activeGuideStep === 1 ? workoutInfo.core :
                          activeGuideStep === 2 ? workoutInfo.hiit :
                          activeGuideStep === 3 ? workoutInfo.strength :
                          activeGuideStep === 4 ? workoutInfo.fullBodyCircuit :
                          workoutInfo.cooldown).map((drill, idx) => {
                            const drillId = `step_${activeGuideStep}_drill_${idx}`;
                            const isChecked = !!completedGuideDrills[drillId];
                            const libName = mapDrillToLibraryName(drill);
                            return (
                              <button
                                key={idx}
                                onClick={() => handleToggleGuideDrill(drillId)}
                                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                                  isChecked
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-slate-700 dark:text-slate-300"
                                    : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                                    isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div className="min-w-0">
                                    <span className={`font-semibold block ${isChecked ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                                      {drill}
                                    </span>
                                    <span className="text-[9px] text-[#D32F2F] font-mono block mt-0.5 uppercase tracking-wide">
                                      {libName}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                                    isChecked ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200/60 dark:bg-slate-800 text-slate-500"
                                  }`}>
                                    {isChecked ? "Done" : "Pending"}
                                  </span>
                                  <UnifiedExerciseMedia
                                    exerciseName={libName}
                                    className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                                  />
                                </div>
                              </button>
                            );
                        })}
                      </div>
                    </div>

                    {/* Section Tip */}
                    <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400 flex gap-2">
                      <span className="text-xs">💡</span>
                      <p>
                        <strong>Coaching Pro-tip:</strong> Maintain constant core compression. Squeeze your navel toward your spine during exertion. Focus on deep breathing to trigger metabolic pathways.
                      </p>
                    </div>

                    {/* Stepper buttons */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handlePrevGuideStep}
                        disabled={activeGuideStep === 0}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                          activeGuideStep === 0
                            ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to stop this interactive session? Your timer and drill checklists will be reset.")) {
                              setActiveGuideStep(null);
                              setGuideTimerRunning(false);
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition"
                        >
                          Quit Session
                        </button>

                        <button
                          onClick={handleNextGuideStep}
                          className="py-2.5 px-5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#D32F2F]/10"
                        >
                          <span>
                            {activeGuideStep === 5 ? "Finish Workout 🏁" : "Next Section"}
                          </span>
                          <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Day Switcher and Workout brief */}
              <div className={`border rounded-3xl p-6 shadow-md ${cardBg}`}>
                <div className={`flex items-center justify-between border-b pb-4 mb-4 ${borderCol}`}>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">CALENDAR MATRIX</span>
                    <h2 className={`text-lg font-black uppercase font-display mt-0.5 ${textPrimary}`}>
                      Active Period: W{progress.currentWeek} D{progress.currentDay}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevDay} 
                      className={`p-2 rounded-xl transition cursor-pointer ${btnSecondary}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-xs font-mono font-black px-2 ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                      DAY {progress.currentDay} / 7
                    </span>
                    <button 
                      onClick={handleNextDay} 
                      className={`p-2 rounded-xl transition cursor-pointer ${btnSecondary}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Workout Briefing */}
                <div className="space-y-4">
                  <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D32F2F]/10 text-[#D32F2F] rounded-xl flex items-center justify-center font-bold">
                        {workoutInfo.difficulty === "Beginner" ? "B" : workoutInfo.difficulty === "Intermediate" ? "I" : "A"}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded uppercase">
                          {workoutInfo.phase}
                        </span>
                        <h3 className={`text-sm font-black uppercase mt-1 leading-tight ${textPrimary}`}>
                          {workoutInfo.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono uppercase">Duration</span>
                        <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{workoutInfo.duration}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono uppercase">Difficulty</span>
                        <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{workoutInfo.difficulty}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono uppercase">Burn</span>
                        <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{workoutInfo.calBurn.split(" ")[0]} kcal</span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed font-sans ${textSecondary}`}>
                    Every training session is meticulously designed to create a total caloric deficit. 
                    This workout target includes <strong>{workoutInfo.exercisesList.join(", ")}</strong>, 
                    concluding with an incline interval walk to stimulate visceral fat mobilization.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleToggleWorkout}
                      className={`flex-1 py-3 px-5 rounded-xl font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                        dailyHabitState.workout
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                      }`}
                    >
                      {dailyHabitState.workout ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Workout Completed</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Mark Workout Completed</span>
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => setActiveTab("workouts")} 
                      className={`px-5 py-3 border text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${isDark ? "border-slate-700 hover:border-slate-500 text-slate-300 bg-slate-900" : "border-slate-300 hover:border-slate-400 text-slate-700 bg-white"}`}
                    >
                      View Drills
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Daily Habit Checklist */}
              <div className={`border rounded-3xl p-6 ${cardBg}`}>
                <div className={`flex items-center justify-between border-b pb-4 mb-6 ${borderCol}`}>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">CALORIC DEFICIT LOGS</span>
                    <h2 className={`text-lg font-black uppercase font-display mt-0.5 ${textPrimary}`}>
                      Daily Checklist
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-500 uppercase">
                    DAILY SCORE: {dailyScore}%
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Workout Habit Card */}
                  <div 
                    onClick={handleToggleWorkout}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.workout 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.workout ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Workout Completed</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Today's active session</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.workout ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.workout && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* 5KM Run Card */}
                  <div 
                    onClick={handleToggleRun}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.run 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.run ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">3-5 KM Run Plan</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isRunScheduled ? "⚡ Scheduled Today" : "Rest or Active Walk"}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.run ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.run && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Hydration Card */}
                  <div 
                    onClick={() => logWater(1.0)}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.water 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.water ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Drink Sufficient Water</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{progress.waterIntake}L / {waterTarget}L Consumed</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.water ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.water && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Cucumber Lemon Card */}
                  <div 
                    onClick={handleToggleLemonWater}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.lemonCucumber 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.lemonCucumber ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Lemon Cucumber Routine</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isLemonScheduled ? "⚡ Scheduled Today" : "Bonus Hydration"}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.lemonCucumber ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.lemonCucumber && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Healthy Meals */}
                  <div 
                    onClick={() => toggleDailyHabit("healthyMeals")}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.healthyMeals 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.healthyMeals ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Apple className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Healthy Meals Only</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Defended calorie-deficit plan</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.healthyMeals ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.healthyMeals && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Sleep Habit */}
                  <div 
                    onClick={() => toggleDailyHabit("sleep")}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.sleep 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.sleep ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Sleep 7 - 9 Hours</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Crucial for fat-burning hormones</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.sleep ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.sleep && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Stretching completed */}
                  <div 
                    onClick={() => toggleDailyHabit("stretch")}
                    className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between select-none ${
                      dailyHabitState.stretch 
                        ? (isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800") 
                        : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dailyHabitState.stretch ? "bg-emerald-500/10 text-emerald-500" : (isDark ? "bg-slate-900 text-slate-500" : "bg-slate-200 text-slate-400")}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase leading-tight">Mobility / Stretch</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Soreness reduction and alignment</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${dailyHabitState.stretch ? "border-emerald-500 bg-emerald-500 text-white" : (isDark ? "border-slate-700" : "border-slate-300")}`}>
                      {dailyHabitState.stretch && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                </div>

                {/* Sub-section: Walks After Meal Habits */}
                <div className={`mt-6 pt-6 border-t ${borderCol}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 ${textPrimary}`}>
                    <Footprints className="w-4 h-4 text-[#D32F2F]" />
                    <span>Post-Meal Thermal Walks (10-20 mins)</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {["breakfast", "lunch", "dinner"].map((meal) => {
                      const done = (dailyHabitState.mealWalks as any)[meal];
                      return (
                        <button
                          key={meal}
                          onClick={() => toggleMealWalk(meal as any)}
                          className={`py-3 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                            done
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : (isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300")
                          }`}
                        >
                          <span className="block font-black uppercase">{meal}</span>
                          <span className="text-[8px] font-normal text-slate-500 block mt-0.5">
                            {done ? "Completed" : "Not Done"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Hydration Dashboard & Streaks */}
            <div className="space-y-8">
              
              {/* Daily Hydration Progress Ring card */}
              <div className={`border rounded-3xl p-6 shadow-md text-center ${cardBg}`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">HYDRATION TRACKER</span>
                <h3 className={`text-sm font-black uppercase font-display mb-4 ${textPrimary}`}>Daily Fluid Balance</h3>
                
                {/* SVG Progress Ring */}
                <div className="relative w-36 h-36 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="60" className={`fill-none ${isDark ? "stroke-slate-800" : "stroke-slate-200"}`} strokeWidth="8" />
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="60" 
                      className="stroke-[#D32F2F] fill-none transition-all duration-300" 
                      strokeWidth="8" 
                      strokeDasharray="377" 
                      strokeDashoffset={377 - (377 * hydrationPercentage) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-3xl font-black ${textPrimary}`}>{progress.waterIntake}L</span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">Target {waterTarget}L</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                  <button 
                    onClick={() => logWater(0.25)} 
                    className={`p-2 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer ${btnSecondary}`}
                  >
                    +250ml
                  </button>
                  <button 
                    onClick={() => logWater(0.5)} 
                    className={`p-2 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer ${btnSecondary}`}
                  >
                    +500ml
                  </button>
                  <button 
                    onClick={() => logWater(1.0)} 
                    className={`p-2 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer ${btnSecondary}`}
                  >
                    +1.0L
                  </button>
                  <button 
                    onClick={() => logWater(-0.5)} 
                    className={`p-2 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-800"}`}
                  >
                    -500ml
                  </button>
                </div>

                {/* Hydro stat summaries */}
                <div className={`grid grid-cols-2 gap-2 text-left pt-4 border-t ${borderCol}`}>
                  <div className={`p-3 rounded-xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Perfect Streak</span>
                    <span className={`text-xs font-black uppercase ${textPrimary}`}>{progress.streaks.hydrationStreak} Days</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Lemon routine</span>
                    <span className={`text-xs font-black uppercase ${textPrimary}`}>{progress.lemonCucumberCompleted.length} Completed</span>
                  </div>
                </div>
              </div>

              {/* Lemon & Cucumber Water Routine Card */}
              <div className={`border rounded-3xl p-6 relative overflow-hidden ${cardBg}`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles className="w-16 h-16 text-emerald-400" />
                </div>
                
                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  CUCUMBER-LEMON DETOX DESK
                </span>
                
                <h4 className={`text-sm font-black uppercase mt-3 font-display ${textPrimary}`}>
                  Weekly Refresh Routine (3x/Week)
                </h4>
                
                <p className={`text-[11px] mt-2 leading-relaxed ${textSecondary}`}>
                  Combine <strong>2 Liters of water</strong> with fresh organic cucumber slices and fresh lemon slices. 
                  Let it sit overnight to infuse. Drink throughout the day to satisfy your hydration metrics.
                </p>

                <div className={`p-3.5 rounded-2xl border mt-4 space-y-2 ${secondaryCardBg}`}>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block border-b pb-1.5 border-slate-200 dark:border-slate-800">HYDRATION BENEFITS:</span>
                  <div className={`flex gap-2 items-start text-[10px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Supports Hydration:</strong> Encourages steady drinking patterns.</span>
                  </div>
                  <div className={`flex gap-2 items-start text-[10px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Refreshing Taste:</strong> Substitutes boring water with clean flavor notes.</span>
                  </div>
                  <div className={`flex gap-2 items-start text-[10px] text-slate-400 italic`}>
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Note: This is not an active fat-burning potion. Overall caloric deficit is what triggers real abdominal fat mobilization.</span>
                  </div>
                </div>

                <button
                  onClick={handleToggleLemonWater}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase mt-4 tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    dailyHabitState.lemonCucumber
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {dailyHabitState.lemonCucumber ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Incline Infusion Logged</span>
                    </>
                  ) : (
                    <span>Check off Infusion Drank Today</span>
                  )}
                </button>
              </div>

              {/* Achievements & Badges checklist */}
              <div className={`border rounded-3xl p-6 ${cardBg}`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">STREAKS & GOALS</span>
                <h3 className={`text-sm font-black uppercase font-display mb-4 ${textPrimary}`}>Achievements</h3>
                
                <div className="space-y-3">
                  {[
                    { id: "welcomed_to_shred", title: "Shred Cadet", desc: "Initiate the 5-Month Program baseline", goal: 1 },
                    { id: "7_day_shredder", title: "Metabolic Crusader", desc: "Log 7 workouts of overall deficit", goal: 7 },
                    { id: "30_day_shredder", title: "Deficit General", desc: "Complete 30 progressive sessions", goal: 30 },
                    { id: "60_day_shredder", title: "Thermal Knight", desc: "Complete 60 workouts with post-walks", goal: 60 },
                    { id: "90_day_shredder", title: "Visceral Exorcist", desc: "Survive 90 high intensity drills", goal: 90 },
                    { id: "120_day_shredder", title: "Anatomy Alchemist", desc: "Synthesize 120 total workouts", goal: 120 },
                    { id: "150_day_veteran", title: "Belly Shred Elite", desc: "Complete 150 days of peak fat loss", goal: 150 }
                  ].map((ach) => {
                    const unlocked = progress.achievements.includes(ach.id);
                    return (
                      <div 
                        key={ach.id} 
                        className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          unlocked 
                            ? "bg-amber-500/10 border-amber-500/20 text-emerald-600 dark:text-amber-400" 
                            : (isDark ? "bg-slate-950/50 border-slate-800 text-slate-600" : "bg-slate-100 border-slate-200 text-slate-400")
                        }`}
                      >
                        <Trophy className={`w-5 h-5 ${unlocked ? "text-amber-500 animate-pulse" : "text-slate-400"}`} />
                        <div>
                          <h5 className={`text-xs font-black uppercase leading-none ${unlocked ? (isDark ? "text-white" : "text-slate-800") : "text-slate-400"}`}>{ach.title}</h5>
                          <p className="text-[9px] text-slate-500 mt-1 leading-tight">{ach.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: DETAILED WORKOUT SCHEDULE */}
        {activeTab === "workouts" && (
          <div className="space-y-8">
            <div className={`border rounded-3xl p-6 sm:p-8 ${cardBg}`}>
              <span className="text-[9px] font-mono text-[#D32F2F] uppercase block tracking-widest mb-1">METABOLIC PROGRAMMING</span>
              <h2 className={`text-2xl font-black uppercase font-display ${textPrimary}`}>Active Routine Architecture</h2>
              <p className={`text-xs mt-2 max-w-xl ${textSecondary}`}>
                Difficulty increases dynamically every month. Follow the structural progression to mobilize body fat and prevent physical plateau.
              </p>

              {/* Progress switcher */}
              <div className={`flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t ${borderCol}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${textSecondary}`}>Current Phase:</span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#D32F2F] bg-[#D32F2F]/15 border border-[#D32F2F]/30 px-3 py-1 rounded-full">
                    {workoutInfo.phase}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Day:</span>
                  <button 
                    onClick={handlePrevDay} 
                    className={`px-2 py-1 rounded font-bold cursor-pointer ${btnSecondary}`}
                  >
                    Prev
                  </button>
                  <span className={`font-black px-2 ${textPrimary}`}>W{progress.currentWeek} D{progress.currentDay}</span>
                  <button 
                    onClick={handleNextDay} 
                    className={`px-2 py-1 rounded font-bold cursor-pointer ${btnSecondary}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Workout Bento Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Routine structure card */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Dynamic workout layout */}
                <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                  <div className={`flex justify-between items-start border-b pb-4 ${borderCol}`}>
                    <div>
                      <h3 className={`text-lg font-black uppercase font-display leading-tight ${textPrimary}`}>
                        {workoutInfo.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                        Estimating {workoutInfo.calBurn} • 3-4 sessions/week
                      </p>
                    </div>
                    
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      {workoutInfo.difficulty} Drill
                    </span>
                  </div>

                  {/* Warmup */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>01. Warm-Up Mobility (5-8 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.warmup.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Midsection stability */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>02. Midsection Compression (10 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.core.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* HIIT intervals */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>03. Metabolic HIIT Intervals (15-20 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.hiit.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Strength */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>04. Compound Overload Strength (20 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.strength.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Incline walk finisher */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>05. Full-Body Finisher & 12-3-30 (15-45 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.fullBodyCircuit.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Cooldown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D32F2F] tracking-widest flex items-center gap-2 font-display">
                      <span>06. Recovery Cooldown (5 Mins)</span>
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-xs">
                      {workoutInfo.cooldown.map((drill, idx) => {
                        const libName = mapDrillToLibraryName(drill);
                        return (
                          <li key={idx} className={`p-2.5 pl-3 rounded-2xl border flex items-center justify-between gap-3 ${secondaryCardBg}`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-emerald-500 font-black shrink-0">✔</span>
                              <div className="min-w-0">
                                <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"} truncate`}>{drill}</span>
                                <span className="text-[8px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  {libName}
                                </span>
                              </div>
                            </div>
                            <UnifiedExerciseMedia
                              exerciseName={libName}
                              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm bg-slate-100 dark:bg-slate-900"
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                </div>

              </div>

              {/* Modifications & Intensity Scaling panel */}
              <div className="space-y-6">
                
                {/* Target modifications */}
                <div className={`border rounded-3xl p-6 space-y-4 ${cardBg}`}>
                  <h3 className={`text-sm font-black uppercase font-display border-b pb-3 ${borderCol}`}>
                    Intensity Modifications
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                      <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-900/40 dark:bg-slate-900 px-2.5 py-0.5 rounded uppercase">
                        Beginner Tuning
                      </span>
                      <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {workoutInfo.modifications.beginner}
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                      <span className="text-[9px] font-mono font-black text-sky-400 bg-sky-900/10 px-2.5 py-0.5 rounded uppercase">
                        Intermediate Tuning
                      </span>
                      <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {workoutInfo.modifications.intermediate}
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                      <span className="text-[9px] font-mono font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded uppercase">
                        Advanced Tuning
                      </span>
                      <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {workoutInfo.modifications.advanced}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Science of overall deficit */}
                <div className={`border rounded-3xl p-6 ${cardBg}`}>
                  <h3 className={`text-sm font-black uppercase font-display border-b pb-3 flex items-center gap-2 ${borderCol}`}>
                    <Info className="w-4 h-4 text-[#D32F2F]" />
                    <span>Scientific Fact Check</span>
                  </h3>
                  
                  <p className={`text-[11px] leading-relaxed mt-3 ${textSecondary}`}>
                    <strong>Can you target belly fat directly?</strong> No, localized fat mobilization (spot reduction) is a physiological myth. 
                    Lipolysis is systemic. Fatty acids are released from adipose tissue pools throughout the body during a caloric deficit. 
                    Consistent compound exercises and high incline walks elevate your daily energy expenditure, pulling down overall fat percentages, 
                    which over time permanently reduces abdominal/visceral layers.
                  </p>
                </div>

              </div>

            </div>

            {/* Secure Premium Program Vault from API */}
            {premiumProgramContent ? (
              <div className={`border rounded-3xl p-6 sm:p-8 mt-8 relative overflow-hidden ${isDark ? "bg-slate-900 border-amber-500/30" : "bg-amber-500/5 border-amber-500/20"}`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Shield className="w-48 h-48 text-amber-500" />
                </div>
                
                <div className={`flex items-center gap-3 border-b pb-4 mb-6 ${borderCol}`}>
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">
                      🔒 SECURE PREMIUM PROGRAM DATA VAULT
                    </span>
                    <h3 className={`text-xl font-black uppercase font-display mt-0.5 ${textPrimary}`}>
                      {premiumProgramContent.programName || "5-Month Belly Fat Shred Program"}
                    </h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Column 1: Scientific Framework */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${secondaryCardBg}`}>
                    <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2 ${textPrimary}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Scientific Deficit Matrix
                    </h4>
                    <p className={`text-xs leading-relaxed ${textSecondary}`}>
                      {premiumProgramContent.scientificFramework?.spotReductionMyth}
                    </p>
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">
                        5-Month Strategic Milestones
                      </span>
                      {premiumProgramContent.scientificFramework?.phases?.map((p: any) => (
                        <div key={p.phase} className={`p-3 rounded-xl border text-[11px] ${isDark ? "bg-slate-900/60 border-slate-800/40" : "bg-white border-slate-200"}`}>
                          <span className="font-mono font-black text-amber-500 block mb-0.5">
                            Phase {p.phase}: {p.title}
                          </span>
                          <span className={textSecondary}>{p.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Elite Workouts */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${secondaryCardBg}`}>
                    <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2 ${textPrimary}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Elite Circuit Protocols
                    </h4>
                    <div className="space-y-4">
                      {premiumProgramContent.eliteWorkouts?.map((w: any) => (
                        <div key={w.id} className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-slate-900/60 border-slate-800/40" : "bg-white border-slate-200"}`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-black ${textPrimary}`}>{w.name}</span>
                            <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                              {w.duration}
                            </span>
                          </div>
                          <div className={`space-y-2 pt-1 border-t ${borderCol}`}>
                            {w.exercises?.map((ex: any, idx: number) => (
                              <div key={idx} className="text-[10px]">
                                <span className={`font-mono block ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                                  {ex.name} — {ex.sets}x{ex.reps}
                                </span>
                                <span className="text-slate-500 italic">{ex.instructions}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Secret Hacks */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${secondaryCardBg}`}>
                    <h4 className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-2 ${textPrimary}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Thermodynamic Coaching Hacks
                    </h4>
                    <div className="space-y-4">
                      {premiumProgramContent.secretHacks?.map((hack: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-slate-900/60 border-slate-800/40" : "bg-white border-slate-200"}`}>
                          <span className="text-xs font-black text-amber-500 block">
                            💡 {hack.title}
                          </span>
                          <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                            {hack.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : fetchingPremiumContent ? (
              <div className={`border rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 mt-8 ${cardBg}`}>
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                <span className="text-xs font-mono text-slate-400">
                  Authorizing Token Credentials & Decrypting Program Module...
                </span>
              </div>
            ) : null}

          </div>
        )}

        {/* TAB: HOME WORKOUT MODULE */}
        {activeTab === "home-workouts" && (
          <div className="space-y-8 relative animate-fade-in">
            {/* Main Circuit Header */}
            <div className={`border rounded-3xl p-6 sm:p-8 ${cardBg} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Flame className="w-48 h-48 text-[#D32F2F]" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-mono font-black text-[#D32F2F] bg-[#D32F2F]/10 border border-[#D32F2F]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      {bellyFatCardioCircuit.category}
                    </span>
                    <span className="text-[9px] font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      {bellyFatCardioCircuit.level}
                    </span>
                    <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      {bellyFatCardioCircuit.workoutType}
                    </span>
                  </div>
                  
                  <h2 className={`text-3xl font-black uppercase tracking-tight font-display ${textPrimary}`}>
                    {bellyFatCardioCircuit.title}
                  </h2>
                  
                  <p className={`text-xs max-w-2xl leading-relaxed ${textSecondary}`}>
                    An elite, high-intensity aerobic system requiring zero equipment, designed to spike metabolic rate, maximize calorie output, and stimulate fat-burning post-exercise.
                  </p>
                  
                  {/* Metadata Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Equipment</span>
                      <span className={`text-xs font-black mt-0.5 block ${textPrimary}`}>{bellyFatCardioCircuit.equipment}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Duration</span>
                      <span className={`text-xs font-black mt-0.5 block ${textPrimary}`}>{bellyFatCardioCircuit.duration}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Calories Burned</span>
                      <span className="text-xs font-black mt-0.5 block text-red-500">{bellyFatCardioCircuit.estimatedCalories}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Target Areas</span>
                      <span className={`text-xs font-black mt-0.5 block ${textPrimary} truncate`} title={bellyFatCardioCircuit.targetAreas.join(", ")}>
                        {bellyFatCardioCircuit.targetAreas.slice(0, 3).join(", ")}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                {user.subscriptionStatus === "premium" || user.role === "admin" ? (
                  <div className="flex flex-col gap-3 shrink-0">
                    <button
                      onClick={() => setIsPlayingHomeWorkout(true)}
                      className="px-6 py-3.5 bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Workout Circuit</span>
                    </button>
                    
                    <button
                      onClick={toggleCircuitFavorite}
                      className={`px-6 py-3 border rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        isCircuitFavorited 
                          ? "border-red-500 bg-red-500/10 text-red-500" 
                          : "border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isCircuitFavorited ? "fill-current" : ""}`} />
                      <span>{isCircuitFavorited ? "Circuit Saved" : "Save Circuit"}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Scientific Spot Reduction Disclaimer */}
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400 flex gap-3 leading-relaxed">
              <span className="text-lg shrink-0">⚠️</span>
              <div>
                <strong className="uppercase font-mono tracking-wider block mb-1">Scientific Coaching Note:</strong>
                belly fat cannot be reduced through spot reduction and that consistent nutrition, strength training, cardio, hydration, recovery, and calorie control are essential for overall fat loss.
              </div>
            </div>

            {/* Exercises Grid Container */}
            <div className="relative">
              {/* Premium Lock Overlay for Free Users */}
              {user.subscriptionStatus !== "premium" && user.role !== "admin" && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md rounded-3xl">
                  <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-8 max-w-md text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Lock className="w-8 h-8 text-amber-500" />
                    </div>
                    
                    <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                      👑 Premium Module Lock
                    </span>
                    
                    <h3 className="text-xl font-black uppercase text-white mt-4 font-display">
                      Unlock Home HIIT Cardio Circuit
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      This premium workout circuit features 12 calorie-scorching movements, interactive video guides, speech-synthesized voice count-downs, real-time heart rate simulators, and automated cloud sync.
                    </p>
                    
                    <button
                      onClick={() => {
                        const el = document.getElementById("pricing");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        } else {
                          setView("home");
                          setTimeout(() => {
                            const el2 = document.getElementById("pricing");
                            if (el2) el2.scrollIntoView({ behavior: "smooth" });
                          }, 300);
                        }
                      }}
                      className="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transform transition hover:scale-[1.02]"
                    >
                      Unlock Premium Access Now
                    </button>
                  </div>
                </div>
              )}

              {/* Grid content */}
              <div className={`grid md:grid-cols-2 gap-6 ${user.subscriptionStatus !== "premium" && user.role !== "admin" ? "blur-md select-none pointer-events-none opacity-35" : ""}`}>
                {bellyFatCardioCircuit.exercises.map((exercise, idx) => {
                  const isFav = favoriteExercises.includes(exercise.id);
                  return (
                    <div key={exercise.id} className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${cardBg} hover:shadow-xl transition-all duration-300`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase font-black">Movement {idx + 1}</span>
                            <h3 className={`text-lg font-black uppercase font-display leading-tight ${textPrimary}`}>
                              {exercise.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase font-black">
                              {exercise.duration}
                            </span>
                            <button
                              onClick={() => toggleFavoriteExercise(exercise.id)}
                              className={`p-2 rounded-xl border transition ${
                                isFav 
                                  ? "border-red-500/30 bg-red-500/10 text-red-500" 
                                  : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Visual Media */}
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-44 flex items-center justify-center relative">
                          <UnifiedExerciseMedia 
                            exerciseName={exercise.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-[9px] font-mono text-slate-300">
                            🔥 {exercise.caloriesEst}
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Steps</span>
                          <ol className="text-xs space-y-1 text-slate-600 dark:text-slate-300 list-decimal pl-4 leading-relaxed">
                            {exercise.instructions.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Muscle groups badges */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {exercise.muscles.map((muscle, mIdx) => (
                            <span key={mIdx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 uppercase">
                              {muscle}
                            </span>
                          ))}
                        </div>

                        {/* Variations and modifications bento blocks */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-amber-500 font-bold block uppercase">Beginner Mod</span>
                            <p className={textSecondary}>{exercise.beginnerMod}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-blue-500 font-bold block uppercase">Advanced Var</span>
                            <p className={textSecondary}>{exercise.advancedVar}</p>
                          </div>
                        </div>
                      </div>

                      {/* Safety Alert block */}
                      <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-[10px] text-red-500 leading-relaxed flex gap-2 items-start mt-2">
                        <span className="text-xs shrink-0">🛡️</span>
                        <div>
                          <strong className="uppercase font-mono block">Safety Cue:</strong>
                          {exercise.safetyTips.join(" ")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RUNNING PLAN */}
        {activeTab === "running" && (
          <div className="space-y-8">
            <div className={`border rounded-3xl p-6 sm:p-8 ${cardBg}`}>
              <span className="text-[9px] font-mono text-[#D32F2F] uppercase block tracking-widest mb-1">CARDIOVASCULAR METRICS</span>
              <h2 className={`text-2xl font-black uppercase font-display ${textPrimary}`}>Aerobic Running Protocol</h2>
              <p className={`text-xs mt-2 max-w-xl ${textSecondary}`}>
                Frequency: 2 to 3 sessions every week. Target distance: 3 to 5 Kilometer continuous run. Mark each session to maintain weekly statistics.
              </p>

              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t ${borderCol}`}>
                <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Completed</span>
                  <span className={`text-xl font-black mt-1 block ${textPrimary}`}>{totalCompletedRuns} Runs</span>
                </div>
                <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Distance</span>
                  <span className="text-xl font-black text-[#D32F2F] mt-1 block">{totalKmCompleted} KM</span>
                </div>
                <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Weekly Average</span>
                  <span className={`text-xl font-black mt-1 block ${textPrimary}`}>{(totalCompletedRuns / Math.max(1, progress.currentWeek)).toFixed(1)} / Wk</span>
                </div>
                <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Streak Score</span>
                  <span className="text-xl font-black text-emerald-500 mt-1 block">{progress.streaks.runningStreak} Runs</span>
                </div>
              </div>
            </div>

            {/* Cardio logs layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Target active run panel */}
              <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                <div className={`flex justify-between items-center border-b pb-4 ${borderCol}`}>
                  <div>
                    <h3 className={`text-sm font-black uppercase font-display ${textPrimary}`}>
                      Today's Cardio Assignment: W{progress.currentWeek} Day {progress.currentDay}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                      {isRunScheduled ? "★ ACTIVE RUN SCHEDULED TODAY" : "Active Walk / Rest Day"}
                    </p>
                  </div>
                  
                  <span className={`text-xs font-bold ${textSecondary}`}>
                    3 - 5 KM TARGET
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 ${secondaryCardBg}`}>
                  <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Aim for a sustained, steady-state zone 2 aerobic exertion (typically 65-75% of maximum heart rate). 
                    This zone maximizes lipid utilization relative to glycogen, protecting active muscle mass while expanding daily caloric output.
                  </p>
                  
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex gap-2 items-center">
                      <span className="text-emerald-500">✓</span>
                      <span>Target: Maintain continuous breathing (conversational pace).</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <span className="text-emerald-500">✓</span>
                      <span>Cadence: Stay light on feet, strike mid-foot to prevent joint stress.</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleToggleRun}
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    dailyHabitState.run
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                  }`}
                >
                  {dailyHabitState.run ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>3-5 KM Run Completed</span>
                    </>
                  ) : (
                    <span>Check off today's 3-5 KM Run</span>
                  )}
                </button>
              </div>

              {/* Running checklist / history log */}
              <div className={`border rounded-3xl p-6 space-y-4 ${cardBg}`}>
                <h3 className={`text-sm font-black uppercase font-display border-b pb-3 ${borderCol}`}>
                  Run Progression Log
                </h3>
                
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {progress.completedRuns.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 italic">
                      No runs logged yet. Put on your trainers and hit the track!
                    </div>
                  ) : (
                    progress.completedRuns.map((runKey, idx) => {
                      const parts = runKey.split("_");
                      const wk = parts[1];
                      const dy = parts[3];
                      return (
                        <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${secondaryCardBg}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className={`text-xs font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}>WEEK {wk} DAY {dy}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">5.0 KM • COMPLETED</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: NUTRITION GUIDE */}
        {activeTab === "nutrition" && (
          <div className="space-y-8">
            <div className={`border rounded-3xl p-6 sm:p-8 ${cardBg}`}>
              <span className="text-[9px] font-mono text-[#D32F2F] uppercase block tracking-widest mb-1">CALORIC STABILITY</span>
              <h2 className={`text-2xl font-black uppercase font-display ${textPrimary}`}>Target Shred Nutrition Desk</h2>
              <p className="text-xs text-[#6B6B6B] mt-2 max-w-xl">
                A structured calorie deficit of 300 to 500 kcal below maintenance is required. Center your menus on dense protein, fiber, and whole tubers.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Foods to eat frequently */}
              <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                <h3 className={`text-base font-black uppercase font-display border-b pb-3 flex items-center gap-2 ${borderCol}`}>
                  <Apple className="w-5 h-5 text-emerald-500" />
                  <span>Foods to Eat Frequently</span>
                </h3>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  
                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Dense Lean Proteins</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Chicken, Turkey, Fish, Eggs, Beans</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
                      Sufficient protein ingestion preserves fat-free mass while triggering high thermal effect of food (digestion expenditure).
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Probiotics & Satiety</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Greek Yogurt & Low-Fat Dairy</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
                      Dense amino structures regulate appetite loops, protecting muscular integrity under fat-burning stresses.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Sustained Carbohydrates</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Oats, Brown Rice, Sweet Potatoes, Yam</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
                      Complex fibers with flat glycemic indexes feed muscular glycogen reserves without causing rapid insulin release.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Cruciferous & Leafy Greets</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Spinach, Broccoli, Carrots, Cucumbers, Tomatoes</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
                      High volume, low density fibers that mechanically distend the stomach, sending continuous fullness signals.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Lipid Regulators</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Avocados, Walnuts, Almonds, Olive Oil</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${textSecondary}`}>
                      Healthy monounsaturated fats optimize critical hormone production (including testosterone and thyroid hormones).
                    </p>
                  </div>

                </div>
              </div>

              {/* Foods to limit / avoid */}
              <div className={`border rounded-3xl p-6 space-y-6 ${cardBg}`}>
                <h3 className={`text-base font-black uppercase font-display border-b pb-3 flex items-center gap-2 ${borderCol}`}>
                  <Ban className="w-5 h-5 text-[#D32F2F]" />
                  <span>Foods to Limit or Avoid</span>
                </h3>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  
                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-[#D32F2F] font-bold uppercase">Refined Sugar Cascades</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Sugary Drinks, Soda, Candy, Ice Cream</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed font-sans ${textSecondary}`}>
                      <strong>Why:</strong> High fructose rapidly floods the bloodstream, forcing sudden insulin surges that immediately halt lipolysis and promote visceral fat storage.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-[#D32F2F] font-bold uppercase">Empty Ethanol Sinks</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Alcohol, Cocktails, Beers</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed font-sans ${textSecondary}`}>
                      <strong>Why:</strong> Ethanol is processed preferentially by the liver, pausing fat breakdown pathways. It also causes late-night appetite dysregulation.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-[#D32F2F] font-bold uppercase">Trans Fats & Oxidation</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Deep Fried Foods, Fast Food Burgers</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed font-sans ${textSecondary}`}>
                      <strong>Why:</strong> High thermal processed industrial seed oils trigger systemic arterial swelling, compounding vascular stresses.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${secondaryCardBg}`}>
                    <span className="text-[9px] font-mono text-[#D32F2F] font-bold uppercase">Sodium & Processing Preservatives</span>
                    <h4 className={`text-xs font-black uppercase mt-1 ${textPrimary}`}>Processed Meats, Hot Dogs, Pepperoni</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed font-sans ${textSecondary}`}>
                      <strong>Why:</strong> Promotes subcutaneous fluid retention, obscuring abdominal vascularity and peaking blood pressure baselines.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: PROGRESS ANALYTICS & CHARTS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className={`border rounded-3xl p-6 sm:p-8 ${cardBg}`}>
              <span className="text-[9px] font-mono text-[#D32F2F] uppercase block tracking-widest mb-1">TRAJECTORY METRICS</span>
              <h2 className={`text-2xl font-black uppercase font-display ${textPrimary}`}>Performance Analytics</h2>
              <p className={`text-xs mt-2 max-w-xl ${textSecondary}`}>
                Plot weight curves and waist girth shrinkage. Track transformation consistency to defend your streak records.
              </p>

              <div className={`grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t ${borderCol}`}>
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${secondaryCardBg}`}>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-500 font-mono uppercase block">Log Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 78.5" 
                      value={logWeightVal}
                      onChange={(e) => setLogWeightVal(e.target.value)}
                      className={`text-sm font-black w-full py-2 px-3 border rounded-xl mt-1.5 focus:border-[#D32F2F] focus:outline-none ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}
                    />
                  </div>
                  <button 
                    onClick={handleLogWeight}
                    className="h-10 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-xs font-black uppercase text-white rounded-xl transition self-end cursor-pointer"
                  >
                    Log Weight
                  </button>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${secondaryCardBg}`}>
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-500 font-mono uppercase block">Log Waist Girth (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 84.0" 
                      value={logWaistVal}
                      onChange={(e) => setLogWaistVal(e.target.value)}
                      className={`text-sm font-black w-full py-2 px-3 border rounded-xl mt-1.5 focus:border-[#D32F2F] focus:outline-none ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}
                    />
                  </div>
                  <button 
                    onClick={handleLogWaist}
                    className="h-10 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-xs font-black uppercase text-white rounded-xl transition self-end cursor-pointer"
                  >
                    Log Waist
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Trajectory plots */}
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Weight Plot */}
              <div className={`border rounded-3xl p-6 ${cardBg}`}>
                <h3 className={`text-sm font-black uppercase font-display border-b pb-4 mb-4 ${borderCol} ${textPrimary}`}>
                  Weight Trajectory Index (KG)
                </h3>
                
                <div className="h-64 w-full">
                  {progress.weightHistory.length < 2 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                      Insufficient data to draw line curves. Log another weight entry!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={progress.weightHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#1E293B" : "#e2e8f0"} />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#111827" : "#ffffff", border: theme === "dark" ? "1px solid #1E293B" : "1px solid #e2e8f0", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} />
                        <Line type="monotone" dataKey="value" stroke="#D32F2F" strokeWidth={3} dot={{ fill: "#D32F2F" }} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Waist Plot */}
              <div className={`border rounded-3xl p-6 ${cardBg}`}>
                <h3 className={`text-sm font-black uppercase font-display border-b pb-4 mb-4 ${borderCol} ${textPrimary}`}>
                  Waist Measurement Shrinkage (CM)
                </h3>
                
                <div className="h-64 w-full">
                  {progress.waistHistory.length < 2 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                      Insufficient data to draw curves. Log waist measurements over time!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={progress.waistHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#1E293B" : "#e2e8f0"} />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#111827" : "#ffffff", border: theme === "dark" ? "1px solid #1E293B" : "1px solid #e2e8f0", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} />
                        <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981" }} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Photo Diary Gallery */}
            <div className={`border rounded-3xl p-6 ${cardBg}`}>
              <div className={`flex justify-between items-center border-b pb-4 mb-6 ${borderCol}`}>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">VISUAL TRANSFORMATIONS</span>
                  <h3 className={`text-sm font-black uppercase font-display mt-1 ${textPrimary}`}>
                    Progress Photos Diary
                  </h3>
                </div>
                
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-xs font-black uppercase rounded-xl transition flex items-center gap-1.5 cursor-pointer text-white"
                >
                  <Plus className="w-4 h-4" /> Add Photo
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {progress.progressPhotos.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-4 text-center py-12 text-xs text-slate-500 italic">
                    No progress photos saved yet. Upload a baseline photo to start tracking!
                  </div>
                ) : (
                  progress.progressPhotos.map((photo, idx) => (
                    <div key={idx} className={`border rounded-2xl overflow-hidden group ${secondaryCardBg} ${borderCol}`}>
                      <div className="h-48 w-full bg-slate-900/10 overflow-hidden relative">
                        <img 
                          src={photo.url} 
                          alt={photo.note} 
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#D32F2F]">
                          {photo.date}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className={`text-[11px] font-bold uppercase truncate ${isDark ? "text-slate-300" : "text-slate-800"}`}>{photo.note}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Photo Upload Dialog Modal */}
            {showPhotoModal && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className={`border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl ${cardBg} ${borderCol}`}>
                  <div className={`flex justify-between items-center border-b pb-3 ${borderCol}`}>
                    <h4 className={`text-sm font-black uppercase font-display ${textPrimary}`}>Log Progress Photo</h4>
                    <button 
                      onClick={() => setShowPhotoModal(false)} 
                      className="text-slate-400 hover:text-red-500 font-black text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleLogPhoto} className="space-y-4">
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-mono">Photo URL</label>
                      <input 
                        type="url" 
                        required
                        placeholder="Paste image link (or use Unsplash link)" 
                        value={logPhotoUrl}
                        onChange={(e) => setLogPhotoUrl(e.target.value)}
                        className={`border rounded-xl text-xs p-3 w-full mt-1.5 focus:border-[#D32F2F] focus:outline-none ${isDark ? "bg-slate-950 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"}`}
                      />
                      <p className="text-[8px] text-slate-500 mt-1">
                        Use Unsplash links or external URLs. Refer to Unsplash search patterns.
                      </p>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-mono">Caption / Short Note</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Week 4 update - feeling tight" 
                        value={logPhotoNote}
                        onChange={(e) => setLogPhotoNote(e.target.value)}
                        className={`border rounded-xl text-xs p-3 w-full mt-1.5 focus:border-[#D32F2F] focus:outline-none ${isDark ? "bg-slate-950 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"}`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-xs font-black uppercase tracking-wider text-white rounded-xl transition cursor-pointer"
                    >
                      Save Photo Entry
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 6: NOTIFICATIONS & REMINDERS DESK */}
        {activeTab === "coaching" && (
          <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 ${cardBg}`}>
            <div>
              <span className="text-[9px] font-mono text-[#D32F2F] uppercase block tracking-widest mb-1">COMPLIANCE & TIMINGS</span>
              <h2 className={`text-2xl font-black uppercase font-display ${textPrimary}`}>Reminders Desk</h2>
              <p className="text-xs text-[#6B6B6B] mt-2 max-w-xl">
                Configure your transformation coach alerts. Standard reminders trigger local system scheduling logs to keep your daily calorie deficit on absolute track.
              </p>
            </div>

            <div className={`grid md:grid-cols-2 gap-8 border-t pt-6 ${borderCol}`}>
              
              {/* Reminder checkboxes */}
              <div className="space-y-4">
                <h3 className={`text-sm font-black uppercase font-display ${textPrimary}`}>
                  Active Alerts Configuration
                </h3>
                
                <div className="space-y-2">
                  {[
                    { id: "workout", label: "Workout reminder", desc: "Alert me to log my active core and metabolic session" },
                    { id: "water", label: "Water intake reminder", desc: "Hourly notification to consume optimal water volumes" },
                    { id: "running", label: "Running day alarm", desc: "Remind me to finish my progressive 3-5 km run" },
                    { id: "meal", label: "Clean meal prep reminder", desc: "Keep me focused on high protein whole foods" },
                    { id: "walk", label: "Post-meal walks alarm", desc: "Trigger 10-minute walk alerts after principal meals" },
                    { id: "lemonCucumber", label: "Lemon cucumber drink checklist", desc: "Notify me on scheduled fresh infusion days" }
                  ].map((rem) => {
                    const active = (progress.reminders as any)[rem.id];
                    return (
                      <div 
                        key={rem.id}
                        onClick={() => toggleReminder(rem.id as any)}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer select-none ${
                          active 
                            ? (isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-100 border-slate-200 text-slate-900")
                            : (isDark ? "bg-slate-950/40 border-slate-900/60 text-slate-600" : "bg-slate-50/50 border-slate-200/50 text-slate-400")
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-black uppercase leading-tight">{rem.label}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 leading-none">{rem.desc}</p>
                        </div>
                        
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${active ? "border-[#D32F2F] bg-[#D32F2F] text-white" : "border-slate-300 dark:border-slate-800"}`}>
                          {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated system log box */}
              <div className={`rounded-2xl border p-6 space-y-4 ${secondaryCardBg} ${borderCol}`}>
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2 border-slate-200 dark:border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>SYSTEM NOTIFICATION DAEMON</span>
                </h3>
                
                <p className={`text-xs leading-relaxed font-sans ${textSecondary}`}>
                  Whenever an active reminder is configured, our background schedule daemon logs the timing triggers locally. 
                  Below are the simulated active event timing cues queued for today:
                </p>

                <div className={`p-4 rounded-xl border space-y-2 text-[10px] font-mono ${isDark ? "bg-slate-900/60 border-slate-800/80 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
                  <p className="text-[#D32F2F] font-bold">W{progress.currentWeek} REMINDER THREADS ACTIVE:</p>
                  {progress.reminders.workout && <p>• [07:30] WORKOUT_ALARM: Ignite W{progress.currentWeek} Day {progress.currentDay} Full Body Burn</p>}
                  {progress.reminders.water && <p>• [09:00 - 19:00] HYDRO_DAEMON: Consume 250ml fluid increment (Male: 4L, Female: 3L)</p>}
                  {progress.reminders.running && isRunScheduled && <p>• [17:00] CARDIO_TRACKER: 3-5 KM Run assignment scheduled</p>}
                  {progress.reminders.walk && <p>• [13:30, 20:00] THERMAL_WALK: 15-minute post-meal calorie dispersion alerts ready</p>}
                  {progress.reminders.lemonCucumber && isLemonScheduled && <p>• [08:00] INFUSION_ALERT: Prepare Lemon & Cucumber Water Routine (2 Liters)</p>}
                </div>

                <div className={`text-[10px] leading-relaxed p-3 rounded-xl border ${isDark ? "bg-[#D32F2F]/5 border-[#D32F2F]/10 text-slate-400" : "bg-[#D32F2F]/5 border-[#D32F2F]/20 text-slate-600"}`}>
                  👑 <strong>Premium Notice:</strong> Browser notification permissions must be granted to trigger persistent push popups. Otherwise, timings remain listed dynamically in your Coach Briefing logs on this page.
                </div>
              </div>

              {/* Automated Firebase Extension for Mail Integration */}
              <div className={`md:col-span-2 rounded-2xl border p-6 space-y-4 ${secondaryCardBg} ${borderCol}`}>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#D32F2F] animate-pulse" />
                  <div>
                    <h3 className={`text-sm font-black uppercase font-display ${textPrimary}`}>
                      Automated Email Coaching Dispatcher
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">
                      INTEGRATED VIA FIREBASE EXTENSION FOR MAIL
                    </p>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${textSecondary}`}>
                  AlexFitnessHub integrates directly with <strong>Firebase Mail Extension Queue</strong>. In addition to fully automated emails sent on registration and weekly reports, you can manually trigger a high-fidelity sports-science <strong>Belly Fat Shred program reminder email</strong> tailored to your current progress stage (<strong>Week {progress.currentWeek} Day {progress.currentDay}</strong>) directly to your inbox.
                </p>

                {emailSuccess && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    {emailSuccess}
                  </div>
                )}

                {emailError && (
                  <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                    {emailError}
                  </div>
                )}

                <button
                  onClick={handleSendBellyFatShredReminder}
                  disabled={emailSending}
                  className="px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-800 disabled:text-slate-500 text-xs font-black uppercase tracking-wider text-white rounded-xl transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  {emailSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Email Reminder...</span>
                    </>
                  ) : (
                    <>
                      <span>Send W{progress.currentWeek} Day {progress.currentDay} Program Email Reminder Now</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
