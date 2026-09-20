import type { Payload } from "payload";
import type { SyncCollection, SyncDocument } from "@/cms/hooks/notion-sync";
import { notionIsConfigured, propertySelect, propertyText, queryResourcePages } from "@/lib/notion";
import { syncNotionPageToPayload } from "@/lib/notion-payload-sync";
import { syncNotionAuthorsToPayload } from "@/lib/notion-authors-sync";

export type SyncDirection = "notion-to-payload";

export function decideSyncDirection(_doc: SyncDocument, _notionUpdatedAt?: string): SyncDirection {
  // Equal timestamps do not prove that an older importer copied every field.
  return "notion-to-payload";
}

export type NotionPayloadSyncSummary = {
  runId: string;
  startedAt: string;
  finishedAt: string;
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  unchanged: number;
  skipped: number;
  errors: Array<{ collection?: SyncCollection; id?: number | string; notionPageId?: string; title?: string; message: string }>;
};

let activeRun: Promise<NotionPayloadSyncSummary> | null = null;

export async function reconcileNotionPage(payload: Payload, pageId: string) {
  const result = await syncNotionPageToPayload(payload, pageId);
  return { direction: "notion-to-payload" as const, result };
}

async function executeSync(payload: Payload): Promise<NotionPayloadSyncSummary> {
  if (!notionIsConfigured()) throw new Error("Notion no está configurado.");
  const summary: NotionPayloadSyncSummary = {
    runId: crypto.randomUUID(), startedAt: new Date().toISOString(), finishedAt: "",
    payloadToNotion: 0, notionToPayload: 0, createdInNotion: 0, unchanged: 0, skipped: 0, errors: []
  };
  const pages = await queryResourcePages();
  await syncNotionAuthorsToPayload(payload);
  for (const page of pages) {
    const type = propertySelect(page.properties.Tipo);
    const collection = type === "Enseñanza" ? "teachings" :
      type === "Articulo" || type === "Pilar Content" ? "resources" : undefined;
    if (!collection) { summary.skipped += 1; continue; }
    try {
      const result = await syncNotionPageToPayload(payload, page.id);
      if ("id" in result) summary.notionToPayload += 1;
      else throw new Error(`No se importó el contenido: ${result.skipped}. Revisa Nombre, Slug y Serie en Notion.`);
    } catch (error) {
      summary.errors.push({ collection, notionPageId: page.id,
        title: propertyText(page.properties.Nombre) || undefined,
        message: error instanceof Error ? error.message : String(error) });
    }
  }
  summary.finishedAt = new Date().toISOString();
  return summary;
}

export async function runNotionPayloadSync(payload: Payload) {
  if (!activeRun) activeRun = executeSync(payload).finally(() => { activeRun = null; });
  return activeRun;
}
