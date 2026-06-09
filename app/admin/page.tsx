import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ClipboardCheck, Percent, Users } from "lucide-react";

const statCards = [
  { title: "Demandes aujourd'hui", icon: ClipboardCheck, value: "—" },
  { title: "Missions prises", icon: BarChart3, value: "—" },
  { title: "Taux de prise", icon: Percent, value: "—" },
  { title: "Professionnels actifs", icon: Users, value: "—" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Vue d&apos;ensemble de l&apos;activité — contenu à implémenter.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ title, icon: Icon, value }) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{title}</CardTitle>
                <Icon className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Historique des dernières actions — à implémenter.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertes importantes</CardTitle>
            <CardDescription>
              Zones nécessitant une attention — à implémenter.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
