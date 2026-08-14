import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const features = [
    { title: "Smart Flashcards", icon: BookOpen },
    { title: "Nursing Quizzes", icon: ClipboardCheck },
    { title: "Study Materials", icon: CalendarCheck },
    { title: "Progress Tracking", icon: BarChart3 },
    { title: "AI Reviewer", icon: Brain },
    { title: "Study Streaks", icon: Sparkles },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/nursemate-study.png"
          alt="NurseMate study workspace"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/52" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-950">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-black">Yume Nurse</span>
            </Link>
            <Link
              href="/login"
              className="hidden min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 sm:inline-flex"
            >
              Log in
            </Link>
          </header>

          <div className="max-w-3xl pb-12 pt-20 text-white sm:pt-28">
            <p className="mb-4 text-sm font-bold uppercase text-sky-100">Nursing reviewer and study tracker</p>
            <h1 className="text-5xl font-black leading-[1.05] sm:text-6xl">Yume Nurse</h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-white">
              Nursing made easier. Study smarter. Become the nurse you want to be.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100">
              A personalized nursing reviewer built to help you learn, practice, and track your progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Start Studying
              </Link>
              <Link
                href="/subjects"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/60 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore Reviewers
              </Link>
            </div>
          </div>

          <div className="grid gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  href="/dashboard"
                  key={feature.title}
                  className="flex min-h-24 items-center gap-3 rounded-lg border border-white/20 bg-white/12 p-4 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-bold leading-5">{feature.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
