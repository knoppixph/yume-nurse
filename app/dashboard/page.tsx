"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Heart,
  Layers3,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { dashboardGoal, nextReviewCards, progressSummary } from "@/lib/study-progress";
import { getSubjectName, getTopicName, subjects, weakTopics } from "@/lib/study-data";
import { loadDailyMessage, type DailyMotivationMessage } from "@/lib/admin-content";
import { getCurrentLevel, loadGamification, type GamificationState } from "@/lib/gamification";

export default function DashboardPage() {
  const [dailyMsg, setDailyMsg] = useState<DailyMotivationMessage | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  useEffect(() => {
    setDailyMsg(loadDailyMessage());
    setGamification(loadGamification());
  }, []);

  const goal = dashboardGoal();
  const summary = progressSummary();
  const dueCards = nextReviewCards();

  const streak = gamification?.currentStreak ?? 1;
  const totalXp = gamification?.totalXp ?? 0;
  const studyMinutes = gamification?.totalStudyMinutes ?? 0;
  const questionsAnswered = gamification?.totalQuestionsAnswered ?? 0;
  const cardsReviewed = gamification?.totalCardsReviewed ?? 0;
  const level = getCurrentLevel(totalXp);

  const formattedStudyTime =
    studyMinutes > 0
      ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`
      : "0h 0m";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Hi, Future Nurse 🩺"
        description="Ready to study today? Your daily goal is within reach."
        action={
          <Link
            href="/quiz"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" /> Quick Quiz
          </Link>
        }
      />

      {/* Top Stat Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Study Streak"
          value={`${streak} ${streak === 1 ? "Day" : "Days"}`}
          detail="Complete 1 quiz or flashcard set today"
          icon={Flame}
        />
        <StatCard
          label="Total Study Time"
          value={formattedStudyTime}
          detail="Logged clinical study sessions"
          icon={Clock3}
        />
        <StatCard
          label="Questions Mastered"
          value={`${questionsAnswered}`}
          detail="NCLEX & PNLE question bank"
          icon={GraduationCap}
        />
        <StatCard
          label="Overall Progress"
          value={`${Math.min(100, Math.round((questionsAnswered / 50) * 100))}%`}
          detail="Calculated from topic mastery"
          icon={BarChart3}
        />
        <StatCard
          label="Flashcards Mastered"
          value={`${cardsReviewed}`}
          detail="Spaced repetition active deck"
          icon={BookOpenCheck}
        />
        <StatCard
          label="Total XP Earned"
          value={`${totalXp} XP`}
          detail={`Tier: ${level.current.title} ${level.current.badge}`}
          icon={Layers3}
        />
      </section>

      {/* Today's Goal & Smart Review */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Today&apos;s Goal</h2>
            <p className="text-xs text-slate-600">{goal.label}</p>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            <ProgressBar
              value={Math.min(100, Math.round((questionsAnswered / goal.total) * 100))}
              label={`${Math.min(goal.total, questionsAnswered)} / ${goal.total} Completed`}
            />

            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/review"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-center text-xs font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Smart Review
              </Link>
              <Link
                href="/quiz"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-3 text-center text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Practice Quiz
              </Link>
              <Link
                href="/flashcards"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-center text-xs font-bold text-slate-900 transition hover:bg-slate-50"
              >
                Flashcards
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950">Smart Review Queue</h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                {summary.dueCards} Due
              </span>
            </div>
          </CardHeader>
          <CardBody className="space-y-2 p-4">
            {dueCards.slice(0, 3).map((card) => (
              <div key={card.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <p className="line-clamp-1 text-xs font-bold text-slate-950">{card.front}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {getSubjectName(card.subjectId)} • {getTopicName(card.subjectId, card.topicId)}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      {/* Weak Topics & Subjects Snapshot */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">High-Yield Priority Topics</h2>
          </CardHeader>
          <CardBody className="space-y-3 p-4">
            {weakTopics().map((topic) => (
              <div key={topic.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-xs font-bold text-slate-950">{topic.name}</p>
                  <p className="text-[11px] text-slate-500">{topic.subjectName}</p>
                </div>
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                  Needs Review
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-950">Subject Curricula (7 Core Areas)</h2>
          </CardHeader>
          <CardBody className="space-y-2 p-4">
            {subjects.slice(0, 4).map((subject) => (
              <div key={subject.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-950 text-white text-xs font-bold">
                    {subject.name.charAt(0)}
                  </span>
                  <p className="text-xs font-bold text-slate-950">{subject.name}</p>
                </div>
                <Link href={`/subjects/${subject.id}`} className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                  Open
                </Link>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      {/* Personalized Encouragement Message */}
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/70 via-white to-sky-50/70 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-black uppercase tracking-wider">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-600" />
          <span>A little message for you</span>
        </div>
        <p className="mt-2.5 text-base font-semibold text-slate-800 leading-relaxed">
          &ldquo;{dailyMsg?.message ?? "Keep going, future nurse. I believe in you! ❤️"}&rdquo;
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">— {dailyMsg?.sender ?? "Yume Nurse Study Team"}</span>
          <Link
            href="/admin"
            className="text-xs font-bold text-sky-700 hover:text-sky-800 underline"
          >
            Edit in Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
