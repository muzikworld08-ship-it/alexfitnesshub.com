import React from "react";
import { 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Dumbbell, 
  Activity, 
  ListTodo, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { useCentralizedExercises } from "../hooks/useCentralizedExercises";

interface WorkoutVisualProps {
  exerciseId?: string;
  category?: string;
  muscleGroups?: string[];
  className?: string;
  animate?: boolean;
  exerciseName?: string;
  customMediaUrl?: string;
  customMediaType?: "image" | "video";
  isCard?: boolean;
}

const WorkoutVisual = React.memo(function WorkoutVisual({ 
  exerciseId,
  category = "", 
  muscleGroups = [], 
  className = "w-full", 
  exerciseName = "",
  customMediaUrl,
  customMediaType,
  isCard = false
}: WorkoutVisualProps) {

  const { exercises } = useCentralizedExercises();

  // Try to find the detailed exercise object from our centralized database
  const exercise = exercises.find(ex => 
    ex.id === exerciseId || 
    ex.name.toLowerCase() === exerciseName.toLowerCase()
  );

  const displayCategory = exercise?.category || category || "General Fitness";
  const displayMuscles = exercise?.muscleGroups || muscleGroups || [];
  const displayEquipment = exercise?.equipment || [];
  const displayDifficulty = exercise?.difficulty || "Beginner";

  const resolvedMediaUrl = customMediaUrl || exercise?.customMediaUrl || exercise?.gifUrl;
  const resolvedMediaType = customMediaType || exercise?.customMediaType || "image";

  // Performance & Robustness states
  const [loading, setLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [resolvedMediaUrl]);

  const handleMediaError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000);
    } else {
      setHasError(true);
      setLoading(false);
    }
  };

  // Card Mode Layout Helper
  if (isCard) {
    return (
      <div 
        id={`visual-card-${(exerciseName || exercise?.name || "exercise").replace(/\s+/g, '-').toLowerCase()}`} 
        className={`relative overflow-hidden ${className} bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between`}
      >
        {resolvedMediaUrl && !hasError ? (
          <div className="absolute inset-0 w-full h-full">
            {loading && (
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-20 flex flex-col items-center justify-center space-y-2">
                <Dumbbell className="w-5 h-5 text-slate-400 dark:text-slate-500 animate-spin" />
                <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">LOADING SKELETON</span>
              </div>
            )}
            <img 
              src={resolvedMediaUrl + (retryCount > 0 ? `?retry=${retryCount}` : "")} 
              alt={exerciseName || "Exercise Preview"} 
              className={`w-full h-full object-cover transition-opacity duration-700 filter brightness-110 ${loading ? 'opacity-0' : 'opacity-100'}`} 
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={() => setLoading(false)}
              onError={handleMediaError}
            />
            <div className="absolute inset-0 bg-white/10" />
          </div>
        ) : null}
        
        <div className="flex flex-col h-full justify-between relative z-10 p-4">
          {/* Top spacer to guarantee absolute safety under absolute parent badges */}
          <div className="h-6" />
          
          {/* Central graphic: stylized glowing biomechanical radar schematic */}
          {(!resolvedMediaUrl || hasError) ? (
            <div className="my-auto flex flex-col items-center justify-center space-y-2">
              <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-[#C0392B]/5 border border-[#C0392B]/10 animate-ping duration-[3000ms]" />
                
                {/* Middle concentric ring with dashed border */}
                <div className="absolute h-16 w-16 rounded-full border border-dashed border-[#C0392B]/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
                
                {/* Inner glowing circle */}
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-slate-950 border border-red-200/50 dark:border-slate-800 flex items-center justify-center shadow-inner">
                  <Dumbbell className="w-5 h-5 text-[#C0392B]" />
                </div>
              </div>
              
              <div className="text-center space-y-0.5">
                <span className="text-[8px] font-mono font-black text-[#C0392B] uppercase tracking-widest bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/40">
                  {hasError ? "FALLBACK SYSTEM ACTIVE" : "KINETIC PROTOCOL"}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 font-sans font-bold tracking-tight">
                  {displayMuscles.length > 0 ? `Target: ${displayMuscles[0].toUpperCase()}` : "BIOMECHANIC ANALYSIS"}
                </p>
              </div>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center">
              {/* Optional overlay spacer */}
            </div>
          )}
          
          {/* Footer bar */}
          <div className="flex justify-between items-center border-t border-slate-200/20 pt-2 text-[7.5px] font-mono text-slate-700 bg-white/95 dark:bg-slate-900 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 uppercase tracking-widest relative z-10 shadow-sm">
            <span>{exerciseName || exercise?.name || "ALEX KINESIOLOGY"}</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{hasError ? "FALLBACK PROT." : resolvedMediaUrl ? "GIF ACTIVE" : "SYSTEM ACTIVE"}</span>
            </div>
          </div>
        </div>
        
        {(!resolvedMediaUrl || hasError) && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
        )}
      </div>
    );
  }

  return (
    <div id="workout-visual-root" className="w-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col p-5 space-y-5">
      
      {/* Exercise Core Title and Meta Specs */}
      <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-[#C0392B]">
              <Dumbbell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-sans font-extrabold text-[#1C1C1C] dark:text-white text-lg tracking-tight uppercase leading-none">
                {exerciseName || exercise?.name}
              </h3>
              <p className="text-[10px] text-slate-450 uppercase font-mono tracking-wider mt-1.5">
                Specification Protocol & Discrimination
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-[#C0392B]/10 border border-[#C0392B]/20 text-[9px] text-[#C0392B] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {displayCategory}
            </span>
            <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-600 dark:text-slate-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
              {displayDifficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Manually uploaded GIF / custom media display */}
      <div id="exercise-demo-media-box" className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        {resolvedMediaUrl && !hasError ? (
          <>
            {loading && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse z-20 flex flex-col items-center justify-center space-y-2">
                <Dumbbell className="w-6 h-6 text-slate-500 animate-spin" />
                <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">LOADING KINESIOLOGY STREAM</span>
              </div>
            )}
            <img 
              src={resolvedMediaUrl + (retryCount > 0 ? `?retry=${retryCount}` : "")} 
              alt={exerciseName || "Exercise Demo GIF"} 
              className={`w-full h-full object-contain transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`} 
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={() => setLoading(false)}
              onError={handleMediaError}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-[#C0392B]/30 animate-spin-slow" style={{ animationDuration: '25s' }} />
              <div className="absolute h-24 w-24 rounded-full bg-[#C0392B]/5 animate-pulse" />
              <div className="h-14 w-14 rounded-full bg-slate-900 border border-[#C0392B]/30 flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-[#C0392B]" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-[#C0392B] bg-[#C0392B]/10 px-2.5 py-1 rounded border border-[#C0392B]/20 tracking-wider">
                {hasError ? "MEDIA HOST UNREACHABLE" : "KINETIC PLACEHOLDER"}
              </span>
              <p className="text-xs text-slate-405 dark:text-slate-400 font-medium max-w-sm">
                {hasError ? "Unable to retrieve raw media stream. Falling back to biomechanic guidelines." : "No custom visual uploaded. Follow the professional instructions below."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3-Part Movement Biomechanics Details */}
      {exercise && (
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1 shadow-xs">
            <span className="text-[8px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
              Phase 1: Starting Position
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {exercise.startingPosition || "Establish standard athletic grip, lock core alignment, and load stabilization frames."}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1 shadow-xs">
            <span className="text-[8px] font-mono font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest block">
              Phase 2: Execution Drive
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {exercise.movementExecution || "Concentric contraction through target muscular fibers with complete control."}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1 shadow-xs">
            <span className="text-[8px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
              Phase 3: Finish Contraction
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {exercise.finishingPosition || "Isometric lock at peak squeeze point, then execute high-tempo eccentric release."}
            </p>
          </div>
        </div>
      )}

      {/* Movement Instructions / Discrimination Steps */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-750 dark:text-slate-300 flex items-center gap-1.5 font-sans border-b border-slate-100 dark:border-slate-850 pb-2">
          <ListTodo className="w-4 h-4 text-[#C0392B]" />
          <span>Step-by-Step Training Instructions</span>
        </h4>
        
        {exercise && exercise.instructions && exercise.instructions.length > 0 ? (
          <div className="space-y-2.5">
            {exercise.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-900 text-[#C0392B] font-bold text-[10px] font-mono flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Standard performance: Retract scapula, establish neutral head position, maintain active core brace, and execute targeted concentric load with tempo control.
          </p>
        )}
      </div>

      {/* Target Muscles & Equipment tags */}
      <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-855 pt-4">
        {displayMuscles.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-extrabold text-slate-400 tracking-wider block">
              Anatomical Muscle Targets
            </span>
            <div className="flex flex-wrap gap-1">
              {displayMuscles.map((muscle) => (
                <span key={muscle} className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {displayEquipment.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-extrabold text-slate-400 tracking-wider block">
              Required Equipment Setup
            </span>
            <div className="flex flex-wrap gap-1">
              {displayEquipment.map((eq) => (
                <span key={eq} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-850">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety Compliance Tips */}
      {exercise && exercise.safetyTips && exercise.safetyTips.length > 0 && (
        <div className="p-3.5 bg-red-50/50 dark:bg-red-950/15 border border-red-100 dark:border-red-950/40 rounded-xl space-y-1.5">
          <span className="text-[9px] font-mono font-black text-[#C0392B] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Injury Prevention & Safety Guidelines
          </span>
          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {exercise.safetyTips.slice(0, 2).map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
});

export default WorkoutVisual;
