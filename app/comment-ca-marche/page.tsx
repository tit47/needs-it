import type { Metadata } from "next";
import { SeoContentView } from "@/components/seo/seo-content-view";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { ClientShell } from "@/components/layout/client-shell";
import { getSeoContentDocument } from "@/lib/seo/content";
import { buildBreadcrumbSchema, JsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

const document = getSeoContentDocument("comment-ca-marche.md");

export const metadata: Metadata = buildPageMetadata({
  title: document.title,
  description:
    "Découvrez comment Need's it met en relation particuliers et professionnels : création de demande, alertes, contact et confirmation par code à 4 chiffres.",
  path: "/comment-ca-marche",
});

export default function CommentCaMarchePage() {
  return (
    <ClientShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Comment ça marche", path: "/comment-ca-marche" },
        ])}
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <SeoBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Comment ça marche" },
          ]}
        />
        <SeoContentView markdown={document.content} />
      </div>
    </ClientShell>
  );
}
