import {
  getCollections,
  getResources,
  getTeachings,
  getTopicPublicationOverrides
} from "@/lib/content";
import { absoluteUrl, localePath } from "@/lib/site";
import {
  getTopicContent,
  getTopicSummaries,
  isTopicIndexable
} from "@/lib/topics";
import type { Locale } from "@/lib/types";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function buildSitemap(locale: Locale) {
  const [collections, teachings, resources, publication] = await Promise.all([
    getCollections(locale),
    getTeachings(locale),
    getResources(locale),
    getTopicPublicationOverrides()
  ]);
  const prefix = locale === "en" ? "/en" : "";
  const topics = getTopicSummaries(
    teachings,
    resources,
    publication.published,
    publication.unpublished
  ).filter(
    isTopicIndexable
  );
  const staticPaths = [
    prefix || "/",
    `${prefix}/recursos`,
    `${prefix}/recursos/temas`,
    `${prefix}/conocenos`,
    `${prefix}/visitanos`,
    `${prefix}/dar`,
    `${prefix}/comunidades`,
    `${prefix}/contactanos`
  ];
  const urls = [
    ...staticPaths.map((path) => ({ path, lastmod: undefined })),
    ...collections.map((collection) => ({
      path: localePath(locale, `/ensenanzas/${collection.slug}`),
      lastmod: undefined
    })),
    ...teachings.map((teaching) => ({
      path: localePath(
        locale,
        `/ensenanzas/${teaching.collection}/${teaching.slug}`
      ),
      lastmod: teaching.updatedAt || teaching.date
    })),
    ...resources.map((resource) => ({
      path: localePath(locale, `/recursos/${resource.slug}`),
      lastmod: resource.updatedAt || resource.date
    })),
    ...topics.map((topic) => {
      const content = getTopicContent(
        topic.slug,
        teachings,
        resources,
        publication.published,
        publication.unpublished
      );
      const lastmod = [
        ...(content?.teachings || []).map(
          (item) => item.updatedAt || item.date || ""
        ),
        ...(content?.resources || []).map(
          (item) => item.updatedAt || item.date || ""
        )
      ]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))[0];

      return {
        path: localePath(locale, `/recursos/temas/${topic.slug}`),
        lastmod
      };
    })
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>${
      lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;
}
