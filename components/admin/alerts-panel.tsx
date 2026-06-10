"use client";

import { useMemo, useState, useTransition } from "react";
import { resolveAlertAction } from "@/app/actions/admin";
import { AlertLevelBadge } from "@/components/admin/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Alert } from "@/types";
import { formatDateFr } from "@/utils/datetime";

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "open" | "done">(
    "open"
  );
  const [isPending, startTransition] = useTransition();

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (resolvedFilter === "open" && alert.resolved) return false;
      if (resolvedFilter === "done" && !alert.resolved) return false;
      if (city && !alert.city.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }
      if (
        category &&
        !alert.category.toLowerCase().includes(category.toLowerCase())
      ) {
        return false;
      }
      if (from && alert.created_at < from) return false;
      if (to && alert.created_at > `${to}T23:59:59.999Z`) return false;
      return true;
    });
  }, [alerts, category, city, from, resolvedFilter, to]);

  const handleResolve = (id: string) => {
    startTransition(async () => {
      await resolveAlertAction(id);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Ville, catégorie, date et statut de résolution
          </CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Ville"
            placeholder="Ex. Agen"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <Input
            label="Catégorie"
            placeholder="Ex. Plombier"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <Input
            label="Date début"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input
            label="Date fin"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
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
      </Card>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Résolu</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableEmpty message="Aucune alerte correspondant aux filtres." />
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{formatDateFr(alert.created_at)}</TableCell>
                  <TableCell>{alert.city}</TableCell>
                  <TableCell>{alert.category}</TableCell>
                  <TableCell>
                    <AlertLevelBadge level={alert.level} />
                  </TableCell>
                  <TableCell className="max-w-[280px]">{alert.message}</TableCell>
                  <TableCell>{alert.resolved ? "Oui" : "Non"}</TableCell>
                  <TableCell>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolve(alert.id)}
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
    </div>
  );
}
