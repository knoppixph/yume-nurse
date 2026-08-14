"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Coffee, Pause, Play, RotateCcw, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { addXpAndRecordActivity } from "@/lib/gamification";
import { cn } from "@/lib/utils";

type TimerMode = "study" | "shortBreak" | "longBreak";

const MODE_CONFIGS: Record<TimerMode, { label: string; defaultMinutes: number; color: string }> = {
  study: { label: "Focus Study", defaultMinutes: 25, color: "text-sky-700 bg-sky-50 border-sky-300" },
  shortBreak: { label: "Short Break", defaultMinutes: 5, color: "text-teal-700 bg-teal-50 border-teal-300" },
  longBreak: { label: "Long Break", defaultMinutes: 15, color: "text-purple-700 bg-purple-50 border-purple-300" },
};

export function StudyTimer() {
  const [mode, setMode] = useState<TimerMode>("study");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionCompletedNotice, setSessionCompletedNotice] = useState<string | null>(null);

  const totalDuration = MODE_CONFIGS[mode].defaultMinutes * 60;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  function handleSessionComplete() {
    if (mode === "study") {
      setCompletedSessions((c) => c + 1);
      const { newlyUnlocked } = addXpAndRecordActivity(50, { studyMinutes: 25 });
      setSessionCompletedNotice(
        "🎉 Great study session! You earned +50 XP and logged 25 study minutes.",
      );
      // Auto-switch to break
      setMode("shortBreak");
      setTimeLeft(5 * 60);
    } else {
      setSessionCompletedNotice("Break finished. Ready for the next study block!");
      setMode("study");
      setTimeLeft(25 * 60);
    }
  }

  function switchMode(newMode: TimerMode) {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIGS[newMode].defaultMinutes * 60);
    setSessionCompletedNotice(null);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIGS[mode].defaultMinutes * 60);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-sky-700" />
            <h2 className="text-base font-black text-slate-950">Pomodoro Study Timer</h2>
          </div>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {completedSessions} Sessions Completed
          </span>
        </div>
      </CardHeader>
      <CardBody className="p-6 text-center space-y-6">
        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {(Object.keys(MODE_CONFIGS) as TimerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-bold transition",
                mode === m ? "bg-white text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-950",
              )}
            >
              {MODE_CONFIGS[m].label} ({MODE_CONFIGS[m].defaultMinutes}m)
            </button>
          ))}
        </div>

        {/* Big Timer Display */}
        <div className="py-4">
          <p className="font-mono text-6xl sm:text-7xl font-black tracking-tight text-slate-950">
            {formatTime(timeLeft)}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isRunning ? `${MODE_CONFIGS[mode].label} in progress...` : "Paused"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Notice on completion */}
        {sessionCompletedNotice ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-teal-50 p-3 text-xs font-bold text-teal-900 border border-teal-200">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>{sessionCompletedNotice}</span>
          </div>
        ) : null}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setIsRunning((r) => !r)}
            className={cn(
              "min-w-32 gap-2 text-sm font-bold shadow-sm",
              isRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start Focus
              </>
            )}
          </Button>

          <Button variant="secondary" onClick={resetTimer} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
