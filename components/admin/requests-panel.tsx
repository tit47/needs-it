"use client";

import { useState, useTransition } from "react";
import { getRequestDetailAction } from "@/app/actions/admin";
import { ProPhotoGallery } from "@/components/pro/pro-photo-gallery";
import { RequestStatusBadge } from "@/components/admin/status-badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import type { Request, RequestStatus } from "@/types";
import type { AdminRequestDetail } from "@/app/actions/admin";
import { formatEventLabel } from "@/utils/admin-labels";
import { formatDateFr, formatDateTimeFr } from "@/utils/datetime";
import { formatDistanceKm } from "@/utils/distance";

type RequestRow = Request & {
  categories: { name: string } | null;
  professionals: { full_name: string } | null;
};

interface RequestsPanelProps {
  requests: RequestRow[];
}

export function RequestsPanel({ requests }: RequestsPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openDetail = (id: string) => {
    setSelectedId(id);
    setError(null);
    startTransition(async () => {
      const result = await getRequestDetailAction(id);
      if (!result.success) {
        setError(result.error ?? "Impossible de charger la demande.");
        setDetail(null);
        return;
      }
      setDetail(result.data);
    });
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
    setError(null);
  };

  return (
    <>
      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Professionnel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableEmpty message="Aucune demande pour le moment." />
            ) : (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() => openDetail(request.id)}
                >
                  <TableCell>{formatDateFr(request.created_at)}</TableCell>
                  <TableCell>{request.categories?.name ?? "—"}</TableCell>
                  <TableCell>{request.city}</TableCell>
                  <TableCell>
                    <RequestStatusBadge status={request.status as RequestStatus} />
                  </TableCell>
                  <TableCell>
                    {request.professionals?.full_name ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        open={selectedId !== null}
        onClose={closeDetail}
        title="Détail de la demande"
        className="max-w-2xl"
      >
        {isPending && (
          <p className="text-sm text-[var(--color-muted)]">Chargement…</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {detail && !isPending && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={detail.status} />
              <Badge variant="accent">{detail.categories?.name ?? "—"}</Badge>
              <Badge>{detail.city}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Description
              </p>
              <p className="mt-1 text-[var(--color-card-foreground)]">
                {detail.description}
              </p>
            </div>

            <ProPhotoGallery
              photoUrls={detail.request_photos.map((photo) => photo.photo_url)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Client
                </p>
                <p className="mt-1">{detail.client_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Téléphone
                </p>
                <p className="mt-1">{detail.client_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Distance 1er pro
                </p>
                <p className="mt-1">
                  {detail.first_pro_distance != null
                    ? formatDistanceKm(detail.first_pro_distance)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Code mission
                </p>
                <p className="mt-1 font-mono">{detail.mission_code}</p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-[var(--color-muted)]">
                Historique complet
              </p>
              {detail.request_events.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Aucun événement enregistré.
                </p>
              ) : (
                <ul className="space-y-2">
                  {detail.request_events.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm dark:bg-white/[0.04]"
                    >
                      <span className="font-medium">
                        {formatDateTimeFr(event.created_at)}
                      </span>
                      {" — "}
                      {formatEventLabel(
                        event.event_type,
                        detail.categories?.name,
                        detail.city
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
