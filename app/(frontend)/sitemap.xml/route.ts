import { absoluteUrl } from "@/lib/site";

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${absoluteUrl("/sitemap-es.xml")}</loc></sitemap>
  <sitemap><loc>${absoluteUrl("/sitemap-en.xml")}</loc></sitemap>
</sitemapindex>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400"
    }
  });
}
