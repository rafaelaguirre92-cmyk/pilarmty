import { buildSitemap } from "@/lib/sitemap";

export async function GET() {
  return new Response(await buildSitemap("es"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400"
    }
  });
}
