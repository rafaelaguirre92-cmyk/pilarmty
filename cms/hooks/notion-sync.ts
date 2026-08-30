import type { CollectionAfterChangeHook, Payload } from "payload";

import { lexicalToNotionBlocks } from "@/lib/lexical-to-notion";
import {
  createNotionPage,
  getNotionPage,
  notionPageUrl,
  notionWritebackIsEnabled,
  replaceNotionPageBlocks,
  updateNotionPageProperties
} from "@/lib/notion";

export type SyncCollection = "teachings" | "resources";
export type SyncDocument = Record<string, unknown> & {
  id: number | string;
  notionPageId?: string | null;
};

function relationId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "number" || typeof id === "string") return id;
  }
  return undefined;
}

async function relationValue(
  payload: Payload,
  collection: "authors" | "series" | "topics",
  value: unknown,
  field: "name" | "slug" | "title"
) {
  if (value && typeof value === "object" && field in value) {
    return String((value as Record<string, unknown>)[field] || "");
  }
  const id = relationId(value);
  if (!id) return "";
  const related = await payload.findByID({
    collection,
    id,
    depth: 0,
    overrideAccess: true
  });
  return String((related as unknown as Record<string, unknown>)[field] || "");
}

async function topicNames(payload: Payload, value: unknown) {
  if (!Array.isArray(value)) return [];
  return Promise.all(value.map((topic) => relationValue(payload, "topics", topic, "name")));
}

function text(value: unknown) {
  const content = typeof value === "string" ? value.trim() : "";
  return { rich_text: content ? [{ type: "text", text: { content } }] : [] };
}

function title(value: unknown) {
  const content = typeof value === "string" ? value.trim() : "";
  return { title: content ? [{ type: "text", text: { content } }] : [] };
}

function select(value: string) {
  return { select: value ? { name: value } : null };
}

function date(value: unknown) {
  return { date: typeof value === "string" && value ? { start: value } : null };
}

function seoDescription(doc: SyncDocument) {
  const seo = doc.seo;
  return seo && typeof seo === "object"
    ? (seo as Record<string, unknown>).description
    : undefined;
}

export async function notionProperties(
  collection: SyncCollection,
  doc: SyncDocument,
  payload: Payload,
  syncedAt: string
) {
  const author = await relationValue(payload, "authors", doc.author, "name");
  const topics = (await topicNames(payload, doc.topics)).filter(Boolean);
  const common: Record<string, unknown> = {
    Nombre: title(doc.title),
    Slug: text(doc.slug),
    "Sinópsis": text(doc.excerpt),
    SEO: text(seoDescription(doc)),
    Fecha: date(collection === "teachings" ? doc.teachingDate : doc.contentDate),
    Web: { checkbox: doc._status === "published" },
    Orador: select(author),
    Etiquetas: { multi_select: topics.map((name) => ({ name })) },
    "Payload ID": text(String(doc.id)),
    "CMS URL": {
      url: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/collections/${collection}/${doc.id}`
    },
    "Estado de sincronización": select("Sincronizado"),
    "Última sincronización": { date: { start: syncedAt } },
    "Origen del último cambio": select("Payload")
  };

  if (collection === "teachings") {
    const seriesName = await relationValue(payload, "series", doc.series, "title");
    const seriesSlug = await relationValue(payload, "series", doc.series, "slug");
    return {
      ...common,
      Tipo: select("Enseñanza"),
      Serie: select(seriesName),
      "Sección": select(seriesSlug),
      Episodio: { number: typeof doc.episode === "number" ? doc.episode : null },
      "YouTube URL": { url: typeof doc.youtubeUrl === "string" ? doc.youtubeUrl || null : null },
      "Apple Podcasts URL": {
        url: typeof doc.applePodcastsUrl === "string" ? doc.applePodcastsUrl || null : null
      }
    };
  }

  return {
    ...common,
    Tipo: select(doc.kind === "pillar" ? "Pilar Content" : "Articulo")
  };
}

async function updateLocalStatus(
  collection: SyncCollection,
  doc: SyncDocument,
  payload: Payload,
  data: Record<string, unknown>
) {
  return payload.update({
    collection,
    id: doc.id,
    data: data as never,
    locale: "es",
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
}

export async function pushPayloadDocumentToNotion(
  payload: Payload,
  collection: SyncCollection,
  doc: SyncDocument
) {
  if (!notionWritebackIsEnabled()) {
    throw new Error("La escritura en Notion no está habilitada.");
  }

  const syncedAt = new Date().toISOString();
  try {
    const properties = await notionProperties(collection, doc, payload, syncedAt);
    const initialPage = doc.notionPageId
      ? await updateNotionPageProperties(doc.notionPageId, properties)
      : await createNotionPage(properties);
    await replaceNotionPageBlocks(initialPage.id, lexicalToNotionBlocks(doc.body));
    const page = await getNotionPage(initialPage.id);

    await updateLocalStatus(collection, doc, payload, {
      notionPageId: page.id,
      notionUrl: page.url || notionPageUrl(page.id),
      sourceUpdatedAt: page.last_edited_time,
      syncStatus: "synced",
      lastSyncedAt: new Date().toISOString(),
      lastSyncSource: "payload",
      syncError: null,
      migrationKey: doc.notionPageId ? doc.migrationKey : `notion:${page.id}`
    });
    return page;
  } catch (error) {
    await updateLocalStatus(collection, doc, payload, {
      syncStatus: "error",
      lastSyncSource: "payload",
      syncError: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

export const syncPayloadToNotion = (
  collection: SyncCollection
): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    const current = doc as SyncDocument;
    if (
      !notionWritebackIsEnabled() ||
      req.context?.skipNotionSync ||
      req.locale === "en"
    ) {
      return doc;
    }

    // Autosave only marks the item. The daily/manual reconciler performs the
    // remote write once, preventing a burst of Notion requests while editing.
    await updateLocalStatus(collection, current, req.payload, {
      syncStatus: "pending",
      lastSyncSource: "payload",
      syncError: null
    });
    return doc;
  };
