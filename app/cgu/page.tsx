import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/client/legal-document-view";
import { ClientShell } from "@/components/layout/client-shell";
import { getLegalDocument } from "@/lib/get-legal-document";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions Générales d'Utilisation du service Need's it.",
};

export default function CguPage() {
  const document = getLegalDocument("cgu");

  return (
    <ClientShell>
      <LegalDocumentView document={document} />
    </ClientShell>
  );
}
