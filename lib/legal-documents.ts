export type LegalDocumentSlug =
  | "politique-de-confidentialite"
  | "cgu"
  | "mentions-legales";

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  filename: string;
  content: string;
};

export const LEGAL_DOCUMENTS: Record<
  LegalDocumentSlug,
  Omit<LegalDocument, "content">
> = {
  "politique-de-confidentialite": {
    slug: "politique-de-confidentialite",
    title: "Politique de confidentialité",
    filename: "POLITIQUE_DE_CONFIDENTIALITE.md",
  },
  cgu: {
    slug: "cgu",
    title: "Conditions Générales d'Utilisation",
    filename: "CGU.md",
  },
  "mentions-legales": {
    slug: "mentions-legales",
    title: "Mentions légales",
    filename: "MENTIONS_LEGALES.md",
  },
};

export const LEGAL_DOCUMENT_LINKS = [
  {
    href: "/politique-de-confidentialite",
    label: "Politique de confidentialité",
  },
  {
    href: "/cgu",
    label: "Conditions Générales d'Utilisation (CGU)",
  },
  {
    href: "/mentions-legales",
    label: "Mentions légales",
  },
] as const;

export function isLegalDocumentSlug(
  value: string
): value is LegalDocumentSlug {
  return value in LEGAL_DOCUMENTS;
}
