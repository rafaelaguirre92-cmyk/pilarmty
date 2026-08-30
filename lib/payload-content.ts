import { draftMode } from "next/headers";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "@payload-config";
import type {
  Author,
  Media,
  Resource as PayloadResource,
  Series,
  Teaching as PayloadTeaching,
  Topic
} from "@/payload-types";
import type {
  Collection,
  Locale,
  Resource,
  Teaching
} from "@/lib/types";
import { normalizePathSegment } from "@/lib/site";

async function previewIsEnabled() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Static route generation has no request context and must always read published content.
    return false;
  }
}

function related<T extends { id: number | string }>(value: unknown): T | undefined {
  return value && typeof value === "object" && "id" in value
    ? (value as T)
    : undefined;
}

function mediaUrl(value: unknown) {
  const url = related<Media>(value)?.url || undefined;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative media URLs are already safe for Next Image.
  }
  return url;
}

function mediaAlt(value: unknown) {
  return related<Media>(value)?.alt || undefined;
}

function authorName(value: unknown) {
  return related<Author>(value)?.name || undefined;
}

function authorUrl(value: unknown) {
  return related<Author>(value)?.profileUrl || undefined;
}

function authorImage(value: unknown) {
  return mediaUrl(related<Author>(value)?.image);
}

function topicNames(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => related<Topic>(value)?.name)
    .filter((name): name is string => Boolean(name));
}

function mapSeries(doc: Series, locale: Locale): Collection {
  return {
    slug: doc.slug,
    name: doc.title,
    kind: doc.kind === "event" ? "evento" : "serie",
    description: doc.description || "",
    image: mediaUrl(doc.image),
    locale
  };
}

function mapTeaching(
  doc: PayloadTeaching,
  locale: Locale,
  alternate?: PayloadTeaching
): Teaching | null {
  const series = related<Series>(doc.series);
  const alternateSeries = related<Series>(alternate?.series);
  if (!series) return null;
  return {
    payloadId: doc.id,
    slug: doc.slug,
    collection: series.slug,
    collectionName: series.title,
    title: doc.title,
    locale,
    date: doc.teachingDate || undefined,
    author: authorName(doc.author),
    authorUrl: authorUrl(doc.author),
    authorImage: authorImage(doc.author),
    episode: doc.episode || undefined,
    excerpt: doc.excerpt || undefined,
    keyVerse: doc.keyVerse || undefined,
    body: doc.body as Record<string, unknown> | undefined,
    tags: topicNames(doc.topics),
    image: mediaUrl(doc.image),
    imageAlt: mediaAlt(doc.image),
    youtubeUrl: doc.youtubeUrl || undefined,
    applePodcastsUrl: doc.applePodcastsUrl || undefined,
    legacy: Boolean(doc.legacy),
    seoTitle: doc.seo?.title || undefined,
    seoDescription: doc.seo?.description || undefined,
    canonical: doc.seo?.canonical || undefined,
    noindex: Boolean(doc.seo?.noIndex),
    socialImage: mediaUrl(doc.seo?.socialImage),
    updatedAt: doc.updatedAt,
    translation:
      alternate?.slug && alternateSeries?.slug
        ? { collection: alternateSeries.slug, slug: alternate.slug }
        : undefined
  };
}

function mapResource(
  doc: PayloadResource,
  locale: Locale,
  alternate?: PayloadResource
): Resource {
  return {
    payloadId: doc.id,
    slug: doc.slug,
    title: doc.title,
    locale,
    kind: doc.kind === "pillar" ? "contenido-pilar" : "articulo",
    excerpt: doc.excerpt || undefined,
    body: doc.body as Record<string, unknown> | undefined,
    author: authorName(doc.author),
    authorUrl: authorUrl(doc.author),
    date: doc.contentDate || undefined,
    tags: topicNames(doc.topics),
    image: mediaUrl(doc.image),
    imageAlt: mediaAlt(doc.image),
    relatedTeachingSlugs: Array.isArray(doc.relatedTeachings)
      ? doc.relatedTeachings
          .map((item) => related<PayloadTeaching>(item)?.slug)
          .filter((slug): slug is string => Boolean(slug))
      : [],
    seoTitle: doc.seo?.title || undefined,
    seoDescription: doc.seo?.description || undefined,
    canonical: doc.seo?.canonical || undefined,
    noindex: Boolean(doc.seo?.noIndex),
    socialImage: mediaUrl(doc.seo?.socialImage),
    updatedAt: doc.updatedAt,
    translation: alternate?.slug
      ? { collection: "recursos", slug: alternate.slug }
      : undefined
  };
}

async function queryTeachings(locale: Locale, preview: boolean) {
  const payload = await getPayload({ config });
  const alternateLocale: Locale = locale === "es" ? "en" : "es";
  const [result, alternateResult] = await Promise.all([
    payload.find({
      collection: "teachings",
      locale,
      fallbackLocale: "es",
      depth: 2,
      limit: 1000,
      sort: "-teachingDate",
      draft: preview,
      overrideAccess: preview
    }),
    payload.find({
      collection: "teachings",
      locale: alternateLocale,
      fallbackLocale: false,
      depth: 2,
      limit: 1000,
      draft: preview,
      overrideAccess: preview
    })
  ]);
  const alternates = new Map(alternateResult.docs.map((doc) => [doc.id, doc]));
  return result.docs
    .map((doc) => mapTeaching(doc, locale, alternates.get(doc.id)))
    .filter((doc): doc is Teaching => Boolean(doc));
}

const cachedTeachings = unstable_cache(
  (locale: Locale) => queryTeachings(locale, false),
  ["payload-teachings-v2"],
  { revalidate: 300, tags: ["payload-content", "payload-teachings"] }
);

export async function payloadTeachings(locale: Locale) {
  return (await previewIsEnabled())
    ? queryTeachings(locale, true)
    : cachedTeachings(locale);
}

export async function payloadTeaching(locale: Locale, collection: string, slug: string) {
  const docs = await payloadTeachings(locale);
  const normalizedCollection = normalizePathSegment(collection);
  const normalizedSlug = normalizePathSegment(slug);
  return docs.find(
    (doc) =>
      doc.collection.normalize("NFC") === normalizedCollection &&
      doc.slug.normalize("NFC") === normalizedSlug
  ) || null;
}

async function queryCollections(locale: Locale, preview: boolean) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "series",
    locale,
    fallbackLocale: "es",
    depth: 1,
    limit: 1000,
    sort: "title",
    draft: preview,
    overrideAccess: preview
  });
  return result.docs.map((doc) => mapSeries(doc, locale));
}

const cachedCollections = unstable_cache(
  (locale: Locale) => queryCollections(locale, false),
  ["payload-series-v2"],
  { revalidate: 300, tags: ["payload-content", "payload-series"] }
);

export async function payloadCollections(locale: Locale) {
  return (await previewIsEnabled())
    ? queryCollections(locale, true)
    : cachedCollections(locale);
}

async function queryResources(locale: Locale, preview: boolean) {
  const payload = await getPayload({ config });
  const alternateLocale: Locale = locale === "es" ? "en" : "es";
  const [result, alternateResult] = await Promise.all([
    payload.find({
      collection: "resources",
      locale,
      fallbackLocale: "es",
      depth: 2,
      limit: 1000,
      sort: "-contentDate",
      draft: preview,
      overrideAccess: preview
    }),
    payload.find({
      collection: "resources",
      locale: alternateLocale,
      fallbackLocale: false,
      depth: 2,
      limit: 1000,
      draft: preview,
      overrideAccess: preview
    })
  ]);
  const alternates = new Map(alternateResult.docs.map((doc) => [doc.id, doc]));
  return result.docs.map((doc) =>
    mapResource(doc, locale, alternates.get(doc.id))
  );
}

const cachedResources = unstable_cache(
  (locale: Locale) => queryResources(locale, false),
  ["payload-resources-v2"],
  { revalidate: 300, tags: ["payload-content", "payload-resources"] }
);

export async function payloadResources(locale: Locale) {
  return (await previewIsEnabled())
    ? queryResources(locale, true)
    : cachedResources(locale);
}

export async function payloadResource(locale: Locale, slug: string) {
  const docs = await payloadResources(locale);
  const normalizedSlug = normalizePathSegment(slug);
  return docs.find((doc) => doc.slug.normalize("NFC") === normalizedSlug) || null;
}

export async function payloadRedirect(source: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "redirects",
    where: { source: { equals: source } },
    depth: 0,
    limit: 1,
    overrideAccess: true
  });
  const redirect = result.docs[0];
  return redirect
    ? { destination: redirect.destination, permanent: redirect.permanent !== false }
    : null;
}
