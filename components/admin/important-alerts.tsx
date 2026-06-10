import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportantAlertItem } from "@/services/dashboard.service";
import { AlertLevelBadge } from "./status-badges";

export function ImportantAlertsList({
  alerts,
}: {
  alerts: ImportantAlertItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes importantes</CardTitle>
        <CardDescription>Alertes rouges et orange à traiter</CardDescription>
      </CardHeader>

      {alerts.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Aucune alerte importante pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={`${alert.source}-${alert.id}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-card-foreground)]">
                  {alert.city} — {alert.category}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {alert.message}
                </p>
              </div>
              <AlertLevelBadge level={alert.level} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
