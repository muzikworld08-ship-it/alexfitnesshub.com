import React from "react";
import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800/60 ${className}`}
      style={{ animationDuration: "1.5s" }}
    />
  );
}

// 1. DYNAMIC CARD SKELETON (Perfect for Workout Library, Custom Programs, etc.)
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0A0E17] p-4 space-y-4 shadow-sm">
      {/* Media Image Block */}
      <Skeleton className="h-44 w-full rounded-xl" />
      
      {/* Category Tag */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-4/5 rounded" />
        <Skeleton className="h-3.5 w-11/12 rounded" />
      </div>

      {/* Bottom Metrics Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4.5 w-4.5 rounded-full" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
}

// 2. DASHBOARD VIEW SKELETON (Perfect for Stats, Charts, Daily Habits)
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0A0E17] flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column split logic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main interactive segment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0A0E17] space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-44 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            {/* Main chart visual placeholder */}
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>

        {/* Sidebar/Vitals panel */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0A0E17] space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. MAIN WORKOUT GRID CONTAINER
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

// 4. LIST & DETAIL LINES SKELETON (Perfect for community posts, testimonial feeds, chats)
export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-slate-50 dark:border-slate-800/40 bg-white dark:bg-[#0A0E17] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4.5 w-1/3 rounded" />
              <Skeleton className="h-3.5 w-2/3 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

// 5. GLOBAL VIEW LEVEL WRAPPER (Prevents blank screens on major view shifts, integrates navbar style)
export default function GlobalSkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Header/Navbar placeholder */}
      <header className="h-16 border-b border-slate-150 dark:border-slate-850 bg-white dark:bg-[#0A0E17] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-32 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12 rounded hidden sm:inline-block" />
          <Skeleton className="h-4 w-16 rounded hidden sm:inline-block" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </header>

      {/* Main Area layout container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Banner/Hero area */}
        <div className="h-60 rounded-3xl overflow-hidden relative border border-slate-100 dark:border-slate-800/40 bg-white dark:bg-[#0A0E17] p-6 sm:p-8 flex flex-col justify-end gap-3 shadow-sm">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4.5 w-96 rounded" />
        </div>

        {/* Dynamic section loading block */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>

          <CardGridSkeleton count={3} />
        </div>

      </main>
    </div>
  );
}
