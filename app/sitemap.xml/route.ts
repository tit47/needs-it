import { getMetierSlugs } from "@/lib/seo/metiers";
import { absoluteUrl } from "@/lib/seo/site-url";

export function GET() {
  const staticPages = [
    "",
    "/metiers",
    "/faq",
    "/comment-ca-marche",
    "/cgu",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];

  const urls = [
    ...staticPages.map((path) => absoluteUrl(path)),
    ...getMetierSlugs().map((slug) => absoluteUrl(`/${slug}`)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
