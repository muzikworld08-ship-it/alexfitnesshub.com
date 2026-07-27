import { getExerciseGifUrl } from "./exercises";

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface Workout {
  id: string;
  name: string;
  category: "Category 1" | "Category 2" | "Category 3";
  targetMuscle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string; // e.g., "45 Minutes"
  caloriesBurned: number;
  equipmentNeeded: string;
  imageUrl: string;
  description: string;
  exercises: WorkoutExercise[];
}

export const WORKOUT_CATEGORIES_INFO = [
  {
    id: "Chest",
    name: "Chest",
    desc: "Target pectoralis major and minor with progressive loading chest presses, flyes, and crossovers.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7G_JEDmUiLxTLVwV35owlnJssH_3TLx1qdCmEWF9WOZ4WfE9mFQL1ZpQ&s=10"
  },
  {
    id: "Back",
    name: "Back",
    desc: "Sculpt wide lats, deep rhomboids, thick traps, and strong lower back columns with pulling motions.",
    img: "https://learn.athleanx.com/wp-content/uploads/2021/10/BACK-MAIN-IMAGE.png"
  },
  {
    id: "Legs",
    name: "Legs",
    desc: "Build exceptional quadriceps, hamstring, and calf volume with heavy compound squats, lunges, and extensions.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu1FzIxIDBVWh8cl3ljSi7uOZRG6cJo8gEi9JplQA-6nddkhOxAtv-JY8&s=10"
  },
  {
    id: "Shoulders",
    name: "Shoulders",
    desc: "Construct capped, rounded shoulders targeting anterior, lateral, and posterior deltoid zones.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3l3iY0Sp_psk9M0u-J_Wk_YG0BfvXGIfAPbFMXbcu8ClzkB0ETbix_Do&s=10"
  },
  {
    id: "Arms",
    name: "Arms",
    desc: "Build high-peak biceps and horseshoe triceps with precise curl and pushdown mechanical patterns.",
    img: "https://i.ytimg.com/vi/WHOVzjoZ3KY/maxresdefault.jpg"
  },
  {
    id: "Core",
    name: "Core",
    desc: "Forge deep rectus abdominis pillars, transverse stabilization, and sharp, rotating obliques.",
    img: "https://learn.athleanx.com/wp-content/uploads/2024/09/CORE-TRAINING-1.jpg"
  },
  {
    id: "Glutes",
    name: "Glutes",
    desc: "Maximize hip extension power, gluteus medius, and posterior chain strength with glute bridges and deadlifts.",
    img: "https://i.ytimg.com/vi/sY4vJ2uajjY/maxresdefault.jpg"
  },
  {
    id: "Bodyweight",
    name: "Bodyweight",
    desc: "Develop incredible relative strength and body awareness using push-ups, pull-ups, dips, and planks.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-89uZaleE8506y-CMEmQT9-GMnzZVZidcyy7NO1UhF6z5d3I9NJaXf-Q&s=10"
  },
  {
    id: "HIIT",
    name: "HIIT",
    desc: "Burn massive calories and build aerobic capacity with high-intensity intervals and full-body cardio drills.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0zUD-tf3S36BlF7nFuYHCgclj4PQ-wpdig15HDTW_XV9EttoCvPUM4E0&s=10"
  },
  {
    id: "Fat Burning",
    name: "Fat Burning",
    desc: "Accelerate metabolic conditioning, ignite lipolysis, and shred body fat with high-tempo target sessions.",
    img: "https://i.ytimg.com/vi/T2de9yQv-yc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDXYdVILMIN7nnFzJLRsAXDN7vQXQ"
  },
  {
    id: "Strength",
    name: "Strength",
    desc: "Overload your structural power capacity and thick athletic compound pull/press mechanics.",
    img: "https://i.ytimg.com/vi/S1GKOQIIjbs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCURtfjspsvQ5WZj4AHkPdhD0YHkg"
  },
  {
    id: "Cardio",
    name: "Cardio",
    desc: "Boost lung capacity, heart health, and endurance with high-stamina fat-burning exercises.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvRjmXYGr4ScWcYhRHIfOSA8izGD8gzBUGHx5Lf_iB0BZA0s6lujN7OiT&s=10"
  }
];

export const WORKOUTS_DATABASE: Workout[] = [
  // ================= CATEGORY 1 =================
  {
    id: "cellulite-bodyweight",
    name: "10 Best Bodyweight Exercises to Get Rid of Cellulite",
    category: "Category 1",
    targetMuscle: "Glutes & Hamstrings",
    difficulty: "Beginner",
    duration: "30 Minutes",
    caloriesBurned: 240,
    equipmentNeeded: "Bodyweight Only",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "A targeted lower body sequence focusing on building muscle density and improving circulation in glutes and legs to smooth skin appearance.",
    exercises: [
      { name: "Glute Bridges", sets: "3", reps: "15", rest: "30 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Bulgarian Split Squat", sets: "3", reps: "12 each side", rest: "45 seconds" },
      { name: "Lunges", sets: "3", reps: "15 each leg", rest: "30 seconds" },
      { name: "Step Up", sets: "3", reps: "12 each side", rest: "30 seconds" },
      { name: "Donkey Kicks", sets: "3", reps: "15 each side", rest: "30 seconds" },
      { name: "Fire Hydrant", sets: "3", reps: "15 each side", rest: "30 seconds" },
      { name: "Single Leg Hip Thrust", sets: "2", reps: "12 each side", rest: "45 seconds" }
    ]
  },
  {
    id: "slim-waist-routine",
    name: "Slim Waist Workout Routine",
    category: "Category 1",
    targetMuscle: "Transverse Abdominis & Obliques",
    difficulty: "Beginner",
    duration: "20 Minutes",
    caloriesBurned: 180,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Cinch your waistline using deep core exercises that pull the stomach in like a vacuum, strengthening the inner corset.",
    exercises: [
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Russian Twist", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Dead Bug", sets: "3", reps: "12 each side", rest: "30 seconds" },
      { name: "Flutter Kicks", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Side Plank", sets: "2", reps: "30 seconds each leg", rest: "30 seconds" }
    ]
  },
  {
    id: "lower-body-strength-no-equip",
    name: "No Equipment Lower Body Strength Exercises",
    category: "Category 1",
    targetMuscle: "Legs & Glutes",
    difficulty: "Intermediate",
    duration: "25 Minutes",
    caloriesBurned: 220,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    description: "Build robust quadriceps and powerful gluteus muscle groups purely with mechanical bodyweight progressions.",
    exercises: [
      { name: "Bodyweight Squats", sets: "4", reps: "25", rest: "30 seconds" },
      { name: "Lunges", sets: "3", reps: "16 step-backs", rest: "30 seconds" },
      { name: "Pistol Squat", sets: "3", reps: "6 each side", rest: "60 seconds" },
      { name: "Glute Bridges", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Wall Sit", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Jump Squats", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "best-rotator-cuff",
    name: "The Best Rotator Cuff Exercises",
    category: "Category 1",
    targetMuscle: "Rotator Cuff & Shoulders",
    difficulty: "Beginner",
    duration: "15 Minutes",
    caloriesBurned: 90,
    equipmentNeeded: "Light Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    description: "Stabilize your shoulder sockets, release clavicle restriction, and strengthen the infraspinatus and teres minor.",
    exercises: [
      { name: "Arm Circles", sets: "3", reps: "20 circles", rest: "20 seconds" },
      { name: "Wall Slides", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Lateral Raises", sets: "3", reps: "12 (Very Light)", rest: "30 seconds" },
      { name: "Front Raises", sets: "3", reps: "12 (Very Light)", rest: "30 seconds" },
      { name: "Rear Delt Fly", sets: "3", reps: "15 (Very Light)", rest: "30 seconds" }
    ]
  },
  {
    id: "beginner-full-body",
    name: "Full Body Workout Routine For Beginners",
    category: "Category 1",
    targetMuscle: "Total Body Integration",
    difficulty: "Beginner",
    duration: "40 Minutes",
    caloriesBurned: 260,
    equipmentNeeded: "Light Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "An excellent baseline sequence introducing basic pushing, pulling, and squatting movements under strict kinesiologist supervision.",
    exercises: [
      { name: "Push Ups", sets: "3", reps: "10 (or on knees)", rest: "45 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Dumbbell Row", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Plank", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Dumbbell Curl", sets: "2", reps: "12", rest: "30 seconds" }
    ]
  },
  {
    id: "complete-abs-workout",
    name: "Complete Abs Workout",
    category: "Category 1",
    targetMuscle: "Rectus Abdominis & Obliques",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 190,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Activate every segment of the abdominal wall from high ribcage to lower pelvic floor columns.",
    exercises: [
      { name: "Crunch", sets: "4", reps: "20", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Russian Twist", sets: "3", reps: "24 twists", rest: "30 seconds" },
      { name: "Leg Raise", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" }
    ]
  },
  {
    id: "rounder-butt",
    name: "Rounder Butt Workout",
    category: "Category 1",
    targetMuscle: "Glutes & Hip Abductors",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 250,
    equipmentNeeded: "Resistance Band Optional",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "Construct athletic glute curves by targeting the gluteus maximus, medius, and outer abductor fibers.",
    exercises: [
      { name: "Hip Thrust", sets: "4", reps: "15", rest: "45 seconds" },
      { name: "Donkey Kicks", sets: "3", reps: "15 each side", rest: "30 seconds" },
      { name: "Fire Hydrant", sets: "3", reps: "15 each side", rest: "30 seconds" },
      { name: "Glute Bridges", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "20 (Wide Stance)", rest: "30 seconds" },
      { name: "Single Leg Hip Thrust", sets: "2", reps: "10 each side", rest: "45 seconds" }
    ]
  },
  {
    id: "exercises-for-bigger-breasts",
    name: "8 Exercises for Bigger Breasts",
    category: "Category 1",
    targetMuscle: "Pectoralis Major & Under-Bust",
    difficulty: "Intermediate",
    duration: "35 Minutes",
    caloriesBurned: 260,
    equipmentNeeded: "Full Gym or Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "Lift and tone the pectoral musculature to improve structural posture and create an athletic chest frame.",
    exercises: [
      { name: "Barbell Bench Press", sets: "3", reps: "10", rest: "60 seconds" },
      { name: "Dumbbell Chest Press", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Chest Dips", sets: "3", reps: "8 to 10", rest: "60 seconds" },
      { name: "Machine Chest Press", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Pec Deck Fly", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Push Ups", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Dumbbell Fly", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "best-12-posture",
    name: "The Best 12 Posture Exercises",
    category: "Category 1",
    targetMuscle: "Thoracic Extension & Upper Back",
    difficulty: "Beginner",
    duration: "40 Minutes",
    caloriesBurned: 220,
    equipmentNeeded: "Bodyweight & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "A complete therapeutic program to reverse forward-head rounded shoulder slump and activate key stabilizers.",
    exercises: [
      { name: "Wall Slides", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Arm Circles", sets: "3", reps: "20 circles each way", rest: "20 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Face Pulls", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Back Extension", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Dead Bug", sets: "3", reps: "10 each side", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "beach-body-routine",
    name: "Beach Body Workout Routine",
    category: "Category 1",
    targetMuscle: "Total Body Lean Sculpt",
    difficulty: "Intermediate",
    duration: "45 Minutes",
    caloriesBurned: 380,
    equipmentNeeded: "Jump Rope & Bodyweight",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    description: "Combine metabolic fat oxidation with full body muscular stimulation for a beach-ready, athletic frame.",
    exercises: [
      { name: "Burpees", sets: "4", reps: "12", rest: "45 seconds" },
      { name: "Jump Rope", sets: "4", reps: "60 seconds", rest: "30 seconds" },
      { name: "Bodyweight Squats", sets: "4", reps: "20", rest: "30 seconds" },
      { name: "Push Ups", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "obliques-workout",
    name: "Obliques Workout",
    category: "Category 1",
    targetMuscle: "Lateral Core Columns",
    difficulty: "Intermediate",
    duration: "20 Minutes",
    caloriesBurned: 160,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Tighten and trace the obliques and transverse serratus for sharp abdominal framing.",
    exercises: [
      { name: "Russian Twist", sets: "4", reps: "24", rest: "30 seconds" },
      { name: "Side Plank", sets: "3", reps: "40 seconds each side", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "24", rest: "30 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "40 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "flabby-arm-workout",
    name: "Flabby Arm Workout",
    category: "Category 1",
    targetMuscle: "Biceps & Triceps Toning",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 180,
    equipmentNeeded: "Light Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    description: "Tone the posterior upper arms to eliminate sag and construct sleek, tight muscle density.",
    exercises: [
      { name: "Triceps Pushdown", sets: "3", reps: "15", rest: "30 seconds" },
      { name: "Dumbbell Curl", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Hammer Curl", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Dips", sets: "3", reps: "10 (or bench support)", rest: "45 seconds" },
      { name: "Dumbbell Kickbacks", sets: "3", reps: "12 each side", rest: "30 seconds" }
    ]
  },
  {
    id: "inner-chest-workout",
    name: "Inner Chest Workout",
    category: "Category 1",
    targetMuscle: "Sternal Pectoralis Fibers",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 240,
    equipmentNeeded: "Cables & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "Target the sternal cleavage lines of your chest for a deep, full, separated look.",
    exercises: [
      { name: "Diamond Push Up", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Cable Chest Fly", sets: "4", reps: "15", rest: "45 seconds" },
      { name: "Pec Deck Fly", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Machine Chest Press", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "upper-chest-workout",
    name: "Upper Chest Workout",
    category: "Category 1",
    targetMuscle: "Clavicular Pectoralis Head",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 250,
    equipmentNeeded: "Barbell & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "Flesh out the high clavicular head of the chest to avoid a flat look and fill upper-chest gaps.",
    exercises: [
      { name: "Incline Dumbbell Press", sets: "4", reps: "10", rest: "60 seconds" },
      { name: "Decline Bench Press", sets: "3", reps: "12", rest: "60 seconds" },
      { name: "Dumbbell Fly", sets: "3", reps: "12 (Incline Angle)", rest: "45 seconds" },
      { name: "Push Ups", sets: "3", reps: "15 (Decline Angle)", rest: "45 seconds" }
    ]
  },
  {
    id: "at-home-full-body",
    name: "At Home Full Body Workout (No Equipment)",
    category: "Category 1",
    targetMuscle: "Total Body Conditioning",
    difficulty: "Beginner",
    duration: "30 Minutes",
    caloriesBurned: 230,
    equipmentNeeded: "Zero Equipment",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    description: "Get moving with this clinical, highly efficient cardio-conditioning bodyweight routine.",
    exercises: [
      { name: "Push Ups", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Lunges", sets: "3", reps: "12 each leg", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "30 seconds", rest: "30 seconds" }
    ]
  },

  // ================= CATEGORY 2 =================
  {
    id: "barbell-free-weights",
    name: "2 Barbell Free Weights Workout",
    category: "Category 2",
    targetMuscle: "Posterior & Anterior Chains",
    difficulty: "Advanced",
    duration: "50 Minutes",
    caloriesBurned: 420,
    equipmentNeeded: "Barbell Rack",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Master heavy compound mechanical barbell drives to optimize maximum athletic torque.",
    exercises: [
      { name: "Barbell Squat", sets: "4", reps: "8", rest: "90 seconds" },
      { name: "Barbell Bench Press", sets: "4", reps: "8", rest: "90 seconds" },
      { name: "Barbell Row", sets: "4", reps: "8", rest: "75 seconds" },
      { name: "Overhead Barbell Press", sets: "3", reps: "10", rest: "75 seconds" },
      { name: "Deadlift", sets: "3", reps: "5", rest: "120 seconds" }
    ]
  },
  {
    id: "the-300-workout",
    name: "The 300 Workout",
    category: "Category 2",
    targetMuscle: "Extreme Conditioning Overload",
    difficulty: "Advanced",
    duration: "45 Minutes",
    caloriesBurned: 550,
    equipmentNeeded: "Pullup Bar & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "The hardcore legendary Spartan-calibrated stamina track. Perform with extreme mechanical discipline.",
    exercises: [
      { name: "Pull Ups", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Deadlift", sets: "3", reps: "12", rest: "60 seconds" },
      { name: "Push Ups", sets: "3", reps: "25", rest: "45 seconds" },
      { name: "Jump Squats", sets: "3", reps: "20", rest: "45 seconds" },
      { name: "Dumbbell Row", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "25", rest: "30 seconds" }
    ]
  },
  {
    id: "five-min-total-abs",
    name: "5 Min Total Abs Workout",
    category: "Category 2",
    targetMuscle: "Abdominals Core Burnout",
    difficulty: "Intermediate",
    duration: "5 Minutes",
    caloriesBurned: 70,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "A fast, non-stop, high-intensity abdominal corset burn. Complete one exercise right after another.",
    exercises: [
      { name: "Crunch", sets: "1", reps: "60 seconds", rest: "0 seconds" },
      { name: "Plank", sets: "1", reps: "60 seconds", rest: "0 seconds" },
      { name: "Bicycle Crunch", sets: "1", reps: "60 seconds", rest: "0 seconds" },
      { name: "Russian Twist", sets: "1", reps: "60 seconds", rest: "0 seconds" },
      { name: "Mountain Climber", sets: "1", reps: "60 seconds", rest: "0 seconds" }
    ]
  },
  {
    id: "bodyweight-strength",
    name: "Bodyweight Strength Workout",
    category: "Category 2",
    targetMuscle: "Calisthenics Conditioning",
    difficulty: "Intermediate",
    duration: "35 Minutes",
    caloriesBurned: 290,
    equipmentNeeded: "Pullup Bar & Parallel Bars",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Gain total control of your bodyweight across advanced calisthenic compound progressions.",
    exercises: [
      { name: "Push Ups", sets: "4", reps: "20", rest: "45 seconds" },
      { name: "Pull Ups", sets: "4", reps: "8 to 10", rest: "60 seconds" },
      { name: "Dips", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "25", rest: "30 seconds" },
      { name: "Lunges", sets: "3", reps: "16 paces", rest: "30 seconds" },
      { name: "Pistol Squat", sets: "2", reps: "5 each leg", rest: "60 seconds" },
      { name: "Plank", sets: "3", reps: "60 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "beginner-leg-workout",
    name: "Beginner Leg Workout",
    category: "Category 2",
    targetMuscle: "Quads & Hamstrings Foundation",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 200,
    equipmentNeeded: "Gym Machines & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "Begin building safe knee flexion and strong hip drives with structured machines.",
    exercises: [
      { name: "Bodyweight Squats", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Lunges", sets: "3", reps: "10 each side", rest: "45 seconds" },
      { name: "Leg Extension", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Leg Curl", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Calf Raises", sets: "3", reps: "15", rest: "30 seconds" }
    ]
  },
  {
    id: "beginner-bodyweight-workout",
    name: "Beginner Bodyweight Workout",
    category: "Category 2",
    targetMuscle: "Total Body General Fitness",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 190,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    description: "A friendly introduction to bodyweight movements, perfect for active calorie burn at home.",
    exercises: [
      { name: "Push Ups", sets: "3", reps: "8 to 10", rest: "45 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Lunges", sets: "3", reps: "10 step-backs", rest: "45 seconds" },
      { name: "Plank", sets: "3", reps: "30 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "shoulder-beginner",
    name: "Shoulder Workout for Beginners",
    category: "Category 2",
    targetMuscle: "Deltoid Cap Profiles",
    difficulty: "Beginner",
    duration: "20 Minutes",
    caloriesBurned: 150,
    equipmentNeeded: "Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    description: "Build clean, stable shoulders and safe rotator caps using light dumbbell movements.",
    exercises: [
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Lateral Raises", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Front Raises", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Shrugs", sets: "3", reps: "15", rest: "30 seconds" }
    ]
  },
  {
    id: "chest-back-superset",
    name: "Chest and Back Superset Workout",
    category: "Category 2",
    targetMuscle: "Opposing Upper Torso Groups",
    difficulty: "Advanced",
    duration: "45 Minutes",
    caloriesBurned: 410,
    equipmentNeeded: "Barbell & Cable Machine",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "The gold standard Arnold Arnold-inspired program. Alternate pushing and pulling to induce maximum blood flow.",
    exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "10", rest: "0 seconds" },
      { name: "Pull Ups", sets: "4", reps: "8", rest: "90 seconds" },
      { name: "Dumbbell Chest Press", sets: "3", reps: "12", rest: "0 seconds" },
      { name: "Barbell Row", sets: "3", reps: "10", rest: "90 seconds" },
      { name: "Dumbbell Fly", sets: "3", reps: "12", rest: "0 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "90 seconds" }
    ]
  },
  {
    id: "interval-running-speed",
    name: "200m Interval Running Workout For Speed",
    category: "Category 2",
    targetMuscle: "Anaerobic Energy Thresholds",
    difficulty: "Advanced",
    duration: "30 Minutes",
    caloriesBurned: 480,
    equipmentNeeded: "Track or Treadmill",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    description: "Accelerate speed capacity and metabolic afterburn with high-intensity sprinting intervals.",
    exercises: [
      { name: "Mountain Climber", sets: "1", reps: "5 minute warm-up", rest: "0 seconds" },
      { name: "Jump Rope", sets: "5", reps: "200m Sprint (Full Force)", rest: "90 seconds walk" },
      { name: "Bodyweight Squats", sets: "4", reps: "15 recovery deeps", rest: "30 seconds" }
    ]
  },
  {
    id: "fifteen-min-hiit",
    name: "15-Minute HIIT Workout for Beginners",
    category: "Category 2",
    targetMuscle: "Full Body Fat Afterburn",
    difficulty: "Intermediate",
    duration: "15 Minutes",
    caloriesBurned: 260,
    equipmentNeeded: "Zero Equipment",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    description: "Unleash metabolic distress in minimum time with heavy fat burning bursts.",
    exercises: [
      { name: "Burpees", sets: "3", reps: "45 seconds", rest: "15 seconds" },
      { name: "Jump Rope", sets: "3", reps: "45 seconds", rest: "15 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "45 seconds", rest: "15 seconds" },
      { name: "Bodyweight Squats", sets: "3", reps: "45 seconds (Speedy)", rest: "15 seconds" }
    ]
  },
  {
    id: "sexy-butt-abs",
    name: "Sexy Butt and Abs Workout",
    category: "Category 2",
    targetMuscle: "Glutes & Core Columns",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 270,
    equipmentNeeded: "Bodyweight",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "An intensive double-target track framing the abs while lifting the gluteal muscles.",
    exercises: [
      { name: "Hip Thrust", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Glute Bridges", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Crunch", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Donkey Kicks", sets: "2", reps: "15 each side", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" }
    ]
  },
  {
    id: "intermediate-leg-workout",
    name: "Intermediate Leg Workout for Building Muscle",
    category: "Category 2",
    targetMuscle: "Leg Volume Hypertrophy",
    difficulty: "Intermediate",
    duration: "40 Minutes",
    caloriesBurned: 340,
    equipmentNeeded: "Barbell & Leg Press Machine",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "Deep quad loading and direct hamstring stretches for complete leg development.",
    exercises: [
      { name: "Barbell Squat", sets: "4", reps: "10", rest: "75 seconds" },
      { name: "Romanian Deadlift", sets: "3", reps: "10", rest: "60 seconds" },
      { name: "Bulgarian Split Squat", sets: "3", reps: "10 each side", rest: "60 seconds" },
      { name: "Leg Press", sets: "3", reps: "12", rest: "60 seconds" },
      { name: "Calf Raises", sets: "3", reps: "15", rest: "30 seconds" }
    ]
  },
  {
    id: "pyramid-chest",
    name: "Pyramid Chest Workout Routine",
    category: "Category 2",
    targetMuscle: "Pectoralis Fiber Density",
    difficulty: "Advanced",
    duration: "40 Minutes",
    caloriesBurned: 350,
    equipmentNeeded: "Dumbbells & Barbell",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "Ascending weight pyramids (12, 10, 8, 6 reps) designed to fully exhaust pectoral thresholds.",
    exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "12/10/8/6 reps", rest: "90 seconds" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "12/10/8 reps", rest: "75 seconds" },
      { name: "Dumbbell Chest Press", sets: "3", reps: "12/10/8 reps", rest: "75 seconds" },
      { name: "Cable Chest Fly", sets: "3", reps: "15", rest: "45 seconds" }
    ]
  },
  {
    id: "complete-arm-workout",
    name: "The Complete Arm Workout",
    category: "Category 2",
    targetMuscle: "Biceps Peaks & Triceps Arms",
    difficulty: "Intermediate",
    duration: "35 Minutes",
    caloriesBurned: 290,
    equipmentNeeded: "EZ-Bar & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    description: "Squeeze the bicep long head and overload the tricep lateral head to build absolute arm thickness.",
    exercises: [
      { name: "Barbell Curl", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Triceps Pushdown", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Hammer Curl", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Skull Crushers", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Preacher Curl", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Close Grip Bench Press", sets: "3", reps: "8", rest: "60 seconds" }
    ]
  },
  {
    id: "neck-strengthening",
    name: "Neck Strengthening Exercises",
    category: "Category 2",
    targetMuscle: "Cervical Spine Support",
    difficulty: "Beginner",
    duration: "15 Minutes",
    caloriesBurned: 80,
    equipmentNeeded: "No Equipment",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    description: "Realign posture and strengthen deep neck flexing stabilizers to reduce stress from computer work.",
    exercises: [
      { name: "Arm Circles", sets: "3", reps: "15 backward-circles", rest: "20 seconds" },
      { name: "Wall Slides", sets: "3", reps: "10", rest: "30 seconds" },
      { name: "Overhead Barbell Press", sets: "2", reps: "12 (Very Light)", rest: "45 seconds" }
    ]
  },

  // ================= CATEGORY 3 =================
  {
    id: "back-bigger-wing",
    name: "3 Back Workout For a Bigger Back",
    category: "Category 3",
    targetMuscle: "Lats Width & Rhomboids Thickness",
    difficulty: "Intermediate",
    duration: "45 Minutes",
    caloriesBurned: 390,
    equipmentNeeded: "Full Gym Equipment",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "A complete workout designed to build a wider, thicker, and stronger back while improving posture and overall pulling strength.",
    exercises: [
      { name: "Arm Circles", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Wall Slides", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Barbell Row", sets: "3", reps: "10", rest: "60 seconds" },
      { name: "Lat Pulldown", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Deadlift", sets: "3", reps: "8", rest: "90 seconds" },
      { name: "Rear Delt Fly", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Back Extension", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "ultimate-back",
    name: "Ultimate Back Workout",
    category: "Category 3",
    targetMuscle: "Total Posterior Expansion",
    difficulty: "Advanced",
    duration: "50 Minutes",
    caloriesBurned: 420,
    equipmentNeeded: "Heavy Gym Rack",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "Maximize posterior wing projection with heavy deadlifts, pullups, and wide grip pulldown sets.",
    exercises: [
      { name: "Deadlift", sets: "4", reps: "6", rest: "90 seconds" },
      { name: "Pull Ups", sets: "4", reps: "8 to 10", rest: "60 seconds" },
      { name: "Barbell Row", sets: "3", reps: "10", rest: "60 seconds" },
      { name: "Lat Pulldown", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Face Pulls", sets: "3", reps: "15", rest: "45 seconds" }
    ]
  },
  {
    id: "back-beginner",
    name: "Back Workout For Beginners",
    category: "Category 3",
    targetMuscle: "Lats & Lower Back Core",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 180,
    equipmentNeeded: "Machines & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "A friendly routine building proper back retraction mechanics without spinal column strain.",
    exercises: [
      { name: "Lat Pulldown", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Dumbbell Row", sets: "3", reps: "12 each side", rest: "45 seconds" },
      { name: "Back Extension", sets: "3", reps: "12", rest: "30 seconds" }
    ]
  },
  {
    id: "ultimate-back-fat-burn",
    name: "Ultimate Back Fat Burning Workout",
    category: "Category 3",
    targetMuscle: "Posterior Afterburn & Lats",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 350,
    equipmentNeeded: "Bodyweight & Machine",
    imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80",
    description: "High intensity posterior chain intervals targeting excess fat and water weight under shoulders and lats.",
    exercises: [
      { name: "Burpees", sets: "3", reps: "10", rest: "30 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "30 seconds", rest: "30 seconds" },
      { name: "Jump Rope", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Seated Cable Row", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Lat Pulldown", sets: "3", reps: "12", rest: "30 seconds" }
    ]
  },
  {
    id: "home-back-fat-burn",
    name: "At Home Back Fat Burning Workout",
    category: "Category 3",
    targetMuscle: "Back Definition & Cardio",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 260,
    equipmentNeeded: "Bodyweight & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80",
    description: "Melt excess fat and sculpt clean, athletic back margins directly from home with simple gear.",
    exercises: [
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Mountain Climber", sets: "3", reps: "45 seconds", rest: "30 seconds" },
      { name: "Dumbbell Row", sets: "3", reps: "15 each side", rest: "30 seconds" },
      { name: "Plank", sets: "3", reps: "45 seconds", rest: "30 seconds" }
    ]
  },
  {
    id: "three-hundred-cal-hiit",
    name: "300 Calorie HIIT Workout",
    category: "Category 3",
    targetMuscle: "Max Rate Metabolic Afterburn",
    difficulty: "Intermediate",
    duration: "20 Minutes",
    caloriesBurned: 320,
    equipmentNeeded: "Zero Equipment",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    description: "Melt over 300 kcal fast in 20 short minutes using compound full body aerobic surges.",
    exercises: [
      { name: "Burpees", sets: "4", reps: "12", rest: "15 seconds" },
      { name: "Jump Rope", sets: "4", reps: "45 seconds", rest: "15 seconds" },
      { name: "Mountain Climber", sets: "4", reps: "45 seconds", rest: "15 seconds" },
      { name: "Jump Squats", sets: "4", reps: "15", rest: "15 seconds" }
    ]
  },
  {
    id: "biceps-peak-workout",
    name: "Biceps Workout",
    category: "Category 3",
    targetMuscle: "Biceps Peak & Thickness",
    difficulty: "Intermediate",
    duration: "25 Minutes",
    caloriesBurned: 190,
    equipmentNeeded: "Barbell & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    description: "Build absolute sleeve-tearing bicep height and brachialis thickness.",
    exercises: [
      { name: "Barbell Curl", sets: "4", reps: "10", rest: "45 seconds" },
      { name: "Dumbbell Curl", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Hammer Curl", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Preacher Curl", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Concentration Curl", sets: "3", reps: "12 each side", rest: "30 seconds" }
    ]
  },
  {
    id: "triceps-horseshoe-workout",
    name: "Triceps Workout",
    category: "Category 3",
    targetMuscle: "Triceps Horseshoe Lateral Head",
    difficulty: "Intermediate",
    duration: "25 Minutes",
    caloriesBurned: 190,
    equipmentNeeded: "EZ-Bar & Cables",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    description: "Blast the back of your arms with high-tension cables and compound skull crushers.",
    exercises: [
      { name: "Triceps Pushdown", sets: "4", reps: "12", rest: "45 seconds" },
      { name: "Skull Crushers", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Dips", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Dumbbell Kickbacks", sets: "3", reps: "12 each side", rest: "30 seconds" },
      { name: "Overhead Triceps Extension", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "chest-beginner-track",
    name: "Chest Workout Beginner",
    category: "Category 3",
    targetMuscle: "Pectoral Mass Foundation",
    difficulty: "Beginner",
    duration: "25 Minutes",
    caloriesBurned: 180,
    equipmentNeeded: "Dumbbells & Machine",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "Establish strong pushing mechanics and build active chest tissue density.",
    exercises: [
      { name: "Dumbbell Chest Press", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Dumbbell Fly", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Push Ups", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Machine Chest Press", sets: "3", reps: "12", rest: "45 seconds" }
    ]
  },
  {
    id: "shoulder-intermediate-track",
    name: "Shoulder Workout Intermediate Level",
    category: "Category 3",
    targetMuscle: "Lateral & Rear Deltoids",
    difficulty: "Intermediate",
    duration: "30 Minutes",
    caloriesBurned: 240,
    equipmentNeeded: "Barbell & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    description: "Construct wide, round capped shoulders by emphasizing intermediate lateral and rear head volume.",
    exercises: [
      { name: "Overhead Barbell Press", sets: "4", reps: "10", rest: "60 seconds" },
      { name: "Arnold Press", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Lateral Raises", sets: "3", reps: "12", rest: "30 seconds" },
      { name: "Rear Delt Fly", sets: "3", reps: "15", rest: "30 seconds" },
      { name: "Upright Row", sets: "3", reps: "10", rest: "45 seconds" }
    ]
  },
  {
    id: "core-build-up",
    name: "Core Build Up Workout",
    category: "Category 3",
    targetMuscle: "Deep Corset Stabilizers",
    difficulty: "Intermediate",
    duration: "25 Minutes",
    caloriesBurned: 190,
    equipmentNeeded: "Gym Gear & Bodyweight",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Heavy core loading designed to secure the pelvis, align spinal discs, and carve deep abs.",
    exercises: [
      { name: "Hanging Leg Raise", sets: "3", reps: "12", rest: "45 seconds" },
      { name: "Cable Crunch", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Plank", sets: "3", reps: "60 seconds", rest: "30 seconds" },
      { name: "Russian Twist", sets: "3", reps: "20", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" }
    ]
  },
  {
    id: "summer-body-routine",
    name: "Summer Body Workout",
    category: "Category 3",
    targetMuscle: "Full Body Muscular Definition",
    difficulty: "Advanced",
    duration: "45 Minutes",
    caloriesBurned: 410,
    equipmentNeeded: "Full Body Weight & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=80",
    description: "An intense, sweat-heavy full body circuit perfect for peaking before beach season.",
    exercises: [
      { name: "Burpees", sets: "4", reps: "12", rest: "30 seconds" },
      { name: "Jump Squats", sets: "4", reps: "15", rest: "30 seconds" },
      { name: "Push Ups", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", rest: "45 seconds" },
      { name: "Plank", sets: "3", reps: "60 seconds", rest: "30 seconds" },
      { name: "Bicycle Crunch", sets: "3", reps: "20", rest: "30 seconds" }
    ]
  },
  {
    id: "powerbuilding-bench",
    name: "Powerbuilding Bench Press Routine",
    category: "Category 3",
    targetMuscle: "Chest & Triceps",
    difficulty: "Advanced",
    duration: "45 Minutes",
    caloriesBurned: 380,
    equipmentNeeded: "Barbell & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=80",
    description: "A dual-purpose strength and volume builder for heavy bench drives and chest hypertrophy.",
    exercises: [
      { name: "Barbell Bench Press", sets: "5", reps: "5", rest: "120 seconds" },
      { name: "Incline Dumbbell Press", sets: "4", reps: "10", rest: "90 seconds" },
      { name: "Dips", sets: "3", reps: "12", rest: "60 seconds" },
      { name: "Triceps Pushdown", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Dumbbell Fly", sets: "3", reps: "12", rest: "60 seconds" }
    ]
  },
  {
    id: "heavy-deadlift",
    name: "Heavy Deadlift Strength Builder",
    category: "Category 3",
    targetMuscle: "Hamstrings & Lower Back",
    difficulty: "Advanced",
    duration: "50 Minutes",
    caloriesBurned: 450,
    equipmentNeeded: "Barbell & Gym Rack",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    description: "Build exceptional pulling power and posterior chain thickness with heavy barbell pulls.",
    exercises: [
      { name: "Deadlift", sets: "5", reps: "5", rest: "180 seconds" },
      { name: "Barbell Row", sets: "4", reps: "8", rest: "90 seconds" },
      { name: "Lat Pulldown", sets: "3", reps: "12", rest: "60 seconds" },
      { name: "Hamstring Curl", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Back Extension", sets: "3", reps: "12", rest: "60 seconds" }
    ]
  },
  {
    id: "advanced-leg-press",
    name: "Advanced Leg Press Hypertrophy",
    category: "Category 3",
    targetMuscle: "Quadriceps & Glutes",
    difficulty: "Intermediate",
    duration: "40 Minutes",
    caloriesBurned: 360,
    equipmentNeeded: "Leg Press & Dumbbells",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    description: "Overload the quadriceps and glutes safely with heavy leg presses and unilateral dumbbell splits.",
    exercises: [
      { name: "Leg Press", sets: "4", reps: "12", rest: "90 seconds" },
      { name: "Bulgarian Split Squat", sets: "3", reps: "10 each side", rest: "75 seconds" },
      { name: "Leg Extension", sets: "3", reps: "15", rest: "45 seconds" },
      { name: "Calf Raises", sets: "4", reps: "20", rest: "45 seconds" },
      { name: "Goblet Squat", sets: "3", reps: "12", rest: "60 seconds" }
    ]
  }
];

export function getWorkoutMappedCategory(workout: Workout): string {
  const nameLower = workout.name.toLowerCase();
  const muscleLower = workout.targetMuscle.toLowerCase();
  const descLower = workout.description.toLowerCase();
  
  if (nameLower.includes("chest") || muscleLower.includes("chest") || muscleLower.includes("pectoralis")) return "Chest";
  if (nameLower.includes("back") || muscleLower.includes("back") || muscleLower.includes("lats") || muscleLower.includes("rhomboids")) return "Back";
  if (nameLower.includes("glute") || muscleLower.includes("glute")) return "Glutes";
  if (nameLower.includes("leg") || nameLower.includes("squat") || muscleLower.includes("leg") || muscleLower.includes("quad") || muscleLower.includes("hamstring")) return "Legs";
  if (nameLower.includes("shoulder") || muscleLower.includes("shoulder") || muscleLower.includes("deltoid")) return "Shoulders";
  if (nameLower.includes("arm") || nameLower.includes("bicep") || nameLower.includes("tricep") || muscleLower.includes("arm") || muscleLower.includes("tricep") || nameLower.includes("bench")) return "Arms";
  if (nameLower.includes("core") || nameLower.includes("ab ") || nameLower.includes("abs") || muscleLower.includes("core") || muscleLower.includes("abdominis")) return "Core";
  if (nameLower.includes("hiit") || nameLower.includes("interval") || muscleLower.includes("hiit")) return "HIIT";
  if (nameLower.includes("bodyweight") || nameLower.includes("home") || nameLower.includes("no equipment") || workout.equipmentNeeded.toLowerCase().includes("no equipment") || workout.equipmentNeeded.toLowerCase().includes("bodyweight")) return "Bodyweight";
  if (nameLower.includes("fat") || nameLower.includes("shred") || nameLower.includes("burn") || muscleLower.includes("burn")) return "Fat Burning";
  if (nameLower.includes("strength") || nameLower.includes("heavy") || nameLower.includes("deadlift") || nameLower.includes("power") || nameLower.includes("barbell")) return "Strength";
  if (nameLower.includes("cardio") || nameLower.includes("cycle")) return "Cardio";
  
  // Fallback maps
  if (workout.category === "Category 1") return "Fat Burning";
  if (workout.category === "Category 2") return "HIIT";
  return "Strength";
}

