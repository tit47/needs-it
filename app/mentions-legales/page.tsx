import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/client/legal-document-view";
import { ClientShell } from "@/components/layout/client-shell";
import { getLegalDocument } from "@/lib/get-legal-document";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Need's it.",
};

export default function MentionsLegalesPage() {
  const document = getLegalDocument("mentions-legales");

  return (
    <ClientShell>
      <LegalDocumentView document={document} />
    </ClientShell>
  );
}
