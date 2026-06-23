import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";

interface BuildPageMetadataOptions {
  title: string;
  description: string;
  path: string;
  /** When set, used as the document title without the root layout template suffix. */
  absoluteTitle?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: BuildPageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Need's it",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
