export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "admin";
  subscriptionStatus: "free" | "premium";
  subscriptionTier: "monthly" | "yearly" | "none";
  subscriptionExpiry?: string | null;
  subscriptionPlan?: "monthly" | "yearly" | "multi" | "none";
  subscriptionActivationDate?: string;
  paymentReference?: string;
  fitnessGoals?: string;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: string;
  createdAt?: string;

  // Onboarding & Personalization Details
  onboarded?: boolean;
  age?: number;
  targetWeight?: number;
  activityLevel?: string;
  workoutExperience?: string;
  workoutPreference?: string;
  dietaryPreference?: string;
  availableDays?: number;
  trainingLocation?: "Home" | "Gym";

  // Detailed AI Coach Onboarding Fields
  availableEquipment?: string;
  foodAllergies?: string;
  healthRestrictions?: string;
  dailySchedule?: string;
  wakeUpTime?: string;
  bedTime?: string;
  countryRegion?: string;

  // Hydration Daily Progress
  waterGoal?: number; // calculated target in ml
  waterIntakeToday?: number; // accumulated ml
  waterLastLogged?: string; // date string YYYY-MM-DD
  status?: string;
  isBlocked?: boolean;
}

export interface SavedWorkout {
  id: string; // exercise ID
  savedAt: string;
}

export interface ActivityLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string; // ISO string
  weight?: number; // logged load
  reps?: number;
  duration?: string; // duration of cardiovascular
  notes?: string;
}

export interface WeightGoalLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  bodyFat?: number; // optional %
}

export interface PaystackTransaction {
  id: string;
  reference: string;
  amount: number;
  plan: "monthly" | "yearly" | "multi";
  status: string;
  paidAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  message: string;
  timestamp: string;
}

// Social Community Post
export interface CommunityPost {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  content: string;
  category: "Progress Picture" | "Workout Result" | "Transformation Story" | "Achievement" | "General Discussion" | "Challenge";
  imageUrl?: string;
  likes: string[]; // list of user Uids
  comments: {
    id: string;
    userId: string;
    userDisplayName: string;
    content: string;
    createdAt: string;
  }[];
  reports?: string[]; // list of user Uids who reported it
  status: "active" | "moderated" | "reported";
  createdAt: string; // ISO string
}

// Dedicated Success Testimonial (Success Story)
export interface Testimonial {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  category: "Weight Loss" | "Muscle Building" | "General Journey" | "Transformation Story";
  rating: number; // 1-5 star rating
  content: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  approved: boolean; // Needs admin approval before listed globally
  createdAt: string; // ISO string
}

export interface PopupTestimonial {
  id: string;
  name: string;
  country: string;
  avatar: string;
  rating: number;
  review: string;
  membership_plan: string;
  created_at: string;
  status: "enabled" | "disabled";
  action?: string;
  timeText?: string;
}

export interface CustomProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  schedule: {
    day: string;
    focus: string;
    exercises: {
      id: string;
      name: string;
      sets: number;
      reps: number;
      notes?: string;
    }[];
    mealPlan?: string;
  }[];
}

export interface VitalsLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  restingHeartRate: number; // in bpm
  sleepDuration: number; // in hours
}

export interface WorkoutLibraryFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedMuscleGroup: string;
  selectedEquipment: string;
  selectedExerciseType: string;
  selectedTrainingGoal: string;
  activeBrowseTab: "bodyparts" | "cardio" | "mobility" | "programs" | "all";
}

