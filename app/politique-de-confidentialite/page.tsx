import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/client/legal-document-view";
import { ClientShell } from "@/components/layout/client-shell";
import { getLegalDocument } from "@/lib/get-legal-document";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et protection des données personnelles sur Need's it.",
};

export default function PolitiqueConfidentialitePage() {
  const document = getLegalDocument("politique-de-confidentialite");

  return (
    <ClientShell>
      <LegalDocumentView document={document} />
    </ClientShell>
  );
}
