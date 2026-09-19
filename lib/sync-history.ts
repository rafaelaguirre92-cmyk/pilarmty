import fs from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

export type SyncHistoryError = {
  collection?: string;
  id?: number | string;
  notionPageId?: string;
  title?: string;
  message: string;
};

export type SyncHistoryEntry = {
  id: string;
  finishedAt: string;
  status: "ready" | "incident" | "error";
  trigger: "manual" | "cron";
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  unchanged: number;
  skipped: number;
  errors: SyncHistoryError[];
};

const BLOB_FILENAME = "notion-sync-history.json";
const LOCAL_PATH = path.resolve(process.cwd(), ".payload/sync-history.json");

async function readLocalHistory(): Promise<SyncHistoryEntry[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
  } catch {
    // File doesn't exist yet or invalid JSON
  }
  return [];
}

async function writeLocalHistory(entries: SyncHistoryEntry[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
    await fs.writeFile(LOCAL_PATH, JSON.stringify(entries, null, 2), "utf-8");
  } catch (error) {
    console.error("No se pudo escribir el historial local de sincronización:", error);
  }
}

async function readBlobHistory(): Promise<SyncHistoryEntry[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const result = await list({ prefix: BLOB_FILENAME });
    const match = result.blobs.find((blob) => blob.pathname === BLOB_FILENAME);
    if (!match) return null;

    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.error("Error al leer historial de sincronización en Vercel Blob:", error);
    return null;
  }
}

async function writeBlobHistory(entries: SyncHistoryEntry[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await put(BLOB_FILENAME, JSON.stringify(entries, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false
    });
  } catch (error) {
    console.error("Error al persistir historial de sincronización en Vercel Blob:", error);
  }
}

export async function getSyncHistory(): Promise<SyncHistoryEntry[]> {
  // 1. Check Vercel Blob in production / if token configured
  const blobHistory = await readBlobHistory();
  if (blobHistory && blobHistory.length > 0) {
    // Keep local cache synced
    void writeLocalHistory(blobHistory);
    return blobHistory;
  }

  // 2. Check local file
  const localHistory = await readLocalHistory();
  if (localHistory.length > 0) {
    return localHistory;
  }

  return [];
}

export async function recordSyncRun(entry: SyncHistoryEntry): Promise<SyncHistoryEntry[]> {
  const current = await getSyncHistory();
  // Filter out any potential duplicate id and prepend new entry
  const updated = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 50);

  // Write both local and blob
  await writeLocalHistory(updated);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeBlobHistory(updated);
  }

  return updated;
}
