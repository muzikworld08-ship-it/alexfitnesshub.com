import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Award, BookOpen, Brain, CheckCircle2, ChevronRight, Clock, Coffee, 
  Flame, Heart, Lock, Play, RotateCcw, Shield, Sparkles, Dumbbell, 
  Move, Droplets, Moon, Apple, Activity, Check, Trophy, AlertTriangle, 
  Lightbulb, ChevronLeft, Calendar, Sparkle, Mail, Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { queueLifestyleAcademyReminderEmail } from "../lib/mailTriggers";
import WorkoutVisual from "./WorkoutVisual";

// Define TypeScript structures for Lifestyle Academy
interface ChallengeData {
  id: number;
  title: string;
  isFree: boolean;
  subtitle: string;
  icon: React.ReactNode;
  themeColor: string;
  explanation: string;
  whyToday: string;
  risks: string[];
  benefits: string[];
  scienceNote: string;
  habits: {
    hydrationOz: number;
    nutritionTip: string;
    sleepHours: number;
    recoveryTip: string;
  };
}

// 10 Lifestyle Challenges Metadata
const LIFESTYLE_CHALLENGES: ChallengeData[] = [
  {
    id: 1,
    title: "AI Desk Body Syndrome",
    isFree: true,
    subtitle: "Reverse rounded shoulders, forward neck slumps, and rigid spinal alignments.",
    icon: <Activity className="w-6 h-6" />,
    themeColor: "from-blue-500 to-indigo-600",
    explanation: "Desk Body Syndrome is a musculoskeletal imbalance caused by prolonged typing, mouse usage, and staring at screens. It is characterized by overactive chest muscles, underactive upper back muscles, and a protruding chin that strains the neck.",
    whyToday: "Modern screens hold our gaze downwards. Over-reliance on laptops and chairs molds our spinal column into an unnatural C-shape instead of a healthy S-curve.",
    risks: [
      "Chronic neck pain and tension headaches",
      "Reduced lung capacity due to a compressed ribcage",
      "Anterior Pelvic Tilt and lower back compensation"
    ],
    benefits: [
      "Confident, upright posture and expanded chest capacity",
      "Immediate reduction in tension headaches and neck fatigue",
      "Enhanced physical presence and mechanical lifting leverage"
    ],
    scienceNote: "Biomechanical studies show every inch of forward head tilt adds an extra 10 lbs of pressure on the cervical spine.",
    habits: {
      hydrationOz: 90,
      nutritionTip: "Consume collagen-rich bone broth and vitamin C to reinforce spinal tendon repair.",
      sleepHours: 8,
      recoveryTip: "Perform 1 minute of scapular wall slides for every hour seated."
    }
  },
  {
    id: 2,
    title: "Digital Obesity",
    isFree: true,
    subtitle: "Combat modern high-dopamine screen time weight gain and metabolic stagnation.",
    icon: <Apple className="w-6 h-6" />,
    themeColor: "from-emerald-500 to-teal-600",
    explanation: "Digital Obesity describes the metabolic down-regulation resulting from screen-bound sedentary patterns. Continuous visual overstimulation from feeds triggers passive snacking while keeping your muscle tissue locked in low-consumption states.",
    whyToday: "Instant meal deliveries, automated transit, and algorithm-optimized apps reward complete immobility while feeding us highly palatable, calorie-dense foods.",
    risks: [
      "Insulin resistance and rapid visceral fat accumulation",
      "Depleted baseline energy reserves and brain fog",
      "Elevated systemic inflammation and low HRV scores"
    ],
    benefits: [
      "Pristine blood glucose control and enhanced fat oxidation",
      "Constant steady-state physical energy throughout the day",
      "Improved sleep depth and mental resilience"
    ],
    scienceNote: "Slowing down your visual consumption reduces circulating cortisol, directly limiting visceral fat storage triggers.",
    habits: {
      hydrationOz: 100,
      nutritionTip: "Intermittent fasting format: Keep a solid 12-hour fasting window to restore baseline insulin levels.",
      sleepHours: 7,
      recoveryTip: "Walk completely screen-free for 15 minutes after your heaviest dinner."
    }
  },
  {
    id: 3,
    title: "Muscle Loss Epidemic",
    isFree: false,
    subtitle: "Defeat age-related sarcopenia and sedentary lean mass deterioration.",
    icon: <Dumbbell className="w-6 h-6" />,
    themeColor: "from-red-500 to-orange-600",
    explanation: "Our bodies operate on a strict 'use it or lose it' muscle preservation code. Without deliberate heavy loading, modern lifestyle prompts our metabolism to shed energy-expensive skeletal muscle fiber, replacing it with passive adipose tissue.",
    whyToday: "Our daily lives require zero physical resistance. We lift no heavy loads, pull no resistance items, and carry no water, resulting in structural muscle wastage.",
    risks: [
      "Slower metabolic rate making weight gain highly effortless",
      "Joint instability, especially inside vulnerable knees and shoulder capsules",
      "Early frailty and compromised physical independence"
    ],
    benefits: [
      "Sculpted, active lean frame that burns calories even at complete rest",
      "Ironclad joint security and reduced risk of physical injury",
      "Enhanced insulin receptor density in muscle tissue"
    ],
    scienceNote: "After age 30, adults lose 3% to 8% of muscle mass per decade without consistent, structured resistance training.",
    habits: {
      hydrationOz: 110,
      nutritionTip: "Target 1.6g of high-quality protein per kilogram of body weight, focusing on lean meat, fish, and egg whites.",
      sleepHours: 8,
      recoveryTip: "Prioritize eccentric control (slow lowering phases) during your workouts to stimulate muscle repair."
    }
  },
  {
    id: 4,
    title: "Sitting Disease",
    isFree: false,
    subtitle: "Overcome physiological vascular shutdown from sitting >6 hours daily.",
    icon: <Move className="w-6 h-6" />,
    themeColor: "from-amber-500 to-yellow-600",
    explanation: "Sitting Disease is the scientific term used to describe systemic metabolic shutdown. When sitting, electrical activity in the legs drops to zero, calorie burning drops to 1 per minute, and arterial blood flow drops substantially.",
    whyToday: "From office chairs to car commutes and couches, we spend an average of 9.3 hours per day seated, bypassing our body's built-in muscle pumps.",
    risks: [
      "Inhibited lipoprotein lipase (LPL) activity causing poor blood lipid clearance",
      "Vascular stiffness and lower-limb fluid pooling",
      "Gluteal amnesia (deactivated glutes) leading to lumbar spine overload"
    ],
    benefits: [
      "Instant restoration of vascular circulation and high metabolic rate",
      "Activated posterior chain that stabilizes the lower back and pelvis",
      "Drastic reduction in late-afternoon brain fog"
    ],
    scienceNote: "Studies show standing up for just 2 minutes every 30 minutes improves blood sugar regulation by over 11%.",
    habits: {
      hydrationOz: 95,
      nutritionTip: "Increase potassium and leafy greens intake to facilitate dynamic blood pressure regulation.",
      sleepHours: 8,
      recoveryTip: "Adopt a stand-to-work setup or complete 20 bodyweight squats every 2 hours."
    }
  },
  {
    id: 5,
    title: "Stress Burnout Syndrome",
    isFree: false,
    subtitle: "Reset hyper-sympathetic cortisol spikes and recover deep nervous energy.",
    icon: <Brain className="w-6 h-6" />,
    themeColor: "from-purple-500 to-pink-600",
    explanation: "Stress Burnout occurs when your sympathetic nervous system is perpetually activated without receiving a physiological safety signal. Chronic work deadlines, notification alerts, and lack of motion pool cortisol in the body.",
    whyToday: "Unchecked digital inputs never allow the nervous system to enter parasympathetic rest. We are always on, always reacting, and rarely resting.",
    risks: [
      "Chronic systemic inflammation and suppressed immune response",
      "Sleep disruption and fragmented REM patterns",
      "Adrenal fatigue, constant anxiety, and physical exhaustion"
    ],
    benefits: [
      "Calm, focused mind and stable morning cortisol curves",
      "Dramatically deeper sleep and refreshed recovery scores",
      "Improved emotional patience and enhanced concentration"
    ],
    scienceNote: "Deep physical mobility and parasympathetic breathing stimulate the vagus nerve, which acts as a brake on stress response.",
    habits: {
      hydrationOz: 90,
      nutritionTip: "Avoid high doses of caffeine after 12:00 PM to protect adrenal gland sensitivity.",
      sleepHours: 8,
      recoveryTip: "Practice the 4-7-8 deep breathing technique for 3 minutes before sleep."
    }
  },
  {
    id: 6,
    title: "Low Energy Lifestyle",
    isFree: false,
    subtitle: "Supercharge dormant mitochondria and restore standard metabolic vigor.",
    icon: <Flame className="w-6 h-6" />,
    themeColor: "from-orange-500 to-red-600",
    explanation: "A Low Energy Lifestyle is characterized by mitochondrial stagnation. When we minimize physical demands, our cells optimize by reducing their energy output, leading to persistent daily fatigue.",
    whyToday: "We consume artificial light, process sugars, and limit motion, forcing our cellular energy centers to down-regulate their natural ATP output.",
    risks: [
      "Persistent brain fog and cognitive resistance to focus",
      "Reduced cardiac stroke volume and low cardiorespiratory baseline",
      "Increased dependence on chemical stimulants"
    ],
    benefits: [
      "Natural morning alertness without immediate caffeine dependency",
      "Superb physical stamina to breeze through long active days",
      "Elevated calorie burn capacity at all times"
    ],
    scienceNote: "Physical training triggers mitochondrial biogenesis—the actual creation of new energy-producing cells inside your muscles.",
    habits: {
      hydrationOz: 110,
      nutritionTip: "Consume complex carbs paired with healthy fats to avoid high blood sugar spikes.",
      sleepHours: 8,
      recoveryTip: "Expose your eyes to raw outdoor sunlight for 10 minutes within an hour of waking."
    }
  },
  {
    id: 7,
    title: "Core Weakness Crisis",
    isFree: false,
    subtitle: "Secure your abdominal shield and eliminate heavy lumbar load transfers.",
    icon: <Shield className="w-6 h-6" />,
    themeColor: "from-cyan-500 to-blue-600",
    explanation: "A weak core is the single greatest cause of adult back pain. Sitting deactivates your abdominal wall and glutes, leaving your lower spine to bear the entire mechanical weight of your torso during daily movements.",
    whyToday: "Modern seating relieves our abdominal stabilizer muscles of their natural posture duties, causing them to atrophy.",
    risks: [
      "Lumbar disc herniation and acute lower back muscle spasms",
      "Poor transfer of force during compound exercises",
      "Compromised balance, hip misalignment, and knee wear"
    ],
    benefits: [
      "An ironclad abdominal corset that supports and protects your spine",
      "Enhanced physical power in squats, deadlifts, and daily carrying",
      "Pain-free standing, running, and physical agility"
    ],
    scienceNote: "The core is not just your abs; it is a 3D box of muscles including the transverse abdominis, obliques, and pelvic floor stabilizers.",
    habits: {
      hydrationOz: 90,
      nutritionTip: "Supplement with minerals like magnesium to prevent deep muscle cramps and optimize core firing patterns.",
      sleepHours: 7,
      recoveryTip: "Practice abdominal bracing (vacuum pulls) for 10 reps every morning."
    }
  },
  {
    id: 8,
    title: "Metabolic Slowdown",
    isFree: false,
    subtitle: "Ignite sluggish cellular fires and elevate baseline fat oxidation.",
    icon: <Droplets className="w-6 h-6" />,
    themeColor: "from-teal-500 to-blue-600",
    explanation: "Metabolic Slowdown happens when a sedentary lifestyle and poor lean muscle mass signal your body to conserve energy, locking you in a continuous fat-storing mode.",
    whyToday: "Processed high-glycemic foods coupled with zero movement slow down our active thyroid hormone output, lowering baseline body temperature.",
    risks: [
      "Extremely rapid fat gain even from modest portion sizes",
      "Persistent cold sensitivity and sluggish physical reflexes",
      "Declining vascular health and lipid profiles"
    ],
    benefits: [
      "Rapid nutrient partitioning—food is stored as muscle fuel, not fat",
      "High natural thermogenic temperature and quick physical recovery",
      "Effortless maintenance of lean, healthy body fat percentages"
    ],
    scienceNote: "Building just 5 lbs of lean muscle increases your resting metabolic rate by 50 to 150 calories daily, indefinitely.",
    habits: {
      hydrationOz: 120,
      nutritionTip: "Incorporate metabolism-boosting ginger, garlic, and green tea into your nutritional profile.",
      sleepHours: 8,
      recoveryTip: "Engage in cold water therapy or cool showers to trigger active brown adipose tissue calorie burn."
    }
  },
  {
    id: 9,
    title: "Mobility Decline",
    isFree: false,
    subtitle: "Break up fibrotic tissue restrictions and restore youthful joint elasticity.",
    icon: <Sparkles className="w-6 h-6" />,
    themeColor: "from-violet-500 to-fuchsia-600",
    explanation: "Mobility Decline is the gradual stiffening of muscle fascia and joint capsules due to limited movement ranges. This restriction shortens muscle tissue, making common movements rigid and injury-prone.",
    whyToday: "Seated living rarely challenges our joints to move through full athletic paths, causing our soft tissues to adaptively shorten.",
    risks: [
      "Shortened ligaments resulting in joint compression and early arthritis",
      "Loss of ability to perform deep, natural squat depths or high reaches",
      "High risk of muscle tears during minor athletic activities"
    ],
    benefits: [
      "Effortless, fluid daily movement with springy fascia elasticity",
      "Maximized athletic range of motion to secure correct lifting form",
      "Decreased chronic joint friction, pain, and stiffness"
    ],
    scienceNote: "Fascial tissue is dynamic; it responds to mechanical tension by synthesizing fresh, flexible collagen networks.",
    habits: {
      hydrationOz: 100,
      nutritionTip: "Consume high-quality omega-3 fatty acids from fish oils to keep joint surfaces well lubricated.",
      sleepHours: 8,
      recoveryTip: "Perform 5 minutes of focused hip opening mobility drills before your morning shower."
    }
  },
  {
    id: 10,
    title: "Healthy Aging Challenge",
    isFree: false,
    subtitle: "Protect cognitive pathways, retain critical bone density, and live fully.",
    icon: <Award className="w-6 h-6" />,
    themeColor: "from-rose-500 to-red-600",
    explanation: "Aging doesn't require physical decline. The 'Healthy Aging Challenge' integrates modern resistance mechanics, posture correction, and balance training to maintain physical autonomy and vitality for decades.",
    whyToday: "Modern comfort encourages older adults to withdraw from physically challenging tasks, accelerating bone density loss and motor nerve decay.",
    risks: [
      "Fragile bones (osteoporosis) prone to major fractures from simple trips",
      "Neuromuscular decline leading to loss of physical balance",
      "Loss of independent movement and cognitive decline"
    ],
    benefits: [
      "Dense, strong bone structures and robust neuromuscular balance",
      "Sharp cognitive reflexes and high natural dopamine levels",
      "Complete physical independence and active movement confidence"
    ],
    scienceNote: "Weight-bearing resistance exercises are the primary stimulus for osteoblast activity, directly building new bone minerals.",
    habits: {
      hydrationOz: 90,
      nutritionTip: "Ensure adequate calcium and vitamin D3 intake to support active bone mineral density.",
      sleepHours: 8,
      recoveryTip: "Incorporate balance-focused single-leg stands for 1 minute while brushing your teeth."
    }
  }
];

// Helper to generate Stretching routines dynamically
const getStretchingRoutine = (title: string) => {
  return [
    {
      phase: "Warm Up",
      name: "Primal Cat-Cow Spinal Waves",
      duration: "90 seconds",
      sets: "2 sets",
      benefits: "Lubricates the spinal vertebrae and warms the deep core stabilizers.",
      instructions: "On hands and knees, slowly arch your spine up to the ceiling, then dip it down while elevating your gaze."
    },
    {
      phase: "Upper Body",
      name: "Seated Thoracic Extension & Twist",
      duration: "60 seconds per side",
      sets: "2 sets",
      benefits: "Decompresses the upper back and opens up a tight chest wall.",
      instructions: "Place hands behind your head, pull elbows wide, puff your chest forward, and rotate your ribcage side-to-side."
    },
    {
      phase: "Lower Body",
      name: "90/90 Active Hip Opener",
      duration: "60 seconds per hip",
      sets: "2 sets",
      benefits: "Decompresses tight hip capsules and relieves lower back load transfer.",
      instructions: "Sit on the floor with legs folded at 90-degree angles in front and to the side. Lean your chest gently over your front leg."
    },
    {
      phase: "Mobility Focus",
      name: "Ankle Dorsiflexion & Calcaneal Mobilization",
      duration: "45 seconds per side",
      sets: "3 sets",
      benefits: "Improves ankle mobility, allowing for deeper and safer squat biomechanics.",
      instructions: "Drive your knee forward over your toes while keeping your heel firmly planted on the ground."
    },
    {
      phase: "Cool Down",
      name: "Deep Diaphragmatic Box Breathing",
      duration: "120 seconds",
      sets: "1 set",
      benefits: "Activates the parasympathetic nervous system, lowering cortisol and resting heart rate.",
      instructions: "Inhale through your nose for 4 seconds, hold for 4, exhale for 4, and hold empty for 4 seconds."
    }
  ];
};

// Helper to generate Workout Program dynamically based on user context
const getDynamicWorkoutProgram = (
  challengeTitle: string, 
  level: "Beginner" | "Intermediate" | "Advanced", 
  location: "Home" | "Gym"
) => {
  const isGym = location === "Gym";
  
  // Custom tailored schedules
  return [
    {
      day: "Day 1: Posterior Chain Restoration",
      warmUp: "Y-T-W Scapular Raises (Bodyweight) - 2 sets of 15 reps",
      exercises: [
        {
          name: isGym ? "Cable Lat Pulldowns (Slow Eccentric)" : "Dumbbell Bent-Over Row with Chest Support",
          reps: level === "Beginner" ? "3 sets of 10 (Light)" : level === "Intermediate" ? "4 sets of 12 (Moderate)" : "4 sets of 15 (Heavy progressive overload)",
          rest: "60 seconds",
          coaching: "Hold the peak contraction for 2 full seconds to engage the rhomboids."
        },
        {
          name: isGym ? "Romanian Barbell Deadlifts" : "Dumbbell Romanian Deadlifts",
          reps: level === "Beginner" ? "3 sets of 8 (Controlled)" : level === "Intermediate" ? "3 sets of 12 (Moderate)" : "4 sets of 10 (Heavy)",
          rest: "90 seconds",
          coaching: "Push your hips far back and feel the hamstrings stretch. Keep your spine perfectly flat."
        }
      ],
      coolDown: "Child's Pose Spinal Reach - 90 seconds"
    },
    {
      day: "Day 2: Lateral and Front Stability",
      warmUp: "Active Arm Circles & Core Bracing - 2 minutes",
      exercises: [
        {
          name: isGym ? "Standing Dumbbell Overhead Press" : "Resistance Band Shoulder Press",
          reps: level === "Beginner" ? "3 sets of 8" : level === "Intermediate" ? "3 sets of 12" : "4 sets of 10",
          rest: "60 seconds",
          coaching: "Lock your core tightly to protect your lower back at the top of the press."
        },
        {
          name: "Plank with Shoulder Taps",
          reps: level === "Beginner" ? "3 sets of 30 seconds" : level === "Intermediate" ? "3 sets of 45 seconds" : "4 sets of 60 seconds",
          rest: "45 seconds",
          coaching: "Avoid shifting your hips; keep your torso perfectly parallel to the floor."
        }
      ],
      coolDown: "Prone Cobra Chest Opener - 2 minutes"
    },
    {
      day: "Day 3: Lower Limb and Glute Awakening",
      warmUp: "Bodyweight Air Squats & Glute Kickbacks - 3 minutes",
      exercises: [
        {
          name: isGym ? "Leg Press (High & Wide Stance)" : "Dumbbell Goblet Squats",
          reps: level === "Beginner" ? "3 sets of 10" : level === "Intermediate" ? "3 sets of 15" : "4 sets of 12 (Eccentric focus)",
          rest: "90 seconds",
          coaching: "Descend slowly for 3 seconds before driving back up powerfully."
        },
        {
          name: "Single-Leg Glute Bridges",
          reps: level === "Beginner" ? "3 sets of 8 per side" : level === "Intermediate" ? "3 sets of 12 per side" : "4 sets of 15 per side",
          rest: "45 seconds",
          coaching: "Drive through your heel and squeeze your glutes hard at the top."
        }
      ],
      coolDown: "90/90 Hip Stretch - 60 seconds per leg"
    }
  ];
};

export default function LifestyleFitnessAcademy() {
  const { user, setView, exercises } = useApp();
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"education" | "stretching" | "workout" | "habits">("education");

  // Smoothly scroll to the top of the viewport whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState<string | null>(null);

  // Email trigger state variables
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [customEmail, setCustomEmail] = useState("");

  const handleSendEmailTrigger = async (challenge: ChallengeData) => {
    const targetEmail = user?.email || customEmail;
    if (!targetEmail || !targetEmail.includes("@")) {
      setEmailStatus({ success: false, message: "Please enter a valid email address." });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    // Calculate completed tasks for this course
    const completedForThisChallenge = Object.keys(progress)
      .filter(key => key.startsWith(`c${challenge.id}_`))
      .filter(key => progress[key]).length;

    try {
      await queueLifestyleAcademyReminderEmail(
        targetEmail,
        user?.displayName || "Academy Athlete",
        challenge.title,
        completedForThisChallenge,
        userLevel,
        userLocation
      );
      setEmailStatus({ 
        success: true, 
        message: `✓ Action plan dispatched! Check ${targetEmail} shortly.` 
      });
    } catch (err) {
      console.error("Failed to send email trigger:", err);
      setEmailStatus({ success: false, message: "Could not dispatch email. Please try again." });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // User Profile from App Context
  const userLevel = (user?.workoutExperience as "Beginner" | "Intermediate" | "Advanced") || "Beginner";
  const userLocation = (user?.trainingLocation as "Home" | "Gym") || "Home";

  // State for tracking progress
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [waterCount, setWaterCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Unique key for storage based on user UID or local guest
  const storageKey = user ? `fit_academy_progress_${user.uid}` : "fit_academy_progress_guest";
  const waterKey = user ? `fit_academy_water_${user.uid}` : "fit_academy_water_guest";
  const streakKey = user ? `fit_academy_streak_${user.uid}` : "fit_academy_streak_guest";

  // Load progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProgress(JSON.parse(saved));
      
      const savedWater = localStorage.getItem(waterKey);
      if (savedWater) setWaterCount(parseInt(savedWater) || 0);

      const savedStreak = localStorage.getItem(streakKey);
      if (savedStreak) setStreak(parseInt(savedStreak) || 0);
    } catch (e) {}
  }, [storageKey, waterKey, streakKey]);

  // Sync to local storage & quiet Firestore integration (safely catching quota limits)
  const saveProgress = async (newProgress: Record<string, boolean>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
      
      if (user && user.uid) {
        // Quietly back up to Firestore
        const userProgressRef = doc(db, "user_academy_progress", user.uid);
        await setDoc(userProgressRef, {
          progress: newProgress,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn("Quiet sync to Firestore failed (local state is preserved):", err);
    }
  };

  const handleWaterClick = (amt: number) => {
    const nextVal = Math.max(0, waterCount + amt);
    setWaterCount(nextVal);
    try {
      localStorage.setItem(waterKey, nextVal.toString());
    } catch (e) {}
  };

  const toggleCheck = (id: string) => {
    const updated = { ...progress, [id]: !progress[id] };
    saveProgress(updated);

    // Calculate streak reward dynamically when checking a core habit
    if (updated[id] && id.includes("habit")) {
      const currentStreak = streak + 1;
      setStreak(currentStreak);
      try {
        localStorage.setItem(streakKey, currentStreak.toString());
      } catch (e) {}
    }
  };

  // Check if premium logic
  const handleChallengeClick = (challenge: ChallengeData) => {
    const isPremiumUser = user && (user.subscriptionStatus === "premium" || user.role === "admin");
    if (!challenge.isFree && !isPremiumUser) {
      setShowSubscriptionAlert(
        `"${challenge.title}" is a Premium-Only Course. Upgrading unlocks access to all 10 specialized lifestyle challenges with personalized daily plans, adaptive workouts, and posture alignments.`
      );
      return;
    }
    setActiveChallengeId(challenge.id);
    setActiveTab("education");
  };

  const activeChallenge = LIFESTYLE_CHALLENGES.find(c => c.id === activeChallengeId);

  // Progression States for current challenge
  const isScienceCompleted = activeChallenge ? (progress[`c${activeChallenge.id}_science_complete`] || false) : false;
  const isStretchingCompleted = activeChallenge ? (progress[`c${activeChallenge.id}_stretching_complete`] || false) : false;
  const isWorkoutCompleted = activeChallenge ? (progress[`c${activeChallenge.id}_workout_complete`] || false) : false;

  const stretchingUnlocked = isScienceCompleted;
  const workoutUnlocked = isStretchingCompleted;
  const habitsUnlocked = isStretchingCompleted;

  const getMatchedExerciseName = (targetName: string): string => {
    const targetLower = targetName.toLowerCase().trim();
    if (!exercises) return targetName;

    // First try exact or direct matches in central exercises
    const exactMatch = exercises.find(ex => ex.name.toLowerCase().trim() === targetLower);
    if (exactMatch) return exactMatch.name;

    // Map specific Academy Stretches to their actual central exercise names
    if (targetLower.includes("cat-cow") || targetLower.includes("spinal wave")) {
      const ex = exercises.find(e => e.name.toLowerCase().includes("cat-cow"));
      if (ex) return ex.name;
    }
    if (targetLower.includes("thoracic") || targetLower.includes("twist")) {
      const ex = exercises.find(e => e.name.toLowerCase().includes("thoracic"));
      if (ex) return ex.name;
    }
    if (targetLower.includes("hip opener") || targetLower.includes("90/90 active")) {
      const ex = exercises.find(e => e.name.toLowerCase().includes("90/90 active hip"));
      if (ex) return ex.name;
    }
    if (targetLower.includes("dorsiflexion") || targetLower.includes("ankle")) {
      const ex = exercises.find(e => e.name.toLowerCase().includes("dorsiflexion"));
      if (ex) return ex.name;
    }
    if (targetLower.includes("breathing") || targetLower.includes("diaphragmatic")) {
      const ex = exercises.find(e => e.name.toLowerCase().includes("diaphragmatic"));
      if (ex) return ex.name;
    }

    // Try a broad substring or reciprocal inclusion search
    const found = exercises.find(ex => 
      ex.name.toLowerCase().includes(targetLower) || 
      targetLower.includes(ex.name.toLowerCase())
    );
    if (found) return found.name;

    return targetName;
  };

  // Total Academy Progress Metrics
  const totalCoursesUnlocked = user && (user.subscriptionStatus === "premium" || user.role === "admin") ? 10 : 2;
  const totalTasksCompleted = Object.values(progress).filter(Boolean).length;
  const calculatedProgressPercentage = Math.min(100, Math.round((totalTasksCompleted / (totalCoursesUnlocked * 8)) * 100)) || 0;

  return (
    <div id="academy-root-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* 1. ACADEMY HERO HEADER */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-red-600 to-amber-500 text-white p-8 sm:p-12 shadow-xl mb-12">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 max-w-2xl text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkle className="w-4 h-4 fill-white" />
            LIFESTYLE FITNESS ACADEMY
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none uppercase">
            RECLAIM YOUR <br />
            <span className="text-amber-200">POSTURE & VITALITY</span>
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
            Modern lifestyles build posture problems, slow down metabolic fires, and deteriorate strength. Explore our premium science-backed courses designed by Coach Alex to solve real-world problems.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-300" />
              <div>
                <span className="block text-[10px] text-white/75 font-bold uppercase tracking-wider">ACADEMY SCORE</span>
                <span className="text-base font-black">{totalTasksCompleted} Completed Actions</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
              <div>
                <span className="block text-[10px] text-white/75 font-bold uppercase tracking-wider">CONSISTENCY STREAK</span>
                <span className="text-base font-black">{streak} Habits Kept</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Limit Warning Modal */}
      <AnimatePresence>
        {showSubscriptionAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowSubscriptionAlert(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-red-150 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#D32F2F]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Premium Academy Course</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {showSubscriptionAlert}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowSubscriptionAlert(null);
                    setView("home");
                    setTimeout(() => {
                      const el = document.getElementById("pricing");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition"
                >
                  UPGRADE FOR UNLIMITED ACCESS
                </button>
                <button
                  onClick={() => setShowSubscriptionAlert(null)}
                  className="w-full py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!activeChallenge ? (
        // 2. DASHBOARD VIEW: COURSE MATRIX
        <div className="space-y-12">
          
          {/* Progress Tracker Card */}
          <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-md text-left">
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Overall Academic Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have completed {totalTasksCompleted} daily actions out of {totalCoursesUnlocked * 8} target milestones inside your unlocked educational courses.
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-gradient-to-r from-[#D32F2F] to-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${calculatedProgressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shrink-0 shadow-sm">
              <Droplets className="w-8 h-8 text-sky-500 fill-sky-500" />
              <div className="text-left">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DAILY WATER TARGET</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{waterCount} Cups / 8 Cups</span>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => handleWaterClick(1)} className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 rounded-lg text-[10px] font-black uppercase transition">+</button>
                  <button onClick={() => handleWaterClick(-1)} className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase transition">-</button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid layout for 10 challenges */}
          <div className="space-y-6">
            <div className="text-left border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Select a Lifestyle Challenge</h3>
                <p className="text-xs text-slate-500">Pick any topic below to access actionable routines & plans.</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 text-[#D32F2F]">{totalCoursesUnlocked}/10 Courses Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIFESTYLE_CHALLENGES.map((challenge) => {
                const isPremiumLocked = !challenge.isFree && !(user && (user.subscriptionStatus === "premium" || user.role === "admin"));
                const challengeProgress = Object.keys(progress)
                  .filter(key => key.startsWith(`c${challenge.id}_`))
                  .filter(key => progress[key]).length;

                return (
                  <div
                    key={challenge.id}
                    onClick={() => handleChallengeClick(challenge)}
                    className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-red-300 dark:hover:border-red-950 p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
                  >
                    <div className="space-y-4">
                      {/* Icon Banner */}
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl bg-gradient-to-r ${challenge.themeColor} text-white shadow-md`}>
                          {challenge.icon}
                        </div>
                        {isPremiumLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider rounded-full">
                            <Lock className="w-3 h-3" />
                            PREMIUM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      {/* Header */}
                      <div>
                        <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white leading-tight group-hover:text-[#D32F2F] transition-colors">
                          {challenge.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                          {challenge.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-between items-center text-xs">
                      {isPremiumLocked ? (
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Requires Premium Access</span>
                      ) : (
                        <span className="text-slate-500 font-medium">
                          {challengeProgress} of 8 completed tasks
                        </span>
                      )}
                      <span className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 group-hover:bg-red-500 group-hover:text-white transition duration-200">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // 3. COURSE DETAIL PAGE
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Back button */}
          <button 
            onClick={() => setActiveChallengeId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Academy Home
          </button>

          {/* Detail Hero banner */}
          <div className={`relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r ${activeChallenge.themeColor} text-white p-8 sm:p-10 shadow-xl`}>
            <div className="absolute inset-0 bg-black/10 z-0" />
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                COURSE MODULE {activeChallenge.id}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none tracking-tight">
                {activeChallenge.title}
              </h2>
              <p className="text-sm text-white/90 font-medium max-w-2xl leading-relaxed">
                {activeChallenge.subtitle}
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-white/95">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/10 rounded-lg">
                  <Dumbbell className="w-4 h-4" />
                  <span>Adaptive Training Location: {userLocation}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/10 rounded-lg">
                  <Award className="w-4 h-4" />
                  <span>Tailored Level: {userLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Segment selection tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("education")}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "education" 
                  ? "border-[#D32F2F] text-[#D32F2F]" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              1. Scientific Core {isScienceCompleted ? "✓" : ""}
            </button>
            {stretchingUnlocked && (
              <button
                onClick={() => {
                  setActiveTab("stretching");
                }}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "stretching" 
                    ? "border-[#D32F2F] text-[#D32F2F]" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                2. Stretching Routine {isStretchingCompleted ? "✓" : ""}
              </button>
            )}
            {workoutUnlocked && (
              <button
                onClick={() => {
                  setActiveTab("workout");
                }}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "workout" 
                    ? "border-[#D32F2F] text-[#D32F2F]" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                3. Weekly Workout {isWorkoutCompleted ? "✓" : ""}
              </button>
            )}
            {habitsUnlocked && (
              <button
                onClick={() => {
                  setActiveTab("habits");
                }}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "habits" 
                    ? "border-[#D32F2F] text-[#D32F2F]" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                4. Daily Action Plan
              </button>
            )}
          </div>

          {/* Subview Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT / CENTER 2 COLS FOR TAB CONTENT */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tab 1: Educational Core */}
              {activeTab === "education" && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 space-y-6">
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#D32F2F]" />
                      UNDERSTANDING THE CRITICAL CHALLENGE
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      {activeChallenge.explanation}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950 space-y-3">
                      <h4 className="text-xs font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        HEALTH RISKS IF IGNORED
                      </h4>
                      <ul className="space-y-2">
                        {activeChallenge.risks.map((risk, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950 space-y-3">
                      <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        PHYSICAL & MENTAL BENEFITS
                      </h4>
                      <ul className="space-y-2">
                        {activeChallenge.benefits.map((benefit, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-[#D32F2F]" />
                      THE SCIENTIFIC CORNERSTONE
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold italic">
                      "{activeChallenge.scienceNote}"
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/15 dark:to-amber-950/15 border border-red-100 dark:border-red-950/50 space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      HOW ALEXFITNESSHUB SOLVES IT
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      We target structural solutions, reinforcing the specific muscles stretched or deactivated by typical posture blocks. Our adaptive program works around your fitness parameters automatically.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        if (!isScienceCompleted) {
                          toggleCheck(`c${activeChallenge.id}_science_complete`);
                        }
                        setActiveTab("stretching");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>Mark Core Completed & Proceed to Stretching Routine</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

              {/* Tab 2: Daily Stretching Routine */}
              {activeTab === "stretching" && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 space-y-6">
                  
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                      <Move className="w-5 h-5 text-indigo-500" />
                      COACH ALEX'S STRETCHING GUIDE
                    </h3>
                    <button 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_stretching_complete`)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                        progress[`c${activeChallenge.id}_stretching_complete`]
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {progress[`c${activeChallenge.id}_stretching_complete`] ? "Stretching Done ✓" : "Mark as Done"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {getStretchingRoutine(activeChallenge.title).map((stretch, i) => (
                      <div 
                        key={i}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-5 items-stretch text-left"
                      >
                        {/* Dynamic GIF/Video Demonstration */}
                        <div className="w-full md:w-52 h-36 shrink-0 rounded-xl overflow-hidden shadow-sm">
                          <WorkoutVisual 
                            exerciseName={getMatchedExerciseName(stretch.name)} 
                            className="h-full w-full" 
                            isCard={true} 
                          />
                        </div>

                        <div className="space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-[#D32F2F]/10 text-[9px] font-mono font-black text-[#D32F2F] rounded-md uppercase">
                                Phase {stretch.phase}
                              </span>
                            </div>
                            <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                              {stretch.name}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-1">
                              {stretch.instructions}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2 text-[9px] font-mono font-bold uppercase">
                            <span className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded text-slate-500">
                              Duration: {stretch.duration}
                            </span>
                            <span className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2.5 py-1 rounded text-slate-500">
                              Sets: {stretch.sets}
                            </span>
                            <span className="bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded text-emerald-600 border border-emerald-100 dark:border-emerald-950/50">
                              {stretch.benefits}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        if (!isStretchingCompleted) {
                          toggleCheck(`c${activeChallenge.id}_stretching_complete`);
                        }
                        setActiveTab("workout");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>Mark Stretching Routine Done & Unlock Weekly Workout & Daily Action Plan</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

              {/* Tab 3: Weekly Workout Program */}
              {activeTab === "workout" && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 space-y-6">
                  
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-[#D32F2F]" />
                        ADAPTIVE WEEKLY TRAINING
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Scaled for <span className="text-[#D32F2F] font-bold">{userLevel}</span> athletes training at <span className="text-[#D32F2F] font-bold">{userLocation}</span>.
                      </p>
                    </div>

                    <button 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_workout_complete`)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                        progress[`c${activeChallenge.id}_workout_complete`]
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {progress[`c${activeChallenge.id}_workout_complete`] ? "Weekly Workout Done ✓" : "Mark Workout Done"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {getDynamicWorkoutProgram(activeChallenge.title, userLevel, userLocation).map((dayProg, idx) => (
                      <div 
                        key={idx}
                        className="p-6 rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-left space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#D32F2F]" />
                          <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                            {dayProg.day}
                          </h4>
                        </div>
                        
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">DYNAMIC WARM-UP</span>
                          <p>{dayProg.warmUp}</p>
                        </div>

                        <div className="h-px bg-slate-200/50 dark:bg-slate-800" />

                        <div className="space-y-4">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">MAIN EXERCISES</span>
                          {dayProg.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="bg-white dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-800/85 rounded-xl flex flex-col sm:flex-row gap-5 items-stretch">
                              {/* Centralized Exercise Demonstration GIF/Video */}
                              <div className="w-full sm:w-44 h-28 shrink-0 rounded-lg overflow-hidden shadow-xs">
                                <WorkoutVisual 
                                  exerciseName={getMatchedExerciseName(ex.name)} 
                                  className="h-full w-full" 
                                  isCard={true} 
                                />
                              </div>

                              <div className="flex-grow flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start gap-4">
                                    <h5 className="font-bold text-xs uppercase text-[#D32F2F]">{ex.name}</h5>
                                    <span className="bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded text-[9px] font-mono text-slate-500 font-bold uppercase">{ex.reps}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                                    {ex.coaching}
                                  </p>
                                </div>
                                <div className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-2">
                                  Rest Protocol: {ex.rest}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="h-px bg-slate-200/50 dark:bg-slate-800" />

                        <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">ACTIVE COOL-DOWN</span>
                          <p>{dayProg.coolDown}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        if (!isWorkoutCompleted) {
                          toggleCheck(`c${activeChallenge.id}_workout_complete`);
                        }
                        setActiveTab("habits");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <span>Mark Workout Completed & Go to Daily Action Plan</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

              {/* Tab 4: Habits checklist */}
              {activeTab === "habits" && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 space-y-6 text-left">
                  
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      DAILY LIFESTYLE HABITS TRACKER
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Check off your habits daily to earn consistency achievements & build high-performance wellness.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Habit card 1: Walking after meals */}
                    <div 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_habit_walk_after_meals`)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        progress[`c${activeChallenge.id}_habit_walk_after_meals`]
                          ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-[#D32F2F]">LIFESTYLE HUB</span>
                          <h4 className="text-sm font-black uppercase">Walk 15 Minutes After Meals</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            Complete a continuous low-impact stroll after lunch or dinner to reduce blood sugar spikes by 22%.
                          </p>
                        </div>
                        <div className={`p-1.5 rounded-full ${progress[`c${activeChallenge.id}_habit_walk_after_meals`] ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}>
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Habit card 2: Daily Hydration */}
                    <div 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_habit_hydration`)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        progress[`c${activeChallenge.id}_habit_hydration`]
                          ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-indigo-500">HYDRATION SCORE</span>
                          <h4 className="text-sm font-black uppercase">Meet Water Volume ({activeChallenge.habits.hydrationOz} oz)</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            {activeChallenge.habits.nutritionTip}
                          </p>
                        </div>
                        <div className={`p-1.5 rounded-full ${progress[`c${activeChallenge.id}_habit_hydration`] ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}>
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Habit card 3: Sleep Recommendation */}
                    <div 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_habit_sleep`)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        progress[`c${activeChallenge.id}_habit_sleep`]
                          ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-amber-500">SLEEP REST</span>
                          <h4 className="text-sm font-black uppercase">Sleep Goal ({activeChallenge.habits.sleepHours} Hours)</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            {activeChallenge.habits.recoveryTip}
                          </p>
                        </div>
                        <div className={`p-1.5 rounded-full ${progress[`c${activeChallenge.id}_habit_sleep`] ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}>
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Habit card 4: Daily Movement */}
                    <div 
                      onClick={() => toggleCheck(`c${activeChallenge.id}_habit_movement_reminder`)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        progress[`c${activeChallenge.id}_habit_movement_reminder`]
                          ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white"
                          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-purple-500">RECOVERY ADVOCATE</span>
                          <h4 className="text-sm font-black uppercase">Daily Active Movement Break</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            Stand up, roll back your shoulders, and complete 2 minutes of active chest extensions.
                          </p>
                        </div>
                        <div className={`p-1.5 rounded-full ${progress[`c${activeChallenge.id}_habit_movement_reminder`] ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}>
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        toggleCheck(`c${activeChallenge.id}_habits_complete`);
                        setActiveChallengeId(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Complete Entire Challenge Course & Earn Academy Badge</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR 1 COL: PROGRESS AND COACH REVIEWS */}
            <div className="space-y-6">
              
              {/* BRANDED EMAIL DISPATCHER CONSOLE */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-left border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full filter blur-lg pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#D32F2F] shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Coach Action Plan Dispatcher
                    </h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Have Coach Alex send a customized action plan, stretching guides, daily habits checklist, and an official progress appreciation directly to your inbox.
                  </p>

                  <div className="space-y-2">
                    {user?.email ? (
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-left">
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">ATHLETE RECIPIENT</span>
                        <span className="font-mono text-slate-300 font-semibold">{user.email}</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">ENTER RECIPIENT EMAIL</label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D32F2F] placeholder-slate-600 transition"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSendEmailTrigger(activeChallenge)}
                    disabled={isSendingEmail}
                    className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-800 disabled:text-slate-500 text-white font-sans font-black text-[11px] uppercase rounded-xl tracking-wider transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
                  >
                    {isSendingEmail ? (
                      <>
                        <span className="animate-pulse">DISPATCHING PLAN...</span>
                      </>
                    ) : (
                      <>
                        <span>EMAIL ME MY PLAN</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Feedback Status */}
                  {emailStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border text-[11px] font-bold ${
                        emailStatus.success 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-left" 
                          : "bg-red-950/20 border-red-500/30 text-red-400 text-left"
                      }`}
                    >
                      {emailStatus.message}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Course Progress Breakdown */}
              <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Course Progression Checklist</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="prog_science" 
                      checked={progress[`c${activeChallenge.id}_science_complete`] || false}
                      onChange={() => toggleCheck(`c${activeChallenge.id}_science_complete`)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#D32F2F] focus:ring-[#D32F2F] h-4 w-4"
                    />
                    <label htmlFor="prog_science" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">
                      Read scientific explanation
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="prog_stretch" 
                      checked={progress[`c${activeChallenge.id}_stretching_complete`] || false}
                      onChange={() => toggleCheck(`c${activeChallenge.id}_stretching_complete`)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#D32F2F] focus:ring-[#D32F2F] h-4 w-4"
                    />
                    <label htmlFor="prog_stretch" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">
                      Completed Daily Stretching
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="prog_workout" 
                      checked={progress[`c${activeChallenge.id}_workout_complete`] || false}
                      onChange={() => toggleCheck(`c${activeChallenge.id}_workout_complete`)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#D32F2F] focus:ring-[#D32F2F] h-4 w-4"
                    />
                    <label htmlFor="prog_workout" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">
                      Completed Weekly Workout
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="prog_walk" 
                      checked={progress[`c${activeChallenge.id}_habit_walk_after_meals`] || false}
                      onChange={() => toggleCheck(`c${activeChallenge.id}_habit_walk_after_meals`)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#D32F2F] focus:ring-[#D32F2F] h-4 w-4"
                    />
                    <label htmlFor="prog_walk" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">
                      Strolled 15m after major meal
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="prog_water" 
                      checked={progress[`c${activeChallenge.id}_habit_hydration`] || false}
                      onChange={() => toggleCheck(`c${activeChallenge.id}_habit_hydration`)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#D32F2F] focus:ring-[#D32F2F] h-4 w-4"
                    />
                    <label htmlFor="prog_water" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">
                      Met daily hydration volume
                    </label>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  <Coffee className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>Check off milestones above or inside tabs. Your consistency streak goes up with every checked habit!</p>
                </div>
              </div>

              {/* Achievements Box */}
              <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Unlocked Achievements</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase text-slate-900 dark:text-white leading-none">POSTURE ROOKIE</span>
                      <span className="text-[10px] text-slate-400 font-medium">Completed first desk-body corrective slide.</span>
                    </div>
                  </div>

                  {streak >= 3 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900 dark:text-white leading-none">HABIT FLAME</span>
                        <span className="text-[10px] text-slate-400 font-medium">Logged a streak of 3 active daily habits.</span>
                      </div>
                    </div>
                  )}

                  {totalTasksCompleted >= 5 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900 dark:text-white leading-none">LIFESTYLE SCHOLAR</span>
                        <span className="text-[10px] text-slate-400 font-medium">Completed 5 educational actions inside the academy.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
