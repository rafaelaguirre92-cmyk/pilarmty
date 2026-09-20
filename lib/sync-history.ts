import fs from "node:fs/promises";
import path from "node:path";
import { del, list, put } from "@vercel/blob";

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

const MANIFEST_PREFIX = "sync-history/manifest-";
const LEGACY_BLOB_FILENAME = "notion-sync-history.json";
const LOCAL_PATH = path.resolve(process.cwd(), ".payload/sync-history.json");
const isVercelRuntime = process.env.VERCEL === "1";

async function readLocalHistory(): Promise<SyncHistoryEntry[]> {
  if (isVercelRuntime) return [];

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
  if (isVercelRuntime) return;

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
    // 1. List manifest blobs with prefix
    const result = await list({ prefix: MANIFEST_PREFIX });
    if (result.blobs && result.blobs.length > 0) {
      // Sort newest first by uploadedAt
      const sorted = [...result.blobs].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const newest = sorted[0];
      const res = await fetch(`${newest.url}?v=${newest.uploadedAt.getTime()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }

    // 2. Fallback to legacy single file if no manifests found yet
    const legacyResult = await list({ prefix: LEGACY_BLOB_FILENAME });
    const legacyMatch = legacyResult.blobs.find((blob) => blob.pathname === LEGACY_BLOB_FILENAME);
    if (legacyMatch) {
      const res = await fetch(`${legacyMatch.url}?v=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error al leer historial de sincronización en Vercel Blob:", error);
    return null;
  }
}

async function writeBlobHistory(entries: SyncHistoryEntry[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const timestamp = Date.now();
    const newPathname = `${MANIFEST_PREFIX}${timestamp}.json`;

    // Write new immutable manifest (URL is unique so Edge CDN never caches old versions)
    await put(newPathname, JSON.stringify(entries, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 0
    });

    // Cleanup older manifests in background to prevent unbounded blob storage growth
    void (async () => {
      try {
        const existing = await list({ prefix: MANIFEST_PREFIX });
        const oldBlobs = existing.blobs.filter(
          (blob) => blob.pathname !== newPathname
        );
        if (oldBlobs.length > 0) {
          await del(oldBlobs.map((b) => b.url));
        }

        // Also clean up legacy file if it exists
        const legacy = await list({ prefix: LEGACY_BLOB_FILENAME });
        if (legacy.blobs.length > 0) {
          await del(legacy.blobs.map((b) => b.url));
        }
      } catch (cleanupError) {
        console.warn("Advertencia al limpiar manifiestos antiguos de sincronización:", cleanupError);
      }
    })();
  } catch (error) {
    console.error("Error al persistir historial de sincronización en Vercel Blob:", error);
    throw error;
  }
}

export async function getSyncHistory(): Promise<SyncHistoryEntry[]> {
  // 1. Check Vercel Blob in production / if token configured
  const blobHistory = await readBlobHistory();
  if (blobHistory && blobHistory.length > 0) {
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

  // Write local
  await writeLocalHistory(updated);

  // Write blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await writeBlobHistory(updated);
    } catch (err) {
      console.error("Fallo al escribir historial en Vercel Blob:", err);
    }
  }

  return updated;
}
