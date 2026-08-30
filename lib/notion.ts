import { list, put } from "@vercel/blob";

import type { NotionBlock } from "@/lib/types";

const apiVersion = process.env.NOTION_API_VERSION || "2025-09-03";
const dataSourceId =
  process.env.NOTION_DATA_SOURCE_ID ||
  "349de065-6c3e-80db-b431-000b11c998e7";

export type NotionPage = {
  id: string;
  url?: string;
  last_edited_time?: string;
  properties: Record<string, NotionProperty>;
};

type NotionProperty = {
  type?: string;
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string } | null;
  multi_select?: Array<{ name?: string }>;
  date?: { start?: string; end?: string | null } | null;
  number?: number | null;
  checkbox?: boolean;
  url?: string | null;
  relation?: Array<{ id?: string }>;
};

type Paginated<T> = {
  results: T[];
  has_more: boolean;
  next_cursor?: string | null;
};

export function notionIsConfigured() {
  const token = process.env.NOTION_API_TOKEN?.trim();
  return Boolean(token && token !== "empty" && token !== "changeme");
}

async function notionFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.NOTION_API_TOKEN;
  if (!notionIsConfigured()) throw new Error("NOTION_API_TOKEN is not configured");

  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": apiVersion,
      "Content-Type": "application/json",
      ...init?.headers
    },
    next: { revalidate: 300, tags: ["notion-content"] }
  });

  if (!response.ok) {
    throw new Error(`Notion ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export function notionDataSourceId() {
  return dataSourceId;
}

export async function getNotionPage(pageId: string) {
  return notionFetch<NotionPage>(`/pages/${pageId}`, { cache: "no-store" });
}

export async function updateNotionPageProperties(
  pageId: string,
  properties: Record<string, unknown>
) {
  return notionFetch<NotionPage>(`/pages/${pageId}`, {
    method: "PATCH",
    cache: "no-store",
    body: JSON.stringify({ properties })
  });
}

export async function createNotionPage(properties: Record<string, unknown>) {
  return notionFetch<NotionPage>("/pages", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties
    })
  });
}

type NotionWriteBlock = Record<string, unknown>;

export async function replaceNotionPageBlocks(
  pageId: string,
  children: NotionWriteBlock[]
) {
  const existing = await getChildrenRecursively(pageId);

  // Append the complete replacement first. If Notion rejects a block, the
  // original body remains intact instead of leaving a blank page.
  for (let index = 0; index < children.length; index += 100) {
    await notionFetch(`/blocks/${pageId}/children`, {
      method: "PATCH",
      cache: "no-store",
      body: JSON.stringify({ children: children.slice(index, index + 100) })
    });
  }

  for (const block of existing) {
    await notionFetch(`/blocks/${block.id}`, {
      method: "PATCH",
      cache: "no-store",
      body: JSON.stringify({ in_trash: true })
    });
  }

  return getNotionPage(pageId);
}

export function notionWritebackIsEnabled() {
  return notionIsConfigured() && process.env.NOTION_WRITEBACK_ENABLED === "true";
}

export function notionPageUrl(pageId: string) {
  return `https://www.notion.so/${pageId.replaceAll("-", "")}`;
}

export async function queryResourcePages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const response = await notionFetch<Paginated<NotionPage>>(
      `/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          start_cursor: cursor
        })
      }
    );
    pages.push(...response.results);
    cursor = response.has_more
      ? response.next_cursor || undefined
      : undefined;
  } while (cursor);

  return pages;
}

export function propertyText(property: NotionProperty | undefined) {
  if (!property) return "";
  const values = property.title || property.rich_text || [];
  return values.map((value) => value.plain_text || "").join("").trim();
}

export function propertySelect(property: NotionProperty | undefined) {
  return property?.select?.name?.trim() || "";
}

export function propertyMultiSelect(property: NotionProperty | undefined) {
  return (property?.multi_select || [])
    .map((value) => value.name?.trim())
    .filter((value): value is string => Boolean(value));
}

export function propertyDate(property: NotionProperty | undefined) {
  return property?.date?.start || undefined;
}

export function propertyNumber(property: NotionProperty | undefined) {
  return typeof property?.number === "number" ? property.number : undefined;
}

export function propertyCheckbox(property: NotionProperty | undefined) {
  return Boolean(property?.checkbox);
}

export function propertyUrl(property: NotionProperty | undefined) {
  return property?.url || undefined;
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  try {
    return await getChildrenRecursively(pageId);
  } catch (error) {
    const snapshot = await loadSnapshot(pageId);
    if (snapshot) return snapshot;
    throw error;
  }
}

async function getChildrenRecursively(blockId: string) {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (cursor) query.set("start_cursor", cursor);
    const response = await notionFetch<Paginated<NotionBlock>>(
      `/blocks/${blockId}/children?${query.toString()}`
    );

    for (const block of response.results) {
      blocks.push({
        ...block,
        children: block.has_children
          ? await getChildrenRecursively(block.id)
          : undefined
      });
    }

    cursor = response.has_more
      ? response.next_cursor || undefined
      : undefined;
  } while (cursor);

  return blocks;
}

const snapshotPath = (pageId: string) =>
  `notion-cache/${pageId.replaceAll("-", "")}.json`;

async function loadSnapshot(pageId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const result = await list({
      prefix: snapshotPath(pageId),
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    const blob = result.blobs[0];
    if (!blob) return null;
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as NotionBlock[];
  } catch {
    return null;
  }
}

function blockFileUrl(block: NotionBlock) {
  const payload = block[block.type] as
    | {
        type?: "file" | "external";
        file?: { url?: string };
        external?: { url?: string };
      }
    | undefined;
  if (!payload) return undefined;
  return payload.file?.url || payload.external?.url;
}

function withBlockFileUrl(block: NotionBlock, url: string): NotionBlock {
  const payload = (block[block.type] || {}) as Record<string, unknown>;
  return {
    ...block,
    [block.type]: {
      ...payload,
      type: "external",
      file: undefined,
      external: { url }
    }
  };
}

async function mirrorFile(block: NotionBlock) {
  const source = blockFileUrl(block);
  if (!source || !process.env.BLOB_READ_WRITE_TOKEN) return block;

  const extension =
    new URL(source).pathname.split(".").pop()?.toLowerCase().slice(0, 5) ||
    "bin";
  const pathname = `notion-media/${block.id}.${extension}`;
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) return block;

  const mirrored = await put(pathname, response.body!, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: response.headers.get("content-type") || undefined,
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
  return withBlockFileUrl(block, mirrored.url);
}

async function mirrorMedia(blocks: NotionBlock[]): Promise<NotionBlock[]> {
  return Promise.all(
    blocks.map(async (block) => {
      const mirrored =
        block.type === "image" ||
        block.type === "video" ||
        block.type === "audio" ||
        block.type === "file"
          ? await mirrorFile(block)
          : block;

      return {
        ...mirrored,
        children: block.children
          ? await mirrorMedia(block.children)
          : undefined
      };
    })
  );
}

export async function syncNotionPage(pageId: string) {
  const blocks = await getChildrenRecursively(pageId);
  const stableBlocks = await mirrorMedia(blocks);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(snapshotPath(pageId), JSON.stringify(stableBlocks), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json; charset=utf-8",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
  }

  return stableBlocks;
}
