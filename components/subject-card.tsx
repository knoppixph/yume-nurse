import {
  Activity,
  Baby,
  BookOpen,
  Brain,
  Building2,
  HeartPulse,
  Pill,
  ShieldPlus,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Subject } from "@/types/study";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Baby,
  BookOpen,
  Brain,
  Building2,
  HeartPulse,
  Pill,
  ShieldPlus,
  Stethoscope,
  Users,
};

const accentMap: Record<Subject["accent"], string> = {
  pink: "bg-pink-50 text-pink-700",
  purple: "bg-purple-50 text-purple-700",
  blue: "bg-sky-50 text-sky-700",
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

type SubjectCardProps = {
  subject: Subject;
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const Icon = iconMap[subject.icon] ?? HeartPulse;
  const mastery = Math.round(
    subject.topics.reduce((sum, topic) => sum + topic.mastery, 0) / subject.topics.length,
  );

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardBody>
        <div className="flex items-start gap-4">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", accentMap[subject.accent])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-950">{subject.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subject.description}</p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={mastery} label="Mastery" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {subject.topics.slice(0, 4).map((topic) => (
            <span key={topic.id} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
              {topic.name}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

