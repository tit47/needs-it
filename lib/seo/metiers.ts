import seoData from "@/data/seo-metiers.json";

export interface MetierSeoRecord {
  metier: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  travaux: [string, string, string, string, string];
  prix: [
    { nom: string; prix: string },
    { nom: string; prix: string },
    { nom: string; prix: string },
    { nom: string; prix: string },
  ];
  duree: {
    petite: string;
    classique: string;
    importante: string;
  };
  metiersProches: [string, string, string, string];
  urgence: string;
}

type RawMetierRecord = Record<string, string | null>;

function asString(value: string | null | undefined): string {
  return value ?? "";
}

function mapRecord(raw: RawMetierRecord): MetierSeoRecord {
  return {
    metier: asString(raw["Métier"]),
    slug: asString(raw["Slug"]),
    metaTitle: asString(raw["Meta_Title"]),
    metaDescription: asString(raw["Meta_Description"]),
    intro: asString(raw["Intro"]),
    travaux: [
      asString(raw["Travaux_1"]),
      asString(raw["Travaux_2"]),
      asString(raw["Travaux_3"]),
      asString(raw["Travaux_4"]),
      asString(raw["Travaux_5"]),
    ],
    prix: [
      { nom: asString(raw["Prix_1_Nom"]), prix: asString(raw["Prix_1"]) },
      { nom: asString(raw["Prix_2_Nom"]), prix: asString(raw["Prix_2"]) },
      { nom: asString(raw["Prix_3_Nom"]), prix: asString(raw["Prix_3"]) },
      { nom: asString(raw["Prix_4_Nom"]), prix: asString(raw["Prix_4"]) },
    ],
    duree: {
      petite: asString(raw["Durée_Petite"]),
      classique: asString(raw["Durée_Classique"]),
      importante: asString(raw["Durée_Importante"]),
    },
    metiersProches: [
      asString(raw["Métier_Proche_1"]),
      asString(raw["Métier_Proche_2"]),
      asString(raw["Métier_Proche_3"]),
      asString(raw["Métier_Proche_4"]),
    ],
    urgence: asString(raw["Urgence"]),
  };
}

const metiers: MetierSeoRecord[] = seoData.records.map(mapRecord);

const metierBySlug = new Map(metiers.map((item) => [item.slug, item]));
const slugByMetierName = new Map(
  metiers.map((item) => [item.metier.toLowerCase(), item.slug])
);

export const RESERVED_SLUGS = new Set([
  "admin",
  "pro",
  "api",
  "metiers",
  "faq",
  "comment-ca-marche",
  "cgu",
  "mentions-legales",
  "politique-de-confidentialite",
]);

export function getAllMetiers(): MetierSeoRecord[] {
  return metiers;
}

export function getMetierBySlug(slug: string): MetierSeoRecord | undefined {
  if (RESERVED_SLUGS.has(slug)) {
    return undefined;
  }
  return metierBySlug.get(slug);
}

export function getMetierSlugByName(name: string): string | undefined {
  return slugByMetierName.get(name.toLowerCase());
}

export function getMetierNameToSlugMap(): Map<string, string> {
  return new Map(metiers.map((item) => [item.metier, item.slug]));
}

export function getMetierSlugs(): string[] {
  return metiers.map((item) => item.slug);
}

export function buildCategorySearchUrl(metierName: string): string {
  return `/?category=${encodeURIComponent(metierName)}`;
}
