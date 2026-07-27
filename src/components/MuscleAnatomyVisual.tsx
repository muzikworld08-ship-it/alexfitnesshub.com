import React from "react";

interface MuscleAnatomyVisualProps {
  muscleGroups: string[];
  musclesWorked: string[];
}

const MuscleAnatomyVisual = React.memo(function MuscleAnatomyVisual({ muscleGroups = [], musclesWorked = [] }: MuscleAnatomyVisualProps) {
  // Normalize strings for easy checking
  const normalizedTargets = [
    ...muscleGroups.map(m => m.toLowerCase()),
    ...musclesWorked.map(m => m.toLowerCase())
  ];

  const isActive = (terms: string[]) => {
    return terms.some(term => 
      normalizedTargets.some(target => target.includes(term.toLowerCase()) || term.toLowerCase().includes(target))
    );
  };

  // Define muscle groups and their active states
  const muscleStates = {
    chest: isActive(["chest", "pectoralis", "pecs"]),
    lats: isActive(["lats", "latissimus", "back", "rhomboid", "teres"]),
    traps: isActive(["traps", "trapezius", "upper back", "neck"]),
    shoulders: isActive(["shoulder", "deltoid", "delts", "rotator"]),
    biceps: isActive(["bicep", "biceps", "curl"]),
    triceps: isActive(["tricep", "triceps", "dips", "pushdown"]),
    abs: isActive(["abs", "abdominis", "core", "oblique", "crunch", "plank"]),
    glutes: isActive(["glute", "gluteus", "hip", "thrust", "bridge"]),
    quads: isActive(["quad", "quadriceps", "thigh", "squat", "lunge", "leg press"]),
    hamstrings: isActive(["hamstring", "hamstrings", "deadlift", "rdl"]),
    calves: isActive(["calf", "calves", "soleus", "gastrocnemius"])
  };

  return (
    <div id="anatomical-muscle-highlight-board" className="w-full bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Anatomical Muscle Activation Map
          </h4>
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">Interactive red overlays show active muscular contraction targets</p>
        </div>
        <span className="text-[10px] bg-red-500/15 border border-red-500/35 text-red-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold animate-pulse">
          Load active
        </span>
      </div>

      {/* Grid of Anterior & Posterior views */}
      <div className="grid grid-cols-2 gap-4 items-center justify-center py-4">
        
        {/* VIEW 1: ANTERIOR (FRONT VIEW) */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-widest">ANTERIOR (FRONT)</span>
          <div className="relative w-full max-w-[140px] aspect-[1/2] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
            
            {/* STYLIZED MUSCLE MAN VECTOR */}
            <svg viewBox="0 0 100 200" className="w-full h-full text-slate-700 select-none">
              {/* Head & Neck */}
              <circle cx="50" cy="18" r="8" className="fill-slate-800" />
              <path d="M46,26 L54,26 L53,32 L47,32 Z" className="fill-slate-800" />
              
              {/* Trap Ridge (Upper) */}
              <path 
                d="M38,32 Q50,28 62,32 L58,38 L42,38 Z" 
                className={`transition-colors duration-500 ${muscleStates.traps ? "fill-red-500 animate-pulse opacity-85 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "fill-slate-800"}`} 
              />
              
              {/* Chest (Pectorals) */}
              <path 
                d="M36,40 L50,40 L50,56 L34,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.chest ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              <path 
                d="M64,40 L50,40 L50,56 L66,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.chest ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              
              {/* Shoulders (Anterior/Lateral Deltoids) */}
              <path 
                d="M34,38 C28,40 28,52 33,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.shoulders ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-850"}`} 
              />
              <path 
                d="M66,38 C72,40 72,52 67,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.shoulders ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-850"}`} 
              />
              
              {/* Abdominals & Obliques */}
              <rect 
                x="40" y="58" width="20" height="32" rx="2" 
                className={`transition-colors duration-500 ${muscleStates.abs ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-750"}`} 
              />
              {/* Draw abs details */}
              <line x1="42" y1="65" x2="58" y2="65" stroke="#1E293B" strokeWidth="1.5" />
              <line x1="42" y1="72" x2="58" y2="72" stroke="#1E293B" strokeWidth="1.5" />
              <line x1="42" y1="79" x2="58" y2="79" stroke="#1E293B" strokeWidth="1.5" />
              <line x1="50" y1="58" x2="50" y2="90" stroke="#1E293B" strokeWidth="1" />

              {/* Biceps (Front arms) */}
              <path 
                d="M26,52 Q23,68 28,80 L32,78 Q28,66 31,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.biceps ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-800"}`} 
              />
              <path 
                d="M74,52 Q77,68 72,80 L68,78 Q72,66 69,54 Z" 
                className={`transition-colors duration-500 ${muscleStates.biceps ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-800"}`} 
              />

              {/* Forearms */}
              <path d="M28,80 L23,105 L28,105 L31,80 Z" className="fill-slate-800" />
              <path d="M72,80 L77,105 L72,105 L69,80 Z" className="fill-slate-800" />
              
              {/* Quadriceps (Front Thighs) */}
              <path 
                d="M34,94 L48,94 L46,140 L34,136 Z" 
                className={`transition-colors duration-500 ${muscleStates.quads ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              <path 
                d="M66,94 L52,94 L54,140 L66,136 Z" 
                className={`transition-colors duration-500 ${muscleStates.quads ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              
              {/* Shins & Calves (Anterior) */}
              <path d="M34,142 L44,142 L42,185 L36,185 Z" className="fill-slate-800" />
              <path d="M66,142 L56,142 L58,185 L64,185 Z" className="fill-slate-800" />
            </svg>
            
          </div>
        </div>

        {/* VIEW 2: POSTERIOR (BACK VIEW) */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-widest">POSTERIOR (BACK)</span>
          <div className="relative w-full max-w-[140px] aspect-[1/2] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
            
            <svg viewBox="0 0 100 200" className="w-full h-full text-slate-700 select-none">
              {/* Back Head & Neck */}
              <circle cx="50" cy="18" r="8" className="fill-slate-850" />
              <path d="M46,26 L54,26 L53,32 L47,32 Z" className="fill-slate-850" />
              
              {/* Traps (Posterior view) */}
              <path 
                d="M38,32 Q50,28 62,32 L58,48 L42,48 Z" 
                className={`transition-colors duration-500 ${muscleStates.traps ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-750"}`} 
              />
              
              {/* Latissimus Dorsi (Lats) */}
              <path 
                d="M34,48 L50,48 L50,72 L38,68 Z" 
                className={`transition-colors duration-500 ${muscleStates.lats ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              <path 
                d="M66,48 L50,48 L50,72 L62,68 Z" 
                className={`transition-colors duration-500 ${muscleStates.lats ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />

              {/* Lower Back */}
              <path d="M38,68 L50,72 L62,68 L60,82 L40,82 Z" className="fill-slate-800" />
              
              {/* Shoulders (Posterior Deltoids) */}
              <circle 
                cx="31" cy="42" r="5" 
                className={`transition-colors duration-500 ${muscleStates.shoulders ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-850"}`} 
              />
              <circle 
                cx="69" cy="42" r="5" 
                className={`transition-colors duration-500 ${muscleStates.shoulders ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-850"}`} 
              />

              {/* Triceps (Back Arms) */}
              <path 
                d="M26,52 L31,54 L29,76 L25,74 Z" 
                className={`transition-colors duration-500 ${muscleStates.triceps ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-800"}`} 
              />
              <path 
                d="M74,52 L69,54 L71,76 L75,74 Z" 
                className={`transition-colors duration-500 ${muscleStates.triceps ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-800"}`} 
              />

              {/* Glutes (Buttocks) */}
              <path 
                d="M34,84 Q50,80 66,84 L64,104 Q50,110 36,104 Z" 
                className={`transition-colors duration-500 ${muscleStates.glutes ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-750"}`} 
              />
              <line x1="50" y1="83" x2="50" y2="106" stroke="#1E293B" strokeWidth="1.5" />
              
              {/* Hamstrings (Back Thighs) */}
              <path 
                d="M34,106 L48,106 L46,140 L34,136 Z" 
                className={`transition-colors duration-500 ${muscleStates.hamstrings ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              <path 
                d="M66,106 L52,106 L54,140 L66,136 Z" 
                className={`transition-colors duration-500 ${muscleStates.hamstrings ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-700"}`} 
              />
              
              {/* Calves (Gastrocnemius) */}
              <path 
                d="M34,142 L44,142 L42,175 L36,175 Z" 
                className={`transition-colors duration-500 ${muscleStates.calves ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-750"}`} 
              />
              <path 
                d="M66,142 L56,142 L58,175 L64,175 Z" 
                className={`transition-colors duration-500 ${muscleStates.calves ? "fill-red-500 animate-pulse opacity-85" : "fill-slate-750"}`} 
              />
            </svg>
            
          </div>
        </div>

      </div>

      {/* Target list indicator */}
      <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-wrap gap-2 items-center justify-between">
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Activated muscles:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(muscleStates).filter(([, val]) => val).map(([key]) => (
            <span key={key} className="text-[9px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
              {key}
            </span>
          ))}
          {Object.entries(muscleStates).filter(([, val]) => !val).length === Object.keys(muscleStates).length && (
            <span className="text-[9px] font-mono text-slate-500">General stabilizers</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default MuscleAnatomyVisual;
