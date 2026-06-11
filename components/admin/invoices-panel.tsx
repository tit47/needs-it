"use client";

import { useMemo, useState, useTransition } from "react";
import {
  markInvoicePaidAction,
  markInvoiceSentAction,
} from "@/app/actions/admin";
import { InvoiceStatusBadge } from "@/components/admin/status-badges";
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
import type { InvoiceWithProfessional } from "@/services/invoices.service";
import { formatEur, formatMonthFr } from "@/utils/invoices";

interface InvoicesPanelProps {
  invoices: InvoiceWithProfessional[];
  missionPriceEur: number;
}

function getProfessionalName(invoice: InvoiceWithProfessional): string {
  const professional = invoice.professionals;
  if (!professional) return "—";
  if (Array.isArray(professional)) {
    return professional[0]?.full_name ?? "—";
  }
  return professional.full_name;
}

export function InvoicesPanel({
  invoices,
  missionPriceEur,
}: InvoicesPanelProps) {
  const [month, setMonth] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [professional, setProfessional] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (month && invoice.month !== month) return false;
      if (paidFilter === "paid" && !invoice.paid) return false;
      if (paidFilter === "unpaid" && invoice.paid) return false;
      if (
        professional &&
        !getProfessionalName(invoice)
          .toLowerCase()
          .includes(professional.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [invoices, month, paidFilter, professional]);

  const handleMarkSent = (id: string, sent: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await markInvoiceSentAction(id, sent);
      if (!result.success) {
        setError(result.error ?? "Action impossible.");
      }
    });
  };

  const handleMarkPaid = (id: string, paid: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await markInvoicePaidAction(id, paid);
      if (!result.success) {
        setError(result.error ?? "Action impossible.");
      }
    });
  };

  return (
    <Card padding="none">
      <div className="space-y-4 border-b border-[var(--color-border)] p-6">
        <div>
          <CardTitle>Suivi des factures</CardTitle>
          <CardDescription>
            Facturation manuelle — {formatEur(missionPriceEur)} par mission
            validée
          </CardDescription>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Mois"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]">
              Payé ou non
            </label>
            <select
              value={paidFilter}
              onChange={(event) =>
                setPaidFilter(event.target.value as "all" | "paid" | "unpaid")
              }
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-foreground)]"
            >
              <option value="all">Tous</option>
              <option value="unpaid">Non payées</option>
              <option value="paid">Payées</option>
            </select>
          </div>
          <Input
            label="Professionnel"
            placeholder="Ex. Dupont"
            value={professional}
            onChange={(event) => setProfessional(event.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professionnel</TableHead>
            <TableHead>Mois</TableHead>
            <TableHead>Missions</TableHead>
            <TableHead>Montant dû</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Facture envoyée</TableHead>
            <TableHead>Payée</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableEmpty message="Aucune facture pour ces critères." />
          ) : (
            filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {getProfessionalName(invoice)}
                </TableCell>
                <TableCell>{formatMonthFr(invoice.month)}</TableCell>
                <TableCell>{invoice.mission_count}</TableCell>
                <TableCell className="font-semibold">
                  {formatEur(Number(invoice.amount))}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge
                    invoiceSent={invoice.invoice_sent}
                    paid={invoice.paid}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={invoice.invoice_sent ? "success" : "default"}>
                    {invoice.invoice_sent ? "Oui" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={invoice.paid ? "success" : "default"}>
                    {invoice.paid ? "Oui" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {!invoice.invoice_sent && !invoice.paid && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handleMarkSent(invoice.id, true)}
                      >
                        Marquer envoyée
                      </Button>
                    )}
                    {invoice.invoice_sent && !invoice.paid && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isPending}
                        onClick={() => handleMarkPaid(invoice.id, true)}
                      >
                        Marquer payée
                      </Button>
                    )}
                    {invoice.paid && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleMarkPaid(invoice.id, false)}
                      >
                        Annuler paiement
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
