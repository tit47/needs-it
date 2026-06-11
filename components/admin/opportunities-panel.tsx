"use client";

import { useMemo, useState, useTransition } from "react";
import { resolveCoverageAlertAction } from "@/app/actions/admin";
import { AlertLevelBadge } from "@/components/admin/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OpportunityRow } from "@/services/coverage.service";
import { formatDateFr } from "@/utils/datetime";

interface OpportunitiesPanelProps {
  opportunities: OpportunityRow[];
}

function priorityVariant(
  priority: OpportunityRow["priority"]
): "danger" | "warning" | "success" {
  switch (priority) {
    case "Haute":
      return "danger";
    case "Moyenne":
      return "warning";
    default:
      return "success";
  }
}

export function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "open" | "done">(
    "open"
  );
  const [isPending, startTransition] = useTransition();

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((row) => {
      if (resolvedFilter === "open" && row.resolved) return false;
      if (resolvedFilter === "done" && !row.resolved) return false;
      if (city && !row.city.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }
      if (
        category &&
        !row.category.toLowerCase().includes(category.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [category, city, opportunities, resolvedFilter]);

  const handleResolve = (id: string) => {
    startTransition(async () => {
      await resolveCoverageAlertAction(id);
    });
  };

  return (
    <Card padding="none">
      <div className="space-y-4 border-b border-[var(--color-border)] p-6">
        <div>
          <CardTitle>Zones à développer</CardTitle>
          <CardDescription>
            Demandes, taux de réussite et couverture par ville et catégorie
          </CardDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Ville"
            placeholder="Ex. Marmande"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <Input
            label="Catégorie"
            placeholder="Ex. Plombier"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-card-foreground)]">
              Résolu ou non
            </label>
            <select
              value={resolvedFilter}
              onChange={(event) =>
                setResolvedFilter(event.target.value as "all" | "open" | "done")
              }
              className="h-14 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-base"
            >
              <option value="open">Non résolues</option>
              <option value="done">Résolues</option>
              <option value="all">Toutes</option>
            </select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ville</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Demandes</TableHead>
            <TableHead>Satisfaites</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Couverture</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead>Dernière activité</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOpportunities.length === 0 ? (
            <TableEmpty message="Aucune opportunité correspondant aux filtres." />
          ) : (
            filteredOpportunities.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.city}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.request_count}</TableCell>
                <TableCell>{row.success_count}</TableCell>
                <TableCell>
                  {row.successRatePercent != null
                    ? `${row.successRatePercent}%`
                    : "—"}
                </TableCell>
                <TableCell>
                  <AlertLevelBadge level={row.level} />
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(row.priority)}>
                    {row.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateFr(row.last_seen)}</TableCell>
                <TableCell>
                  {!row.resolved && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(row.id)}
                      disabled={isPending}
                    >
                      Marquer résolu
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
