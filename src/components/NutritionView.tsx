import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { auth } from "../lib/firebase";
import PageHero from "./PageHero";
import { 
  Apple, Flame, Award, HelpCircle, Utensils, RotateCcw, 
  Sparkles, Check, ChevronRight, CheckCircle2, ChevronDown,
  Camera, UploadCloud, TrendingUp, PlusCircle, Droplet
} from "lucide-react";

interface SeedMeal {
  name: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  serving: string;
  ingredients: string[];
}

export default function NutritionView() {
  const { user } = useApp();
  const [activeCategory, setActiveCategory] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [selectedMeals, setSelectedMeals] = useState<Record<string, SeedMeal>>({});
  const [customCalorieInput, setCustomCalorieInput] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // AI Calorie Calculator & Snapshot Analyzer States
  const [analyzerText, setAnalyzerText] = useState("");
  const [analyzerImage, setAnalyzerImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [analyzerImageName, setAnalyzerImageName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<any | null>(null);
  const [analyzerError, setAnalyzerError] = useState("");

  // AI Daily Meal Planner States
  const [selectedGoal, setSelectedGoal] = useState<"loss fat" | "gain muscles" | "build muscles">("loss fat");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlanText, setGeneratedPlanText] = useState<string | null>(null);
  const [plannerError, setPlannerError] = useState("");

  // Convert uploaded image file to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzerImageName(file.name);
    setAnalyzerError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const cleanBase64 = base64Data.split(",")[1];
      setAnalyzerImage({
        data: cleanBase64,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      setAnalyzerError("Failed to convert the selected food image.");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeFood = async () => {
    if (!analyzerText && !analyzerImage) {
      setAnalyzerError("Please describe your food or snap/upload an image of what you have!");
      return;
    }
    setIsAnalyzing(true);
    setAnalyzerError("");
    setAnalyzerResult(null);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch("/api/gemini/analyze-food", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: analyzerText,
          image: analyzerImage,
        }),
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: false, error: "Malformed server response" };
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned status code ${response.status}`);
      }

      if (data.success && data.result) {
        setAnalyzerResult(data.result);
      } else {
        setAnalyzerError(data.error || "Failed to analyze food calories accurately. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setAnalyzerError(`Food Analysis Error: ${err.message || "Network error occurred during visual or text calibration."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDailyPlan = async () => {
    setIsGeneratingPlan(true);
    setPlannerError("");
    setGeneratedPlanText(null);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch("/api/gemini/nutrition-planner", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ goal: selectedGoal }),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: false, error: "Malformed server response" };
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned status code ${response.status}`);
      }

      if (data.success && data.text) {
        setGeneratedPlanText(data.text);
      } else {
        setPlannerError(data.error || "Could not retrieve plan from backend. Try again.");
      }
    } catch (err: any) {
      console.error(err);
      setPlannerError(`AI Nutrition Planner Error: ${err.message || "Failed to connect to AI nutrition agent."}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAddAnalyzedMealToSelection = () => {
    if (!analyzerResult) return;
    const { foodName, calories, protein, carbs, fat, fiber, sugar } = analyzerResult;
    
    const mealItem: SeedMeal = {
      name: foodName,
      type: "Snack",
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      serving: analyzerResult.serving || "Analyzed portion",
      ingredients: ["Custom AI Analyzed Ingredient"],
    };

    setSelectedMeals(prev => ({
      ...prev,
      Snack: mealItem
    }));

    setSuccessToast(`Successfully added "${foodName}" to Snack calculations!`);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  // Miffln-St Jeor TDEE Math
  const metrics = useMemo(() => {
    // Falls back to safe averages if user hasn't finished onboarding or is guest
    const weight = user?.weight || 78;
    const height = user?.height || 176;
    const age = user?.age || 26;
    const isMale = user?.gender !== "Female";
    const goal = user?.fitnessGoals || "Lose Weight";
    const activity = user?.activityLevel || "Moderately Active";

    // 1. Calculate Basal Metabolic Rate (BMR)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (isMale) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 2. Activity Multiplier
    let multiplier = 1.375;
    if (activity.includes("Sedentary")) multiplier = 1.2;
    else if (activity.includes("Light")) multiplier = 1.375;
    else if (activity.includes("Moderat")) multiplier = 1.55;
    else if (activity.includes("Very") || activity.includes("Super")) multiplier = 1.725;

    const tdee = bmr * multiplier;

    // 3. Goal Calorie Offset
    let targetCalories = tdee;
    if (goal.includes("Lose")) {
      targetCalories -= 500;
    } else if (goal.includes("Gain") || goal.includes("Muscle")) {
      targetCalories += 350;
    } else {
      targetCalories -= 100; // recomposition slight deficit
    }

    const finalCalories = Math.round(targetCalories);

    // 4. Macro Subdivisions
    // Protein: 2g/kg bodyweight
    const proteinGrams = Math.round(weight * 2.0);
    const proteinKcal = proteinGrams * 4;

    // Fat: 25% of target
    const fatKcal = finalCalories * 0.25;
    const fatGrams = Math.round(fatKcal / 9);

    // Carbs: Remainder of target
    const remainingKcal = finalCalories - proteinKcal - fatKcal;
    const carbGrams = Math.round(Math.max(50, remainingKcal / 4));

    return {
      weight,
      height,
      age,
      goal,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: finalCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    };
  }, [user]);

  // Actual macro databases focusing on elite West African and International bodybuilding items
  const mealDatabase: SeedMeal[] = [
    // BREAKFAST
    {
      name: "High-Protein Oatmeal & Sliced Banana",
      type: "Breakfast",
      calories: 390,
      protein: 24,
      carbs: 58,
      fat: 6,
      fiber: 9,
      sugar: 12,
      serving: "1 Bowl",
      ingredients: ["1 cup Rolled Oats", "1 scoop Whey Isolate or Pea Protein", "1/2 medium Banana", "1 tbsp Chia seeds"]
    },
    {
      name: "Akara (Bean Cakes) & Egg White Scramble",
      type: "Breakfast",
      calories: 420,
      protein: 28,
      carbs: 40,
      fat: 12,
      fiber: 8,
      sugar: 3,
      serving: "3 pieces of Akara + 3 scrambled whites",
      ingredients: ["Ewa Oloyin (Honey beans) pureed", "3 large Egg whites + 1 whole egg", "Minced habanerros & onions", "1 tsp Light vegetable oil spraying"]
    },
    {
      name: "Steamed Moi Moi & Custard Fit",
      type: "Breakfast",
      calories: 360,
      protein: 20,
      carbs: 48,
      fat: 7,
      fiber: 6,
      sugar: 4,
      serving: "1 large Leaf wrap of Moi Moi + light custard cup",
      ingredients: ["Beans hull removed", "Ground bell peppers", "1 boiled egg inside wrap for protein peak", "Steamed leaves anchor"]
    },

    // LUNCH
    {
      name: "Jollof Rice with Charbroiled Chicken Breast",
      type: "Lunch",
      calories: 630,
      protein: 48,
      carbs: 72,
      fat: 14,
      fiber: 4,
      sugar: 5,
      serving: "250g Jollof Rice + 180g skinless Chicken Breast",
      ingredients: ["Basmati Parboiled Rice", "Blended Tomatoes, Red Tatashe, and onions", "Grilled chicken breast with garlic rub", "Baked sweet plantain slices (2 pcs)"]
    },
    {
      name: "Masan Gida Brown Rice & Grilled Tilapia",
      type: "Lunch",
      calories: 540,
      protein: 42,
      carbs: 64,
      fat: 10,
      fiber: 7,
      sugar: 2,
      serving: "200g Brown rice + 150g Fresh Tilapia fillet",
      ingredients: ["Whole grain brown local rice", "Lime-infused Tilapia fish baked", "Steamed spinach leaves with red onions"]
    },
    {
      name: "Honey Sweet Potatoes & Ground Turkey",
      type: "Lunch",
      calories: 580,
      protein: 40,
      carbs: 68,
      fat: 12,
      fiber: 8,
      sugar: 9,
      serving: "250g Roasted Sweet Potato cuboids + 150g Turkey paste",
      ingredients: ["Organic local sweet potatoes", "93% Lean ground Turkey stir-fry", "Bell pepper garnishing"]
    },

    // DINNER
    {
      name: "Egusi Soup with Oat swallow & Grilled Catfish",
      type: "Dinner",
      calories: 680,
      protein: 45,
      carbs: 55,
      fat: 22,
      fiber: 9,
      sugar: 3,
      serving: "1 cup Egusi + 1 medium ball Oat swallow + catfish slice",
      ingredients: ["Melon seeds grounded", "Fresh fluted pumpkin greens", "Finely blended oat grain wrap", "Oven baked wild catfish"]
    },
    {
      name: "Efo Riro (Rich Spinach Salad) & Baked Salmon",
      type: "Dinner",
      calories: 510,
      protein: 44,
      carbs: 22,
      fat: 24,
      fiber: 5,
      sugar: 2,
      serving: "1.5 cups Efo Riro + 150g Pink Salmon flake",
      ingredients: ["Shoko or Tete wild spinach", "Iru (locust beans) aromatic", "Wild pink salmon baked under thyme and lemon", "Crayfish stock infusion"]
    },
    {
      name: "Yam Porridge with Peppered Meat cubes",
      type: "Dinner",
      calories: 610,
      protein: 38,
      carbs: 78,
      fat: 13,
      fiber: 7,
      sugar: 4,
      serving: "200g Yam porridge + 3 Peppered Beef chunks",
      ingredients: ["Puna white yam", "Palm oil seasoning reduction (1 tsp)", "Lean beef cubes pressure-cooked", "Green leaves garnish"]
    },

    // SNACKS
    {
      name: "Garden Eggs & Peanut Butter Paste",
      type: "Snack",
      calories: 220,
      protein: 8,
      carbs: 18,
      fat: 14,
      fiber: 5,
      sugar: 6,
      serving: "2 native white garden eggs + 1.5 tbsp peanut spread",
      ingredients: ["Raw garden eggs", "Salt-free organic peanut butter paste"]
    },
    {
      name: "Plantain Chips & Roasted Cashews",
      type: "Snack",
      calories: 290,
      protein: 6,
      carbs: 32,
      fat: 16,
      fiber: 3,
      sugar: 8,
      serving: "1 Cup",
      ingredients: ["Air-baked unripe green plantain chips", "Unsalted roasted cashew cores"]
    },
    {
      name: "Whey Shake & Handful of Pawpaw (Papaya) cubes",
      type: "Snack",
      calories: 240,
      protein: 26,
      carbs: 28,
      fat: 2,
      fiber: 4,
      sugar: 15,
      serving: "1 Shaker",
      ingredients: ["1 scoop Vanilla whey isolate", "Water or unsweetened almond milk", "100g Fresh Pawpaw wedges"]
    }
  ];

  const filteredMeals = useMemo(() => {
    return mealDatabase.filter(m => m.type === activeCategory);
  }, [activeCategory]);

  // Log summary
  const currentSelectionsLog = useMemo(() => {
    const values = Object.values(selectedMeals) as SeedMeal[];
    const sumCal = values.reduce((acc, current) => acc + current.calories, 0);
    const sumProt = values.reduce((acc, current) => acc + current.protein, 0);
    const sumCarbs = values.reduce((acc, current) => acc + current.carbs, 0);
    const sumFat = values.reduce((acc, current) => acc + current.fat, 0);


    return {
      calories: sumCal,
      protein: sumProt,
      carbs: sumCarbs,
      fat: sumFat
    };
  }, [selectedMeals]);

  const handleSelectMeal = (meal: SeedMeal) => {
    setSelectedMeals(prev => {
      const next = { ...prev };
      if (next[meal.type]?.name === meal.name) {
        delete next[meal.type]; // Toggle off
      } else {
        next[meal.type] = meal;
      }
      return next;
    });
  };

  const handleApplyDiet = () => {
    setSuccessToast("Personalized diet routine locked directly to active calorie targets!");
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  const handleResetMeals = () => {
    setSelectedMeals({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* HEADER INDEX CARDS */}
      <PageHero
        title="African & International Macro Hub"
        subtitle="Nutrition Calibration Engine"
        description="Real BMR algorithms calibrated to dietary preferences, African foods (Egusi, Jollof, Akara, Fufu, Plantains), and healthy macro subdivisions. Fully customized daily nutrition targets."
        imageUrl="https://ntfb.org/wp-content/uploads/2024/11/meal-prepping.jpg"
        category="MACRONUTRIENT BALANCE"
      />

      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 animate-pulse flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {successToast}
        </div>
      )}

      {/* 🚀 AI CO-PILOT: SNAP CALORIE RECOGNIZER & PLANNER ROW */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* CARD A: REAL-TIME CALORIE CALCULATOR & IMAGE SNAPPING */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#C0392B] font-mono uppercase tracking-widest bg-[#C0392B]/10 px-2.5 py-1 rounded-full">
                SNAP & LOG
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">ACCURATE MULTIMODAL AI</span>
            </div>
            
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C0392B]" />
              AI Food Snap & Calorie Analyzer
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Describe what you ate or upload/drag a snap image of your food, and our AI will calculate accurate proteins, carbs, fats, and fiber in real-time.
            </p>

            {/* Input field */}
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Describe what you ate</label>
                <input
                  type="text"
                  value={analyzerText}
                  onChange={(e) => setAnalyzerText(e.target.value)}
                  placeholder="e.g., 2 slices of whole wheat toast with sliced avocado and 2 fried eggs"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#C0392B]"
                />
              </div>

              {/* Upload image slot */}
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Or Snap / Upload Food Image</label>
                <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-150">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                      {analyzerImageName ? `Selected: ${analyzerImageName}` : "Click to snap or drag food photo"}
                    </span>
                    <span className="text-[9px] text-slate-400">Supports PNG, JPG (Max 5MB)</span>
                  </div>
                </div>
              </div>
            </div>

            {analyzerError && (
              <p className="text-[11px] text-[#C0392B] bg-[#C0392B]/5 px-3 py-2 rounded-lg font-mono mt-3">
                {analyzerError}
              </p>
            )}

            {/* Results output if analyzed */}
            {analyzerResult && (
              <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-3 animate-fade-in text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono uppercase">{analyzerResult.foodName}</span>
                  <span className="text-emerald-500 font-mono font-black text-sm">{analyzerResult.calories} kCal</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="font-bold text-sky-500">{analyzerResult.protein}g</div>
                    <div className="text-[8px] text-slate-450 uppercase">Protein</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="font-bold text-amber-500">{analyzerResult.carbs}g</div>
                    <div className="text-[8px] text-slate-450 uppercase">Carbs</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div className="font-bold text-emerald-500">{analyzerResult.fat}g</div>
                    <div className="text-[8px] text-slate-450 uppercase">Fat</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-mono text-slate-500">
                  <div>Fiber: <strong>{analyzerResult.fiber}g</strong></div>
                  <div>Sugar: <strong>{analyzerResult.sugar}g</strong></div>
                </div>

                <div className="p-2.5 bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-xl text-[10px] text-[#1E3A8A] dark:text-blue-300 leading-relaxed">
                  <strong>Serving:</strong> {analyzerResult.serving || "1 serving"}. {analyzerResult.explanation}
                </div>

                <button
                  type="button"
                  onClick={handleAddAnalyzedMealToSelection}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black font-mono uppercase tracking-widest transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add to Selected Daily Menu
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyzeFood}
            className="w-full mt-6 py-3 bg-[#1C1C1C] dark:bg-white text-white dark:text-slate-950 hover:opacity-90 rounded-2xl text-xs font-black font-mono uppercase tracking-widest transition flex items-center justify-center gap-2 shadow disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                Analyzing food macros...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-550" />
                Analyze food calories & macros
              </>
            )}
          </button>
        </div>

        {/* CARD B: PERSONALIZED AI DIET GENERATOR (FAT LOSS, MUSCLE, CUCUMBER PROTOCOL) */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-emerald-500 font-mono uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
                AI PLANNER
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">NATURAL MEAL EXPERT</span>
            </div>

            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              AI Daily Meal & Hydration Planner
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Get an customized daily whole-food meal plan, hydration guidelines, and cucumber & lemon detox instructions.
            </p>

            {/* Selector Goal Buttons */}
            <div className="mt-5 space-y-3">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">Select your goal</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "loss fat", label: "Loss Fat" },
                  { key: "gain muscles", label: "Gain Muscle" },
                  { key: "build muscles", label: "Build Muscle" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedGoal(item.key as any)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                      selectedGoal === item.key
                        ? "bg-[#C0392B] border-[#C0392B] text-white shadow-md shadow-[#C0392B]/10"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {plannerError && (
              <p className="text-[11px] text-[#C0392B] bg-[#C0392B]/5 px-3 py-2 rounded-lg font-mono mt-3">
                {plannerError}
              </p>
            )}

            {/* Output markdown text scroll view */}
            {generatedPlanText && (
              <div className="mt-5 p-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 space-y-3 animate-fade-in text-xs max-h-[250px] overflow-y-auto custom-scrollbar leading-relaxed text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1 text-emerald-600 font-mono font-black text-[10px] uppercase border-b border-emerald-500/10 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Your Custom Whole-Food Blueprint
                </div>
                
                <div className="space-y-4 whitespace-pre-line font-sans leading-relaxed text-[11px]">
                  {generatedPlanText}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl text-[10px] text-slate-500 font-medium">
              <Droplet className="w-5 h-5 text-sky-500 shrink-0" />
              <span>Includes specific guidance on the <strong>Cucumber & Lemon 2-Liter Hydration Protocol</strong> 3-4x weekly!</span>
            </div>
            
            <button
              type="button"
              disabled={isGeneratingPlan}
              onClick={handleGenerateDailyPlan}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black font-mono uppercase tracking-widest transition flex items-center justify-center gap-2 shadow disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPlan ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                  Generating custom plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate custom meal plan
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* THREE SECTION GRID BENTO LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* SECTION 1: DETAILED CALORIE TARGETS CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest mb-4 flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-500" />
              My Basal Calibration
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">Basal Metabolism (BMR):</span>
                <strong className="text-slate-900 dark:text-white font-mono">{metrics.bmr} kCal</strong>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400 font-sans">
                <span className="font-mono">Daily TDEE Maintenance:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{metrics.tdee} kCal</strong>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">Specific Target Formula:</span>
                <strong className="text-slate-900 dark:text-emerald-400 uppercase font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">{user?.fitnessGoals || "Weight Loss"}</strong>
              </div>
            </div>

            {/* Smart target circular slider meters */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">My Ideal Macronutrient Targets</h4>
              
              <div className="space-y-3">
                {/* Protein */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-sky-500 font-bold">Protein (2.0g/kg)</span>
                    <span className="text-slate-800 dark:text-white font-bold">{metrics.protein}g / {metrics.protein * 4} kCal</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-amber-500 font-bold">Carbohydrates</span>
                    <span className="text-slate-800 dark:text-white font-bold">{metrics.carbs}g / {metrics.carbs * 4} kCal</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-emerald-500 font-bold">Fats (25%)</span>
                    <span className="text-slate-800 dark:text-white font-bold">{metrics.fat}g / {metrics.fat * 9} kCal</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE GENERATION TRACKER PANEL */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-mono tracking-widest">
                My Selected Menu
              </h3>
              {Object.keys(selectedMeals).length > 0 && (
                <button 
                  onClick={handleResetMeals} 
                  className="text-[10px] text-slate-500 hover:text-rose-500 font-mono uppercase font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {Object.keys(selectedMeals).length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                Choose custom African/International meals from the directory to construct your daily plan.
              </div>
            ) : (
              <div className="space-y-3">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map(tType => {
                  const m = selectedMeals[tType];
                  if (!m) return null;
                  return (
                    <div key={tType} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-800/60 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 font-mono uppercase bg-slate-200 dark:bg-slate-850 px-1 py-0.5 rounded">{tType}</span>
                        <h4 className="font-extrabold text-slate-900 dark:text-white mt-1 truncate max-w-[150px]">{m.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{m.serving}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-500 font-mono font-black">{m.calories} kCal</span>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">P: {m.protein}g | C: {m.carbs}g</p>
                      </div>
                    </div>
                  );
                })}

                {/* Summary calculation progress vs TDEE target */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2 mt-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Intake Total:</span>
                    <strong className="text-slate-900 dark:text-white">{currentSelectionsLog.calories} / {metrics.calories} kCal</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Protein Total:</span>
                    <strong className="text-slate-900 dark:text-white">{currentSelectionsLog.protein} / {metrics.protein}g</strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 text-xs">
                    <div 
                      className={`h-full rounded-full ${currentSelectionsLog.calories > metrics.calories ? "bg-rose-500" : "bg-emerald-555"}`} 
                      style={{ width: `${Math.min(100, (currentSelectionsLog.calories / metrics.calories) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyDiet}
                  className="w-full mt-3 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-black font-mono uppercase tracking-widest transition shadow"
                >
                  Lock Selected Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 & 3: MEALS DIRECTORY */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recipes & Dishes Catalog
              </h3>
              <p className="text-xs text-slate-500">Choose meal components to align with targets.</p>
            </div>

            {/* TAB SELECTORS CLASSIFIER */}
            <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-150 dark:border-slate-850 self-start">
              {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider transition-all ${
                    activeCategory === tab
                      ? "bg-white dark:bg-slate-950 text-emerald-500 shadow"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC LIST CARD COMPONENT */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredMeals.map((meal) => {
              const isSelected = selectedMeals[meal.type]?.name === meal.name;
              return (
                <div 
                  key={meal.name} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-900/5" 
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{meal.name}</h4>
                      <span className="text-emerald-500 font-mono font-extrabold text-xs whitespace-nowrap bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {meal.calories} kcal
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono italic block mt-1">Serves: {meal.serving}</span>

                    {/* METICULOUS MACROS DISPLAY */}
                    <div className="grid grid-cols-5 gap-1.5 mt-3.5 mb-3.5 border-t border-b border-dashed border-slate-150 dark:border-slate-850/80 py-2.5 text-center text-[10px] font-mono">
                      <div>
                        <div className="font-bold text-sky-500">{meal.protein}g</div>
                        <div className="text-[8px] text-slate-450 uppercase uppercase">Prot</div>
                      </div>
                      <div>
                        <div className="font-bold text-amber-500">{meal.carbs}g</div>
                        <div className="text-[8px] text-slate-450 uppercase uppercase">Carb</div>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-500">{meal.fat}g</div>
                        <div className="text-[8px] text-slate-450 uppercase">Fat</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-500">{meal.fiber}g</div>
                        <div className="text-[8px] text-slate-450 uppercase">Fibr</div>
                      </div>
                      <div>
                        <div className="font-bold text-rose-500">{meal.sugar}g</div>
                        <div className="text-[8px] text-slate-450 uppercase">Sugr</div>
                      </div>
                    </div>

                    {/* INGREDIENTS */}
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono font-bold uppercase text-slate-450">Key Ingredients:</div>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map(ing => (
                          <span key={ing} className="text-[9px] py-0.5 px-2 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-full font-sans">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectMeal(meal)}
                    className={`w-full mt-4 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-950 shadow"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </>
                    ) : (
                      "Set as default"
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
