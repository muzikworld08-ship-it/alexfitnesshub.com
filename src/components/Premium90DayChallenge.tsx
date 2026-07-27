import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import WorkoutVisual from "./WorkoutVisual";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Flame, Zap, Award, CheckCircle2, Lock, Calendar, 
  ChevronRight, TrendingUp, Sparkles, Clock, Dumbbell, Droplet, 
  Info, Medal, RefreshCw, Crown, Shield, Eye, Heart, Camera, 
  Download, Share2, Clipboard, ChevronDown, Check, AlertTriangle, 
  MessageSquare, UserCheck, ChevronLeft, Target, ArrowRight, ExternalLink
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import PersistentDashboardTabs from "./PersistentDashboardTabs";

// 1. Definition of the 7 Flagship Premium Challenges
export interface PremiumChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: string;
  image: string;
  badgeId: string;
  badgeName: string;
  badgeColor: string;
}

export const PREMIUM_CHALLENGES: PremiumChallenge[] = [
  {
    id: "lean_muscle",
    title: "90 Day Lean Muscle Challenge",
    description: "Build premium lean muscle definition, optimize progressive load, and improve baseline metabolic body composition.",
    category: "Hypertrophy",
    goal: "Build lean muscle, increase strength, and improve body composition.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_muscle_champion",
    badgeName: "Lean Muscle Overlord",
    badgeColor: "from-red-500 to-amber-600"
  },
  {
    id: "fat_burning",
    title: "90 Day Fat Burning Challenge",
    description: "Intense cardiorespiratory conditioning designed to burn stubborn adipose tissue while locking in lean muscle preservation.",
    category: "Conditioning",
    goal: "Burn body fat while preserving muscle.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_fat_burner",
    badgeName: "Adipose Vaporizer",
    badgeColor: "from-orange-500 to-red-600"
  },
  {
    id: "body_transformation",
    title: "90 Day Body Transformation Challenge",
    description: "The ultimate recomposition blueprint. Simultaneously stimulate local muscular development and systemic body fat depletion.",
    category: "Recomposition",
    goal: "Lose fat while gaining muscle.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_transformation_master",
    badgeName: "Aesthetic Shapeshifter",
    badgeColor: "from-purple-500 to-indigo-600"
  },
  {
    id: "athletic_performance",
    title: "90 Day Athletic Performance Challenge",
    description: "Enhance rate of force development, rotational power, agility vectors, and structural endurance for competitive dominance.",
    category: "Athleticism",
    goal: "Improve speed, power, endurance, and athletic ability.",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_apex_athlete",
    badgeName: "Apex Predator Rank",
    badgeColor: "from-cyan-500 to-blue-600"
  },
  {
    id: "strength_challenge",
    title: "90 Day Strength Challenge",
    description: "Command major barbell compound movements. Systematically overload neurological pathways to claim high personal records.",
    category: "Powerlifting",
    goal: "Increase overall strength and lifting performance.",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_strength_titan",
    badgeName: "Titanium Leviathan",
    badgeColor: "from-yellow-600 to-amber-700"
  },
  {
    id: "home_fitness",
    title: "90 Day Home Fitness Challenge",
    description: "Maximal mechanical tension utilizing advanced bodyweight progressions and minimal load setups. Zero excuses.",
    category: "Calisthenics",
    goal: "Train effectively at home using bodyweight or minimal equipment.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_home_elite",
    badgeName: "Sovereign Domestic Warrior",
    badgeColor: "from-emerald-500 to-teal-600"
  },
  {
    id: "six_pack_core",
    title: "90 Day Six Pack & Core Challenge",
    description: "Build deep anterior and posterior core stability, define the rectus abdominis, and strengthen vital bracing systems.",
    category: "Core Force",
    goal: "Build a stronger core and visible abdominal muscles.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    badgeId: "badge_core_citadel",
    badgeName: "Citadel Core Overlord",
    badgeColor: "from-pink-500 to-rose-600"
  }
];

// Presets for splits
const CHALLENGE_SPLITS: Record<string, string[]> = {
  lean_muscle: ["Chest + Triceps", "Back + Biceps", "Legs", "Shoulders + Core", "Upper Body", "Conditioning", "Recovery"],
  fat_burning: ["HIIT Cardio", "Lower Body Conditioning", "Aerobic Cardio", "Upper Body Circuit", "Full Body Shred", "HIIT Endurance", "Recovery"],
  body_transformation: ["Upper Body Strength", "Lower Body Strength", "Core + Mobility", "Full Body Hypertrophy", "HIIT Cardio", "Core + Conditioning", "Recovery"],
  athletic_performance: ["Plyometrics & Speed", "Lower Body Power", "Conditioning", "Upper Body Power", "Agility + Core", "Endurance Running", "Recovery"],
  strength_challenge: ["Squats & Legs", "Bench Press & Chest", "Active Recovery", "Deadlifts & Back", "Overhead Press & Shoulders", "Heavy Bracing Core", "Recovery"],
  home_fitness: ["Bodyweight Full Body", "Core & Mobility", "Home HIIT Cardio", "Bodyweight Upper Body", "Bodyweight Lower Body", "Home Conditioning", "Recovery"],
  six_pack_core: ["Upper Abs + Obliques", "Lower Abs + Deep Core", "Cardio + Core Burn", "Planks & Isometrics", "Rotational Core Strength", "Full Core Circuit", "Recovery"]
};

// 2. Types for challenge persistence state
interface ChallengeOnboarding {
  age: number;
  gender: string;
  height: number;
  currentWeight: number;
  goalWeight: number;
  fitnessGoal: string;
  fitnessLevel: "Beginner" | "Intermediate" | "Advanced";
  gymOrHome: "Gym" | "Home";
  availableEquipment: string;
  trainingDays: number;
  preferredWorkoutTime: string;
  injuries: string;
  medicalRestrictions: string;
}

interface CompletedWorkoutLog {
  dayNum: number;
  date: string;
  durationMinutes: number;
  caloriesBurned: number;
}

interface MeasurementLog {
  date: string;
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  leg?: number;
}

interface PRLog {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

interface Premium90DayState {
  userId: string;
  challengeId: string;
  currentDay: number;
  onboarding: ChallengeOnboarding;
  completedDays: number[]; // e.g., [1, 2, 3]
  workoutHistory: CompletedWorkoutLog[];
  bodyMeasurements: MeasurementLog[];
  personalRecords: PRLog[];
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: string;
  };
  achievements: string[]; // unlocked badge ids
  notificationsSettings: {
    workoutTime: boolean;
    hydration: boolean;
    recovery: boolean;
    stretching: boolean;
    restDay: boolean;
    weeklyProgress: boolean;
    monthlyReport: boolean;
  };
  updatedAt: string;
  assignedCoach?: string;
}

export default function Premium90DayChallenge() {
  const { user, exercises, theme, allSystemUsers } = useApp();
  const isPremiumUser = user?.subscriptionStatus === "premium" || user?.role === "admin";

  const [activeSubTab, setActiveSubTab] = useState<"workout" | "analytics" | "badges" | "measurements" | "certificate">("workout");

  // Scroll to top smoothly when challenge active sub-tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSubTab]);

  const [loadingDb, setLoadingDb] = useState(false);
  const [dbState, setDbState] = useState<Premium90DayState | null>(null);

  // Admin Coach Assignment State
  const [selectedAdminUserUid, setSelectedAdminUserUid] = useState<string>("");
  const [adminCoachName, setAdminCoachName] = useState<string>("Coach Marcus");
  const [adminCustomCoachName, setAdminCustomCoachName] = useState<string>("");
  const [adminStatusMessage, setAdminStatusMessage] = useState<string>("");
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  // Local storage fallback helper functions for robust offline / quota-limited access
  const getLocalChallengeKey = (uid: string) => `premium_90_day_challenge_${uid}`;

  const loadChallengeData = async (uid: string): Promise<Premium90DayState | null> => {
    try {
      const docRef = doc(db, "user_premium_challenges", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Premium90DayState;
        localStorage.setItem(getLocalChallengeKey(uid), JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn("Firestore read failed, falling back to localStorage:", err);
    }
    const cached = localStorage.getItem(getLocalChallengeKey(uid));
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Local storage parse error:", e);
      }
    }
    return null;
  };

  const saveChallengeData = async (uid: string, data: Premium90DayState): Promise<boolean> => {
    localStorage.setItem(getLocalChallengeKey(uid), JSON.stringify(data));
    try {
      const docRef = doc(db, "user_premium_challenges", uid);
      await setDoc(docRef, data);
      return true;
    } catch (err) {
      console.warn("Firestore write failed, saved to localStorage fallback successfully:", err);
      return false;
    }
  };

  const handleAdminAssignCoach = async () => {
    if (!selectedAdminUserUid) {
      setAdminStatusMessage("Please select a user first.");
      return;
    }
    const finalCoachName = adminCoachName === "Custom" ? adminCustomCoachName.trim() : adminCoachName;
    if (!finalCoachName) {
      setAdminStatusMessage("Please enter or select a coach name.");
      return;
    }

    setAdminLoading(true);
    setAdminStatusMessage("");

    try {
      const existingData = await loadChallengeData(selectedAdminUserUid);
      
      let updatedData: any;
      if (existingData) {
        updatedData = {
          ...existingData,
          assignedCoach: finalCoachName,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Create initial skeleton for the user who hasn't enrolled yet
        updatedData = {
          userId: selectedAdminUserUid,
          assignedCoach: finalCoachName,
          currentDay: 1,
          completedDays: [],
          workoutHistory: [],
          bodyMeasurements: [],
          personalRecords: [],
          streaks: { currentStreak: 0, longestStreak: 0 },
          achievements: [],
          notificationsSettings: {
            workoutTime: true,
            hydration: true,
            recovery: true,
            stretching: true,
            restDay: true,
            weeklyProgress: true,
            monthlyReport: true
          },
          updatedAt: new Date().toISOString()
        };
      }

      await saveChallengeData(selectedAdminUserUid, updatedData);
      
      // If the admin assigned the coach to themselves, update local state immediately
      if (selectedAdminUserUid === user?.uid) {
        setDbState(updatedData);
      }

      setAdminStatusMessage(`Successfully assigned ${finalCoachName} to user!`);
      setAdminCustomCoachName("");
    } catch (err) {
      console.error("Error assigning coach:", err);
      setAdminStatusMessage("Error assigning coach: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAdminLoading(false);
    }
  };

  // Onboarding Form State
  const [onboardingForm, setOnboardingForm] = useState<ChallengeOnboarding>({
    age: 28,
    gender: "Male",
    height: 175,
    currentWeight: 80,
    goalWeight: 75,
    fitnessGoal: "Build Muscle & Lose Fat",
    fitnessLevel: "Intermediate",
    gymOrHome: "Gym",
    availableEquipment: "Full Gym",
    trainingDays: 5,
    preferredWorkoutTime: "Morning",
    injuries: "",
    medicalRestrictions: ""
  });

  // Log Form states
  const [logWeight, setLogWeight] = useState<string>("");
  const [logBodyFat, setLogBodyFat] = useState<string>("");
  const [logChest, setLogChest] = useState<string>("");
  const [logWaist, setLogWaist] = useState<string>("");
  const [logHip, setLogHip] = useState<string>("");
  const [logArm, setLogArm] = useState<string>("");
  const [logLeg, setLogLeg] = useState<string>("");

  // PR Form States
  const [prExercise, setPrExercise] = useState<string>("");
  const [prWeight, setPrWeight] = useState<string>("");
  const [prReps, setPrReps] = useState<string>("");

  // Certificate Sharing
  const [certificateShared, setCertificateShared] = useState(false);

  // Load state from Firestore
  useEffect(() => {
    if (!user || !isPremiumUser) return;
    loadProgress();
  }, [user, isPremiumUser]);

  const loadProgress = async () => {
    if (!user) return;
    setLoadingDb(true);
    try {
      const data = await loadChallengeData(user.uid);
      setDbState(data);
    } catch (error) {
      console.error("Error loading premium 90 progress:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleEnroll = async (challengeId: string) => {
    if (!user) return;
    setLoadingDb(true);
    
    const preassignedCoach = dbState?.assignedCoach || "";
    
    const initialProgress: Premium90DayState = {
      userId: user.uid,
      challengeId,
      currentDay: 1,
      onboarding: onboardingForm,
      completedDays: [],
      workoutHistory: [],
      bodyMeasurements: [
        {
          date: new Date().toISOString().split("T")[0],
          weight: onboardingForm.currentWeight
        }
      ],
      personalRecords: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0
      },
      achievements: [],
      notificationsSettings: {
        workoutTime: true,
        hydration: true,
        recovery: true,
        stretching: true,
        restDay: true,
        weeklyProgress: true,
        monthlyReport: true
      },
      updatedAt: new Date().toISOString(),
      assignedCoach: preassignedCoach
    };

    try {
      await saveChallengeData(user.uid, initialProgress);
      setDbState(initialProgress);
    } catch (err) {
      console.error("Error enrolling in premium 90 day challenge:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  // 3. Daily Workout Generator Logic
  const getDailyWorkoutDetail = (dayNum: number, challengeId: string) => {
    const weekNum = Math.ceil(dayNum / 7);
    const dayOfWeekIdx = (dayNum - 1) % 7;
    const isRecoveryDay = dayOfWeekIdx === 6; // Sunday/7th day is Recovery

    let phase = "Foundation Phase";
    let phaseDesc = "Establish structural endurance, target base neuromuscular patterns, and prepare connective tissues.";
    let setsMultiplier = 3;
    let repScheme = "12-15 repetitions";
    let restTime = "60 seconds";
    let intensityLabel = "Moderate (65% of max)";

    if (weekNum >= 5 && weekNum <= 8) {
      phase = "Progressive Overload Phase";
      phaseDesc = "Saturate mechanical tension, scale load coefficients, and stimulate maximum fiber recruitment.";
      setsMultiplier = 4;
      repScheme = "8-12 repetitions";
      restTime = "90 seconds";
      intensityLabel = "High (75-80% of max)";
    } else if (weekNum >= 9 && weekNum <= 12) {
      phase = "Peak Performance Phase";
      phaseDesc = "Neuro-peak training. High velocity force, advanced supersets, and maximal systemic output.";
      setsMultiplier = 4;
      repScheme = "6-8 repetitions";
      restTime = "120-180 seconds";
      intensityLabel = "Peak Intensity (85-90% of max)";
    } else if (weekNum === 13) {
      phase = "Championship Overload & Peak";
      phaseDesc = "Unlocking pure athletic potential. Ultimate testing, high volume deloading, and final body composition peak.";
      setsMultiplier = 5;
      repScheme = "5-6 repetitions";
      restTime = "180 seconds";
      intensityLabel = "Absolute Maximum Effort (90-95%)";
    }

    const currentSplit = CHALLENGE_SPLITS[challengeId] || CHALLENGE_SPLITS["lean_muscle"];
    const focusLabel = currentSplit[dayOfWeekIdx];

    // Pick dynamic exercises based on focusLabel
    let targetCategory = "Gym Workouts";
    if (dbState?.onboarding?.gymOrHome === "Home" || onboardingForm.gymOrHome === "Home") {
      targetCategory = "Home Workouts";
    }

    // Filter exercises from active exercise list
    const filtered = exercises.filter(ex => {
      const matchCat = ex.category === targetCategory || ex.categories?.includes(targetCategory);
      // matching focus word in muscles or title
      const focusWords = focusLabel.toLowerCase().split(/[ +&]+/);
      const matchFocus = ex.muscleGroups?.some(m => focusWords.includes(m.toLowerCase())) ||
                         ex.name.toLowerCase().split(" ").some(w => focusWords.includes(w));
      return matchCat && matchFocus;
    });

    // Fallbacks if nothing found
    let matchedExercises = filtered.slice(0, 7);
    if (matchedExercises.length < 5) {
      // fill up with general exercise matching category
      const extras = exercises.filter(ex => ex.category === targetCategory).slice(0, 6);
      matchedExercises = [...matchedExercises, ...extras].slice(0, 7);
    }

    // Ensure we always have at least a few exercises
    if (matchedExercises.length === 0) {
      matchedExercises = exercises.slice(0, 6);
    }

    // Construct exercises details list
    const exercisesWithDetails = matchedExercises.map((ex, idx) => {
      // Dynamic calculations
      const exerciseSets = setsMultiplier;
      const isCardio = ex.muscleGroups?.includes("Cardio") || ex.name.toLowerCase().includes("run") || ex.name.toLowerCase().includes("hiit");
      const calBurnFactor = isCardio ? 12 : 8;
      const calories = Math.round(exerciseSets * 10 * calBurnFactor * (dbState?.onboarding?.fitnessLevel === "Advanced" ? 1.2 : 0.9));

      let weightRec = "Moderate Dumbbells";
      if (ex.equipment?.includes("Bodyweight")) weightRec = "Bodyweight load";
      else if (ex.equipment?.includes("Barbell")) weightRec = "65%-80% of 1RM load";
      else if (ex.equipment?.includes("Machine")) weightRec = "Standard stack weight";

      if (dbState?.onboarding?.fitnessLevel === "Beginner") {
        weightRec = ex.equipment?.includes("Bodyweight") ? "Light bodyweight assistance" : "Minimal/Light load";
      }

      return {
        ...ex,
        sets: exerciseSets,
        reps: isCardio ? "30-45 seconds" : repScheme,
        weight: weightRec,
        rest: restTime,
        calories,
        instruction: ex.instructions?.[0] || "Maintain stable spine posture and execute movement slowly.",
        mistake: ex.commonMistakes?.[0] || "Letting momentum take over during negative phase.",
        safety: ex.safetyTips?.[0] || "Keep core locked tightly. Do not hyper-extend lower back."
      };
    });

    // Estimate overall stats
    const totalEstTime = isRecoveryDay ? 30 : 75; // 60-90 minutes
    const totalEstCalories = isRecoveryDay ? 150 : exercisesWithDetails.reduce((acc, curr) => acc + curr.calories, 120);

    return {
      dayNum,
      weekNum,
      phase,
      phaseDesc,
      focus: focusLabel,
      isRecoveryDay,
      restTime,
      intensityLabel,
      exercises: exercisesWithDetails,
      estTime: totalEstTime,
      estCalories: totalEstCalories,
      warmUp: [
        { name: "Dynamic Warm-up Jumps", duration: "3 Mins", desc: "Light impact baseline dynamic hopping." },
        { name: "Dynamic Rotational Swings", duration: "3 Mins", desc: "Full range axial mobility pivots." },
        { name: "Active Stretch Squats", duration: "4 Mins", desc: "Deep eccentric bodyweight hold pivots." }
      ],
      coolDown: [
        { name: "Systemic Decompression Breathing", duration: "4 Mins", desc: "Deep diaphragmatic nasal inhalation cycles." },
        { name: "Full Posterior Muscle Release Stretch", duration: "4 Mins", desc: "Static hamstring and back lengthening holds." }
      ]
    };
  };

  // Mark Today's Workout completed
  const handleCompleteWorkout = async () => {
    if (!dbState || !user) return;
    const currentDay = dbState.currentDay;
    const completedWorkout = getDailyWorkoutDetail(currentDay, dbState.challengeId);

    // Save logs
    const newHistoryLog: CompletedWorkoutLog = {
      dayNum: currentDay,
      date: new Date().toISOString().split("T")[0],
      durationMinutes: completedWorkout.estTime,
      caloriesBurned: completedWorkout.estCalories
    };

    const nextCompletedDays = [...dbState.completedDays];
    if (!nextCompletedDays.includes(currentDay)) {
      nextCompletedDays.push(currentDay);
    }

    // Calculate streaks
    const todayStr = new Date().toISOString().split("T")[0];
    let newStreak = dbState.streaks.currentStreak;
    const lastDate = dbState.streaks.lastCompletedDate;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== todayStr) {
        newStreak = 1; // broken streak
      }
    }

    const newLongestStreak = Math.max(dbState.streaks.longestStreak, newStreak);

    // Badges / Achievements check
    const newAchievements = [...dbState.achievements];
    const totalDone = nextCompletedDays.length;

    const badgeThresholds = [
      { id: "streak_7", limit: 7, name: "7 Day Warrior" },
      { id: "streak_14", limit: 14, name: "14 Day Gladiator" },
      { id: "streak_30", limit: 30, name: "30 Day Centurion" },
      { id: "streak_45", limit: 45, name: "45 Day Elite Force" },
      { id: "streak_60", limit: 60, name: "60 Day Iron Fortress" },
      { id: "streak_75", limit: 75, name: "75 Day Titan Overlord" },
      { id: "streak_90", limit: 90, name: "90 Day Immortal Champion" }
    ];

    if (totalDone === 1 && !newAchievements.includes("first_workout")) {
      newAchievements.push("first_workout");
    }
    badgeThresholds.forEach(badge => {
      if (totalDone >= badge.limit && !newAchievements.includes(badge.id)) {
        newAchievements.push(badge.id);
      }
    });

    const isChallengeFinished = totalDone >= 90;
    if (isChallengeFinished && !newAchievements.includes("challenge_champion")) {
      newAchievements.push("challenge_champion");
    }

    const updatedState: Premium90DayState = {
      ...dbState,
      completedDays: nextCompletedDays,
      workoutHistory: [...dbState.workoutHistory, newHistoryLog],
      currentDay: Math.min(90, currentDay + 1), // unlocks next day, cap at 90
      streaks: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: todayStr
      },
      achievements: newAchievements,
      updatedAt: new Date().toISOString()
    };

    setLoadingDb(true);
    try {
      await saveChallengeData(user.uid, updatedState);
      setDbState(updatedState);
    } catch (err) {
      console.error("Error logging workout completion:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Add Progress Measurements
  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbState || !user) return;

    const numWeight = parseFloat(logWeight);
    if (isNaN(numWeight)) return;

    const newLog: MeasurementLog = {
      date: new Date().toISOString().split("T")[0],
      weight: numWeight,
      bodyFat: logBodyFat ? parseFloat(logBodyFat) : undefined,
      chest: logChest ? parseFloat(logChest) : undefined,
      waist: logWaist ? parseFloat(logWaist) : undefined,
      hip: logHip ? parseFloat(logHip) : undefined,
      arm: logArm ? parseFloat(logArm) : undefined,
      leg: logLeg ? parseFloat(logLeg) : undefined
    };

    // Check for "personal_records" badge if they logged strength improvements
    const newAchievements = [...dbState.achievements];
    if (!newAchievements.includes("personal_records")) {
      newAchievements.push("personal_records");
    }

    const updatedState: Premium90DayState = {
      ...dbState,
      achievements: newAchievements,
      bodyMeasurements: [...dbState.bodyMeasurements, newLog],
      updatedAt: new Date().toISOString()
    };

    setLoadingDb(true);
    try {
      await saveChallengeData(user.uid, updatedState);
      setDbState(updatedState);
      // Reset
      setLogWeight("");
      setLogBodyFat("");
      setLogChest("");
      setLogWaist("");
      setLogHip("");
      setLogArm("");
      setLogLeg("");
    } catch (err) {
      console.error("Error adding body measurement:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Add Personal Record
  const handleAddPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbState || !user || !prExercise || !prWeight || !prReps) return;

    const newPR: PRLog = {
      id: Math.random().toString(36).substring(7),
      exerciseName: prExercise,
      weight: parseFloat(prWeight),
      reps: parseInt(prReps),
      date: new Date().toISOString().split("T")[0]
    };

    const updatedState: Premium90DayState = {
      ...dbState,
      personalRecords: [...dbState.personalRecords, newPR],
      updatedAt: new Date().toISOString()
    };

    setLoadingDb(true);
    try {
      await saveChallengeData(user.uid, updatedState);
      setDbState(updatedState);
      setPrExercise("");
      setPrWeight("");
      setPrReps("");
    } catch (err) {
      console.error("Error adding PR:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  // Share certificate
  const shareCertificate = () => {
    setCertificateShared(true);
    setTimeout(() => setCertificateShared(false), 3000);
  };

  // Clean formatted date helper
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  // Active workout object calculations
  const todayWorkoutDetail = (dbState && dbState.onboarding) ? getDailyWorkoutDetail(dbState.currentDay, dbState.challengeId) : getDailyWorkoutDetail(1, "lean_muscle");

  // Calculations for total progress metrics
  const totalCompletedCount = dbState?.completedDays?.length || 0;
  const overallProgressPercentage = Math.round((totalCompletedCount / 90) * 100);
  const totalCaloriesBurned = dbState?.workoutHistory?.reduce((acc, curr) => acc + curr.caloriesBurned, 0) || 0;
  const totalMinutesTrained = dbState?.workoutHistory?.reduce((acc, curr) => acc + curr.durationMinutes, 0) || 0;
  const activeChallengeName = PREMIUM_CHALLENGES.find(c => c.id === dbState?.challengeId)?.title || "90 Day Lean Muscle Challenge";

  // Recharts formatted data
  const chartData = dbState?.bodyMeasurements?.map(m => ({
    date: m.date,
    weight: m.weight,
    bodyFat: m.bodyFat || 0,
    waist: m.waist || 0
  })) || [];

  return (
    <div id="premium_90_day_root" className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans pb-16`}>
      
      {/* Persistent navigation tabs across top dashboards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PersistentDashboardTabs />
      </div>

      {/* 1. Header Banner with Premium Hero Photo */}
      <div className="relative overflow-hidden text-white py-20 px-6 sm:px-12 text-center shadow-2xl rounded-3xl mx-4 mt-6">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1200&auto=format&fit=crop&q=80" 
            alt="Immortal 90-Day Challenge Hero"
            className="w-full h-full object-cover object-center scale-100"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4 relative z-10 bg-black/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-amber-300 shadow-md">
            <Crown className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span>AlexFitnessHub Premium Flagship</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
            Immortal 90-Day Challenge Engine
          </h1>
          <p className="text-white/95 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
            Unlock your physical limits with a fully automated, personalized Personal Trainer engine. Dynamically generated progressive overloads updated every day for 90 days.
          </p>
        </div>
      </div>

      {/* FREE USER EXPERIENCE */}
      {!isPremiumUser && (
        <div className="max-w-5xl mx-auto px-4 mt-12 space-y-12">
          {/* Promotional Locked Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="mx-auto h-14 w-14 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                Exclusive Premium Masterclass
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                The fully personalized 90-Day Challenge requires an active **AlexFitnessHub Premium Elite Subscription**. Upgrade your account to instantly personalize your splits, activate daily locked lessons, unlock visual progress graphing, and earn your verified Champion's PDF Certificate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button 
                  onClick={() => alert("Please proceed to the Account Settings page to complete your Premium Membership Upgrade!")}
                  className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  Upgrade to Premium Elite
                </button>
                <a 
                  href="#sample_preview" 
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold uppercase text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Eye className="w-4 h-4" />
                  Sample Day 1 Preview
                </a>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              7 Premium Flagship Blueprints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {PREMIUM_CHALLENGES.map((challenge) => (
                <div key={challenge.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between h-[420px] group hover:border-red-500/50 transition-all">
                  <div className="relative h-44 overflow-hidden">
                    <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-black text-[9px] uppercase px-2.5 py-1 rounded-full shadow-md">
                      {challenge.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-red-500 transition-colors leading-tight">
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3 mt-4">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${challenge.badgeColor} flex items-center justify-center text-white`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Completer Badge</span>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{challenge.badgeName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Day 1 Preview */}
          <div id="sample_preview" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg text-left space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-black uppercase tracking-widest">Sample Teaser Preview</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase mt-1">
                  Lean Muscle Challenge • Day 1 Workout
                </h3>
              </div>
              <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full border border-amber-200/50 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Premium Content Preview
              </span>
            </div>

            {/* Simulated Teaser Workout details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Splits Focus</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-1">Chest + Triceps</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Calories Expected</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-1">~640 kcal</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Time Investment</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-1">75 Minutes</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-extrabold text-sm uppercase text-slate-500">Day 1 Exercises Preview (5 of 8)</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: "Barbell Bench Press", sets: "3 Sets", reps: "12 Reps", rest: "60s Rest", desc: "Build overall pectoral power and thickness." },
                  { name: "Incline Dumbbell Press", sets: "3 Sets", reps: "12 Reps", rest: "60s Rest", desc: "Target clavicular upper pectoral fibers." },
                  { name: "Cable Chest Fly", sets: "3 Sets", reps: "15 Reps", rest: "60s Rest", desc: "Maximize deep chest mechanical load contraction." },
                  { name: "Triceps Pushdown", sets: "3 Sets", reps: "15 Reps", rest: "60s Rest", desc: "Isolate lateral head of triceps brachii." },
                  { name: "Close Grip Bench Press", sets: "3 Sets", reps: "12 Reps", rest: "90s Rest", desc: "Compound triceps focus with high load overload." }
                ].map((ex, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{ex.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{ex.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold font-mono">
                      <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50">{ex.sets}</span>
                      <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/50">{ex.reps}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{ex.rest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM LOGGED USER EXPERIENCE */}
      {isPremiumUser && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          
          {/* A. NOT YET ENROLLED: Display Onboarding Questionnaire and Challenge Selector */}
          {!dbState || !dbState.onboarding ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-8">
              <div>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-black uppercase tracking-widest">Enrollment Protocol</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white uppercase mt-1">
                  Activate Premium 90-Day Blueprint
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
                  Provide your baseline physiological metrics and preferences. Our personal training engine will adapt and progressive-overload all 90 daily workouts specifically for your bio-profile.
                </p>
              </div>

              {/* Questionnaire Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Age</label>
                  <input 
                    type="number"
                    value={onboardingForm.age}
                    onChange={(e) => setOnboardingForm({...onboardingForm, age: parseInt(e.target.value) || 28})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                  <select 
                    value={onboardingForm.gender}
                    onChange={(e) => setOnboardingForm({...onboardingForm, gender: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
                  <input 
                    type="number"
                    value={onboardingForm.height}
                    onChange={(e) => setOnboardingForm({...onboardingForm, height: parseInt(e.target.value) || 175})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Current Weight (kg)</label>
                  <input 
                    type="number"
                    value={onboardingForm.currentWeight}
                    onChange={(e) => setOnboardingForm({...onboardingForm, currentWeight: parseInt(e.target.value) || 80})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Goal Weight (kg)</label>
                  <input 
                    type="number"
                    value={onboardingForm.goalWeight}
                    onChange={(e) => setOnboardingForm({...onboardingForm, goalWeight: parseInt(e.target.value) || 75})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Experience level</label>
                  <select 
                    value={onboardingForm.fitnessLevel}
                    onChange={(e) => setOnboardingForm({...onboardingForm, fitnessLevel: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Workout Environment</label>
                  <select 
                    value={onboardingForm.gymOrHome}
                    onChange={(e) => setOnboardingForm({...onboardingForm, gymOrHome: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Gym">Commercial Gym Setup</option>
                    <option value="Home">Home Workout Setup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Available Equipment</label>
                  <input 
                    type="text"
                    value={onboardingForm.availableEquipment}
                    placeholder="e.g., Dumbbells, Barbell, None"
                    onChange={(e) => setOnboardingForm({...onboardingForm, availableEquipment: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Weekly Frequency</label>
                  <select 
                    value={onboardingForm.trainingDays}
                    onChange={(e) => setOnboardingForm({...onboardingForm, trainingDays: parseInt(e.target.value) || 5})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="3">3 Days per week</option>
                    <option value="4">4 Days per week</option>
                    <option value="5">5 Days per week</option>
                    <option value="6">6 Days per week</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">Active Injuries / Structural Precautions</label>
                  <input 
                    type="text"
                    placeholder="e.g., Left knee patellar tendonitis, Lower back herniation (Leave empty if none)"
                    value={onboardingForm.injuries}
                    onChange={(e) => setOnboardingForm({...onboardingForm, injuries: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Challenge Selector */}
              <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Step 2: Choose Your 90-Day Blueprint
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PREMIUM_CHALLENGES.map((challenge) => (
                    <div key={challenge.id} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-[300px] hover:border-red-500 hover:shadow-lg transition-all text-left">
                      <div className="space-y-2">
                        <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-full">{challenge.category}</span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">{challenge.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">{challenge.description}</p>
                      </div>
                      <button 
                        onClick={() => handleEnroll(challenge.id)}
                        className="w-full mt-4 bg-slate-950 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-900 text-white font-black uppercase tracking-wider text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Select & Begin Day 1
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // B. ACTIVE ENROLLED USER DASHBOARD
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700"><Target className="w-8 h-8" /></div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Enrolled Challenge</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-2 uppercase truncate leading-tight">{activeChallengeName}</p>
                  <p className="text-xs text-red-500 font-bold mt-1">Day {dbState.currentDay} of 90</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700"><Flame className="w-8 h-8" /></div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Overall Progress</span>
                  <p className="text-2xl font-black text-[#D32F2F] mt-1">{overallProgressPercentage}%</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-red-600 h-full transition-all" style={{ width: `${overallProgressPercentage}%` }} />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700"><Zap className="w-8 h-8" /></div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Workouts Done</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCompletedCount} <span className="text-xs text-slate-400 font-medium">Completed</span></p>
                  <p className="text-xs text-emerald-500 font-bold mt-1">~{totalCaloriesBurned} kcal burned</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700"><Award className="w-8 h-8" /></div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Current Streak</span>
                  <p className="text-2xl font-black text-amber-500 mt-1">{dbState.streaks.currentStreak} Days</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Longest: {dbState.streaks.longestStreak} Days</p>
                </div>
              </div>

              {/* Assigned Personal Coach Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-red-500/5 dark:from-amber-950/20 dark:to-red-950/10 border border-amber-500/25 dark:border-amber-900/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-md">
                    <Crown className="w-6 h-6 text-slate-950 fill-slate-950 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                      Assigned Personal Head Coach
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">
                      {dbState.assignedCoach || "Coach Marcus (Default Head Coach)"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Your progressive overloads, bio-mechanics, and daily progress metric reports are directly supervised.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 rounded-full px-3 py-1 uppercase tracking-wider animate-pulse">
                    🟢 Active 1-on-1 Guidance
                  </span>
                </div>
              </div>

              {/* Sub tabs Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 flex flex-wrap gap-2 shadow-xs">
                {[
                  { id: "workout", label: "Today's Workout", icon: Dumbbell },
                  { id: "analytics", label: "Analytics & History", icon: TrendingUp },
                  { id: "measurements", label: "Log PRs & Body", icon: Clipboard },
                  { id: "badges", label: "Trophy Case", icon: Medal },
                  { id: "certificate", label: "Certificate", icon: Crown }
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  const isActive = activeSubTab === subTab.id;
                  const isCertLocked = subTab.id === "certificate" && totalCompletedCount < 90;

                  return (
                    <button
                      key={subTab.id}
                      onClick={() => !isCertLocked && setActiveSubTab(subTab.id as any)}
                      className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isCertLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                      } ${
                        isActive 
                          ? "bg-red-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{subTab.label}</span>
                      {isCertLocked && <Lock className="w-3 h-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENTS */}
              <div className="transition-all duration-300">
                {/* 1. Workout Day Tab */}
                {activeSubTab === "workout" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left: Active Workout Info */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Active Workout Goal block */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                          <div>
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-black uppercase tracking-widest">{todayWorkoutDetail.phase}</span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white uppercase mt-0.5">Day {dbState.currentDay} Focus: {todayWorkoutDetail.focus}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">{todayWorkoutDetail.phaseDesc}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold">
                            <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/40">Week {todayWorkoutDetail.weekNum}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full">{todayWorkoutDetail.estTime} Mins</span>
                            <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/40">~{todayWorkoutDetail.estCalories} kcal expected</span>
                          </div>
                        </div>

                        {/* Injury warnings if onboarding filled */}
                        {dbState.onboarding.injuries && (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-amber-800 dark:text-amber-400 text-xs font-medium rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-bold">Athlete Injury Precaution Flagged:</p>
                              <p className="opacity-90">Personal Trainer advice: Be careful with: "{dbState.onboarding.injuries}". Keep reps slow, respect mechanical structural alignments, and modify load levels instantly if pain occurs.</p>
                            </div>
                          </div>
                        )}

                        {/* Warm Up List */}
                        <div className="space-y-4">
                          <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-cyan-400" />
                            Warm-up Routine (10-15 Minutes)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {todayWorkoutDetail.warmUp.map((wu, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-left space-y-1">
                                <span className="text-[9px] text-cyan-500 font-mono font-bold uppercase">{wu.duration}</span>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{wu.name}</h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{wu.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Main exercises list */}
                        <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-red-500" />
                            Core Exercises List ({todayWorkoutDetail.exercises.length} Exercises)
                          </h4>

                          <div className="space-y-8">
                            {todayWorkoutDetail.exercises.map((ex, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs relative">
                                <span className="absolute top-4 right-4 text-3xl font-black text-slate-100 dark:text-slate-800 select-none">0{idx + 1}</span>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div>
                                    <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{ex.name}</h5>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold uppercase mt-1 text-slate-400">
                                      <span>Target: {ex.muscleGroups?.join(", ") || "General Body"}</span>
                                      <span>•</span>
                                      <span>{ex.difficulty || "Intermediate"}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono font-bold">
                                    <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-md border border-red-100 dark:border-red-900/30">{ex.sets} Sets</span>
                                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-900/30">{ex.reps}</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">{ex.weight}</span>
                                    <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">{ex.rest} Rest</span>
                                  </div>
                                </div>

                                {/* HD Giphy loop representation */}
                                <div className="relative aspect-video max-h-[300px] w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-xs">
                                  <WorkoutVisual 
                                    exerciseId={ex.id} 
                                    exerciseName={ex.name} 
                                    isCard={true} 
                                    className="w-full h-full"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-150 dark:border-slate-800">
                                  <div className="space-y-1.5">
                                    <p className="font-black uppercase text-[10px] text-slate-400 tracking-wider">Instructions</p>
                                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{ex.instruction}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-100 dark:border-amber-900/30 text-[11px]">
                                      <p className="font-black text-amber-800 dark:text-amber-400 uppercase text-[9px] tracking-wider mb-0.5">Common Mistakes</p>
                                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-tight">{ex.mistake}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[11px]">
                                      <p className="font-black text-emerald-800 dark:text-emerald-400 uppercase text-[9px] tracking-wider mb-0.5">Safety Tip</p>
                                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-tight">{ex.safety}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cool down */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            Cool Down & Stretching (5-10 Minutes)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {todayWorkoutDetail.coolDown.map((cd, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-left space-y-1">
                                <span className="text-[9px] text-indigo-500 font-mono font-bold uppercase">{cd.duration}</span>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{cd.name}</h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{cd.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={handleCompleteWorkout}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            Finish Day {dbState.currentDay} Workout
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Personal Trainer Notification Settings & AI coaching */}
                    <div className="space-y-6">
                      
                      {/* Personal AI Coach Assist */}
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white border border-indigo-800/60 rounded-3xl p-6 shadow-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                        <div className="space-y-4 relative">
                          <div className="h-10 w-10 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center border border-indigo-500/30">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-base uppercase tracking-tight text-white">AI Personal Trainer Assist</h4>
                            <p className="text-xs text-indigo-200/80 leading-relaxed font-medium mt-1">
                              Need a modification, macro advice, or custom advice for today's focus? Launch our live neural AI coach configured with your 90-day progress metrics.
                            </p>
                          </div>
                          <button
                            onClick={() => alert("Launching AI Coach with active challenge telemetry pre-loaded...")}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat with AI Coach
                          </button>
                        </div>
                      </div>

                      {/* Daily Reminders / Automated Notifications */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Automated Reminders</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Activate real-time browser triggers to notify your physical tracking routines.</p>
                        
                        <div className="space-y-3 pt-2">
                          {[
                            { key: "workoutTime", label: "Workout Time Reminder" },
                            { key: "hydration", label: "Water & Hydration Alarm" },
                            { key: "recovery", label: "Recovery Windows advice" },
                            { key: "stretching", label: "Static stretching triggers" },
                            { key: "restDay", label: "Active Rest-day guidelines" }
                          ].map((item) => (
                            <label key={item.key} className="flex items-center justify-between cursor-pointer group text-xs text-slate-700 dark:text-slate-300 font-extrabold">
                              <span>{item.label}</span>
                              <input 
                                type="checkbox"
                                checked={(dbState.notificationsSettings as any)[item.key]}
                                onChange={async () => {
                                  const updatedSettings = {
                                    ...dbState.notificationsSettings,
                                    [item.key]: !(dbState.notificationsSettings as any)[item.key]
                                  };
                                  const updatedState = { ...dbState, notificationsSettings: updatedSettings };
                                  setDbState(updatedState);
                                  await saveChallengeData(user.uid, updatedState);
                                }}
                                className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Analytics & History */}
                {activeSubTab === "analytics" && (
                  <div className="space-y-8 text-left">
                    {/* Charts block */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Weight progress chart */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div>
                          <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">Weight Progress Trajectory</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tracks logged changes across the 90-day cycle.</p>
                        </div>
                        <div className="h-[280px] w-full pt-4">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Legend />
                                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#E53935" strokeWidth={3} activeDot={{ r: 8 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs">No logs recorded yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Bodyfat progress chart */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div>
                          <h4 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">Waist & Composition Measurements</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Visual metrics reflecting progressive narrowing.</p>
                        </div>
                        <div className="h-[280px] w-full pt-4">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip contentStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Legend />
                                <Bar dataKey="waist" name="Waist Circumference (cm)" fill="#3F51B5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs">No measurements logged yet.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Workout logs listing */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base uppercase text-slate-900 dark:text-white">Active Logs History</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Historical audit trails for completed workout sessions.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                              <th className="pb-3">Completed Day</th>
                              <th className="pb-3">Completed Date</th>
                              <th className="pb-3">Invested Time</th>
                              <th className="pb-3">Calories Expended</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {dbState.workoutHistory.length > 0 ? (
                              dbState.workoutHistory.map((item, idx) => (
                                <tr key={idx} className="text-slate-700 dark:text-slate-300 font-bold">
                                  <td className="py-3 text-red-600">Day {item.dayNum}</td>
                                  <td className="py-3">{item.date}</td>
                                  <td className="py-3">{item.durationMinutes} Minutes</td>
                                  <td className="py-3 text-emerald-500">~{item.caloriesBurned} kcal</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">No logged active days recorded yet. Completed days automatically register here.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Log measurements and PRs */}
                {activeSubTab === "measurements" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left: Log Measurements Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      <div>
                        <h4 className="font-black text-lg uppercase text-slate-900 dark:text-white">Log Dynamic Body metrics</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep your structural progress graphs updated. Measuring weekly is recommended.</p>
                      </div>

                      <form onSubmit={handleAddMeasurement} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Weight (kg) *</label>
                            <input 
                              type="number"
                              step="any"
                              required
                              value={logWeight}
                              onChange={(e) => setLogWeight(e.target.value)}
                              placeholder="e.g. 78.5"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Body Fat (%)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logBodyFat}
                              onChange={(e) => setLogBodyFat(e.target.value)}
                              placeholder="e.g. 14.2"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Chest Circumference (cm)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logChest}
                              onChange={(e) => setLogChest(e.target.value)}
                              placeholder="e.g. 102"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Waist Circumference (cm)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logWaist}
                              onChange={(e) => setLogWaist(e.target.value)}
                              placeholder="e.g. 84"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Hips Circumference (cm)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logHip}
                              onChange={(e) => setLogHip(e.target.value)}
                              placeholder="e.g. 96"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Arm (cm)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logArm}
                              onChange={(e) => setLogArm(e.target.value)}
                              placeholder="e.g. 38"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Leg (cm)</label>
                            <input 
                              type="number"
                              step="any"
                              value={logLeg}
                              onChange={(e) => setLogLeg(e.target.value)}
                              placeholder="e.g. 58"
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          Save Metrics Log
                        </button>
                      </form>
                    </div>

                    {/* Right: Personal Records Form & Log */}
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Record Lifter PRs</h4>
                        
                        <form onSubmit={handleAddPR} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Exercise Name</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. Barbell Squat"
                              value={prExercise}
                              onChange={(e) => setPrExercise(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Weight (kg)</label>
                            <input 
                              type="number"
                              required
                              placeholder="e.g. 140"
                              value={prWeight}
                              onChange={(e) => setPrWeight(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Repetitions</label>
                            <input 
                              type="number"
                              required
                              placeholder="e.g. 5"
                              value={prReps}
                              onChange={(e) => setPrReps(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-slate-950 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-900 text-white font-black uppercase text-xs py-2.5 rounded-lg transition-all cursor-pointer"
                          >
                            Add Personal Record
                          </button>
                        </form>
                      </div>

                      {/* Display PR list */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Hall of Personal Records</h4>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto">
                          {dbState.personalRecords.length > 0 ? (
                            dbState.personalRecords.map((pr) => (
                              <div key={pr.id} className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-900 dark:text-white">{pr.exerciseName}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{pr.date}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-red-600">{pr.weight} kg</p>
                                  <p className="text-[10px] text-slate-400 font-bold font-mono">{pr.reps} Reps</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 font-mono text-xs py-4">No PRs recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Badges / Achievements Tab */}
                {activeSubTab === "badges" && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h4 className="font-black text-xl uppercase text-slate-900 dark:text-white">Flagship Digital Medals Cabinet</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Accumulate specific streaks and completion thresholds to unlock elite rewards.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {[
                        { id: "first_workout", title: "First Blood Initiation", desc: "Successfully completed Day 1's progressive overload.", color: "from-blue-400 to-indigo-600" },
                        { id: "streak_7", title: "7 Day Gladiator", desc: "Maintained complete consistency for 7 days.", color: "from-green-400 to-emerald-600" },
                        { id: "streak_14", title: "14 Day Legionnaire", desc: "Forged neuromuscular resilience for 14 continuous days.", color: "from-teal-400 to-cyan-600" },
                        { id: "streak_30", title: "30 Day Iron Fortification", desc: "Completed 30 entire progressive overload days.", color: "from-pink-400 to-rose-600" },
                        { id: "streak_45", title: "45 Day Masterclass Knight", desc: "Crossed the midway threshold of complete execution.", color: "from-purple-400 to-fuchsia-600" },
                        { id: "streak_60", title: "60 Day Core Overlord", desc: "Completed 60 entire personalized workout plans.", color: "from-amber-400 to-orange-600" },
                        { id: "streak_75", title: "75 Day Kinetic Titan", desc: "Claimed mechanical absolute mastery for 75 workouts.", color: "from-yellow-400 to-red-600" },
                        { id: "streak_90", title: "90 Day Champion Elite", desc: "Absolute peak completion. Master of the AlexFitnessHub blueprint.", color: "from-amber-400 to-yellow-600", special: true }
                      ].map((badge) => {
                        const isUnlocked = dbState.achievements.includes(badge.id);

                        return (
                          <div 
                            key={badge.id}
                            className={`border rounded-2xl p-6 text-center flex flex-col items-center justify-between transition-all ${
                              isUnlocked 
                                ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 shadow-md scale-100" 
                                : "bg-slate-100/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-40"
                            }`}
                          >
                            <div className="relative mb-3">
                              <div className={`h-16 w-16 rounded-full flex items-center justify-center shadow-md ${
                                isUnlocked 
                                  ? `bg-gradient-to-tr ${badge.color} text-white` 
                                  : "bg-slate-300 dark:bg-slate-800 text-slate-500"
                              }`}>
                                {isUnlocked ? (
                                  <Award className="w-8 h-8 animate-pulse" />
                                ) : (
                                  <Lock className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              {isUnlocked && badge.special && (
                                <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white shadow-xs">
                                  <Crown className="w-3 h-3 fill-white" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">{badge.title}</h5>
                              <p className="text-[10px] text-slate-400 max-w-[140px] mx-auto leading-relaxed font-medium">{badge.desc}</p>
                            </div>

                            <span className={`block mt-3 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isUnlocked ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200/50" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {isUnlocked ? "Unlocked Medal" : "Locked"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Completion Certificate Tab (Unlocked only at Day 90 completion) */}
                {activeSubTab === "certificate" && (
                  <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Certificate Board Render */}
                    <div className="bg-white text-slate-900 border-8 border-slate-900 rounded-3xl p-6 sm:p-12 shadow-2xl relative text-center space-y-8 overflow-hidden font-sans">
                      {/* Security watermarks */}
                      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
                      <div className="absolute top-0 bottom-0 left-4 w-1 border-r border-slate-200 pointer-events-none" />
                      <div className="absolute top-0 bottom-0 right-4 w-1 border-l border-slate-200 pointer-events-none" />

                      {/* Certificate Header */}
                      <div className="space-y-2 relative">
                        <div className="flex justify-center mb-2">
                          <Crown className="w-12 h-12 text-amber-500 fill-amber-100" />
                        </div>
                        <h4 className="text-[10px] font-black tracking-[0.25em] text-amber-600 uppercase font-mono">Official AlexFitnessHub Board</h4>
                        <h3 className="text-3xl font-black uppercase tracking-tight text-slate-950">Certificate of Completion</h3>
                        <div className="w-24 h-1 bg-red-600 mx-auto mt-2" />
                      </div>

                      {/* Certificate core body */}
                      <div className="space-y-4 relative">
                        <p className="text-xs font-medium text-slate-500 italic">This authentic accolade is proudly bestowed upon</p>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 underline decoration-red-600 decoration-2 underline-offset-8">
                          {user?.displayName || "Athlete Champion"}
                        </h2>
                        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                          For demonstrating exceptional physical resilience, complete mental discipline, and continuous progressive overload output by completing the comprehensive **{activeChallengeName}** over 90 consecutive days.
                        </p>
                      </div>

                      {/* Audit Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-slate-150 py-6 text-center relative">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Total Workouts</span>
                          <span className="block text-base font-black text-slate-900 mt-0.5">90 Sessions</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Time Invested</span>
                          <span className="block text-base font-black text-slate-900 mt-0.5">~{totalMinutesTrained || 6750} Mins</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Burn</span>
                          <span className="block text-base font-black text-slate-900 mt-0.5">~{totalCaloriesBurned || 57600} kcal</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Verification ID</span>
                          <span className="block text-xs font-mono font-bold text-slate-900 mt-1 truncate">CERT-AFH-{user?.uid?.substring(0, 8)?.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-8 relative pt-4">
                        <div className="text-left">
                          <p className="font-serif font-bold italic text-slate-800 text-sm">Alex Admin</p>
                          <div className="w-32 border-b border-slate-300 my-1" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AlexFitnessHub Founder</p>
                        </div>

                        {/* Simulated QR Verification */}
                        <div className="h-16 w-16 bg-white border border-slate-200 p-1 rounded shadow-sm flex items-center justify-center">
                          <div className="bg-slate-900 h-full w-full [background-image:linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:8px_8px] [background-position:0_0,4px_4px]" />
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-mono">Issued: {formatDate(new Date().toISOString())}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Authentic Telemetry</p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Action Controls */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={shareCertificate}
                        className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4 text-white" />
                        {certificateShared ? "Copied URL to Clipboard!" : "Share Certificate"}
                      </button>
                      <button
                        onClick={() => alert("Downloading secure PDF Certificate of Completion...")}
                        className="bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold uppercase text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-250 dark:border-slate-700 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Admin Coach Assignment Console */}
          {user?.role === "admin" && (
            <div className="mt-12 mb-16 bg-white dark:bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-left max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-amber-500 animate-pulse" />
                <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  👑 Admin 1-on-1 Personal Coach Assignment Console
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold max-w-2xl">
                As an Administrator, you can manually assign a specialized coach (kinesiologist / physiotherapist) to any premium member's Immortal 90-Day Challenge program. This will instantly override or initialize their personalized coaching desk.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Select User */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">
                    Select Member
                  </label>
                  <select
                    value={selectedAdminUserUid}
                    onChange={(e) => setSelectedAdminUserUid(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose a Member --</option>
                    {allSystemUsers?.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName || u.email} ({u.subscriptionStatus === "premium" ? "Premium" : "Free"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Coach */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2">
                    Coach Name
                  </label>
                  <select
                    value={adminCoachName}
                    onChange={(e) => setAdminCoachName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Coach Marcus">Coach Marcus (Default)</option>
                    <option value="Coach Stephanie">Coach Stephanie (Physiotherapist)</option>
                    <option value="Coach Sarah">Coach Sarah (Nutritional Kinesiologist)</option>
                    <option value="Coach Alex">Coach Alex (Strength Specialist)</option>
                    <option value="Custom">-- Custom Type Name --</option>
                  </select>
                </div>

                {/* Custom Coach Input */}
                <div>
                  {adminCoachName === "Custom" ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                        Enter Custom Coach Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Coach David"
                        value={adminCustomCoachName}
                        onChange={(e) => setAdminCustomCoachName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ) : (
                    <div className="h-10 invisible" /> // spacing helper
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <button
                  onClick={handleAdminAssignCoach}
                  disabled={adminLoading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 font-sans font-black text-xs uppercase rounded-xl shadow-md transition duration-150 cursor-pointer text-center inline-flex items-center justify-center gap-2"
                >
                  {adminLoading ? "Assigning..." : "Assign Personal Coach"}
                </button>

                {adminStatusMessage && (
                  <p className={`text-xs font-bold ${adminStatusMessage.includes("Error") ? "text-red-500" : "text-emerald-500"}`}>
                    {adminStatusMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
