import React from "react";
import { Calendar, Trophy, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

interface PersistentDashboardTabsProps {
  activeTab?: string;
}

export default function PersistentDashboardTabs({
  activeTab,
}: PersistentDashboardTabsProps) {
  const { currentView, setView } = useApp();

  const tabs = [
    {
      id: "my-plan",
      label: "My Plan",
      icon: Calendar,
      isActive: currentView === "daily-plan" || (currentView === "dashboard" && activeTab === "plan"),
      action: () => setView("daily-plan"),
    },
    {
      id: "active-challenges",
      label: "Active Challenges",
      icon: Trophy,
      isActive: currentView === "challenges",
      action: () => setView("challenges"),
    },
    {
      id: "program-progress",
      label: "Program Progress",
      icon: TrendingUp,
      isActive:
        ["dashboard", "weekly-reports", "daily-habit-tracker", "daily-calibration-desk", "handbook", "weight-trajectory"].includes(currentView) &&
        activeTab !== "plan",
      action: () => setView("dashboard"),
    },
  ];

  return (
    <div id="persistent_dashboard_tabs_bar" className="w-full max-w-4xl mx-auto mb-6 bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex gap-1 shadow-xs font-sans">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={tab.action}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none border-0 ${
              tab.isActive
                ? "bg-[#D32F2F] text-white shadow-md scale-[1.01]"
                : "bg-white/85 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tab.isActive ? "text-white" : "text-slate-400"}`} />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
