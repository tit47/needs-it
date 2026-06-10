"use client";

import { useTransition } from "react";
import { updateCandidateStatusAction } from "@/app/actions/admin";
import { CandidateStatusBadge } from "@/components/admin/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CandidateProfessional, CandidateStatus } from "@/types";

interface CandidatesPanelProps {
  candidates: CandidateProfessional[];
}

export function CandidatesPanel({ candidates }: CandidatesPanelProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (id: string, status: CandidateStatus) => {
    startTransition(async () => {
      await updateCandidateStatusAction(id, status);
    });
  };

  return (
    <Card padding="none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Mail</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>SIREN</TableHead>
            <TableHead>Catégories</TableHead>
            <TableHead>Rayon</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length === 0 ? (
            <TableEmpty message="Aucun candidat en attente." />
          ) : (
            candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">
                  {candidate.full_name}
                </TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>
                  {candidate.address}, {candidate.city}
                </TableCell>
                <TableCell>{candidate.siren}</TableCell>
                <TableCell>
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {candidate.categories.slice(0, 2).map((category) => (
                      <Badge key={category} variant="accent">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{candidate.radius_km} km</TableCell>
                <TableCell>
                  <CandidateStatusBadge status={candidate.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {candidate.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatus(candidate.id, "accepted")}
                          disabled={isPending}
                        >
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatus(candidate.id, "refused")}
                          disabled={isPending}
                        >
                          Refuser
                        </Button>
                      </>
                    )}
                    {candidate.status !== "suspended" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatus(candidate.id, "suspended")}
                        disabled={isPending}
                      >
                        Suspendre
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
