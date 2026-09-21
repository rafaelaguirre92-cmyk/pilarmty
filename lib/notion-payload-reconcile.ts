import type { Payload } from "payload";

import {
  pushPayloadDocumentToNotion,
  type SyncCollection,
  type SyncDocument
} from "@/cms/hooks/notion-sync";
import { syncNotionAuthorsToPayload } from "@/lib/notion-authors-sync";
import {
  getNotionPage,
  notionIsConfigured,
  notionWritebackIsEnabled,
  propertyDate,
  propertySelect,
  propertyText,
  queryResourcePages,
  type NotionPage
} from "@/lib/notion";
import {
  findLinkedDocument,
  type LinkedDocument
} from "@/lib/notion-payload-link";
import { syncNotionPageToPayload } from "@/lib/notion-payload-sync";

type ReconcileDocument = LinkedDocument & SyncDocument;

export type SyncDirection =
  | "payload-to-notion"
  | "notion-to-payload"
  | "conflict"
  | "unchanged";

function notionIsNewer(doc: ReconcileDocument, notionUpdatedAt?: string) {
  return (
    Boolean(notionUpdatedAt) &&
    (!doc.sourceUpdatedAt ||
      Date.parse(notionUpdatedAt!) > Date.parse(doc.sourceUpdatedAt) + 500)
  );
}

export function decideSyncDirection(
  doc: ReconcileDocument,
  notionUpdatedAt?: string
): SyncDirection {
  const payloadHasPriority =
    doc.lastSyncSource === "payload" &&
    (doc.syncStatus === "pending" ||
      doc.syncStatus === "error" ||
      doc.syncStatus === "conflict");

  const notionChanged = notionIsNewer(doc, notionUpdatedAt);

  if (payloadHasPriority && notionChanged) return "conflict";
  if (payloadHasPriority) return "payload-to-notion";

  if (doc.syncStatus === "error" && doc.lastSyncSource === "notion") {
    return "notion-to-payload";
  }

  return notionChanged ? "notion-to-payload" : "unchanged";
}

function collectionForPage(page: NotionPage): SyncCollection | undefined {
  const type = propertySelect(page.properties.Tipo);
  const normalized = type.normalize("NFC").trim().toLocaleLowerCase("es-MX");
  if (type === "Enseñanza") return "teachings";
  if (
    normalized === "articulo" ||
    normalized === "artículo" ||
    type === "Pilar Content" ||
    normalized === "contenido pilar"
  ) {
    return "resources";
  }
  return undefined;
}

async function markConflict(
  payload: Payload,
  collection: SyncCollection,
  doc: ReconcileDocument
) {
  await payload.update({
    collection,
    id: doc.id,
    data: {
      syncStatus: "conflict",
      lastSyncSource: "payload",
      syncError: "Incidencia detectada: se conservó la versión de Payload."
    } as never,
    locale: "es",
    draft: true,
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  });
}

async function unlinkedPendingDocuments(payload: Payload, collection: SyncCollection) {
  const result = await payload.find({
    collection,
    where: {
      and: [
        { notionPageId: { exists: false } },
        {
          or: [
            { syncStatus: { equals: "pending" } },
            { syncStatus: { equals: "error" } },
            { syncStatus: { equals: "conflict" } }
          ]
        },
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
  runId: string;
  startedAt: string;
  finishedAt: string;
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  conflictsResolved: number;
  unchanged: number;
  skipped: number;
  skippedReasons: Record<string, number>;
  errors: Array<{
    collection?: SyncCollection;
    id?: number | string;
    notionPageId?: string;
    title?: string;
    message: string;
  }>;
};

let activeRun: Promise<NotionPayloadSyncSummary> | null = null;

function bumpSkip(
  summary: Omit<NotionPayloadSyncSummary, "finishedAt">,
  reason: string,
  meta?: { collection?: SyncCollection; notionPageId?: string; title?: string; detail?: string }
) {
  summary.skipped += 1;
  summary.skippedReasons[reason] = (summary.skippedReasons[reason] || 0) + 1;
  if (
    reason === "invalid_teaching" ||
    reason === "invalid_resource" ||
    reason === "unsupported_type"
  ) {
    summary.errors.push({
      collection: meta?.collection,
      notionPageId: meta?.notionPageId,
      title: meta?.title,
      message:
        meta?.detail ||
        (reason === "unsupported_type"
          ? "Tipo de Notion no soportado."
          : reason === "invalid_teaching"
            ? "Enseñanza incompleta: revisa Nombre, Slug y Serie/Sección."
            : "Artículo incompleto: revisa Nombre, Slug y Tipo.")
    });
  }
}

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
  if (direction === "conflict" || direction === "payload-to-notion") {
    if (!notionWritebackIsEnabled()) {
      throw new Error("La escritura bidireccional con Notion no está habilitada.");
    }
    if (direction === "conflict") {
      await markConflict(payload, collection, doc);
    }
    await pushPayloadDocumentToNotion(payload, collection, {
      ...doc,
      syncStatus: direction === "conflict" ? "conflict" : doc.syncStatus
    });
    return {
      collection,
      id: doc.id,
      direction: "payload-to-notion" as const,
      conflict: direction === "conflict"
    };
  }
  if (direction === "notion-to-payload") {
    await syncNotionPageToPayload(payload, page.id);
  }
  return { collection, id: doc.id, direction };
}

async function executeSync(payload: Payload): Promise<NotionPayloadSyncSummary> {
  if (!notionIsConfigured()) throw new Error("Notion no está configurado.");

  const summary: NotionPayloadSyncSummary = {
    runId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    finishedAt: "",
    payloadToNotion: 0,
    notionToPayload: 0,
    createdInNotion: 0,
    conflictsResolved: 0,
    unchanged: 0,
    skipped: 0,
    skippedReasons: {},
    errors: []
  };

  const pages = await queryResourcePages();
  await syncNotionAuthorsToPayload(payload);
  const linkedPayloadIds = new Set<string>();

  for (const page of pages) {
    const collection = collectionForPage(page);
    if (!collection) {
      bumpSkip(summary, "unsupported_type", {
        notionPageId: page.id,
        title: propertyText(page.properties.Nombre) || undefined
      });
      continue;
    }

    try {
      const doc = await findLinkedDocument(payload, collection, page);
      if (!doc) {
        const result = await syncNotionPageToPayload(payload, page.id);
        if ("id" in result) summary.notionToPayload += 1;
        else {
          bumpSkip(summary, result.skipped, {
            collection,
            notionPageId: "notionPageId" in result ? result.notionPageId : page.id,
            title: "title" in result ? result.title : propertyText(page.properties.Nombre) || undefined,
            detail: "detail" in result ? result.detail : undefined
          });
        }
        continue;
      }
      linkedPayloadIds.add(`${collection}:${doc.id}`);

      const direction = decideSyncDirection(doc, page.last_edited_time);
      if (direction === "conflict" || direction === "payload-to-notion") {
        if (!notionWritebackIsEnabled()) {
          throw new Error("La escritura bidireccional con Notion no está habilitada.");
        }
        if (direction === "conflict") {
          await markConflict(payload, collection, doc);
          summary.conflictsResolved += 1;
        }
        await pushPayloadDocumentToNotion(payload, collection, {
          ...doc,
          syncStatus: direction === "conflict" ? "conflict" : doc.syncStatus
        });
        summary.payloadToNotion += 1;
      } else if (direction === "notion-to-payload") {
        const result = await syncNotionPageToPayload(payload, page.id);
        if ("id" in result) summary.notionToPayload += 1;
        else {
          bumpSkip(summary, result.skipped, {
            collection,
            notionPageId: "notionPageId" in result ? result.notionPageId : page.id,
            title: "title" in result ? result.title : propertyText(page.properties.Nombre) || undefined,
            detail: "detail" in result ? result.detail : undefined
          });
        }
      } else {
        summary.unchanged += 1;
      }
    } catch (error) {
      summary.errors.push({
        collection,
        notionPageId: page.id,
        title: propertyText(page.properties.Nombre) || undefined,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (notionWritebackIsEnabled()) {
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
            title: typeof doc.title === "string" ? doc.title : undefined,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  summary.finishedAt = new Date().toISOString();
  return summary;
}

export async function runNotionPayloadSync(payload: Payload) {
  if (!activeRun) {
    activeRun = executeSync(payload).finally(() => {
      activeRun = null;
    });
  }
  return activeRun;
}
