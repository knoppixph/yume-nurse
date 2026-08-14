import type { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{detail}</p>
      </CardBody>
    </Card>
  );
}

