import React from "react";
import { Sparkles, Shield, ChevronRight } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  category: string;
}

export default function PageHero({
  title,
  subtitle,
  description,
  imageUrl,
  category,
}: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-xl mb-12 grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
      
      {/* Left side text column (Bright white background, high-contrast labels, clear hierarchy) */}
      <div className="md:col-span-6 lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 text-left relative z-10 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            {category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Verified Elite
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono font-black tracking-[0.25em] text-[#D32F2F] uppercase">
            {subtitle}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-black tracking-tight text-slate-950 leading-tight uppercase">
            {title.split(" ").map((word, i) => (
              <span key={i} className={i % 2 === 1 ? "text-[#D32F2F]" : "text-slate-900"}>
                {word}{" "}
              </span>
            ))}
          </h1>
          <div className="h-1.5 w-24 bg-[#D32F2F] rounded-full" />
        </div>

        <p className="text-sm sm:text-base text-slate-700 font-sans leading-relaxed max-w-xl font-semibold">
          {description}
        </p>

        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 font-mono pt-3 border-t border-slate-100">
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Home</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#D32F2F] font-black">{title}</span>
        </div>
      </div>

      {/* Right side vertical full-height image column (No dark overlays, ultra-bright presentation) */}
      <div className="md:col-span-6 lg:col-span-5 relative h-[380px] md:h-full overflow-hidden select-none bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-125 contrast-110 saturate-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Soft, clean exposure balancing overlay */}
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      </div>

    </div>
  );
}
