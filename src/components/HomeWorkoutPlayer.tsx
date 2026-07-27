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
  Droplet, 
  Heart, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { HomeWorkoutCircuit, HomeExercise, bellyFatCardioCircuit } from "../data/homeWorkouts";
import { UnifiedExerciseMedia } from "./UnifiedExerciseMedia";

interface HomeWorkoutPlayerProps {
  onComplete: (caloriesBurned: number, durationMinutes: number) => void;
  onClose: () => void;
}

export default function HomeWorkoutPlayer({ onComplete, onClose }: HomeWorkoutPlayerProps) {
  const circuit = bellyFatCardioCircuit;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>(Array(15).fill(72));
  const [isMuted, setIsMuted] = useState(false);
  const [showHydrationReminder, setShowHydrationReminder] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Local active reminder state for coaching tips during session
  const [activeReminder, setActiveReminder] = useState<{
    title: string;
    body: string;
    type: "hydration" | "posture";
  } | null>(null);

  // Auto-request HTML5 Notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(e => console.log("System notification request blocked:", e));
    }
  }, []);

  // System-level + In-app notification dispatcher
  const triggerLocalWorkoutNotification = (title: string, body: string, type: "hydration" | "posture") => {
    // 1. Show beautiful animated overlay banner inside the active player
    setActiveReminder({ title, body, type });

    // 2. Energetic audio coach voice read-out using Speech Synthesis
    speak(`${title}. ${body}`);

    // 3. Native push notification (if authorized by browser)
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: body,
          icon: "/favicon.ico",
          silent: false,
          tag: "workout-active-reminder"
        });
      } catch (err) {
        console.warn("System desktop notification failed to render:", err);
      }
    }

    // Auto-dismiss the overlay banner after 7 seconds for a clean visual experience
    setTimeout(() => {
      setActiveReminder((prev) => (prev?.title === title ? null : prev));
    }, 7000);
  };
  
  // Prep-phase: 5-second intro countdown before first exercise
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(5);
  const [isPrepPhase, setIsPrepPhase] = useState(true);

  // Canvas ref for premium physics-based confetti bursts!
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentExercise = circuit.exercises[currentIndex];

  // Helper function for Voice Countdown Speech Synthesis
  const speak = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15; // slightly faster and energetic
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Trigger speech on prep phase starts
  useEffect(() => {
    speak("Prepare yourself for the Belly Fat Cardio Circuit! High knees is up first. Get ready in 5 seconds.");
  }, []);

  // Prep Phase Timer
  useEffect(() => {
    let interval: any = null;
    if (isPrepPhase) {
      interval = setInterval(() => {
        setPrepTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPrepPhase(false);
            setIsPlaying(true);
            speak("Start " + circuit.exercises[0].name + "! Let's go!");
            return 0;
          }
          const nextVal = prev - 1;
          if (nextVal <= 3) {
            speak(nextVal.toString());
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPrepPhase]);

  // Main Exercise Timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isPrepPhase && !isCompleted && !showHydrationReminder) {
      interval = setInterval(() => {
        // Increment calories burned based on exercise intensity
        const baseCalPerSec = parseFloat(currentExercise.caloriesEst.split("-")[1] || "15") / 30;
        setCaloriesBurned(prev => parseFloat((prev + baseCalPerSec).toFixed(2)));

        // Dynamic Heart Rate Simulation
        setHeartRate(prev => {
          const targetMin = currentExercise.name.includes("Burpees") || currentExercise.name.includes("Climbers") ? 145 : 120;
          const targetMax = currentExercise.name.includes("Burpees") || currentExercise.name.includes("Climbers") ? 170 : 140;
          let nextHr = prev;
          if (prev < targetMin) {
            nextHr += Math.floor(Math.random() * 4) + 1;
          } else if (prev > targetMax) {
            nextHr -= Math.floor(Math.random() * 3);
          } else {
            nextHr += Math.floor(Math.random() * 5) - 2;
          }
          // Clamp
          return Math.max(80, Math.min(185, nextHr));
        });

        // Decrement timer
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Check if this was the last exercise
            if (currentIndex >= circuit.exercises.length - 1) {
              clearInterval(interval);
              setIsPlaying(false);
              setIsCompleted(true);
              speak("Congratulations! You have completed the Belly Fat Cardio Circuit! Exceptional effort!");
              triggerConfetti();
              return 0;
            } else {
              // Check for Hydration Reminder every 3 exercises
              const nextIndex = currentIndex + 1;
              if (nextIndex % 3 === 0) {
                setShowHydrationReminder(true);
                setIsPlaying(false);
                speak("Hydration Check! Pause and take a sip of refreshing lemon cucumber water.");
              } else {
                // Advance to next exercise
                setCurrentIndex(nextIndex);
                speak("Next up: " + circuit.exercises[nextIndex].name + ". Let's go!");
              }
              return 30;
            }
          }

          const nextVal = prev - 1;
          
          // Trigger local posture/hydration coaching reminders at the 15-second mark of each exercise
          if (nextVal === 15) {
            if (currentIndex % 2 === 0) {
              triggerLocalWorkoutNotification(
                "Focus on your posture!",
                "Keep your core fully engaged, shoulders relaxed, and maintain optimal spinal alignment.",
                "posture"
              );
            } else {
              triggerLocalWorkoutNotification(
                "Time to hydrate!",
                "Take a small, quick sip of clean water to maintain muscle density and keep your energy high.",
                "hydration"
              );
            }
          }

          // Voice countdown for last 3 seconds of exercise
          if (nextVal <= 3 && nextVal > 0) {
            speak(nextVal.toString());
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPrepPhase, currentIndex, isCompleted, showHydrationReminder]);

  // Update heart rate history for the micro sparkline
  useEffect(() => {
    setHeartRateHistory(prev => {
      const updated = [...prev.slice(1), heartRate];
      return updated;
    });
  }, [heartRate]);

  // Handle Controls
  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false);
      speak("Workout paused");
    } else {
      setIsPlaying(true);
      speak("Resuming " + currentExercise.name);
    }
  };

  const handleSkipForward = () => {
    if (currentIndex < circuit.exercises.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSecondsRemaining(30);
      setIsPlaying(true);
      speak("Skipped. Starting " + circuit.exercises[nextIndex].name);
    } else {
      setIsPlaying(false);
      setIsCompleted(true);
      speak("Workout completed!");
      triggerConfetti();
    }
  };

  const handleSkipBackward = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSecondsRemaining(30);
      setIsPlaying(true);
      speak("Going back to " + circuit.exercises[prevIndex].name);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  };

  const handleDismissHydration = () => {
    setShowHydrationReminder(false);
    setIsPlaying(true);
    speak("Resuming. Let's start " + currentExercise.name);
  };

  const handleFinishEarly = () => {
    if (window.confirm("Do you want to log your completed work so far and finish this session?")) {
      setIsPlaying(false);
      setIsCompleted(true);
      speak("Workout logged! Excellent effort.");
      triggerConfetti();
    }
  };

  // Confetti Physics Engine
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#D32F2F", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
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
      let remaining = false;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (p.r + 1.5) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 8;

        if (p.y < canvas.height) {
          remaining = true;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (remaining) {
        animationFrameRef.current = requestAnimationFrame(drawConfetti);
      }
    };

    drawConfetti();
  };

  // Cleanup confetti animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Completion Screen Submit
  const handleCompleteSubmit = () => {
    onComplete(caloriesBurned, circuit.duration);
  };

  // Progress Percent
  const progressPercent = Math.round(((currentIndex) / circuit.exercises.length) * 100);

  // SVG Line Path Generator for heart rate sparkline
  const generateHeartRatePath = () => {
    const width = 160;
    const height = 40;
    const padding = 2;
    const maxVal = Math.max(...heartRateHistory, 120);
    const minVal = Math.min(...heartRateHistory, 70);
    const range = maxVal - minVal || 1;

    return heartRateHistory
      .map((val, i) => {
        const x = padding + (i / (heartRateHistory.length - 1)) * (width - padding * 2);
        const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto">
      {/* Confetti overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Real-time Dynamic Notification Toast Banner */}
      {activeReminder && (
        <div 
          className={`fixed top-24 right-6 z-55 max-w-sm w-full p-4 rounded-2xl border bg-slate-900 shadow-2xl flex gap-3 items-start animate-slide-in transition-all duration-300 ${
            activeReminder.type === "hydration" 
              ? "border-blue-500/50 shadow-blue-500/10" 
              : "border-amber-500/50 shadow-amber-500/10"
          }`}
          id="workout_active_toast_notification"
        >
          <div className={`p-2 rounded-xl shrink-0 ${
            activeReminder.type === "hydration" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
          }`}>
            {activeReminder.type === "hydration" ? (
              <Droplet className="w-5 h-5 fill-current" />
            ) : (
              <Activity className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div className="space-y-1 text-left flex-grow">
            <span className={`text-[9px] font-mono font-black uppercase tracking-widest block ${
              activeReminder.type === "hydration" ? "text-blue-400" : "text-amber-400"
            }`}>
              {activeReminder.type === "hydration" ? "Hydration Alert" : "Posture Check"}
            </span>
            <h4 className="text-xs font-black text-white uppercase tracking-tight leading-none">
              {activeReminder.title}
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal font-sans">
              {activeReminder.body}
            </p>
          </div>
          <button 
            onClick={() => setActiveReminder(null)} 
            className="text-slate-500 hover:text-slate-300 transition text-[10px] uppercase font-mono font-bold self-start cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header bar */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <button 
          onClick={onClose} 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Player</span>
        </button>
        <span className="text-xs font-mono font-bold text-[#D32F2F] uppercase tracking-widest bg-[#D32F2F]/10 border border-[#D32F2F]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Circuit Session
        </span>
        <button 
          onClick={handleMuteToggle}
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
          title={isMuted ? "Unmute Coaching Voice" : "Mute Coaching Voice"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col justify-center items-center z-10 relative">
        
        {isPrepPhase ? (
          /* PREP COUNTDOWN VIEW */
          <div className="text-center space-y-8 max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-up">
            <div className="relative flex items-center justify-center h-28 w-28 mx-auto">
              <div className="absolute inset-0 rounded-full bg-[#D32F2F]/10 border border-[#D32F2F]/20 animate-ping duration-[3000ms]" />
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-[#D32F2F]/30 animate-spin" style={{ animationDuration: '10s' }} />
              <div className="h-16 w-16 rounded-full bg-[#D32F2F] text-white font-mono text-3xl font-black flex items-center justify-center shadow-lg">
                {prepTimeRemaining}
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#D32F2F] uppercase tracking-widest block">GET READY IN...</span>
              <h2 className="text-2xl font-black uppercase text-white font-display">Prepare Your Workspace</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear some space on your floor. No equipment is required for this workout. Up first is <strong className="text-white">{currentExercise.name}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5 text-left">
              <UnifiedExerciseMedia 
                exerciseName={currentExercise.mediaName}
                className="w-14 h-14 rounded-xl border border-slate-800 shrink-0 overflow-hidden"
              />
              <div>
                <span className="text-[9px] text-slate-500 font-mono block">UP FIRST</span>
                <span className="text-sm font-black text-white block">{currentExercise.name}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Duration: 30 Seconds</span>
              </div>
            </div>
          </div>
        ) : isCompleted ? (
          /* COMPLETED SCREEN */
          <div className="text-center space-y-8 max-w-lg p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-up">
            <div className="relative flex items-center justify-center h-24 w-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-ping duration-[3000ms]" />
              <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">SESSION COMPLETE</span>
              <h2 className="text-3xl font-black uppercase text-white font-display">Belly Melt Champion!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You crushed the 12 Minute Cardio Circuit! That is how consistent habits are built and belly fat is melted away. Excellent speed, control, and endurance!
              </p>
            </div>

            {/* Workout Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <Flame className="w-5 h-5 text-[#D32F2F] mx-auto mb-1.5" />
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Calories</span>
                <span className="text-xl font-black text-white mt-0.5 block">{caloriesBurned} kcal</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <Clock className="w-5 h-5 text-[#D32F2F] mx-auto mb-1.5" />
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Time Logged</span>
                <span className="text-xl font-black text-white mt-0.5 block">{circuit.duration} Minutes</span>
              </div>
            </div>

            {/* Spot Reduction Scientific Disclaimer */}
            <div className="p-4 bg-[#D32F2F]/5 border border-[#D32F2F]/10 rounded-2xl text-left space-y-1.5">
              <span className="text-[9px] font-mono font-black text-[#D32F2F] uppercase tracking-widest flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> SCIENTIFIC COMPLIANCE BRIEFING
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Please remember that <strong>belly fat cannot be reduced through spot reduction</strong>. Persistent overall fat loss is achieved via nutritional deficit, strength training, cardio, proper hydration, recovery, and caloric control.
              </p>
            </div>

            <button
              onClick={handleCompleteSubmit}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Log Workout & Save Progress</span>
            </button>
          </div>
        ) : showHydrationReminder ? (
          /* HYDRATION REMINDER MODAL */
          <div className="text-center space-y-6 max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-scale-up">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto animate-bounce">
              <Droplet className="w-8 h-8 fill-blue-500" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest block">COACH REMINDER</span>
              <h2 className="text-2xl font-black uppercase text-white font-display">Hydration Check-in</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Exceptional work completing the last section! Take <strong>15-30 seconds</strong> to pause, catch your breath, and drink a sip of water (preferably lemon-cucumber hydration) to maintain optimal cellular performance and high-tempo metabolism.
              </p>
            </div>

            <button
              onClick={handleDismissHydration}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Done, Resume Circuit ➜
            </button>
          </div>
        ) : (
          /* ACTIVE EXERCISE CIRCUIT SCREEN */
          <div className="w-full grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Exercise Video & Detail */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Media Card */}
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl flex items-center justify-center">
                <UnifiedExerciseMedia 
                  exerciseName={currentExercise.mediaName}
                  className="w-full h-full object-contain"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-[#D32F2F] border border-slate-800 flex items-center gap-1 uppercase tracking-widest">
                  Exercise {currentIndex + 1} of 12
                </div>
              </div>

              {/* Title & Stats */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active Exercise</span>
                  <h1 className="text-2xl font-black text-white mt-1 uppercase font-display">{currentExercise.name}</h1>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {currentExercise.instructions[0]}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Primary Targets</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {currentExercise.muscles.map(m => (
                        <span key={m} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 uppercase">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Beginner Modification</span>
                    <p className="text-[10px] text-emerald-400 font-medium leading-relaxed mt-1.5">
                      💡 {currentExercise.beginnerMod}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Interactive Panel, Stopwatch, Live Heart Rate, live Calories */}
            <div className="lg:col-span-5 space-y-6 w-full">
              
              {/* Timer Display */}
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">SECONDS REMAINING</span>
                
                <div className="relative flex items-center justify-center h-44 w-44 mx-auto">
                  {/* SVG progress circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="88" 
                      cy="88" 
                      r="80" 
                      stroke="#1e293b" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="88" 
                      cy="88" 
                      r="80" 
                      stroke="#D32F2F" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="502"
                      strokeDashoffset={502 - (502 * secondsRemaining) / 30}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  
                  <div className="absolute font-mono text-6xl font-black text-white">
                    {secondsRemaining}
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                    <span>PROGRESS</span>
                    <span>{progressPercent}% COMPLETE</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Timer Playback Buttons */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={handleSkipBackward}
                    disabled={currentIndex === 0}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Exercise"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handlePauseResume}
                    className={`p-4 rounded-2xl flex items-center justify-center transition shadow-lg cursor-pointer ${
                      isPlaying 
                        ? "bg-[#D32F2F] hover:bg-[#B71C1C] text-white" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                    title={isPlaying ? "Pause Timer" : "Resume Timer"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button
                    onClick={handleSkipForward}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition cursor-pointer"
                    title="Skip Exercise"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Live Bio Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Heart Rate Sparkline Card */}
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between h-36">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block">Live Pulse</span>
                      <span className="text-2xl font-black text-white mt-1 block flex items-baseline gap-1">
                        {heartRate} <span className="text-slate-500 text-xs font-normal">BPM</span>
                      </span>
                    </div>
                    <Heart className="w-5 h-5 text-rose-500 animate-pulse fill-rose-500 shrink-0" />
                  </div>
                  
                  {/* Heart rate wave mini graph (SVG) */}
                  <div className="h-10 w-full mt-2 overflow-hidden">
                    <svg className="w-full h-full">
                      <path 
                        d={generateHeartRatePath()} 
                        fill="none" 
                        stroke="#f43f5e" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Live Calorie Estimator Card */}
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between h-36">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block">Calorie Burn</span>
                      <span className="text-2xl font-black text-white mt-1 block flex items-baseline gap-1">
                        {caloriesBurned} <span className="text-slate-500 text-xs font-normal">KCAL</span>
                      </span>
                    </div>
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-850 flex items-center gap-1.5 leading-snug">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Rate: ~15 kcal/min</span>
                  </div>
                </div>

              </div>

              {/* Next Up Sneak Peek */}
              {currentIndex < circuit.exercises.length - 1 && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">UP NEXT</span>
                      <span className="text-xs font-black text-white block uppercase tracking-wide">
                        {circuit.exercises[currentIndex + 1].name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">30s</span>
                </div>
              )}

              {/* End Workout Early Button */}
              <button 
                onClick={handleFinishEarly}
                className="w-full py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Finish Session Early
              </button>

            </div>

          </div>
        )}

      </main>

      {/* Footer / Safety Tips */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 z-10 sticky bottom-0">
        <p className="max-w-2xl mx-auto">
          ⚠️ <strong>Safety Warning:</strong> Maintain soft knees, engage core. Focus on absolute control over speed. If you experience lightheadedness, chest pains, or extreme fatigue, pause immediately and rest.
        </p>
      </footer>
    </div>
  );
}
