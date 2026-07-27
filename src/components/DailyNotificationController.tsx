import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Bell, BellOff, CheckCircle2, Circle, Clock, Flame, Info, Sparkles, X, ChevronRight, Activity } from "lucide-react";

export default function DailyNotificationController() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem("alexfit_reminder_time") || "08:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("alexfit_notify_enabled") === "true");
  
  // Track daily tasks list (saved in localStorage to persist completion state)
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean; category: string }[]>(() => {
    const saved = localStorage.getItem("alexfit_daily_tasks_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if it was saved on a previous day. If so, reset!
        const lastSavedDate = localStorage.getItem("alexfit_daily_tasks_date");
        const todayStr = new Date().toDateString();
        if (lastSavedDate === todayStr) {
          return parsed;
        }
      } catch (e) {}
    }

    // Default checklist depending on user preferences or profile
    return [
      { id: "task-workout", text: "Complete your biomechanical training drill", done: false, category: "Workout" },
      { id: "task-hydration", text: "Hydrate: Log at least 3.0L of pure water", done: false, category: "Hydration" },
      { id: "task-protein", text: "Log meal macros: Aim for 1.8g of protein per kg", done: false, category: "Nutrition" },
      { id: "task-weight", text: "Register morning weight in telemetry logs", done: false, category: "Tracking" },
    ];
  });

  // Persist tasks and today's date
  useEffect(() => {
    localStorage.setItem("alexfit_daily_tasks_state", JSON.stringify(tasks));
    localStorage.setItem("alexfit_daily_tasks_date", new Date().toDateString());
  }, [tasks]);

  // Sync notification permission status
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        localStorage.setItem("alexfit_notify_enabled", "true");
        setNotificationsEnabled(true);
        triggerLocalNotification(
          "Notifications Enabled!",
          "Excellent choice. AlexFitnessHub will keep you fully calibrated."
        );
      } else {
        localStorage.setItem("alexfit_notify_enabled", "false");
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  // Turn off notifications
  const disableNotifications = () => {
    localStorage.setItem("alexfit_notify_enabled", "false");
    setNotificationsEnabled(false);
  };

  // Helper to trigger browser push notification
  const triggerLocalNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted" && notificationsEnabled) {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico"
        });
      } catch (e) {
        // Fallback for browsers that don't support non-service worker notifications
        console.warn("Notification construct failed, standard push fallback.", e);
      }
    }
  };

  // Trigger test notification
  const handleTestNotification = () => {
    if (Notification.permission !== "granted") {
      requestPermission();
      return;
    }
    triggerLocalNotification(
      "AlexFitnessHub Calibration",
      `Today's focus: Sculpt your divisions, hydrate, and maintain premium consistency!`
    );
  };

  // Handle task check/uncheck
  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const newDone = !t.done;
          if (newDone) {
            // Trigger browser notification encouragement
            triggerLocalNotification(
              "Task Cleared! 🔥",
              `You completed: "${t.text}". Keep executing the program!`
            );
          }
          return { ...t, done: newDone };
        }
        return t;
      })
    );
  };

  // Time-based periodic check (simulate daily notification trigger check)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHrMin = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      
      if (currentHrMin === reminderTime && notificationsEnabled) {
        const remainingTasks = tasks.filter(t => !t.done).length;
        if (remainingTasks > 0) {
          triggerLocalNotification(
            "AlexFitnessHub: Daily Reminder! ⏰",
            `You have ${remainingTasks} active training items left for today. Keep the streak alive!`
          );
        } else {
          triggerLocalNotification(
            "Perfect Day Achieved! ⭐",
            "Awesome work! All physical daily protocols have been successfully executed."
          );
        }
      }
    }, 60000); // Check once per minute

    return () => clearInterval(interval);
  }, [reminderTime, notificationsEnabled, tasks]);

  // Handle reminder time change
  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("alexfit_reminder_time", time);
  };

  // Calculate percentage done
  const doneCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((doneCount / tasks.length) * 100);

  // If user is not logged in, do not render notifications controls
  if (!user) return null;

  return (
    <>
      {/* Floating Bell Trigger bottom-right removed as requested */}

      {/* Slide-over Reminders Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-100 dark:border-slate-900 animate-slide-left">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#C0392B]" />
                  <h3 className="font-sans font-black text-lg uppercase tracking-tight">
                    Daily Calibration Desk
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Panel */}
              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    COMPLETION PROGRESS
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#C0392B]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C0392B] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {doneCount === tasks.length 
                    ? "⭐ Absolute consistency achieved! All metrics locked." 
                    : `You have ${tasks.length - doneCount} protocols remaining to secure perfect execution today.`}
                </p>
              </div>

              {/* Native System Notifications Toggle Card */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 space-y-3 shadow-sm mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      SYSTEM COMPLIANCE REMINDERS
                    </span>
                  </div>
                  {notificationsEnabled && permission === "granted" ? (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 uppercase border border-emerald-500/20">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-400 uppercase">
                      OFFLINE
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  Receive actual native browser notifications on your mobile or PC device so you never lose physical training consistency.
                </p>

                <div className="flex flex-wrap gap-2 pt-1.5">
                  {notificationsEnabled && permission === "granted" ? (
                    <button
                      onClick={disableNotifications}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <BellOff className="w-3.5 h-3.5" /> Disable Reminders
                    </button>
                  ) : (
                    <button
                      onClick={requestPermission}
                      className="px-3 py-1.5 rounded-lg bg-[#C0392B] hover:bg-[#A82E22] text-white text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" /> Permit Browser Alerts
                    </button>
                  )}

                  <button
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    🚀 Trigger Test
                  </button>
                </div>

                {/* Reminder Schedule time */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-900">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Daily Alert Schedule:</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="ml-auto text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C0392B]"
                  />
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block pl-1">
                  WHAT TO DO TODAY
                </h4>

                <div className="space-y-2">
                  {tasks.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left flex items-start gap-3 ${
                        t.done 
                          ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/60 opacity-60" 
                          : "bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-900 hover:border-[#C0392B]"
                      }`}
                    >
                      <button className="shrink-0 mt-0.5 text-slate-400 hover:text-[#C0392B] transition-colors focus:outline-none">
                        {t.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                          {t.category}
                        </span>
                        <p className={`text-[11px] font-sans font-medium text-slate-700 dark:text-slate-200 leading-snug ${t.done ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                          {t.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Guidance */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 dark:text-slate-500 flex items-start gap-1.5">
              <Info className="w-4 h-4 text-[#C0392B] shrink-0" />
              <p className="leading-snug">
                These telemetry markers auto-reset daily. Keep browser active to trigger system notifications accurately.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
