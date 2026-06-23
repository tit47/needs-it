import { absoluteUrl } from "@/lib/seo/site-url";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /pro/
Disallow: /api/

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
