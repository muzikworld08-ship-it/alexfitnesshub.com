import React from "react";
import { useApp } from "../context/AppContext";

interface LogoProps {
  className?: string;
  showText?: boolean;
  showSubtext?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  hideTextOnMobile?: boolean;
}

export default function Logo({ className = "", showText = true, showSubtext = false, size = "md", hideTextOnMobile = false }: LogoProps) {
  const { theme } = useApp();

  // Responsive sizing configurations
  const sizeClasses = {
    sm: {
      svg: "w-8 h-8",
      text: "text-base sm:text-lg",
      subtext: "text-[7px]",
      gap: "gap-1.5"
    },
    md: {
      svg: "w-10 h-10 sm:w-11 sm:h-11",
      text: "text-lg sm:text-xl md:text-2xl",
      subtext: "text-[9px]",
      gap: "gap-2"
    },
    lg: {
      svg: "w-16 h-16 sm:w-20 sm:h-20",
      text: "text-2xl sm:text-3xl",
      subtext: "text-xs",
      gap: "gap-3"
    },
    xl: {
      svg: "w-28 h-28 sm:w-36 sm:h-36",
      text: "text-3xl sm:text-4xl md:text-5xl",
      subtext: "text-xs sm:text-sm",
      gap: "gap-4"
    }
  }[size];

  return (
    <div className={`flex items-center ${sizeClasses.gap} ${className} select-none shrink-0`}>
      {/* SVG Emblem: Replicating Hexagon, Running Athlete, Barbell & Shield */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeClasses.svg} shrink-0`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. Barbell behind athlete (silver/grey) */}
        <g id="barbell" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round">
          {/* Barbell shaft */}
          <line x1="12" y1="50" x2="88" y2="50" strokeWidth="3" />
          {/* Inner collars */}
          <line x1="22" y1="44" x2="22" y2="56" strokeWidth="2.5" />
          <line x1="78" y1="44" x2="78" y2="56" strokeWidth="2.5" />
          {/* Weight plates */}
          <rect x="14" y="38" width="6" height="24" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="8" y="42" width="4" height="16" rx="1.5" fill="#64748B" stroke="#475569" strokeWidth="1" />
          <rect x="80" y="38" width="6" height="24" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />
          <rect x="88" y="42" width="4" height="16" rx="1.5" fill="#64748B" stroke="#475569" strokeWidth="1" />
        </g>

        {/* 2. Outer Blue Hexagon Outline */}
        <polygon 
          points="50,6 90,28 90,72 50,94 10,72 10,28" 
          stroke="#0EA5E9" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
          fill="none"
        />

        {/* 3. Athlete Silhouettes & Actions (Gradients of Orange & Blue) */}
        <g id="running-athlete">
          {/* Athlete head (Blue) */}
          <circle cx="58" cy="24" r="5" fill="#38BDF8" />
          
          {/* Dynamic running torso & arms (Orange & Blue) */}
          {/* Front Arm (Orange) */}
          <path 
            d="M 60,33 C 65,33 68,30 68,26" 
            stroke="#F97316" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />
          {/* Front arm fist */}
          <circle cx="68" cy="26" r="2" fill="#F97316" />

          {/* Back arm (Blue) */}
          <path 
            d="M 46,31 C 41,31 38,34 36,37" 
            stroke="#0284C7" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none" 
          />
          <circle cx="36" cy="37" r="1.5" fill="#0284C7" />

          {/* Running Legs (Orange & Blue in motion) */}
          {/* Front Leg (Blue / Orange gradient path) */}
          <path 
            d="M 45,58 L 33,65 L 36,75" 
            stroke="#38BDF8" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          {/* Back Leg (Orange) */}
          <path 
            d="M 52,58 L 57,68 L 48,78" 
            stroke="#F97316" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
        </g>

        {/* 4. Central Shield with Chevrons overlay */}
        <g id="shield-group" transform="translate(0, -3)">
          {/* Shield Base (Deep Slate/Charcoal body with Orange border) */}
          <path 
            d="M 50,34 C 40,34 38,38 38,48 C 38,58 50,67 50,67 C 50,67 62,58 62,48 C 62,38 60,34 50,34 Z" 
            fill="#0F172A" 
            stroke="#F97316" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />
          
          {/* 3 Chevrons inside shield pointing upward (Golden Orange) */}
          <path 
            d="M 44,45 L 50,39 L 56,45" 
            stroke="#FF9F1C" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          <path 
            d="M 44,51 L 50,45 L 56,51" 
            stroke="#FF9F1C" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          <path 
            d="M 44,57 L 50,51 L 56,57" 
            stroke="#FF9F1C" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
        </g>
      </svg>

      {/* Brand Text Titles */}
      {showText && (
        <div className={`${hideTextOnMobile ? "hidden min-[450px]:flex" : "flex"} flex-col items-start leading-none shrink-0 overflow-hidden whitespace-nowrap`}>
          <div className={`font-sans font-black uppercase tracking-tighter ${sizeClasses.text} flex flex-row items-center flex-nowrap whitespace-nowrap`}>
            <span className="text-[#2B2B2B]">ALEXFITNESS</span>
            <span className="text-[#E53935]">HUB</span>
          </div>
          {showSubtext && (
            <span className={`font-mono font-bold tracking-widest text-[#F97316] uppercase mt-0.5 ${sizeClasses.subtext} whitespace-nowrap`}>
              STRENGTH • COMMUNITY • RESULTS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
