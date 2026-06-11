import type { Invoice } from "@/types";

/** États de facture V1 — extensible pour Stripe / abonnements plus tard. */
export type InvoiceStatus = "not_sent" | "sent" | "paid";

export function getInvoiceStatus(
  invoice: Pick<Invoice, "invoice_sent" | "paid">
): InvoiceStatus {
  if (invoice.paid) return "paid";
  if (invoice.invoice_sent) return "sent";
  return "not_sent";
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatMonthFr(month: string): string {
  const [year, monthPart] = month.split("-");
  const date = new Date(Number(year), Number(monthPart) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return month;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}
