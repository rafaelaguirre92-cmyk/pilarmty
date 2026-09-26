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
  propertySelectOption,
  propertyText,
  propertyUrl,
  propertyMultiSelectOptions,
  updateNotionPageProperties,
  type NotionPage
} from "@/lib/notion";
import { authorIdForNotionRelation } from "@/lib/notion-authors-sync";
import {
  seriesMigrationKey,
  topicMigrationKey,
  type NotionMetadataOption
} from "@/lib/notion-metadata-identity";
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

type MetadataDocument = {
  id: number | string;
  name?: string;
  migrationKey?: string | null;
};

async function findMetadataDocuments(
  payload: Payload,
  collection: "series" | "topics",
  where: Record<string, unknown>
) {
  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true
  });
  return result.docs as unknown as MetadataDocument[];
}

async function namedMetadataRelation(
  payload: Payload,
  collection: "topics",
  option: NotionMetadataOption
) {
  const migrationKey = topicMigrationKey(option);
  const linked = await findMetadataDocuments(payload, collection, {
    migrationKey: { equals: migrationKey }
  });
  if (linked.length === 1) return linked[0]!.id;
  if (linked.length > 1) {
    throw new Error(`Hay ${linked.length} temas con la clave ${migrationKey}. Únelos manualmente.`);
  }

  const sameName = await findMetadataDocuments(payload, collection, {
    name: { equals: option.name }
  });
  if (sameName.length > 1) {
    throw new Error(`Hay ${sameName.length} temas con el nombre "${option.name}". Únelos manualmente.`);
  }
  if (sameName.length === 1) {
    const existing = sameName[0]!;
    if (existing.migrationKey !== migrationKey) {
      await payload.update({
        collection,
        id: existing.id,
        data: { migrationKey } as never,
        depth: 0,
        overrideAccess: true,
        context: { skipNotionSync: true, skipAutoTranslate: true }
      });
    }
    return existing.id;
  }

  try {
    const created = await payload.create({
      collection,
      data: { name: option.name, migrationKey } as never,
      depth: 0,
      overrideAccess: true
    });
    return created.id;
  } catch (error) {
    const concurrent = await findMetadataDocuments(payload, collection, {
      migrationKey: { equals: migrationKey }
    });
    if (concurrent.length !== 1) throw error;
    return concurrent[0]!.id;
  }
}

async function seriesRelation(
  payload: Payload,
  slug: string,
  title: string | undefined,
  optionId: string | undefined
) {
  const migrationKey = seriesMigrationKey(optionId, slug);
  const linked = await findMetadataDocuments(payload, "series", {
    migrationKey: { equals: migrationKey }
  });
  if (linked.length === 1) return linked[0]!.id;
  if (linked.length > 1) {
    throw new Error(`Hay ${linked.length} series con la clave ${migrationKey}. Únelas manualmente.`);
  }

  const sameSlug = await findMetadataDocuments(payload, "series", {
    slug: { equals: slug }
  });
  if (sameSlug.length > 1) {
    throw new Error(`Hay ${sameSlug.length} series con el slug "${slug}". Únelas manualmente.`);
  }
  if (sameSlug.length === 1) {
    const existing = sameSlug[0]!;
    if (existing.migrationKey !== migrationKey) {
      await payload.update({
        collection: "series",
        id: existing.id,
        data: { migrationKey } as never,
        locale: "es",
        depth: 0,
        overrideAccess: true,
        context: { skipNotionSync: true, skipAutoTranslate: true }
      });
    }
    return existing.id;
  }

  try {
    const created = await payload.create({
      collection: "series",
      data: {
        title: title || slugToTitle(slug),
        slug,
        kind: "series",
        migrationKey,
        _status: "published"
      },
      locale: "es",
      depth: 0,
      overrideAccess: true,
      draft: false,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
    return created.id;
  } catch (error) {
    const concurrent = await findMetadataDocuments(payload, "series", {
      migrationKey: { equals: migrationKey }
    });
    if (concurrent.length !== 1) throw error;
    return concurrent[0]!.id;
  }
}

async function topicRelations(payload: Payload, options: NotionMetadataOption[]) {
  return (await Promise.all(options.map((option) => namedMetadataRelation(payload, "topics", option)))).filter(Boolean);
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
  payloadId: number | string,
  options: { slug?: string } = {}
) {
  if (!notionWritebackIsEnabled()) return page;
  const properties = page.properties;
  const cmsUrl = `${(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/collections/${collection}/${payloadId}`;
  const slugMissing = Boolean(options.slug) && !propertyText(properties.Slug);
  if (
    propertyText(properties["Payload ID"]) === String(payloadId) &&
    propertyUrl(properties["CMS URL"]) === cmsUrl &&
    propertySelect(properties["Estado de sincronización"]) === "Sincronizado" &&
    propertySelect(properties["Origen del último cambio"]) === "Notion" &&
    !slugMissing
  ) {
    return page;
  }
  try {
    return await updateNotionPageProperties(page.id, {
      "Payload ID": { rich_text: [{ type: "text", text: { content: String(payloadId) } }] },
      "CMS URL": { url: cmsUrl },
      "Estado de sincronización": { select: { name: "Sincronizado" } },
      "Última sincronización": { date: { start: new Date().toISOString() } },
      "Origen del último cambio": { select: { name: "Notion" } },
      ...(slugMissing && options.slug
        ? { Slug: { rich_text: [{ type: "text", text: { content: options.slug } }] } }
        : {})
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
        detail: "Revisa Nombre y Serie/Sección en Notion."
      };
    }
    const author = await authorRelation(payload, page);
    const doc = await save(payload, collection, page, {
      title: item.title,
      slug: item.slug,
      series: await seriesRelation(
        payload,
        item.collection,
        item.collectionName,
        propertySelectOption(page.properties.Serie)?.id
      ),
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
      topics: await topicRelations(payload, propertyMultiSelectOptions(page.properties.Etiquetas)),
      legacy: item.legacy,
      seo: { description: fitSeoDescription(item.seoDescription) },
      _status: status
    });
    await confirmInNotion(page, collection, doc.id, { slug: item.slug });
    return { collection, id: doc.id, warnings };
  }

  const item = normalizeResourcePage(page, { includeUnpublished: true });
  if (!item) {
    return {
      skipped: "invalid_resource" as const,
      title: propertyText(page.properties.Nombre) || undefined,
      notionPageId: page.id,
      detail: "Revisa Nombre y Tipo (Articulo / Pilar Content) en Notion."
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
    topics: await topicRelations(payload, propertyMultiSelectOptions(page.properties.Etiquetas)),
    seo: { description: fitSeoDescription(item.seoDescription) },
    _status: status
  });
  await confirmInNotion(page, collection, doc.id, { slug: item.slug });
  return { collection, id: doc.id, warnings };
}
