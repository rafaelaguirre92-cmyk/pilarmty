import type { Payload } from "payload";

import type { SyncCollection } from "@/cms/hooks/notion-sync";
import { syncNotionAuthorsToPayload } from "@/lib/notion-authors-sync";
import {
  getNotionPage,
  notionIsConfigured,
  propertySelect,
  propertyText,
  queryResourcePages,
  type NotionPage
} from "@/lib/notion";
import { syncNotionPageToPayload } from "@/lib/notion-payload-sync";

export type SyncDirection =
  | "payload-to-notion"
  | "notion-to-payload"
  | "conflict"
  | "unchanged";

export function decideSyncDirection(
  _doc: unknown,
  _notionUpdatedAt?: string
): SyncDirection {
  // A complete Notion snapshot is imported on every run. This also repairs
  // missing fields when an earlier import recorded the same Notion timestamp.
  return "notion-to-payload";
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
  const result = await syncNotionPageToPayload(payload, page.id);
  return { collection, direction: "notion-to-payload" as const, result };
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
    } catch (error) {
      summary.errors.push({
        collection,
        notionPageId: page.id,
        title: propertyText(page.properties.Nombre) || undefined,
        message: error instanceof Error ? error.message : String(error)
      });
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
