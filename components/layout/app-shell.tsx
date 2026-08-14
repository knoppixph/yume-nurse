"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  FileText,
  Flame,
  GraduationCap,
  Home,
  Layers3,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { loadGamification } from "@/lib/gamification";
import { loadDailyMessage } from "@/lib/admin-content";
import { cn } from "@/lib/utils";

const studentNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/subjects", label: "Subjects", icon: Layers3 },
  { href: "/flashcards", label: "Flashcards", icon: BookOpen },
  { href: "/quiz", label: "Quizzes", icon: GraduationCap },
  { href: "/review", label: "Review", icon: Brain },
  { href: "/materials", label: "Materials", icon: FileText },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const mobileItems = studentNavItems.filter((item) =>
  ["/dashboard", "/review", "/quiz", "/progress", "/profile"].includes(item.href),
);

const plainRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dailyMsg, setDailyMsg] = useState("Keep going, future nurse. One topic at a time. You have got this.");

  useEffect(() => {
    // Load streak from gamification state
    const g = loadGamification();
    setStreak(g.currentStreak);

    // Load custom daily message
    const msg = loadDailyMessage();
    if (msg?.message) setDailyMsg(msg.message);

    // Check admin role from Supabase
    async function checkAdmin() {
      if (!isSupabaseConfigured()) return;
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();
          if (profile?.role === "admin") setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }
    checkAdmin();
  }, []);

  if (plainRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  const navItems = isAdmin
    ? [...studentNavItems, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : studentNavItems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-black text-slate-950">Yume Nurse</p>
              <p className="text-xs font-semibold uppercase text-slate-500">Study platform</p>
            </div>
          </Link>
          <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                    active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                    item.href === "/admin" && !active && "text-amber-700 hover:bg-amber-50 hover:text-amber-900",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-950">A little message for you</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{dailyMsg}</p>
            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-black text-slate-950">Yume Nurse</span>
          </Link>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">
              <Flame className="h-3 w-3 text-teal-600" />
              {streak} day streak
            </span>
          )}
        </div>
      </header>

      <main className="pb-24 lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 py-2 lg:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-bold text-slate-500 transition hover:bg-slate-100",
                  active && "bg-slate-950 text-white hover:bg-slate-950",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
