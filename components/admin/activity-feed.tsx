import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/services/dashboard.service";
import { formatTimeFr } from "@/utils/datetime";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Dernières actions sur la plateforme
        </CardDescription>
      </CardHeader>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Aucune activité récente.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl bg-black/[0.03] px-4 py-3 dark:bg-white/[0.04]"
            >
              <span className="shrink-0 text-sm font-semibold text-[var(--color-accent)]">
                {formatTimeFr(item.createdAt)}
              </span>
              <span className="text-sm text-[var(--color-card-foreground)]">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
