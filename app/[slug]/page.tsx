import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMetierFaqItems,
  MetierPageContent,
} from "@/components/seo/metier-page-content";
import { ClientShell } from "@/components/layout/client-shell";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  JsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getMetierBySlug,
  getMetierSlugs,
} from "@/lib/seo/metiers";

interface MetierPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getMetierSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: MetierPageProps): Promise<Metadata> {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);

  if (!metier) {
    return {};
  }

  return buildPageMetadata({
    title: metier.metaTitle,
    description: metier.metaDescription,
    path: `/${slug}`,
    absoluteTitle: true,
  });
}

export default async function MetierPage({ params }: MetierPageProps) {
  const { slug } = await params;
  const metier = getMetierBySlug(slug);

  if (!metier) {
    notFound();
  }

  const faqItems = getMetierFaqItems(metier);

  return (
    <ClientShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Métiers", path: "/metiers" },
          { name: metier.metier, path: `/${slug}` },
        ])}
      />
      <JsonLd data={buildFaqSchema(faqItems)} />
      <MetierPageContent metier={metier} />
    </ClientShell>
  );
}
