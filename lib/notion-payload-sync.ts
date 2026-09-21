import type { Payload } from "payload";

import { normalizeResourcePage, normalizeTeachingPage } from "@/lib/content";
import {
  getNotionPage,
  getPageBlocks,
  notionPageUrl,
  notionWritebackIsEnabled,
  propertyCheckbox,
  propertyRelationIds,
  propertySelect,
  propertyText,
  propertyUrl,
  updateNotionPageProperties,
  type NotionPage
} from "@/lib/notion";
import { authorIdForNotionRelation } from "@/lib/notion-authors-sync";
import {
  findLinkedDocument,
  type SyncCollection
} from "@/lib/notion-payload-link";
import { notionBlocksToLexical } from "@/lib/notion-to-lexical";
import { slugToTitle } from "@/lib/site";

type EditorialCollection = SyncCollection;

function fitSeoDescription(value?: string) {
  if (!value || value.length <= 170) return value;
  const candidate = value.slice(0, 170);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > 120 ? boundary : 167).trimEnd()}…`;
}

async function findOne(payload: Payload, collection: string, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1,
    overrideAccess: true
  });
  return result.docs[0] as { id: number | string } | undefined;
}

async function namedRelation(
  payload: Payload,
  collection: "authors" | "topics",
  name: string
) {
  if (!name) return undefined;
  const existing = await findOne(payload, collection, { name: { equals: name } });
  if (existing) return existing.id;
  const created = await payload.create({
    collection,
    data: {
      name,
      migrationKey: `${collection === "authors" ? "author" : "topic"}:${name.toLocaleLowerCase("es-MX")}`
    } as never,
    depth: 0,
    overrideAccess: true
  });
  return created.id;
}

async function seriesRelation(payload: Payload, slug: string, title?: string) {
  const existing = await findOne(payload, "series", { slug: { equals: slug } });
  if (existing) return existing.id;
  const created = await payload.create({
    collection: "series",
    data: {
      title: title || slugToTitle(slug),
      slug,
      kind: "series",
      migrationKey: `notion:series:${slug}`,
      _status: "published"
    },
    locale: "es",
    depth: 0,
    overrideAccess: true,
    draft: false,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
  return created.id;
}

async function topicRelations(payload: Payload, names: string[]) {
  return (await Promise.all(names.map((name) => namedRelation(payload, "topics", name)))).filter(Boolean);
}

async function authorRelation(payload: Payload, page: NotionPage) {
  const [authorPageId] = propertyRelationIds(page.properties.Autor);
  return authorPageId ? authorIdForNotionRelation(payload, authorPageId) : undefined;
}

async function save(
  payload: Payload,
  collection: EditorialCollection,
  page: NotionPage,
  data: Record<string, unknown>
) {
  const existing = await findLinkedDocument(payload, collection, page);
  const status = data._status === "published" ? "published" : "draft";
  // Draft-only writes must use draft:true so they don't create a sparse
  // "latest version" that admin list reads without series/author.
  // Published writes update main + version together with the full payload.
  const savingDraft = status === "draft";
  const common = {
    ...data,
    _status: status,
    migrationKey: `notion:${page.id}`,
    notionPageId: page.id,
    notionUrl: notionPageUrl(page.id),
    sourceUpdatedAt: page.last_edited_time,
    syncStatus: "synced",
    lastSyncedAt: new Date().toISOString(),
    lastSyncSource: "notion",
    syncError: null
  };
  const write = {
    collection,
    data: common as never,
    locale: "es" as const,
    depth: 0,
    overrideAccess: true,
    draft: savingDraft,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  };

  if (existing) {
    return payload.update({ ...write, id: existing.id });
  }
  try {
    return await payload.create(write);
  } catch (error) {
    // A second webhook or cron worker may have created this page between the
    // lookup above and the insert. Re-read the unique link and update it.
    const concurrent = await findLinkedDocument(payload, collection, page);
    if (!concurrent) throw error;
    return payload.update({ ...write, id: concurrent.id });
  }
}

async function confirmInNotion(
  page: Awaited<ReturnType<typeof getNotionPage>>,
  collection: EditorialCollection,
  payloadId: number | string
) {
  if (!notionWritebackIsEnabled()) return page;
  const properties = page.properties;
  const cmsUrl = `${(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/collections/${collection}/${payloadId}`;
  if (
    propertyText(properties["Payload ID"]) === String(payloadId) &&
    propertyUrl(properties["CMS URL"]) === cmsUrl &&
    propertySelect(properties["Estado de sincronización"]) === "Sincronizado" &&
    propertySelect(properties["Origen del último cambio"]) === "Notion"
  ) {
    return page;
  }
  try {
    return await updateNotionPageProperties(page.id, {
      "Payload ID": { rich_text: [{ type: "text", text: { content: String(payloadId) } }] },
      "CMS URL": { url: cmsUrl },
      "Estado de sincronización": { select: { name: "Sincronizado" } },
      "Última sincronización": { date: { start: new Date().toISOString() } },
      "Origen del último cambio": { select: { name: "Notion" } }
    });
  } catch (error) {
    console.error("Notion metadata writeback failed", error);
    return page;
  }
}

export async function syncNotionPageToPayload(payload: Payload, pageId: string) {
  const page = await getNotionPage(pageId);
  const rawType = propertySelect(page.properties.Tipo);
  const normalizedType = rawType.normalize("NFC").trim().toLocaleLowerCase("es-MX");
  const collection: EditorialCollection | undefined =
    rawType === "Enseñanza"
      ? "teachings"
      : normalizedType === "articulo" ||
          normalizedType === "artículo" ||
          rawType === "Pilar Content" ||
          normalizedType === "contenido pilar"
        ? "resources"
        : undefined;
  if (!collection) {
    return {
      skipped: "unsupported_type" as const,
      title: propertyText(page.properties.Nombre) || undefined,
      notionPageId: page.id
    };
  }

  const status = propertyCheckbox(page.properties.Web) ? "published" : "draft";

  const warnings: string[] = [];
  const body = await notionBlocksToLexical(await getPageBlocks(pageId), undefined, warnings);
  if (collection === "teachings") {
    const item = normalizeTeachingPage(page, { includeUnpublished: true });
    if (!item) {
      return {
        skipped: "invalid_teaching" as const,
        title: propertyText(page.properties.Nombre) || undefined,
        notionPageId: page.id,
        detail: "Revisa Nombre, Slug y Serie/Sección en Notion."
      };
    }
    const author = await authorRelation(payload, page);
    const doc = await save(payload, collection, page, {
      title: item.title,
      slug: item.slug,
      series: await seriesRelation(payload, item.collection, item.collectionName),
      episode: item.episode,
      keyVerse: item.keyVerse || null,
      teachingDate: item.date || null,
      author: author || null,
      excerpt: item.excerpt,
      body,
      youtubeUrl: item.youtubeUrl,
      youtubeDescription: item.youtubeDescription || null,
      notionImageUrl: item.image || null,
      spotifyUrl: item.spotifyUrl,
      topics: await topicRelations(payload, item.tags),
      legacy: item.legacy,
      seo: { description: fitSeoDescription(item.seoDescription) },
      _status: status
    });
    await confirmInNotion(page, collection, doc.id);
    return { collection, id: doc.id, warnings };
  }

  const item = normalizeResourcePage(page, { includeUnpublished: true });
  if (!item) {
    return {
      skipped: "invalid_resource" as const,
      title: propertyText(page.properties.Nombre) || undefined,
      notionPageId: page.id,
      detail: "Revisa Nombre, Slug y Tipo (Articulo / Pilar Content) en Notion."
    };
  }
  const author = await authorRelation(payload, page);
  const doc = await save(payload, collection, page, {
    title: item.title,
    slug: item.slug,
    kind: item.kind === "contenido-pilar" ? "pillar" : "article",
    contentDate: item.date || null,
    notionImageUrl: item.image || null,
    author: author || null,
    excerpt: item.excerpt,
    body,
    topics: await topicRelations(payload, item.tags),
    seo: { description: fitSeoDescription(item.seoDescription) },
    _status: status
  });
  await confirmInNotion(page, collection, doc.id);
  return { collection, id: doc.id, warnings };
}
