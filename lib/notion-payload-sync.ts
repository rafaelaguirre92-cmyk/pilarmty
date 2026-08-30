import type { Payload } from "payload";

import { normalizeResourcePage, normalizeTeachingPage } from "@/lib/content";
import {
  getNotionPage,
  getPageBlocks,
  notionPageUrl,
  notionWritebackIsEnabled,
  propertyCheckbox,
  propertySelect,
  propertyText,
  propertyUrl,
  updateNotionPageProperties
} from "@/lib/notion";
import { notionBlocksToLexical } from "@/lib/notion-to-lexical";
import { slugToTitle } from "@/lib/site";

type EditorialCollection = "teachings" | "resources";

async function findOne(payload: Payload, collection: string, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    locale: "es",
    depth: 0,
    limit: 1,
    overrideAccess: true
  });
  return result.docs[0] as { id: number | string } | undefined;
}

async function existingNotionDoc(payload: Payload, collection: EditorialCollection, pageId: string) {
  return (
    (await findOne(payload, collection, { notionPageId: { equals: pageId } })) ||
    (await findOne(payload, collection, { migrationKey: { equals: `notion:${pageId}` } }))
  );
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
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
  return created.id;
}

async function topicRelations(payload: Payload, names: string[]) {
  return (await Promise.all(names.map((name) => namedRelation(payload, "topics", name)))).filter(Boolean);
}

async function save(
  payload: Payload,
  collection: EditorialCollection,
  pageId: string,
  data: Record<string, unknown>
) {
  const existing = await existingNotionDoc(payload, collection, pageId);
  const common = {
    ...data,
    migrationKey: `notion:${pageId}`,
    notionPageId: pageId,
    notionUrl: notionPageUrl(pageId),
    syncStatus: "synced",
    lastSyncedAt: new Date().toISOString(),
    lastSyncSource: "notion",
    syncError: null
  };
  if (existing) {
    return payload.update({
      collection,
      id: existing.id,
      data: common as never,
      locale: "es",
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }
  return payload.create({
    collection,
    data: common as never,
    locale: "es",
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
}

async function confirmInNotion(
  page: Awaited<ReturnType<typeof getNotionPage>>,
  collection: EditorialCollection,
  payloadId: number | string
) {
  if (!notionWritebackIsEnabled()) return page;
  const properties = page.properties;
  const cmsUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/collections/${collection}/${payloadId}`;
  if (
    propertyText(properties["Payload ID"]) === String(payloadId) &&
    propertyUrl(properties["CMS URL"]) === cmsUrl &&
    propertySelect(properties["Estado de sincronización"]) === "Sincronizado" &&
    propertySelect(properties["Origen del último cambio"]) === "Notion"
  ) {
    return page;
  }
  return updateNotionPageProperties(page.id, {
    "Payload ID": { rich_text: [{ type: "text", text: { content: String(payloadId) } }] },
    "CMS URL": { url: cmsUrl },
    "Estado de sincronización": { select: { name: "Sincronizado" } },
    "Última sincronización": { date: { start: new Date().toISOString() } },
    "Origen del último cambio": { select: { name: "Notion" } }
  });
}

async function finishNotionImport(
  payload: Payload,
  collection: EditorialCollection,
  id: number | string,
  page: Awaited<ReturnType<typeof getNotionPage>>
) {
  await payload.update({
    collection,
    id,
    data: {
      sourceUpdatedAt: page.last_edited_time,
      syncStatus: "synced",
      lastSyncedAt: new Date().toISOString(),
      lastSyncSource: "notion",
      syncError: null
    } as never,
    locale: "es",
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
}

export async function syncNotionPageToPayload(payload: Payload, pageId: string) {
  const page = await getNotionPage(pageId);
  const notionType = propertySelect(page.properties.Tipo);
  const collection: EditorialCollection | undefined =
    notionType === "Enseñanza"
      ? "teachings"
      : notionType === "Articulo" || notionType === "Pilar Content"
        ? "resources"
        : undefined;
  if (!collection) return { skipped: "unsupported_type" as const };

  const existing = await existingNotionDoc(payload, collection, pageId);
  if (!propertyCheckbox(page.properties.Web)) {
    if (existing) {
      await payload.update({
        collection,
        id: existing.id,
        data: {
          _status: "draft",
          sourceUpdatedAt: page.last_edited_time,
          syncStatus: "synced",
          lastSyncedAt: new Date().toISOString(),
          lastSyncSource: "notion",
          syncError: null
        } as never,
        locale: "es",
        depth: 0,
        overrideAccess: true,
        context: { skipNotionSync: true, skipAutoTranslate: true }
      });
    }
    return { skipped: "not_web" as const };
  }

  const warnings: string[] = [];
  const body = await notionBlocksToLexical(await getPageBlocks(pageId), undefined, warnings);
  if (collection === "teachings") {
    const item = normalizeTeachingPage(page);
    if (!item) return { skipped: "invalid_teaching" as const };
    const author = item.author
      ? await namedRelation(payload, "authors", item.author)
      : undefined;
    const doc = await save(payload, collection, pageId, {
      title: item.title,
      slug: item.slug,
      series: await seriesRelation(payload, item.collection, item.collectionName),
      episode: item.episode,
      teachingDate: item.date,
      author,
      excerpt: item.excerpt,
      body,
      youtubeUrl: item.youtubeUrl,
      applePodcastsUrl: item.applePodcastsUrl,
      topics: await topicRelations(payload, item.tags),
      legacy: item.legacy,
      seo: { description: item.seoDescription },
      sourceUpdatedAt: item.updatedAt,
      _status: "published"
    });
    const confirmedPage = await confirmInNotion(page, collection, doc.id);
    await finishNotionImport(payload, collection, doc.id, confirmedPage);
    return { collection, id: doc.id, warnings };
  }

  const item = normalizeResourcePage(page);
  if (!item) return { skipped: "invalid_resource" as const };
  const author = item.author
    ? await namedRelation(payload, "authors", item.author)
    : undefined;
  const doc = await save(payload, collection, pageId, {
    title: item.title,
    slug: item.slug,
    kind: item.kind === "contenido-pilar" ? "pillar" : "article",
    contentDate: item.date,
    author,
    excerpt: item.excerpt,
    body,
    topics: await topicRelations(payload, item.tags),
    seo: { description: item.seoDescription },
    sourceUpdatedAt: item.updatedAt,
    _status: "published"
  });
  const confirmedPage = await confirmInNotion(page, collection, doc.id);
  await finishNotionImport(payload, collection, doc.id, confirmedPage);
  return { collection, id: doc.id, warnings };
}
