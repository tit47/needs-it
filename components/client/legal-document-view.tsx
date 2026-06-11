import { Card } from "@/components/ui/card";
import type { LegalDocument } from "@/lib/legal-documents";
import { renderMarkdownToHtml } from "@/utils/markdown";

interface LegalDocumentViewProps {
  document: LegalDocument;
}

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  const html = renderMarkdownToHtml(document.content);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card padding="lg">
        <article
          className="legal-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </div>
  );
}
