import {
  collections as fallbackCollections,
  collections,
  englishTeachings,
  spanishTeachings,
  translationPairs
} from "@/lib/content/fallback";
import {
  getPageBlocks,
  notionIsConfigured,
  propertyCheckbox,
  propertyDate,
  propertyMultiSelect,
  propertyNumber,
  propertySelect,
  propertyText,
  propertyUrl,
  queryResourcePages
} from "@/lib/notion";
import { normalizePathSegment, slugToTitle } from "@/lib/site";
import { siteCommunities, siteEvents } from "@/lib/content/site-data";
import type {
  Collection,
  Community,
  Locale,
  Resource,
  Event,
  Teaching,
  TranslationTarget
} from "@/lib/types";

const usePayload = process.env.CONTENT_SOURCE === "payload";

export function normalizeTeachingPage(
  page: Awaited<ReturnType<typeof queryResourcePages>>[number],
  options: { includeUnpublished?: boolean } = {}
): Teaching | null {
  const properties = page.properties;
  if (propertySelect(properties.Tipo) !== "Enseñanza") return null;

  const slug = propertyText(properties.Slug);
  const collection = propertySelect(properties["Sección"]);
  const title = propertyText(properties.Nombre);
  if (!slug || !collection || !title) return null;
  const legacy = spanishTeachings.some(
    (teaching) => teaching.legacy && teaching.slug === slug
  );
  const published = propertyCheckbox(properties.Web);
  if (!options.includeUnpublished && !legacy && !published) return null;

  return {
    notionId: page.id,
    slug,
    collection,
    collectionName:
      propertySelect(properties.Serie) ||
      fallbackCollections.find((item) => item.slug === collection)?.name ||
      slugToTitle(collection),
    title,
    locale: "es",
    date: propertyDate(properties.Fecha),
    author: propertySelect(properties.Orador) || undefined,
    episode: propertyNumber(properties.Episodio),
    excerpt: propertyText(properties["Sinópsis"]) || undefined,
    seoDescription: propertyText(properties.SEO) || undefined,
    tags: propertyMultiSelect(properties.Etiquetas),
    image:
      propertyUrl(properties["Imagen URL"]) ||
      propertyUrl(properties["Cover URL"]),
    youtubeUrl: propertyUrl(properties["YouTube URL"]),
    applePodcastsUrl: propertyUrl(properties["Apple Podcasts URL"]),
    updatedAt: page.last_edited_time,
    legacy,
    published
  };
}

export function normalizeResourcePage(
  page: Awaited<ReturnType<typeof queryResourcePages>>[number]
): Resource | null {
  const properties = page.properties;
  const notionType = propertySelect(properties.Tipo);
  if (notionType !== "Articulo" && notionType !== "Pilar Content") {
    return null;
  }
  if (!propertyCheckbox(properties.Web)) return null;

  const slug = propertyText(properties.Slug);
  const title = propertyText(properties.Nombre);
  if (!slug || !title) return null;

  return {
    notionId: page.id,
    slug,
    title,
    locale: "es",
    kind: notionType === "Articulo" ? "articulo" : "contenido-pilar",
    excerpt: propertyText(properties["Sinópsis"]) || undefined,
    seoDescription: propertyText(properties.SEO) || undefined,
    author: propertySelect(properties.Orador) || undefined,
    date: propertyDate(properties.Fecha),
    tags: propertyMultiSelect(properties.Etiquetas),
    image:
      propertyUrl(properties["Imagen URL"]) ||
      propertyUrl(properties["Cover URL"]),
    updatedAt: page.last_edited_time,
    relatedTeachingSlugs: []
  };
}

async function notionCatalog() {
  if (!notionIsConfigured()) return null;
  try {
    const pages = await queryResourcePages();
    return {
      teachings: pages
        .map((page) => normalizeTeachingPage(page))
        .filter((item): item is Teaching => Boolean(item)),
      resources: pages
        .map(normalizeResourcePage)
        .filter((item): item is Resource => Boolean(item))
    };
  } catch (error) {
    console.error("Notion catalog unavailable; using migration snapshot.", error);
    return null;
  }
}

export async function getTeachings(locale: Locale) {
  if (usePayload) {
    const { payloadTeachings } = await import("@/lib/payload-content");
    return payloadTeachings(locale);
  }
  const fallback =
    locale === "es"
      ? spanishTeachings.filter((teaching) => teaching.legacy)
      : englishTeachings;
  if (locale === "en") return fallback;

  const notion = await notionCatalog();
  if (!notion) return fallback;

  const merged = new Map(fallback.map((item) => [item.slug, item]));
  for (const teaching of notion.teachings) {
    const existing = merged.get(teaching.slug);
    const isLegacy = Boolean(existing?.legacy);
    merged.set(teaching.slug, {
      ...existing,
      ...teaching,
      tags: teaching.tags.length ? teaching.tags : existing?.tags || [],
      legacy: isLegacy
    });
  }

  return [...merged.values()].sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return (a.episode ?? 999) - (b.episode ?? 999);
  });
}

export async function getTeaching(
  locale: Locale,
  collection: string,
  slug: string
) {
  if (usePayload) {
    const { payloadTeaching } = await import("@/lib/payload-content");
    return payloadTeaching(locale, collection, slug);
  }
  const normalizedCollection = normalizePathSegment(collection);
  const normalizedSlug = normalizePathSegment(slug);
  const teachings = await getTeachings(locale);
  const teaching = teachings.find(
    (item) =>
      item.collection.normalize("NFC") === normalizedCollection &&
      item.slug.normalize("NFC") === normalizedSlug
  );
  if (!teaching) return null;

  if (teaching.notionId && notionIsConfigured()) {
    try {
      return {
        ...teaching,
        blocks: await getPageBlocks(teaching.notionId)
      };
    } catch (error) {
      console.error("Notion page body unavailable.", error);
    }
  }

  return teaching;
}

export async function getCollections(locale: Locale): Promise<Collection[]> {
  if (usePayload) {
    const { payloadCollections } = await import("@/lib/payload-content");
    return payloadCollections(locale);
  }
  return collections.filter((collection) => collection.locale === locale);
}

export async function getCollection(locale: Locale, slug: string) {
  const available = await getCollections(locale);
  const normalizedSlug = normalizePathSegment(slug);
  return (
    available.find(
      (collection) => collection.slug.normalize("NFC") === normalizedSlug
    ) || null
  );
}

export async function getResources(locale: Locale) {
  if (usePayload) {
    const { payloadResources } = await import("@/lib/payload-content");
    return payloadResources(locale);
  }
  if (locale === "en") return [] as Resource[];
  const notion = await notionCatalog();
  return notion?.resources || [];
}

export async function getResource(locale: Locale, slug: string) {
  if (usePayload) {
    const { payloadResource } = await import("@/lib/payload-content");
    return payloadResource(locale, slug);
  }
  const resources = await getResources(locale);
  const normalizedSlug = normalizePathSegment(slug);
  const resource = resources.find(
    (item) => item.slug.normalize("NFC") === normalizedSlug
  );
  if (!resource) return null;

  if (resource.notionId && notionIsConfigured()) {
    try {
      return {
        ...resource,
        blocks: await getPageBlocks(resource.notionId)
      };
    } catch (error) {
      console.error("Notion resource body unavailable.", error);
    }
  }

  return resource;
}

export async function getUpcomingEvents(locale: Locale): Promise<Event[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return siteEvents(locale)
    .filter((event) => new Date(event.endDate || event.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
}

export async function getCommunities(locale: Locale): Promise<Community[]> {
  return siteCommunities(locale).sort(
    (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
  );
}

export async function getContentRedirect(source: string) {
  if (!usePayload) return null;
  const { payloadRedirect } = await import("@/lib/payload-content");
  return payloadRedirect(source);
}

export function getTeachingTranslation(
  locale: Locale,
  collection: string,
  slug: string
): TranslationTarget | null {
  for (const pair of Object.values(translationPairs)) {
    const current = pair[locale];
    if (current.collection === collection && current.slug === slug) {
      return pair[locale === "es" ? "en" : "es"];
    }
  }
  return null;
}
