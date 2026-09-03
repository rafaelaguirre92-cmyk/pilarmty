import "server-only";

import type { Media } from "@/payload-types";

function relatedMedia(value: unknown): Media | undefined {
  return value && typeof value === "object" && "id" in value
    ? (value as Media)
    : undefined;
}

export function payloadMediaUrl(value: unknown) {
  const media = relatedMedia(value);
  const url = media?.url || undefined;
  if (!media || !url) return undefined;

  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(
    /^vercel_blob_rw_([a-z\d]+)_/i
  )?.[1]?.toLowerCase();

  if (storeId && media.filename) {
    const prefix = typeof media.prefix === "string" ? media.prefix : "";
    const pathname = [prefix, media.filename]
      .filter(Boolean)
      .flatMap((part) => part.split("/"))
      .map(encodeURIComponent)
      .join("/");

    return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative media URLs are already safe to render.
  }

  return url;
}
