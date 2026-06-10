"use client";

import { useState, useTransition } from "react";
import {
  getProfessionalDetailAction,
  suspendProfessionalAction,
  updateProfessionalAction,
} from "@/app/actions/admin";
import {
  ActiveStatusBadge,
  RequestStatusBadge,
} from "@/components/admin/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Professional, RequestStatus } from "@/types";
import { formatDateFr, formatDateTimeFr } from "@/utils/datetime";

type ProfessionalRow = Professional;

interface ProfessionalsPanelProps {
  professionals: ProfessionalRow[];
}

export function ProfessionalsPanel({
  professionals,
}: ProfessionalsPanelProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<ProfessionalRow | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    siren: "",
    categories: "",
    radius_km: "30",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDetail = (professional: ProfessionalRow) => {
    setSelected(professional);
    setDetailOpen(true);
    setError(null);
    startTransition(async () => {
      const result = await getProfessionalDetailAction(professional.id);
      if (!result.success) {
        setError(result.error ?? "Impossible de charger la fiche.");
        return;
      }
      setHistory(result.data.history);
      setUnpaidAmount(result.data.unpaidAmount);
    });
  };

  const openEdit = (professional: ProfessionalRow) => {
    setSelected(professional);
    setForm({
      full_name: professional.full_name,
      email: professional.email,
      phone: professional.phone,
      address: professional.address,
      city: professional.city,
      siren: professional.siren,
      categories: professional.categories.join(", "),
      radius_km: String(professional.radius_km),
    });
    setEditOpen(true);
    setError(null);
  };

  const handleSuspend = (professional: ProfessionalRow) => {
    startTransition(async () => {
      const result = await suspendProfessionalAction(
        professional.id,
        !professional.active
      );
      if (!result.success) {
        setError(result.error ?? "Action impossible.");
      }
    });
  };

  const handleSave = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await updateProfessionalAction(selected.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        siren: form.siren.trim(),
        categories: form.categories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        radius_km: Number(form.radius_km) || 30,
      });

      if (!result.success) {
        setError(result.error ?? "Enregistrement impossible.");
        return;
      }

      setEditOpen(false);
    });
  };

  return (
    <>
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead>Rayon</TableHead>
              <TableHead>Missions</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.length === 0 ? (
              <TableEmpty message="Aucun professionnel enregistré." />
            ) : (
              professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">
                    {professional.full_name}
                  </TableCell>
                  <TableCell>{professional.city}</TableCell>
                  <TableCell>
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {professional.categories.slice(0, 2).map((category) => (
                        <Badge key={category} variant="accent">
                          {category}
                        </Badge>
                      ))}
                      {professional.categories.length > 2 && (
                        <Badge>+{professional.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{professional.radius_km} km</TableCell>
                  <TableCell>{professional.completed_jobs}</TableCell>
                  <TableCell>
                    <ActiveStatusBadge active={professional.active} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(professional)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant={professional.active ? "danger" : "primary"}
                        onClick={() => handleSuspend(professional)}
                        disabled={isPending}
                      >
                        {professional.active ? "Suspendre" : "Réactiver"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetail(professional)}
                      >
                        Voir fiche
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Fiche professionnel"
        className="max-w-2xl"
      >
        {selected && (
          <div className="space-y-5">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-muted)]">Nom</p>
                <p className="font-medium">{selected.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Téléphone</p>
                <p>{selected.phone}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Email</p>
                <p>{selected.email}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">SIREN</p>
                <p>{selected.siren}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Rayon</p>
                <p>{selected.radius_km} km</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">
                  Missions réalisées
                </p>
                <p>{selected.completed_jobs}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Montant dû</p>
                <p className="font-semibold">{unpaidAmount.toFixed(2)} €</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-[var(--color-muted)]">
                Catégories
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.categories.map((category) => (
                  <Badge key={category} variant="accent">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-[var(--color-muted)]">
                Historique
              </p>
              {history.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Aucune mission enregistrée.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((entry) => {
                    const claim = entry as {
                      id: string;
                      claimed_at: string | null;
                      created_at: string;
                      requests: {
                        city: string;
                        status: RequestStatus;
                        categories: { name: string } | { name: string }[] | null;
                      } | {
                        city: string;
                        status: RequestStatus;
                        categories: { name: string } | { name: string }[] | null;
                      }[] | null;
                    };
                    const request = Array.isArray(claim.requests)
                      ? claim.requests[0]
                      : claim.requests;
                    const categoryName = Array.isArray(request?.categories)
                      ? request.categories[0]?.name
                      : request?.categories?.name;

                    return (
                    <li
                      key={claim.id}
                      className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {categoryName ?? "Mission"}
                        </span>
                        <span>{request?.city}</span>
                        {request?.status && (
                          <RequestStatusBadge status={request.status} />
                        )}
                      </div>
                      <p className="mt-1 text-[var(--color-muted)]">
                        {claim.claimed_at
                          ? formatDateTimeFr(claim.claimed_at)
                          : formatDateFr(claim.created_at)}
                      </p>
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le professionnel"
        className="max-w-xl"
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Input
            label="Nom complet"
            value={form.full_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                full_name: event.target.value,
              }))
            }
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <Input
            label="Téléphone"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
          <Input
            label="Adresse"
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={(event) =>
              setForm((current) => ({ ...current, city: event.target.value }))
            }
          />
          <Input
            label="SIREN"
            value={form.siren}
            onChange={(event) =>
              setForm((current) => ({ ...current, siren: event.target.value }))
            }
          />
          <Input
            label="Catégories (séparées par des virgules)"
            value={form.categories}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categories: event.target.value,
              }))
            }
          />
          <Input
            label="Rayon d'intervention (km)"
            type="number"
            min={1}
            value={form.radius_km}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                radius_km: event.target.value,
              }))
            }
          />
          <Button onClick={handleSave} disabled={isPending} className="w-full">
            Enregistrer
          </Button>
        </div>
      </Modal>
    </>
  );
}
