import type { Payload } from "payload";

import {
  pushPayloadDocumentToNotion,
  type SyncCollection,
  type SyncDocument
} from "@/cms/hooks/notion-sync";
import {
  getNotionPage,
  notionIsConfigured,
  notionPageUrl,
  notionWritebackIsEnabled,
  propertyDate,
  propertySelect,
  propertyText,
  queryResourcePages,
  type NotionPage
} from "@/lib/notion";
import { syncNotionPageToPayload } from "@/lib/notion-payload-sync";

type ReconcileDocument = SyncDocument & {
  lastSyncSource?: "notion" | "payload" | null;
  lastSyncedAt?: string | null;
  sourceUpdatedAt?: string | null;
  syncStatus?: "pending" | "synced" | "conflict" | "error" | null;
  updatedAt?: string;
};

export type SyncDirection = "payload-to-notion" | "notion-to-payload" | "unchanged";

export function decideSyncDirection(doc: ReconcileDocument, notionUpdatedAt?: string): SyncDirection {
  const payloadHasPriority =
    doc.lastSyncSource === "payload" &&
    (doc.syncStatus === "pending" || doc.syncStatus === "error" || doc.syncStatus === "conflict");
  if (payloadHasPriority) return "payload-to-notion";

  if (doc.syncStatus === "error" && doc.lastSyncSource === "notion") {
    return "notion-to-payload";
  }

  const notionChanged =
    Boolean(notionUpdatedAt) &&
    (!doc.sourceUpdatedAt || Date.parse(notionUpdatedAt!) > Date.parse(doc.sourceUpdatedAt) + 500);
  return notionChanged ? "notion-to-payload" : "unchanged";
}

function collectionForPage(page: NotionPage): SyncCollection | undefined {
  const type = propertySelect(page.properties.Tipo);
  if (type === "Enseñanza") return "teachings";
  if (type === "Articulo" || type === "Pilar Content") return "resources";
  return undefined;
}

async function findLinkedDocument(
  payload: Payload,
  collection: SyncCollection,
  page: NotionPage
) {
  const direct = await payload.find({
    collection,
    where: { notionPageId: { equals: page.id } },
    locale: "es",
    draft: true,
    depth: 1,
    limit: 1,
    overrideAccess: true
  });
  if (direct.docs[0]) return direct.docs[0] as unknown as ReconcileDocument;

  const migrated = await payload.find({
    collection,
    where: { migrationKey: { equals: `notion:${page.id}` } },
    locale: "es",
    draft: true,
    depth: 1,
    limit: 1,
    overrideAccess: true
  });
  if (migrated.docs[0]) return migrated.docs[0] as unknown as ReconcileDocument;

  // When a Notion database is moved or copied to another workspace, every
  // Notion page receives a new ID. The copied Payload ID is the stable bridge
  // that lets us relink the existing document instead of creating a duplicate.
  const payloadId = propertyText(page.properties["Payload ID"]);
  const slug = propertyText(page.properties.Slug);
  if (!/^\d+$/.test(payloadId) || !slug) return undefined;
  const linkedByPayloadId = await payload.find({
    collection,
    where: {
      and: [
        { id: { equals: Number(payloadId) } },
        { slug: { equals: slug } }
      ]
    },
    locale: "es",
    draft: true,
    depth: 1,
    limit: 1,
    overrideAccess: true
  });
  const linked = linkedByPayloadId.docs[0] as unknown as ReconcileDocument | undefined;
  if (!linked) return undefined;

  return payload.update({
    collection,
    id: linked.id,
    data: {
      notionPageId: page.id,
      notionUrl: notionPageUrl(page.id),
      migrationKey: `notion:${page.id}`
    } as never,
    locale: "es",
    draft: true,
    depth: 1,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  }) as unknown as Promise<ReconcileDocument>;
}

async function unlinkedPendingDocuments(payload: Payload, collection: SyncCollection) {
  const result = await payload.find({
    collection,
    where: {
      and: [
        { notionPageId: { exists: false } },
        { syncStatus: { equals: "pending" } },
        { lastSyncSource: { equals: "payload" } }
      ]
    },
    locale: "es",
    draft: true,
    depth: 1,
    limit: 1000,
    overrideAccess: true
  });
  return result.docs as unknown as ReconcileDocument[];
}

export type NotionPayloadSyncSummary = {
  startedAt: string;
  finishedAt: string;
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  unchanged: number;
  skipped: number;
  errors: Array<{ collection?: SyncCollection; id?: number | string; notionPageId?: string; message: string }>;
};

let activeRun: Promise<NotionPayloadSyncSummary> | null = null;

export async function reconcileNotionPage(payload: Payload, pageId: string) {
  const page = await getNotionPage(pageId);
  const collection = collectionForPage(page);
  if (!collection) return { direction: "unchanged" as const, skipped: "unsupported_type" as const };

  const doc = await findLinkedDocument(payload, collection, page);
  if (!doc) {
    const result = await syncNotionPageToPayload(payload, page.id);
    return { direction: "notion-to-payload" as const, result };
  }

  const origin = propertySelect(page.properties["Origen del último cambio"]);
  const remoteSyncedAt = propertyDate(page.properties["Última sincronización"]);
  const isOwnRecentWrite =
    origin === "Payload" &&
    Boolean(remoteSyncedAt && page.last_edited_time) &&
    Date.parse(page.last_edited_time!) <= Date.parse(remoteSyncedAt!) + 120_000;
  if (isOwnRecentWrite) {
    return { collection, id: doc.id, direction: "unchanged" as const };
  }

  const direction = decideSyncDirection(doc, page.last_edited_time);
  if (direction === "payload-to-notion") {
    await pushPayloadDocumentToNotion(payload, collection, doc);
  } else if (direction === "notion-to-payload") {
    await syncNotionPageToPayload(payload, page.id);
  }
  return { collection, id: doc.id, direction };
}

async function executeSync(payload: Payload): Promise<NotionPayloadSyncSummary> {
  if (!notionIsConfigured()) throw new Error("Notion no está configurado.");
  if (!notionWritebackIsEnabled()) throw new Error("La escritura bidireccional con Notion no está habilitada.");

  const startedAt = new Date().toISOString();
  const summary: Omit<NotionPayloadSyncSummary, "finishedAt"> = {
    startedAt,
    payloadToNotion: 0,
    notionToPayload: 0,
    createdInNotion: 0,
    unchanged: 0,
    skipped: 0,
    errors: []
  };
  const pages = await queryResourcePages();
  const linkedPayloadIds = new Set<string>();

  for (const page of pages) {
    const collection = collectionForPage(page);
    if (!collection) {
      summary.skipped += 1;
      continue;
    }

    try {
      const doc = await findLinkedDocument(payload, collection, page);
      if (!doc) {
        const result = await syncNotionPageToPayload(payload, page.id);
        if ("id" in result) summary.notionToPayload += 1;
        else summary.skipped += 1;
        continue;
      }
      linkedPayloadIds.add(`${collection}:${doc.id}`);

      const direction = decideSyncDirection(doc, page.last_edited_time);
      if (direction === "payload-to-notion") {
        await pushPayloadDocumentToNotion(payload, collection, doc);
        summary.payloadToNotion += 1;
      } else if (direction === "notion-to-payload") {
        const result = await syncNotionPageToPayload(payload, page.id);
        if ("id" in result) summary.notionToPayload += 1;
        else summary.skipped += 1;
      } else {
        summary.unchanged += 1;
      }
    } catch (error) {
      summary.errors.push({
        collection,
        notionPageId: page.id,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  for (const collection of ["teachings", "resources"] as const) {
    const pending = await unlinkedPendingDocuments(payload, collection);
    for (const doc of pending) {
      if (linkedPayloadIds.has(`${collection}:${doc.id}`)) continue;
      try {
        await pushPayloadDocumentToNotion(payload, collection, doc);
        summary.createdInNotion += 1;
      } catch (error) {
        summary.errors.push({
          collection,
          id: doc.id,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  return { ...summary, finishedAt: new Date().toISOString() };
}

export async function runNotionPayloadSync(payload: Payload) {
  if (!activeRun) {
    activeRun = executeSync(payload).finally(() => {
      activeRun = null;
    });
  }
  return activeRun;
}
