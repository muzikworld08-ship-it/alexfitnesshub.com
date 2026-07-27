import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Activity, 
  Flame, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { Exercise } from "../data/exercises";

interface WorkoutPlayerProps {
  exercises: Exercise[];
  sessionTitle: string;
  onClose: () => void;
  onComplete: (caloriesBurned: number, durationMinutes: number) => void;
}

export default function WorkoutPlayer({ exercises, sessionTitle, onClose, onComplete }: WorkoutPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = 3; // Standard 3 sets per exercise
  const exerciseDuration = 45; // 45 seconds per set
  const restDuration = 30; // 30 seconds rest between sets/exercises

  const [secondsRemaining, setSecondsRemaining] = useState(5); // Prep phase countdown
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<"prep" | "work" | "rest" | "completed">("prep");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(75);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>(Array(15).fill(75));
  const [elapsedTime, setElapsedTime] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentExercise = exercises[currentIndex] || exercises[0];

  // Helper function for Voice Countdown Speech Synthesis
  const speak = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Speak when phase changes
  useEffect(() => {
    if (phase === "prep") {
      speak(`Get ready for ${currentExercise?.name || "the next exercise"}. Starting in 5 seconds.`);
    } else if (phase === "work") {
      speak(`Go! Perform ${currentExercise?.name}. Focus on your posture.`);
    } else if (phase === "rest") {
      if (currentSet < totalSets) {
        speak(`Great set! Rest for ${restDuration} seconds. Sip some water.`);
      } else if (currentIndex < exercises.length - 1) {
        speak(`Exercise complete! Take a breather. Up next is ${exercises[currentIndex + 1]?.name}.`);
      } else {
        setPhase("completed");
        speak("Congratulations! Workout session completed. Outstanding job!");
      }
    }
  }, [phase, currentIndex, currentSet]);

  // Overall stopwatch
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && phase !== "completed") {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase]);

  // Main countdown loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && phase !== "completed") {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handlePhaseTransition();
            return 0;
          }

          // Voice ticking countdown for last 3 seconds
          const nextVal = prev - 1;
          if (nextVal <= 3 && nextVal > 0) {
            speak(nextVal.toString());
          }

          // Calories math
          if (phase === "work") {
            const met = currentExercise?.difficulty === "Advanced" ? 8 : currentExercise?.difficulty === "Intermediate" ? 6 : 4;
            // calories per second approx
            setCaloriesBurned(c => parseFloat((c + (met * 3.5 * 70) / (200 * 60)).toFixed(1)));
            
            // Heart rate increase
            setHeartRate(hr => {
              const maxHr = currentExercise?.difficulty === "Advanced" ? 165 : currentExercise?.difficulty === "Intermediate" ? 145 : 125;
              if (hr < maxHr) return hr + Math.floor(Math.random() * 3) + 1;
              return hr + (Math.random() > 0.5 ? 1 : -1);
            });
          } else {
            // Heart rate decay on rest
            setHeartRate(hr => {
              if (hr > 80) return hr - Math.floor(Math.random() * 2) - 1;
              return hr;
            });
          }

          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, phase, currentIndex, currentSet]);

  // Track HR history for active dashboard
  useEffect(() => {
    if (isPlaying && phase !== "completed") {
      const interval = setInterval(() => {
        setHeartRateHistory(prev => [...prev.slice(1), heartRate]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, heartRate, phase]);

  const handlePhaseTransition = () => {
    if (phase === "prep") {
      setPhase("work");
      setSecondsRemaining(exerciseDuration);
    } else if (phase === "work") {
      setPhase("rest");
      setSecondsRemaining(restDuration);
    } else if (phase === "rest") {
      if (currentSet < totalSets) {
        setCurrentSet(prev => prev + 1);
        setPhase("work");
        setSecondsRemaining(exerciseDuration);
      } else {
        // Move to next exercise
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setCurrentSet(1);
          setPhase("prep");
          setSecondsRemaining(5);
        } else {
          setPhase("completed");
          setIsPlaying(false);
        }
      }
    }
  };

  // Confetti Physics Celebration Animation
  useEffect(() => {
    if (phase === "completed" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

      const colors = ["#C0392B", "#E74C3C", "#F1C40F", "#2ECC71", "#3498DB", "#9B59B6"];
      const particles: any[] = [];

      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          r: Math.random() * 6 + 4,
          d: Math.random() * canvas.height,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 10 - 5,
          tiltAngleIncremental: Math.random() * 0.07 + 0.02,
          tiltAngle: 0
        });
      }

      const drawConfetti = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach((p, idx) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

          if (p.y <= canvas.height) {
            active = true;
          } else {
            // Reset to top
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();
        });

        if (active) {
          animationFrameRef.current = requestAnimationFrame(drawConfetti);
        }
      };

      drawConfetti();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase]);

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn("Fullscreen request blocked:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setPhase("prep");
      setSecondsRemaining(5);
    } else {
      setPhase("completed");
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentSet(1);
      setPhase("prep");
      setSecondsRemaining(5);
    }
  };

  const handleSkipPhase = () => {
    handlePhaseTransition();
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto"
      id="immersive-workout-player-container"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300 hover:text-white border-0 cursor-pointer"
            title="Exit workout player"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C0392B] font-bold">ALEX FITNESS CO-PILOT</span>
            <h1 className="text-sm font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-md">{sessionTitle}</h1>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300 hover:text-white border-0 cursor-pointer"
            title={isMuted ? "Unmute audio coach" : "Mute audio coach"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300 hover:text-white border-0 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 flex flex-col justify-center relative">
        
        {phase === "prep" && (
          <div className="text-center space-y-6 max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in relative z-10">
            <div className="relative flex items-center justify-center h-28 w-28 mx-auto">
              <div className="absolute inset-0 rounded-full bg-[#C0392B]/10 border border-[#C0392B]/20 animate-ping duration-[3000ms]" />
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-[#C0392B]/30 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="h-16 w-16 rounded-full bg-[#C0392B] text-white font-mono text-3xl font-black flex items-center justify-center shadow-lg">
                {secondsRemaining}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-black text-[#C0392B] uppercase tracking-widest block">PREPARATION MODE</span>
              <h2 className="text-xl font-black uppercase text-white font-display">Get Set & Stabilize</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Position your joints safely. Set up equipment. Next up is <strong className="text-white">{currentExercise?.name}</strong>.
              </p>
            </div>

            {currentExercise?.gifUrl && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3 text-left">
                <img 
                  src={currentExercise.gifUrl} 
                  alt={currentExercise.name} 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <span className="text-[8px] text-slate-500 font-mono block">UP NEXT</span>
                  <span className="text-xs font-black text-white block truncate">{currentExercise.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Target: {currentExercise.muscleGroups?.join(", ")}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2.5 bg-[#C0392B] hover:bg-[#A82E22] text-white text-xs font-bold uppercase rounded-xl tracking-wider shadow active:scale-95 duration-150 transition-all font-mono"
            >
              {isPlaying ? "Pause Setup" : "Start Setup Countdown"}
            </button>
          </div>
        )}

        {phase === "rest" && (
          <div className="text-center space-y-6 max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in relative z-10">
            <div className="relative flex items-center justify-center h-28 w-28 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-ping duration-[3000ms]" />
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-emerald-500/30 animate-spin" style={{ animationDuration: '10s' }} />
              <div className="h-16 w-16 rounded-full bg-emerald-500 text-white font-mono text-3xl font-black flex items-center justify-center shadow-lg">
                {secondsRemaining}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">RECOVERY REST PERIOD</span>
              <h2 className="text-xl font-black uppercase text-white font-display">Hydrate & Breathe Deep</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allow your target muscle fibers to clear lactic acid. Get ready for <strong>Set {currentSet < totalSets ? currentSet + 1 : 1}</strong>.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSkipPhase}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl tracking-wider transition-all font-mono cursor-pointer border-0"
              >
                Skip Rest ➜
              </button>
            </div>
          </div>
        )}

        {phase === "completed" && (
          <div className="text-center space-y-6 max-w-lg mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-up relative z-10">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none rounded-3xl" />
            
            <div className="relative flex items-center justify-center h-20 w-20 mx-auto z-10">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-ping duration-[3000ms]" />
              <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-2 z-10 relative">
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">SESSION COMPLETE</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">Habit Complete!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You successfully crushed your training protocol. Solid mechanical tension is the absolute engine of structural adaptation.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 z-10 relative">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Flame className="w-4 h-4 text-[#C0392B] mx-auto mb-1" />
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Calories</span>
                <span className="text-sm font-black text-white block">{Math.round(caloriesBurned)} kcal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Clock className="w-4 h-4 text-[#C0392B] mx-auto mb-1" />
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Duration</span>
                <span className="text-sm font-black text-white block">{Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Activity className="w-4 h-4 text-[#C0392B] mx-auto mb-1" />
                <span className="text-[8px] text-slate-500 font-mono uppercase block">Workouts</span>
                <span className="text-sm font-black text-white block">{exercises.length} Drills</span>
              </div>
            </div>

            <button
              onClick={() => onComplete(Math.round(caloriesBurned), parseFloat((elapsedTime / 60).toFixed(1)))}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 z-10 relative border-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save & Log Active Progress</span>
            </button>
          </div>
        )}

        {phase === "work" && (
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Animated Demonstration */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg min-h-[400px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACTIVE BIOMECHANIC FEED</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-black">SET {currentSet} OF {totalSets}</span>
              </div>

              {/* Large GIF */}
              <div className="flex-1 my-6 flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden min-h-[220px] max-h-[360px] relative border border-slate-850">
                {currentExercise?.gifUrl ? (
                  <img 
                    src={currentExercise.gifUrl} 
                    alt={currentExercise.name} 
                    className="w-full h-full object-contain filter brightness-110"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Activity className="w-8 h-8 text-[#C0392B] animate-pulse" />
                    <span className="text-[10px] font-mono">LOADING PREVIEW</span>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-wider block">COACHING ADVICE</span>
                  <p className="text-[11px] text-slate-300 leading-normal">{currentExercise?.trainerTips || "Focus closely on active mind-muscle connection. Keep tension on the target fibers rather than neighboring joints."}</p>
                </div>
              </div>
            </div>

            {/* Right Box: Counters & Kinesis Gauge */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg min-h-[400px]">
              
              {/* Exercise Metadata & Progress */}
              <div className="text-left space-y-1">
                <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  <span>EXERCISE {currentIndex + 1} OF {exercises.length}</span>
                  <span>{currentExercise?.difficulty}</span>
                </div>
                <h3 className="text-lg font-black uppercase text-white truncate leading-snug">{currentExercise?.name}</h3>
                <p className="text-xs text-slate-400 leading-normal line-clamp-2">{currentExercise?.description || "Isolate your target muscle fibers with proper posture alignment."}</p>
              </div>

              {/* Circular Timer & Countdown */}
              <div className="my-4 flex items-center justify-center relative">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    className="stroke-slate-800 fill-transparent"
                    strokeWidth="10"
                  />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    className="stroke-[#C0392B] fill-transparent transition-all duration-1000"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={2 * Math.PI * 76 * (1 - secondsRemaining / exerciseDuration)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">SECONDS LEFT</span>
                  <span className="text-4xl font-mono font-black text-white">{secondsRemaining}</span>
                  <span className="block text-[10px] text-[#C0392B] font-mono font-bold uppercase mt-1">ACTIVE WORK</span>
                </div>
              </div>

              {/* Real-time Health Monitor Dashboard */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-850 rounded-2xl">
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <Activity className="w-3 h-3 text-[#C0392B] animate-pulse" />
                    <span>HEART RATE</span>
                  </div>
                  <span className="text-base font-black text-white font-mono block mt-1">{heartRate} <span className="text-[10px] text-slate-500">BPM</span></span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>BURNING ENERGY</span>
                  </div>
                  <span className="text-base font-black text-white font-mono block mt-1">{Math.round(caloriesBurned)} <span className="text-[10px] text-slate-500">KCAL</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Audio Coaching Coach Voice Status Indicator or Player Controls bar */}
      {phase !== "completed" && (
        <footer className="px-6 py-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Playlist Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-xl transition cursor-pointer border-0"
                title="Previous exercise"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-[#C0392B] hover:bg-[#A82E22] text-white rounded-full transition shadow-md active:scale-95 duration-150 cursor-pointer border-0 flex items-center justify-center"
                title={isPlaying ? "Pause Active Training" : "Resume Training Session"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border-0"
                title="Next exercise"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Stats overview */}
            <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C0392B]" />
                <span>ACTIVE STOPWATCH: <strong className="text-white">{Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s</strong></span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <span>TOTAL ESTIMATED STRETCH BURNT: <strong className="text-emerald-400">{Math.round(caloriesBurned)} kcal</strong></span>
            </div>

            {/* Exit/Finish block */}
            <div>
              <button
                onClick={() => setPhase("completed")}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition shadow active:scale-95 font-mono cursor-pointer border-0"
              >
                Finish Session
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
