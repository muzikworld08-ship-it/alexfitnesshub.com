import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Send, Trash2, ShieldAlert, Cpu, Heart, CheckCircle2, Flame, Clock, BookOpen, Info, Apple, Award, Image as ImageIcon, Download, Trash, Check, Loader2, RefreshCw, Palette, Layers, HelpCircle } from "lucide-react";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db, isMockFirebase, auth } from "../lib/firebase";
import PageHero from "./PageHero";
import WorkoutVisual from "./WorkoutVisual";

interface InspirationItem {
  id: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
}

export default function CoachView() {
  const { user, chatMessages, sendCoachMessage, clearCoachChat, exercises } = useApp();
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "lifestyle" | "art">("lifestyle"); // Default to the premium lifestyle hub to showcase this beautiful new feature!
  
  // Smoothly scroll to the top of the viewport whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);
  
  // Lookup central exercises to retrieve their unique IDs and media
  const ex1 = exercises.find(ex => ex.name.toLowerCase() === "hanging knee-to-chest / leg raises");
  const ex2 = exercises.find(ex => ex.name.toLowerCase() === "high-intensity dumbbell thrusters");
  const ex3 = exercises.find(ex => ex.name.toLowerCase() === "dumbbell renegade rows with push-up");
  const ex4 = exercises.find(ex => ex.name.toLowerCase() === "explosive hip-hinge kettlebell swings");
  
  // Image Generator States
  const [artPrompt, setArtPrompt] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [savedGallery, setSavedGallery] = useState<InspirationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, submitting]);

  // Load Gallery when Art tab is activated
  useEffect(() => {
    if (activeTab === "art") {
      loadGallery();
    }
  }, [activeTab]);

  const loadGallery = async () => {
    if (!user) return;
    try {
      if (isMockFirebase) {
        const cached = localStorage.getItem(`fit_gallery_${user.uid}`);
        if (cached) {
          setSavedGallery(JSON.parse(cached));
        }
      } else {
        const q = query(
          collection(db, "user_inspirations"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list: InspirationItem[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...(doc.data() as any) });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedGallery(list);
        localStorage.setItem(`fit_gallery_${user.uid}`, JSON.stringify(list));
      }
    } catch (err) {
      console.warn("Error loading inspiration gallery:", err);
    }
  };

  const handleGenerateArt = async () => {
    if (!artPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImage(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prompt: artPrompt,
          aspectRatio: selectedRatio
        })
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

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setIsPlaceholder(!!data.isPlaceholder);
      } else {
        throw new Error(data.error || "No image data was generated. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during poster compilation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !user || isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        userId: user.uid,
        imageUrl: generatedImage,
        prompt: artPrompt,
        aspectRatio: selectedRatio,
        createdAt: new Date().toISOString()
      };

      if (isMockFirebase) {
        const nextList = [ { id: Math.random().toString(36).substring(7), ...payload }, ...savedGallery ];
        setSavedGallery(nextList);
        localStorage.setItem(`fit_gallery_${user.uid}`, JSON.stringify(nextList));
      } else {
        const docRef = await addDoc(collection(db, "user_inspirations"), payload);
        const newItem = { id: docRef.id, ...payload };
        setSavedGallery(prev => [newItem, ...prev]);
        localStorage.setItem(`fit_gallery_${user.uid}`, JSON.stringify([newItem, ...savedGallery]));
      }
      alert("Poster saved successfully to your Inspiration Desk!");
    } catch (err) {
      console.error(err);
      alert("Failed to save poster to cloud. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFromGallery = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to remove this piece from your gallery?")) return;
    try {
      if (isMockFirebase) {
        const nextList = savedGallery.filter(item => item.id !== id);
        setSavedGallery(nextList);
        localStorage.setItem(`fit_gallery_${user.uid}`, JSON.stringify(nextList));
      } else {
        await deleteDoc(doc(db, "user_inspirations", id));
        setSavedGallery(prev => prev.filter(item => item.id !== id));
        const nextList = savedGallery.filter(item => item.id !== id);
        localStorage.setItem(`fit_gallery_${user.uid}`, JSON.stringify(nextList));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete the specified inspiration item.");
    }
  };

  const handleDownloadImage = (url: string, pName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `AlexFitnessHub_${pName.substring(0, 15).replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const draftText = inputText;
    setInputText("");
    setSubmitting(true);
    
    try {
      await sendCoachMessage(draftText);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await sendCoachMessage(prompt);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPremium = user?.subscriptionStatus === "premium";

  // 1. PREMIUM COACT PAYWALL BLOCK
  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-radial-[circle_at_center,_rgba(16,185,129,0.04)_10%,_transparent_60%]" />
          
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest">Premium Only Access</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Unlock Your Virtual Elite Diet Coach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Unlock the advanced power-modules of **Gemini 3.5 Flash** for deep conversational biomechanics consulting, individualized water indexes, macro formulas, and nutrition charts.
            </p>
          </div>

          {/* Premium Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 align-left max-w-sm mx-auto space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full macronutrient calorie math templates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Personalized fruit-based micro-recovery logs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Step-by-step calisthenics forms coaching</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-2">Upgrade on the homepage billing cards to unlock coaching instantly.</p>
            <div className="inline-block p-1 bg-amber-500/10 border border-amber-550/20 rounded font-mono text-[9px] text-amber-500 uppercase tracking-wider">
              Requires Monthly Alpha or Yearly Champion tier
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. COACH CORE PANEL
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-[80vh] flex flex-col justify-between font-sans">
      
      {/* Top Coach Ribbon */}
      <PageHero
        title="Coach Alex Premium AI"
        subtitle="Gemini 3.5 Flash Cognitive Core"
        description="Interact with Coach Alex, your direct kinesiologist and nutrition expert. Leverage custom biomechanics, rapid stance tuning, and real-time exercise feedback."
        imageUrl="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop"
        category="AI COGNITIVE COACH"
      />

      {/* Tab switcher */}
      <div className="flex border-b border-slate-200 mt-4 mb-2 shrink-0">
        <button
          onClick={() => setActiveTab("lifestyle")}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "lifestyle"
              ? "border-[#C0392B] text-[#C0392B]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Flame className="w-4 h-4 text-[#C0392B]" />
          Belly Fat Burn & Lifestyle Hub
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "chat"
              ? "border-[#C0392B] text-[#C0392B]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cpu className="w-4 h-4 text-[#C0392B]" />
          Consult Coach Alex AI
        </button>
        <button
          onClick={() => setActiveTab("art")}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "art"
              ? "border-[#C0392B] text-[#C0392B]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#C0392B]" />
          AI Athlete Art & Poster Lab
        </button>
      </div>

      {/* CONTENT AREA: Tab Conditional Rendering */}
      {activeTab === "lifestyle" && (
        <div className="flex-1 overflow-y-auto my-4 py-4 space-y-8 px-1 scrollbar-thin text-left">
          
          {/* HEADER HERO CARD */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-24 h-24 text-[#C0392B]" />
            </div>
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C0392B] bg-red-50 px-2.5 py-1 rounded-full font-mono">
                Premium Elite Guide
              </span>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mt-3 mb-2">
                The Ultimate Visceral Belly Fat Oxidation & Stay-Fit Blueprint
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                Visceral abdominal fat is metabolically active and directly tied to cortisol (stress) and sleep cycles. Under this premium lifestyle guidelines, daily chronobiology routine, and highly specialized core-activation compound exercises, you can accelerate fat lipolysis and maintain peak fitness.
              </p>
            </div>
          </div>

          {/* SECTION 1: LIFESTYLE GUIDELINES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Heart className="w-5 h-5 text-[#C0392B]" />
              <h3 className="text-sm font-black text-[#C0392B] uppercase tracking-wider font-sans">
                I. Premium Lifestyle Guidelines
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-red-100 text-[#C0392B] text-xs font-black font-mono">Pillar A</span>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Sleep Optimization (Hormone Synergy)</h4>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Deep restorative sleep (specifically stage 3 & 4 non-REM sleep) lowers systemic insulin resistance and regulates ghrelin and leptin (hunger hormones). <strong>Target: 7.5 to 8.5 hours of uninterrupted sleep.</strong> Turn off all digital screens at least 90 minutes before sleep to facilitate melatonin secretion.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-red-100 text-[#C0392B] text-xs font-black font-mono">Pillar B</span>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Hydration Lipolysis Command</h4>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Water is a critical substrate in beta-oxidation (the biochemical process of breaking down fats). Drinking cold water stimulates mild thermogenesis. <strong>Target: 3.5 to 4.5 liters daily.</strong> Drink 500ml immediately upon waking and another 500ml 30 minutes before any resistance training.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-red-100 text-[#C0392B] text-xs font-black font-mono">Pillar C</span>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Cortisol Suppression & Breathing</h4>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  High stress hormones (cortisol) signal the body to specifically store visceral fat in the lower abdomen as an emergency reserve. <strong>Target: 10 minutes of daily mindfulness nasal box-breathing.</strong> Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds to trigger parasympathetic calming.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-red-100 text-[#C0392B] text-xs font-black font-mono">Pillar D</span>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Nutritional Caloric Deficit Threshold</h4>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Maintain a clean caloric deficit of 15% (approximately 300 to 500 calories below maintenance) focusing on high-density protein (2.0g per kilogram of lean body mass) and high-fiber cruciferous vegetables. Eliminate all refined sugars, alcohol, and hydrogenated oils which directly trigger liver and visceral inflammation.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: DAILY ROUTINE (CHRONOBIOLOGY) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Clock className="w-5 h-5 text-[#C0392B]" />
              <h3 className="text-sm font-black text-[#C0392B] uppercase tracking-wider font-sans">
                II. Daily Chronobiology Fat-Burn Routine
              </h3>
            </div>

            <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white">
              <div className="grid grid-cols-3 bg-[#C0392B] text-white p-3 text-xs font-black uppercase tracking-wider text-center">
                <div>Time Block</div>
                <div>Protocol Activity</div>
                <div>Metabolic Purpose & Impact</div>
              </div>
              <div className="divide-y divide-slate-200 text-xs text-black">
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">06:30 AM</div>
                  <div className="font-semibold text-[#C0392B]">Fasted Hydration & Active Mobilization</div>
                  <div className="text-slate-650 text-[11px]">Squeeze fresh lemon into 500ml of room-temp water. Perform 10 mins of full-body mobility stretches to activate systemic blood circulation.</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">07:00 AM</div>
                  <div className="font-semibold text-[#C0392B]">Fasted incline Walking / LISS Cardio</div>
                  <div className="text-slate-650 text-[11px]">30-40 minutes of incline treadmill walk (12% incline, 3.0 mph). Fasted LISS prioritizes lipid oxidation as glycogen levels are low.</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">08:30 AM</div>
                  <div className="font-semibold text-[#C0392B]">Low-Glycemic High-Protein Breakfast</div>
                  <div className="text-slate-650 text-[11px]">3 whole eggs scrambled with spinach, 1/2 sliced avocado, and a handful of blackberries. Keeps insulin flat while fueling thermic effect of food (TEF).</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">12:30 PM</div>
                  <div className="font-semibold text-[#C0392B]">High-Density Fibrous Carbs Lunch</div>
                  <div className="text-slate-650 text-[11px]">200g grilled chicken breast or baked salmon, 80g quinoa, steamed broccoli and asparagus. Asparagus acts as a natural diuretic.</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">04:30 PM</div>
                  <div className="font-semibold text-[#C0392B]">Metabolic Resistance Protocol</div>
                  <div className="text-slate-650 text-[11px]">Execute the 4 belly fat exercises detailed below. Focus on explosive compound movements to trigger a high 24-hour afterburn (EPOC effect).</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">07:00 PM</div>
                  <div className="font-semibold text-[#C0392B]">Anti-Inflammatory Dinner</div>
                  <div className="text-slate-650 text-[11px]">Baked cod or lean sirloin, a massive green salad massaged with extra virgin olive oil, and steamed asparagus. Asparagus stabilizes renal filtration.</div>
                </div>
                <div className="grid grid-cols-3 p-3 text-center items-center">
                  <div className="font-bold font-mono">09:30 PM</div>
                  <div className="font-semibold text-[#C0392B]">Wind-Down Breathing & Screen Lock</div>
                  <div className="text-slate-650 text-[11px]">Shut down electronic devices. Drink chamomile tea or take magnesium bisglycinate. Perform 5 minutes of box breathing to lower sleep-onset cortisol.</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: EXERCISE ROUTINES (4 SPECIALLY TARGETED CORE AND METABOLIC BURNERS) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Flame className="w-5 h-5 text-[#C0392B]" />
              <h3 className="text-sm font-black text-[#C0392B] uppercase tracking-wider font-sans">
                III. Specialized Belly Fat Burning Exercise Routine
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Exercise 1 */}
              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#C0392B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">EXERCISE 1</span>
                    <span className="text-[10px] font-mono text-[#C0392B] font-bold">4 Sets x 15 Reps</span>
                  </div>
                  <h4 className="text-sm font-black text-black uppercase tracking-tight">Hanging Knee-to-Chest / Leg Raises</h4>
                  
                  {/* CENTRALIZED EXERCISE MEDIA */}
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 relative bg-slate-900 shadow-xs">
                    <WorkoutVisual 
                      exerciseId={ex1?.id} 
                      exerciseName="Hanging Knee-to-Chest / Leg Raises" 
                      isCard={true} 
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <p className="text-[11px]"><strong>Starting Position:</strong> Hang fully extended from a stable pull-up bar using an overhand grip, shoulders active (scapula depressed), feet together.</p>
                    <p className="text-[11px]"><strong>Movement Execution:</strong> Exhale forcefully, contract your deep transverse abdominis, and raise your knees to chest height (or legs parallel). Squeeze for 1 second at the peak, then slowly lower your legs over 2 seconds. Do not swing or use momentum.</p>
                    <p className="text-[11px]"><strong>Why it Burns Belly Fat:</strong> Targets the entire lower rectus abdominis wall and internal obliques. Squeezing at the top promotes deep abdominal muscle thickness, compressing the core.</p>
                  </div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-[10px] text-slate-800 font-sans italic">
                  <strong>Coach Tip:</strong> Initiate the movement by tucking your pelvis upward first, rather than just pulling with your hip flexors.
                </div>
              </div>

              {/* Exercise 2 */}
              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#C0392B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">EXERCISE 2</span>
                    <span className="text-[10px] font-mono text-[#C0392B] font-bold">4 Sets x 12 Reps</span>
                  </div>
                  <h4 className="text-sm font-black text-black uppercase tracking-tight">High-Intensity Dumbbell Thrusters</h4>
                  
                  {/* CENTRALIZED EXERCISE MEDIA */}
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 relative bg-slate-900 shadow-xs">
                    <WorkoutVisual 
                      exerciseId={ex2?.id} 
                      exerciseName="High-Intensity Dumbbell Thrusters" 
                      isCard={true} 
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <p className="text-[11px]"><strong>Starting Position:</strong> Stand with feet shoulder-width, toes flared slightly out. Hold two dumbbells at shoulder level with a neutral grip.</p>
                    <p className="text-[11px]"><strong>Movement Execution:</strong> Inhale and sit back into a deep squat, keeping elbows high and core fully locked. Explode upward using leg power, using that momentum to press the dumbbells fully overhead. Lower dumbbells to shoulders and repeat immediately.</p>
                    <p className="text-[11px]"><strong>Why it Burns Belly Fat:</strong> The ultimate full-body metabolic driver. Activating legs, core, back, and shoulders simultaneously demands enormous glycogen storage, generating a massive metabolic deficit.</p>
                  </div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-[10px] text-slate-800 font-sans italic">
                  <strong>Coach Tip:</strong> Keep your heels glued to the ground and drive your hips forward violently to launch the weights overhead.
                </div>
              </div>

              {/* Exercise 3 */}
              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#C0392B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">EXERCISE 3</span>
                    <span className="text-[10px] font-mono text-[#C0392B] font-bold">3 Sets x 8 Reps/Side</span>
                  </div>
                  <h4 className="text-sm font-black text-black uppercase tracking-tight">Dumbbell Renegade Rows with Push-Up</h4>
                  
                  {/* CENTRALIZED EXERCISE MEDIA */}
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 relative bg-slate-900 shadow-xs">
                    <WorkoutVisual 
                      exerciseId={ex3?.id} 
                      exerciseName="Dumbbell Renegade Rows with Push-Up" 
                      isCard={true} 
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <p className="text-[11px]"><strong>Starting Position:</strong> High plank position with hands clutching two hexagonal dumbbells directly beneath your shoulders. Feet wider than hips for stability.</p>
                    <p className="text-[11px]"><strong>Movement Execution:</strong> Perform a strict push-up. At the top, pull your right elbow back to row the dumbbell to your hip, maintaining dead-flat hips. Lower it, and perform a row on the left side. That is one complete rep.</p>
                    <p className="text-[11px]"><strong>Why it Burns Belly Fat:</strong> Combines heavy chest, back, and arm kinesis with an extreme anti-rotational core hold. The core must contract maximum force to prevent the hips from swaying during row transitions.</p>
                  </div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-[10px] text-slate-800 font-sans italic">
                  <strong>Coach Tip:</strong> Spread your feet wider to prevent your pelvis from tipping or twisting during the rows.
                </div>
              </div>

              {/* Exercise 4 */}
              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#C0392B] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">EXERCISE 4</span>
                    <span className="text-[10px] font-mono text-[#C0392B] font-bold">4 Sets x 20 Reps</span>
                  </div>
                  <h4 className="text-sm font-black text-black uppercase tracking-tight">Explosive Hip-Hinge Kettlebell Swings</h4>
                  
                  {/* CENTRALIZED EXERCISE MEDIA */}
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 relative bg-slate-900 shadow-xs">
                    <WorkoutVisual 
                      exerciseId={ex4?.id} 
                      exerciseName="Explosive Hip-Hinge Kettlebell Swings" 
                      isCard={true} 
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    <p className="text-[11px]"><strong>Starting Position:</strong> Stand with feet slightly wider than shoulder-width. Place a kettlebell or heavy dumbbell about 12 inches in front of you. Hinge hips backwards.</p>
                    <p className="text-[11px]"><strong>Movement Execution:</strong> Grab the weight, pull it back between your legs to load your hamstrings. Snap your hips forward violently, squeezing your glutes and locking your core, which drives the kettlebell to chest height. Let it swing back under control, hinge and repeat.</p>
                    <p className="text-[11px]"><strong>Why it Burns Belly Fat:</strong> Combines powerful posterior-chain strength with highly intensive cardiorespiratory output. Triggers intense lipid oxidation and stabilizes core bracing.</p>
                  </div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-[10px] text-slate-800 font-sans italic">
                  <strong>Coach Tip:</strong> The swing is a hinge, NOT a squat. Your torso should stay straight, folding back from your hips.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === "chat" && (
        <>
          {chatMessages.length > 0 && (
            <div className="flex justify-end px-2 shrink-0 my-2">
              <button
                onClick={clearCoachChat}
                className="text-[10px] font-mono font-black text-[#C0392B] hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat History
              </button>
            </div>
          )}
          {/* CHAT LOG AREA */}
          <div className="flex-1 overflow-y-auto my-4 py-4 space-y-4 px-1 scrollbar-thin">
            
            {chatMessages.length === 0 ? (
              <div className="space-y-6 max-w-xl mx-auto py-12 text-center text-slate-500">
                <div className="h-12 w-12 bg-red-100 text-[#C0392B] border border-red-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black">Start your Premium Fitness Consultation</h4>
                  <p className="text-xs max-w-sm mx-auto text-slate-600 font-sans">
                    Hi! I am Alex, your Premium Personal Trainer. Ask me specialized questions regarding target weights, metabolic calorie guide formulas, fat-recomposition splits, and recovery templates.
                  </p>
                </div>

                {/* Quick Suggestions grid */}
                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-left">
                  {[
                    "Suggest a customized routine to assist in abdominal fat-loss",
                    "Suggest a calculated daily calorie guide for body recomposition",
                    "What minerals & fruits should I eat to decrease workout soreness?",
                    "How can I transition standard bench pressing into bodyweight pushups?"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="p-3 text-xs bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:border-[#C0392B] transition text-left cursor-pointer font-sans"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={msg.id}
                      className={`flex items-start gap-3 max-w-4xl ${isUser ? "justify-end ml-auto" : "mr-auto"}`}
                    >
                      {!isUser && (
                        <div className="h-8 w-8 bg-[#C0392B] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow">
                          A
                        </div>
                      )}

                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? "bg-[#C0392B] text-white rounded-tr-none px-4 shadow text-left" 
                          : "bg-white border border-slate-200 rounded-tl-none whitespace-pre-wrap font-sans text-black text-left"
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          {msg.message.split("\n").map((para, i) => {
                            if (para.startsWith("### ")) {
                              return <h4 key={i} className="text-xs font-black text-[#C0392B] mt-3 mb-1 uppercase tracking-wide">{para.replace("### ", "")}</h4>;
                            }
                            if (para.startsWith("#### ")) {
                              return <h5 key={i} className="text-[11px] font-black text-black mt-2 mb-1 uppercase">{para.replace("#### ", "")}</h5>;
                            }
                            if (para.startsWith("- ") || para.startsWith("* ")) {
                              return <li key={i} className="ml-3 mt-1 text-black list-disc list-inside">{para.substring(2)}</li>;
                            }
                            return <p key={i} className="mt-1 leading-normal text-black">{para}</p>;
                          })}
                        </div>
                        
                        <span className="block text-[8px] text-slate-500 text-right mt-2 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isUser && (
                        <div className="h-8 w-8 bg-slate-100 text-black rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                          U
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dynamic AI Generation loading pulse */}
            {submitting && (
              <div className="flex items-start gap-3 max-w-xl mr-auto">
                <div className="h-8 w-8 bg-[#C0392B] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 animate-pulse" />
                <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-none flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full animate-bounce delay-200" />
                  <span className="text-[10px] uppercase font-mono font-bold text-[#C0392B] tracking-wider ml-1">Alex Coach is generating Calorie indexes...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT CONTROLLER BLOCK */}
          <form onSubmit={handleSend} className="p-3 rounded-2xl bg-white border border-slate-200 flex gap-2 shrink-0">
            <input
              type="text"
              disabled={submitting}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={submitting ? "Alex is computing calories..." : "Ask Coach Alex: e.g. Suggest a fat-recomposting nutrition outline..."}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              className="p-2.5 rounded-xl bg-[#C0392B] text-white hover:bg-[#A82E22] disabled:bg-slate-100 disabled:text-slate-400 transition flex items-center justify-center shadow cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

      {activeTab === "art" && (
        <div className="flex-1 overflow-y-auto my-4 py-4 space-y-8 px-1 text-left scrollbar-thin">
          
          {/* HEADER ART INTRO */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ImageIcon className="w-32 h-32 text-white" />
            </div>
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC107] bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full font-mono">
                Premium Visual Studio
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight mt-3 mb-2 font-sans">
                AI Athlete Art & Poster Lab
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Bring your fitness aspirations to life visually. Design personalized workout wall-charts, hyper-detailed muscle diagrams, diet prep guides, or motivational athletic wallpapers. Specially optimized for high-definition studio formats.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT INPUT CONTROLLER PANEL */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Prompt Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#C0392B]" />
                  1. Craft Your Prompt
                </h3>
                
                {/* Text Area */}
                <textarea
                  rows={4}
                  value={artPrompt}
                  onChange={(e) => setArtPrompt(e.target.value)}
                  placeholder="Describe your perfect poster. E.g., 'An elegant athlete performing handstand push-ups under neon red lighting on a concrete fitness studio floor, cinematic 8k quality...'"
                  disabled={isGenerating}
                  className="w-full text-xs text-black border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C0392B] focus:border-[#C0392B] bg-slate-50/50 resize-none disabled:opacity-50"
                />

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Quick Design Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { title: "🏋️‍♂️ Industrial Lift", text: "Hyperrealistic muscular athlete lift posing in a dark industrial gym with red neon accents, heavy shadows, cinematic dramatic lighting, 8k resolution" },
                      { title: "🧘‍♀️ Yoga Sunrise", text: "Elegant fitness coach doing yoga pose on a seaside balcony at sunrise, soft golden hour lighting, lens flare, pastel serene tones" },
                      { title: "🥩 Keto Prep Art", text: "Modern aesthetic overhead food photography of a healthy fitness meal prep container containing avocado, grilled sliced salmon, green asparagus, and wild rice, colorful vibrant lighting" },
                      { title: "🔥 Motivation Wall", text: "Retro style boxing gym motivational poster with distressed textures, a sketch of a barbell, and bold high-contrast text reading 'NO SHORTCUTS, ONLY SWEAT'" }
                    ].map((preset) => (
                      <button
                        key={preset.title}
                        onClick={() => setArtPrompt(preset.text)}
                        disabled={isGenerating}
                        className="text-[9px] bg-slate-50 border border-slate-200 hover:border-[#C0392B] hover:bg-rose-50 text-slate-700 hover:text-[#C0392B] px-2 py-1 rounded-lg transition font-sans cursor-pointer disabled:opacity-50 font-semibold"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C0392B]" />
                  2. Select Frame Aspect Ratio
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "1:1", label: "1:1 Square", desc: "Profile Avatar" },
                    { value: "2:3", label: "2:3 Portrait", desc: "Phone Wallpaper" },
                    { value: "3:2", label: "3:2 Landscape", desc: "Slide / Card" },
                    { value: "3:4", label: "3:4 Portrait", desc: "Classic Poster" },
                    { value: "4:3", label: "4:3 Standard", desc: "Thumbnail" },
                    { value: "9:16", label: "9:16 Vertical", desc: "TikTok / Stories" },
                    { value: "16:9", label: "16:9 Cinema", desc: "Widescreen Cover" },
                    { value: "21:9", label: "21:9 Panoramic", desc: "Ultra-Wide Screen" }
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setSelectedRatio(ratio.value)}
                      disabled={isGenerating}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer disabled:opacity-50 ${
                        selectedRatio === ratio.value
                          ? "border-[#C0392B] bg-rose-50/20 text-[#C0392B] ring-1 ring-[#C0392B]"
                          : "border-slate-200 hover:border-slate-400 bg-white text-slate-700"
                      }`}
                    >
                      <span className="text-xs font-black tracking-tight">{ratio.label}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{ratio.desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateArt}
                  disabled={isGenerating || !artPrompt.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold bg-[#C0392B] hover:bg-[#A82E22] text-white disabled:bg-slate-100 disabled:text-slate-400 transition flex items-center justify-center gap-2 shadow cursor-pointer text-xs uppercase tracking-wider mt-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Weaving Athletic Matrix...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Compile Custom Poster
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT PREVIEW & GALLERY AREA */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Live Canvas Frame */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>3. Master Preview Board</span>
                  {isGenerating && (
                    <span className="text-[10px] bg-red-100 text-[#C0392B] px-2 py-0.5 rounded-full font-mono animate-pulse uppercase">
                      Generating...
                    </span>
                  )}
                </h3>

                <div className="border border-slate-100 rounded-2xl bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 min-h-[320px]">
                  
                  {isGenerating ? (
                    <div className="text-center p-6 space-y-4 max-w-sm mx-auto animate-fade-in">
                      <Loader2 className="w-10 h-10 text-[#C0392B] animate-spin mx-auto" />
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Designing Your Fitness Masterpiece</h4>
                        <p className="text-[10px] text-slate-400 italic">"The secret of getting ahead is getting started. We are rendering details with Gemini-3.1."</p>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full space-y-4 animate-fade-in">
                      
                      {/* Image container with strict custom aspect ratios */}
                      <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white mx-auto max-w-md transition-all duration-300">
                        <img
                          src={generatedImage}
                          alt="AI generated athletic piece"
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            selectedRatio === "1:1" ? "aspect-square" :
                            selectedRatio === "2:3" ? "aspect-[2/3]" :
                            selectedRatio === "3:2" ? "aspect-[3/2]" :
                            selectedRatio === "3:4" ? "aspect-[3/4]" :
                            selectedRatio === "4:3" ? "aspect-[4/3]" :
                            selectedRatio === "9:16" ? "aspect-[9/16]" :
                            selectedRatio === "16:9" ? "aspect-[16/9]" :
                            selectedRatio === "21:9" ? "aspect-[21/9]" : "aspect-square"
                          }`}
                        />
                      </div>

                      {isPlaceholder && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-slate-700 text-center leading-relaxed">
                          ⚠️ <strong>Key Config Warning:</strong> Served in high-quality dynamic placeholder mode. To unlock unlimited real-world AI poster generations, specify a real <strong>GEMINI_API_KEY</strong> in the environment variables.
                        </div>
                      )}

                      {/* Controls Row */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleDownloadImage(generatedImage, artPrompt)}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Poster
                        </button>
                        <button
                          onClick={handleSaveToGallery}
                          disabled={isSaving}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Save to Inspiration Desk
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-3 text-slate-400">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canvas Screen Empty</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                          Specify a detailed prompt on the left, select your format, and press compile to initiate high-fidelity rendering!
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Saved Gallery Board */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C0392B]" />
                    Inspiration Board ({savedGallery.length})
                  </span>
                  <button
                    onClick={loadGallery}
                    title="Reload Gallery"
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </h3>

                {savedGallery.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                    <p className="text-xs font-bold">No saved posters yet</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Any poster you generate and save will be stored safely in your Firestore cloud database for future viewing.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {savedGallery.map((item) => (
                      <div
                        key={item.id}
                        className="group relative border border-slate-100 rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col justify-between font-sans"
                      >
                        {/* Custom aspect ratio fitting based on item's meta */}
                        <div className="relative overflow-hidden bg-white">
                          <img
                            src={item.imageUrl}
                            alt={item.prompt}
                            referrerPolicy="no-referrer"
                            className={`w-full object-cover group-hover:scale-105 transition duration-300 ${
                              item.aspectRatio === "1:1" ? "aspect-square" :
                              item.aspectRatio === "2:3" ? "aspect-[2/3]" :
                              item.aspectRatio === "3:2" ? "aspect-[3/2]" :
                              item.aspectRatio === "3:4" ? "aspect-[3/4]" :
                              item.aspectRatio === "4:3" ? "aspect-[4/3]" :
                              item.aspectRatio === "9:16" ? "aspect-[9/16]" :
                              item.aspectRatio === "16:9" ? "aspect-[16/9]" :
                              item.aspectRatio === "21:9" ? "aspect-[21/9]" : "aspect-square"
                            }`}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDownloadImage(item.imageUrl, item.prompt)}
                              className="p-1.5 bg-white text-slate-800 rounded-md hover:bg-slate-100 transition shadow-md cursor-pointer"
                              title="Download Poster"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFromGallery(item.id)}
                              className="p-1.5 bg-white text-rose-600 rounded-md hover:bg-rose-50 transition shadow-md cursor-pointer"
                              title="Delete from Board"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Prompt Caption */}
                        <div className="p-2 text-[9px] text-slate-600 truncate bg-white border-t border-slate-100 font-sans leading-tight">
                          <span className="font-bold uppercase text-[7px] text-[#C0392B] tracking-wider block font-mono">{item.aspectRatio} format</span>
                          {item.prompt}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
