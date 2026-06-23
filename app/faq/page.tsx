import type { Metadata } from "next";
import { SeoContentView } from "@/components/seo/seo-content-view";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { ClientShell } from "@/components/layout/client-shell";
import { getSeoContentDocument } from "@/lib/seo/content";
import { extractFaqItemsFromMarkdown } from "@/lib/seo/faq";
import { buildBreadcrumbSchema, buildFaqSchema, JsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

const document = getSeoContentDocument("faq.md");

export const metadata: Metadata = buildPageMetadata({
  title: document.title,
  description:
    "Réponses aux questions fréquentes sur Need's it : fonctionnement, tarifs, confidentialité et mise en relation avec des professionnels.",
  path: "/faq",
});

export default function FaqPage() {
  const faqItems = extractFaqItemsFromMarkdown(document.content);

  return (
    <ClientShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <JsonLd data={buildFaqSchema(faqItems)} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <SeoBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "FAQ" },
          ]}
        />
        <SeoContentView markdown={document.content} />
      </div>
    </ClientShell>
  );
}
