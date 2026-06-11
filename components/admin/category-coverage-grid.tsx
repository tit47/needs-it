import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryCoverageItem } from "@/services/coverage.service";
import { AlertLevelBadge } from "./status-badges";

export function CategoryCoverageGrid({
  items,
}: {
  items: CategoryCoverageItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Couverture par catégorie</CardTitle>
        <CardDescription>
          Où recruter ? Quelles catégories renforcer ?
        </CardDescription>
      </CardHeader>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Aucune catégorie active pour le moment.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.category}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-card-foreground)]">
                  {item.category}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {item.professionalCount} professionnel
                  {item.professionalCount > 1 ? "s" : ""} actif
                  {item.professionalCount > 1 ? "s" : ""}
                </p>
              </div>
              <AlertLevelBadge level={item.level} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
