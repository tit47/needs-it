import { Badge } from "@/components/ui/badge";
import {
  alertLevelVariant,
  ALERT_LEVEL_LABELS,
  CANDIDATE_STATUS_LABELS,
  candidateStatusVariant,
  INVOICE_STATUS_LABELS,
  invoiceStatusVariant,
  REQUEST_STATUS_LABELS,
  requestStatusVariant,
} from "@/utils/admin-labels";
import type { AlertLevel, CandidateStatus, RequestStatus } from "@/types";
import { getInvoiceStatus, type InvoiceStatus } from "@/utils/invoices";

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant={requestStatusVariant(status)}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export function AlertLevelBadge({ level }: { level: AlertLevel }) {
  return (
    <Badge variant={alertLevelVariant(level)}>{ALERT_LEVEL_LABELS[level]}</Badge>
  );
}

export function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <Badge variant={candidateStatusVariant(status)}>
      {CANDIDATE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "danger"}>
      {active ? "Actif" : "Suspendu"}
    </Badge>
  );
}

export function InvoiceStatusBadge({
  invoiceSent,
  paid,
}: {
  invoiceSent: boolean;
  paid: boolean;
}) {
  const status: InvoiceStatus = getInvoiceStatus({ invoice_sent: invoiceSent, paid });

  return (
    <Badge variant={invoiceStatusVariant(status)}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
