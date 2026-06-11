import type { AlertLevel, CandidateStatus, RequestEventType, RequestStatus } from "@/types";
import type { BadgeProps } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/utils/invoices";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "En attente",
  claimed: "Prise",
  completed: "Terminée",
  cancelled: "Annulée",
  no_match: "Aucun pro",
};

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  suspended: "Suspendu",
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  red: "Rouge",
  orange: "Orange",
  green: "Vert",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  not_sent: "Non envoyée",
  sent: "Envoyée",
  paid: "Payée",
};

export function requestStatusVariant(
  status: RequestStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case "claimed":
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "no_match":
      return "danger";
    default:
      return "default";
  }
}

export function alertLevelVariant(
  level: AlertLevel
): NonNullable<BadgeProps["variant"]> {
  switch (level) {
    case "red":
      return "danger";
    case "orange":
      return "warning";
    case "green":
      return "success";
    default:
      return "default";
  }
}

export function candidateStatusVariant(
  status: CandidateStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case "accepted":
      return "success";
    case "pending":
      return "warning";
    case "refused":
    case "suspended":
      return "danger";
    default:
      return "default";
  }
}

export function invoiceStatusVariant(
  status: InvoiceStatus
): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case "paid":
      return "success";
    case "sent":
      return "warning";
    case "not_sent":
      return "danger";
    default:
      return "default";
  }
}

export function formatEventLabel(
  eventType: RequestEventType,
  categoryName?: string,
  city?: string
): string {
  const category = categoryName ?? "mission";
  const location = city ? ` ${city}` : "";

  switch (eventType) {
    case "request_created":
      return `Nouvelle demande ${category}${location}`;
    case "mission_claimed":
      return `Mission ${category.toLowerCase()} prise`;
    case "mission_released":
      return `Mission ${category.toLowerCase()} libérée`;
    case "mission_completed":
      return `Mission ${category.toLowerCase()} terminée`;
    case "email_sent":
      return `Email envoyé (${category})`;
    case "link_opened":
      return `Lien ouvert (${category})`;
    default:
      return category;
  }
}
