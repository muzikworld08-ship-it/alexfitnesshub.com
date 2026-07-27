import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Exercise } from "../data/exercises";
import { auth } from "../lib/firebase";
import { 
  Sparkles, Search, Dumbbell, Play, CheckCircle2, Bookmark, BookmarkCheck,
  Award, ShieldAlert, Heart, Calendar, HelpCircle, RefreshCw, ChevronRight, Zap
} from "lucide-react";

export default function WorkoutGeneratorView() {
  const { user, addExerciseToLibrary, toggleSaveWorkout, savedWorkouts, exercises } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedExercise, setGeneratedExercise] = useState<Exercise | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedExercise(null);
    setSuccessToast(null);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const response = await fetch("/api/gemini/generate-search-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ workoutName: searchQuery }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: false, error: "Malformed server response" };
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned error status ${response.status}`);
      }

      if (data.success && data.exercise) {
        const exercise: Exercise = data.exercise;
        
        // Ensure standard id format
        if (!exercise.id) {
          exercise.id = "gen_" + Math.random().toString(36).substring(7);
        }
        // Force premium flag for the dynamic libraries
        exercise.isPremium = true;

        // Save to Shared Exercise Library
        await addExerciseToLibrary(exercise);
        setGeneratedExercise(exercise);
        setSuccessToast(`"${exercise.name}" successfully generated and saved to the premium site exercise library!`);
        
        // Clear toast after 4 seconds
        setTimeout(() => {
          setSuccessToast(null);
        }, 5000);
      } else {
        throw new Error(data.error || "Failed to structure customized mechanics.");
      }
    } catch (err: any) {
      console.error(err);
      setError(`AI Generator Error: ${err.message || "Failed to structure customized mechanics."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isSaved = generatedExercise ? savedWorkouts.includes(generatedExercise.id) : false;

  const handleSaveToggle = async () => {
    if (!generatedExercise) return;
    await toggleSaveWorkout(generatedExercise.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-slate-900 dark:text-slate-100 space-y-8">
      
      {/* Header section with Premium visual theme */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
          <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
          On-Demand Generative Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-slate-950 dark:text-white">
          AI On-Demand <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-emerald-400 dark:to-teal-300">Workout Generator</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          Search, build, and formulate biomechanically precise guides for any exercise style or raw drill on earth. Generated workouts are dynamically injected directly into the premium site exercise library.
        </p>
      </div>

      {/* Dynamic Search & Generator Input Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <label className="block text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Enter Any Kind of Workout or Movement
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="e.g., 'Kettlebell snatch to overhead lunge', 'Spanish squat holds', 'Clapping pushups'..."
                value={searchQuery}
                disabled={isGenerating}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-955 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 placeholder:text-slate-400 font-sans shadow-inner transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !searchQuery.trim()}
              className="bg-blue-600 dark:bg-emerald-500 text-white font-bold font-sans text-xs uppercase px-6 py-3.5 rounded-2xl hover:opacity-90 active:scale-95 duration-150 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-md"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Formulating Mechanics...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generate Exercise
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase select-none">AI Presets:</span>
          {[
            "Kettlebell Windmill",
            "Sissy Squat",
            "Pike Push Up Progression",
            "Hanging Windshield Wipers"
          ].map(term => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800-alt border border-slate-200 dark:border-slate-850 text-[10px] rounded-lg font-sans text-slate-600 dark:text-slate-400 transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Operation Toast Success / Error */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-550/20 text-emerald-500 text-xs font-sans flex items-start gap-2.5 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-extrabold block">Added to Premium Exercise Cabinet</span>
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-sans flex items-start gap-2.5 animate-slide-down">
          <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-extrabold block">Engine Interruption</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading Skeletal State */}
      {isGenerating && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-850" />
            ))}
          </div>
        </div>
      )}

      {/* Generated Blueprint View */}
      {generatedExercise && !isGenerating && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-down">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-500 py-0.5 px-2.5 border border-emerald-500/20 rounded-full">
                  {generatedExercise.category}
                </span>
                <span className="text-[9px] font-mono font-extrabold uppercase bg-blue-500/10 text-blue-500 py-0.5 px-2.5 border border-blue-500/20 rounded-full flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Premium Exercise
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-none mt-2">
                {generatedExercise.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToggle}
                className={`p-3 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold ${
                  isSaved
                    ? "bg-slate-900 text-white border-transparent dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    Saved to Bookmarks
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save Workout
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Equipment</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                    {generatedExercise.equipment.join(", ") || "Bodyweight"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Difficulty</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                    {generatedExercise.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 flex items-center gap-2.5 flex-1 col-span-2 sm:col-span-1">
                <Heart className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Target Muscle Group</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                    {generatedExercise.muscleGroups.join(", ") || "Target Muscles"}
                  </span>
                </div>
              </div>

            </div>

            {/* Structured instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Step-by-Step Execution Sequence
              </h3>
              <ol className="space-y-3 pl-1">
                {generatedExercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-blue-500 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-sans">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Scientific Biomechanics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-150 dark:border-slate-850">
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 dark:text-slate-500">
                  1. Starting Position Setup
                </span>
                <p className="text-xs leading-relaxed text-slate-705 dark:text-slate-305 font-sans">
                  {generatedExercise.startingPosition || "Establish proper visual spine alignment and base before tension."}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 dark:text-slate-500">
                  2. Execution Mechanics
                </span>
                <p className="text-xs leading-relaxed text-slate-705 dark:text-slate-305 font-sans">
                  {generatedExercise.movementExecution || "Execute controlled concentric lift targeting localized vectors."}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 dark:text-slate-500">
                  3. Finish & Lock Position
                </span>
                <p className="text-xs leading-relaxed text-slate-705 dark:text-slate-305 font-sans">
                  {generatedExercise.finishingPosition || "Hold peak squeeze contract position before releasing slowly."}
                </p>
              </div>

            </div>

            {/* Mistakes & Safety Warnings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/5 border border-orange-500/10 space-y-2.5">
                <span className="text-[10px] font-mono font-extrabold uppercase text-orange-500 tracking-wider block">
                  Avoid Form Mistakes
                </span>
                <ul className="space-y-1.5 pl-1.5 list-disc text-slate-600 dark:text-slate-400 text-xs">
                  {generatedExercise.commonMistakes.map((mistake, index) => (
                    <li key={index} className="pl-0.5 leading-tight">{mistake}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 space-y-2.5">
                <span className="text-[10px] font-mono font-extrabold uppercase text-amber-500 tracking-wider block">
                  Safety Precautionary Tips
                </span>
                <ul className="space-y-1.5 pl-1.5 list-disc text-slate-600 dark:text-slate-400 text-xs">
                  {generatedExercise.safetyTips.map((tip, index) => (
                    <li key={index} className="pl-0.5 leading-tight">{tip}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Secondary details (alternatives / progression) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-150 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 font-sans">
              
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                  Biomechanic Alternative Drills
                </span>
                <p className="leading-relaxed">
                  {generatedExercise.alternativeExercises.join(", ") || "Other variants like dumbbells, rings, bodyweight squats."}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                  Intensity Variations & Progression
                </span>
                <p className="leading-relaxed">
                  <strong className="text-slate-700 dark:text-slate-300">Harder:</strong> {generatedExercise.progressionVariations.join(", ") || "Weight loading or slower tempos."} <br />
                  <strong className="text-slate-700 dark:text-slate-300">Easier:</strong> {generatedExercise.regressionVariations.join(", ") || "Reduced ranges or gravity assists."}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
