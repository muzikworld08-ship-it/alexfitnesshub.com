import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Menu, X, Shield, Lock, Award, ChevronDown, Calendar, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  onOpenAuth: () => void;
}

export default function Navbar({ currentView, setView, onOpenAuth }: NavbarProps) {
  const { user, logout, loginWithGoogle } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCustomNav = (targetView: string, subview?: string, elementId?: string) => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    
    // Check if view is restricted (requires login)
    const loginRequiredViews = ["daily-plan", "nutrition", "coach", "workout-generator", "library", "community", "dashboard", "weekly-reports", "daily-habit-tracker", "daily-calibration-desk", "handbook", "weight-trajectory", "workout-videos", "saved-exercises", "challenges", "belly-fat-shred"];
    if (loginRequiredViews.includes(targetView) && !user) {
      onOpenAuth();
      return;
    }
    
    // If the user is on the free plan, block premium workouts and redirect to pricing section on Home
    if (user && user.subscriptionStatus !== "premium" && user.role !== "admin") {
      const standalonePremiumViews = ["library", "workout-generator", "workout-videos", "saved-exercises", "coach", "nutrition", "daily-plan", "challenges", "community", "weekly-reports", "daily-habit-tracker", "daily-calibration-desk", "handbook", "weight-trajectory", "dashboard"];
      if (standalonePremiumViews.includes(targetView)) {
        setView("home");
        setTimeout(() => {
          const el = document.getElementById("pricing");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
        return;
      }
    }

    setView(targetView);

    if (elementId) {
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFreeInteractiveNav = (tabId: "trajectory" | "community" | "calibration" | "habits") => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setView("home");
    
    if (typeof window !== "undefined") {
      (window as any).__activeDemoTab = tabId;
      window.dispatchEvent(new CustomEvent("set-demo-tab", { detail: tabId }));
    }

    setTimeout(() => {
      const el = document.getElementById("public-live-desk");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 180);
  };

  const menuItems = [
    { id: "home", label: "HOME", action: () => handleCustomNav("home") },
    { id: "lifestyle-academy", label: "PROGRAMS", action: () => handleCustomNav("lifestyle-academy") },
    { id: "library", label: "WORKOUTS", action: () => handleCustomNav("library") },
    { id: "workout-videos", label: "EXERCISES", action: () => handleCustomNav("workout-videos") },
    { id: "nutrition", label: "NUTRITION", action: () => handleCustomNav("nutrition") },
    { id: "calculators", label: "CALCULATORS", action: () => { if (user) { handleCustomNav("daily-calibration-desk"); } else { handleFreeInteractiveNav("calibration"); } } },
    { id: "coach", label: "AI COACH", action: () => handleCustomNav("coach") },
    { id: "community", label: "COMMUNITY", action: () => { if (user) { handleCustomNav("community"); } else { handleFreeInteractiveNav("community"); } } },
    {
      id: "premium-zone",
      label: "PREMIUM HUB",
      isDropdown: true,
      subItems: [
        { id: "daily-plan", label: "My Daily Plan", desc: "Tailored training & meal schedule", icon: Calendar },
        { id: "challenges", label: "Monthly Challenges", desc: "90-day physical competitions", icon: Award },
        { id: "belly-fat-shred", label: "Belly Fat Shred", desc: "Accelerated direct core fat loss", icon: Flame },
        { id: "dashboard", label: "Athlete Dashboard", desc: "Track progress, reports & stats", icon: Shield }
      ]
    },
    { id: "pricing", label: "PRICING", action: () => { setView("home"); setTimeout(() => { document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200); } }
  ];

  return (
    <>
      {/* Redesigned Sticky Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E8E8E8] h-20 shadow-sm flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 flex items-center justify-between h-full">
          
          {/* Logo Left */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleCustomNav("home");
              }}
              className="flex items-center select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E53935] rounded-lg"
              aria-label="AlexFitnessHub Home View"
            >
              <Logo size="sm" showText={true} showSubtext={false} hideTextOnMobile={false} />
            </a>
          </div>

          {/* Menu Right (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Desktop Navigation Menu">
            {menuItems.map((item) => {
              if (item.isDropdown) {
                const isActive = ["daily-plan", "challenges", "belly-fat-shred", "dashboard"].includes(currentView);
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`text-sm font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer border-b-2 py-1 flex items-center gap-1 ${
                        isActive 
                          ? "text-[#E53935] border-[#E53935]" 
                          : "text-[#2B2B2B] border-transparent hover:text-[#E53935]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[#E53935]" : "text-[#707070]"}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white border border-[#E8E8E8] rounded-2xl shadow-xl py-3 z-50 text-left"
                        >
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = currentView === subItem.id;
                            return (
                              <button
                                key={subItem.id}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  handleCustomNav(subItem.id);
                                }}
                                className={`w-full flex items-start gap-3.5 px-5 py-3 transition-all text-left border-0 cursor-pointer ${
                                  isSubActive 
                                    ? "bg-red-50/60 text-[#E53935]" 
                                    : "text-[#2B2B2B] hover:bg-[#FAFAFA]"
                                }`}
                              >
                                <SubIcon className={`w-5 h-5 mt-0.5 shrink-0 ${isSubActive ? "text-[#E53935]" : "text-[#707070]"}`} />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[13px] font-bold uppercase tracking-wide leading-tight">
                                    {subItem.label}
                                  </span>
                                  <span className="text-[11px] text-[#707070] mt-0.5 font-medium truncate">
                                    {subItem.desc}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Highlight active menu item based on current view match
              const isActive = 
                currentView === item.id || 
                (item.id === "pricing" && currentView === "home" && window.location.hash === "#pricing");
                
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`text-sm font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer border-b-2 py-1 ${
                    isActive 
                      ? "text-[#E53935] border-[#E53935]" 
                      : "text-[#2B2B2B] border-transparent hover:text-[#E53935]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Authentication Button Desktop */}
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="ml-2 bg-[#E53935] hover:bg-[#C62828] text-white text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[10px] transition-all duration-250 cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover border border-[#E8E8E8]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white font-black text-xs uppercase">
                    {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "A")}
                  </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    setView("home");
                  }}
                  className="border border-[#E8E8E8] hover:border-[#E53935] text-[#707070] hover:text-[#E53935] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-[8px] transition-all duration-250 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 border border-[#E8E8E8] hover:bg-[#FAFAFA] rounded-xl transition cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 text-[#2B2B2B]" />
            </button>
          </div>

        </div>
      </header>

      {/* Slide-In Menu Drawer for Mobile (Redesigned) */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute top-0 bottom-0 right-0 w-[80%] max-w-[400px] bg-white shadow-xl flex flex-col p-6 justify-between pointer-events-auto"
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[#E8E8E8] mb-4 shrink-0">
                  <Logo size="sm" showText={true} showSubtext={false} />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-full border border-[#E8E8E8] text-[#707070] hover:text-[#E53935] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Card if Authenticated */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl mb-4 shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover shadow-inner" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center text-white font-black text-sm uppercase">
                        {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "A")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#2B2B2B] truncate uppercase">
                        {user.displayName || "Athlete"}
                      </h4>
                      <p className="text-xs text-[#707070] truncate leading-none mt-0.5">
                        {user.email}
                      </p>
                      {user.subscriptionStatus === "premium" && (
                        <span className="inline-block text-[9px] font-bold uppercase text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1.5">
                          👑 Premium Athlete
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Vertical menu list */}
                <nav className="flex flex-col space-y-1 overflow-y-auto pr-1 flex-grow" aria-label="Mobile Navigation Menu">
                  {menuItems.filter(item => !item.isDropdown).map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={`w-full text-left py-2.5 px-4 rounded-xl text-[14px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-[#E53935] text-white"
                            : "text-[#2B2B2B] hover:bg-[#FAFAFA] hover:text-[#E53935]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                  {/* Premium Hub Mobile Accordion */}
                  <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
                    <span className="text-[10px] font-bold text-[#E53935] uppercase tracking-widest px-4 block mb-2 font-sans">
                      🏆 PREMIUM ZONE
                    </span>
                    <div className="space-y-1">
                      {[
                        { id: "daily-plan", label: "📅 My Daily Plan", action: () => handleCustomNav("daily-plan") },
                        { id: "challenges", label: "🏆 Monthly Challenges", action: () => handleCustomNav("challenges") },
                        { id: "belly-fat-shred", label: "🔥 Belly Fat Shred", action: () => handleCustomNav("belly-fat-shred") },
                        { id: "dashboard", label: "📊 Athlete Dashboard", action: () => handleCustomNav("dashboard") }
                      ].map((subItem) => {
                        const isSubActive = currentView === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setIsMenuOpen(false);
                              subItem.action();
                            }}
                            className={`w-full text-left py-2.5 px-4 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                              isSubActive
                                ? "bg-[#E53935]/10 text-[#E53935] border-l-4 border-[#E53935]"
                                : "text-[#707070] hover:bg-[#FAFAFA] hover:text-[#E53935]"
                            }`}
                          >
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </nav>

                {/* Drawer Footer CTA */}
                <div className="pt-4 border-t border-[#E8E8E8] mt-4 shrink-0 space-y-2">
                  {!user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full py-3.5 rounded-[10px] bg-[#E53935] text-white hover:bg-[#C62828] text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        Login / Sign In
                      </button>
                      <button
                        onClick={async () => {
                          setIsMenuOpen(false);
                          try {
                            await loginWithGoogle();
                          } catch (e) {
                            onOpenAuth();
                          }
                        }}
                        className="w-full py-3.5 rounded-[10px] border border-[#E8E8E8] text-[#2B2B2B] hover:bg-[#FAFAFA] text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                          setView("home");
                        }}
                        className="w-full py-3 rounded-[10px] border border-[#E8E8E8] text-[#707070] hover:text-[#E53935] hover:border-[#E53935] text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
