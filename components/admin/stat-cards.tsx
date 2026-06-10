import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/services/dashboard.service";
import {
  BarChart3,
  ClipboardCheck,
  Percent,
  Users,
  type LucideIcon,
} from "lucide-react";

const statConfig: {
  key: keyof DashboardStats;
  title: string;
  icon: LucideIcon;
  format: (value: DashboardStats[keyof DashboardStats]) => string;
}[] = [
  {
    key: "requestsToday",
    title: "Demandes aujourd'hui",
    icon: ClipboardCheck,
    format: (value) => String(value),
  },
  {
    key: "missionsClaimedToday",
    title: "Missions prises",
    icon: BarChart3,
    format: (value) => String(value),
  },
  {
    key: "claimRatePercent",
    title: "Taux de prise",
    icon: Percent,
    format: (value) => (value === null ? "—" : `${value} %`),
  },
  {
    key: "activeProfessionals",
    title: "Professionnels actifs",
    icon: Users,
    format: (value) => String(value),
  },
];

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map(({ key, title, icon: Icon, format }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{title}</CardTitle>
              <Icon className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <p className="text-3xl font-bold">{format(stats[key])}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
