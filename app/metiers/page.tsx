import Link from "next/link";
import type { Metadata } from "next";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { ClientShell } from "@/components/layout/client-shell";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildBreadcrumbSchema, JsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getAllMetiers } from "@/lib/seo/metiers";

export const metadata: Metadata = buildPageMetadata({
  title: "Tous les métiers",
  description:
    "Découvrez tous les métiers disponibles sur Need's it et trouvez rapidement le professionnel adapté à votre besoin.",
  path: "/metiers",
});

export default function MetiersPage() {
  const metiers = getAllMetiers().sort((a, b) =>
    a.metier.localeCompare(b.metier, "fr")
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Accueil", path: "/" },
    { name: "Métiers", path: "/metiers" },
  ]);

  return (
    <ClientShell>
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <SeoBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Métiers" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            Métiers
          </h1>
          <p className="text-sm text-[var(--color-foreground)]/80">
            Trouvez le professionnel adapté à votre besoin parmi les métiers
            disponibles sur Need&apos;s it.
          </p>
        </div>

        <ul className="grid gap-4">
          {metiers.map((item) => (
            <li key={item.slug}>
              <Card>
                <CardHeader>
                  <CardTitle>{item.metier}</CardTitle>
                  <CardDescription>{item.intro}</CardDescription>
                </CardHeader>
                <Link href={`/${item.slug}`}>
                  <Button variant="secondary" size="sm">
                    En savoir plus
                  </Button>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </ClientShell>
  );
}
