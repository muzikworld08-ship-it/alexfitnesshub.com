import React, { useState, useEffect } from "react";
import { Dumbbell, Play } from "lucide-react";
import { useCentralizedExercises } from "../hooks/useCentralizedExercises";
import { OptimizedImage } from "./OptimizedImage";

interface UnifiedExerciseMediaProps {
  exerciseId?: string;
  exerciseName?: string;
  className?: string;
  fallbackType?: "pulsing" | "dumbbell" | "none";
}

export const UnifiedExerciseMedia: React.FC<UnifiedExerciseMediaProps> = ({
  exerciseId,
  exerciseName = "",
  className = "w-full h-full",
  fallbackType = "pulsing",
}) => {
  const { exercises, loading: hookLoading } = useCentralizedExercises();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Search for the centralized exercise matching ID or Name
  const exercise = exercises.find((ex) => {
    if (exerciseId && ex.id === exerciseId) return true;
    if (exerciseName && ex.name.toLowerCase() === exerciseName.toLowerCase()) return true;
    return false;
  });

  const resolvedMediaUrl = exercise?.customMediaUrl || exercise?.gifUrl || exercise?.imageUrl;
  const resolvedMediaType = exercise?.customMediaType || "image";

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [resolvedMediaUrl]);

  if (hookLoading && !exercise) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
        <Dumbbell className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">LOADING MEDIA</span>
      </div>
    );
  }

  if (!resolvedMediaUrl || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
        <Dumbbell className="w-5 h-5 text-slate-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 uppercase tracking-tight text-center px-2 truncate w-full">
          {exerciseName || exercise?.name || "KINETIC PLACEHOLDER"}
        </span>
      </div>
    );
  }

  if (resolvedMediaType === "video") {
    return (
      <div className={`relative overflow-hidden ${className} bg-slate-950 flex items-center justify-center rounded-xl`}>
        <video
          src={resolvedMediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center space-y-1.5 z-10 animate-pulse">
            <Dumbbell className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">STREAM LOADING</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-mono font-bold text-emerald-400 flex items-center gap-1">
          <Play className="w-2.5 h-2.5 fill-emerald-400 stroke-none" /> VIDEO ACTIVE
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <OptimizedImage
        src={resolvedMediaUrl}
        alt={exercise?.name || exerciseName || "Exercise Media"}
        className="w-full h-full object-cover"
        fallbackType={fallbackType}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default UnifiedExerciseMedia;
