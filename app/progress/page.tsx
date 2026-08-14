"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StudyTimer } from "@/components/study-timer";
import { progressSummary, weeklyActivity } from "@/lib/study-progress";
import { subjects } from "@/lib/study-data";
import {
  getAllAchievements,
  getCurrentLevel,
  loadGamification,
  type GamificationState,
} from "@/lib/gamification";
import { cn } from "@/lib/utils";

export default function ProgressPage() {
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  useEffect(() => {
    setGamification(loadGamification());
  }, []);

  const summary = progressSummary();
  const maxQuestions = Math.max(...weeklyActivity.map((day) => day.questions));

  const totalXp = gamification?.totalXp ?? 450;
  const currentStreak = gamification?.currentStreak ?? 4;
  const levelInfo = getCurrentLevel(totalXp);
  const achievements = gamification ? getAllAchievements(gamification) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progress & Gamification"
        title="Study Mastery & Stats"
        description="Track your daily study consistency, level up through clinical tiers, and manage your focus sessions."
      />

      {/* Top Stat Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Level"
          value={`${levelInfo.current.badge} ${levelInfo.current.title}`}
          detail={`${totalXp} Total XP earned`}
          icon={GraduationCap}
        />
        <StatCard
          label="Study Streak"
          value={`${currentStreak} Days`}
          detail={`Longest: ${gamification?.longestStreak ?? 7} days`}
          icon={Flame}
        />
        <StatCard
          label="Overall Mastery"
          value={`${summary.averageMastery}%`}
          detail="Across all 7 nursing subjects"
          icon={BarChart3}
        />
        <StatCard
          label="Total Study Time"
          value={`${Math.floor((gamification?.totalStudyMinutes ?? 455) / 60)}h ${(gamification?.totalStudyMinutes ?? 455) % 60}m`}
          detail="Pomodoro & practice sessions"
          icon={Clock3}
        />
      </section>

      {/* Level Progression Banner */}
      <Card className="border-sky-200 bg-gradient-to-r from-sky-50/80 via-rose-50/40 to-teal-50/80 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{levelInfo.current.badge}</span>
                <h3 className="text-lg font-black text-slate-950">
                  Level {levelInfo.current.level}: {levelInfo.current.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                {levelInfo.next
                  ? `${levelInfo.next.minXp - totalXp} XP needed to reach Level ${levelInfo.next.level} (${levelInfo.next.title})`
                  : "Maximum clinical tier reached!"}
              </p>
            </div>

            <div className="w-full md:max-w-md">
              <ProgressBar value={levelInfo.progressPercent} label="Tier Progression" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Timer & Weekly Activity Grid */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <StudyTimer />

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950">Weekly Practice Activity</h2>
              <span className="text-xs font-bold text-slate-500">Last 7 Days</span>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <div className="flex h-56 items-end gap-2.5">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end rounded-lg bg-slate-100 p-1">
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-teal-500 to-sky-400 transition-all duration-300"
                      style={{ height: `${Math.max(15, (day.questions / maxQuestions) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{day.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Subject Mastery & Achievements Grid */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Subject Mastery */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Subject Mastery Breakdown</h2>
          </CardHeader>
          <CardBody className="space-y-4 p-6">
            {subjects.map((subject) => {
              const mastery = Math.round(
                subject.topics.reduce((sum, topic) => sum + topic.mastery, 0) / subject.topics.length,
              );
              return <ProgressBar key={subject.id} value={mastery} label={subject.name} />;
            })}
          </CardBody>
        </Card>

        {/* Achievement Badges */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-black text-slate-950">Nursing Achievements</h2>
            </div>
          </CardHeader>
          <CardBody className="max-h-[460px] space-y-3 overflow-y-auto p-4">
            {achievements.map((ach) => {
              const unlocked = ach.progress >= 100 || ach.unlockedAt;

              return (
                <div
                  key={ach.id}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl border p-3.5 transition",
                    unlocked
                      ? "border-amber-200 bg-amber-50/40 text-slate-950"
                      : "border-slate-200 bg-slate-50/50 opacity-70",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-2xs",
                      unlocked ? "bg-amber-100" : "bg-slate-200",
                    )}
                  >
                    {ach.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-950 truncate">{ach.title}</p>
                      {unlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3 text-amber-600" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">{ach.progress}%</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 line-clamp-1">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
