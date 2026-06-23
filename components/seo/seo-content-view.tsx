import { Card } from "@/components/ui/card";
import { linkifyMetierNamesInMarkdown } from "@/lib/seo/linkify-metiers";
import { renderMarkdownToHtml } from "@/utils/markdown";

interface SeoContentViewProps {
  markdown: string;
  linkifyMetiers?: boolean;
}

export function SeoContentView({
  markdown,
  linkifyMetiers = true,
}: SeoContentViewProps) {
  const source = linkifyMetiers
    ? linkifyMetierNamesInMarkdown(markdown)
    : markdown;
  const html = renderMarkdownToHtml(source);

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
