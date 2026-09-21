import type { Payload } from "payload";

import {
  notionPageUrl,
  propertyText,
  type NotionPage
} from "@/lib/notion";

export type SyncCollection = "teachings" | "resources";

export type LinkedDocument = {
  id: number | string;
  slug?: string | null;
  notionPageId?: string | null;
  migrationKey?: string | null;
  notionUrl?: string | null;
  _status?: "draft" | "published" | null;
  lastSyncedAt?: string | null;
  sourceUpdatedAt?: string | null;
  syncStatus?: "pending" | "synced" | "conflict" | "error" | null;
  lastSyncSource?: "notion" | "payload" | null;
  updatedAt?: string;
  [key: string]: unknown;
};

export type DuplicatePair = {
  collection: SyncCollection;
  slug: string;
  keep: LinkedDocument;
  drop: LinkedDocument[];
};

function asDoc(value: unknown): LinkedDocument | undefined {
  if (!value || typeof value !== "object" || !("id" in value)) return undefined;
  return value as LinkedDocument;
}

async function findDocs(
  payload: Payload,
  collection: SyncCollection,
  where: Record<string, unknown>,
  limit = 10
) {
  const result = await payload.find({
    collection,
    where: where as never,
    locale: "es",
    draft: true,
    depth: 0,
    limit,
    overrideAccess: true
  });
  return result.docs.map((doc) => asDoc(doc)).filter((doc): doc is LinkedDocument => Boolean(doc));
}

export function pickCanonicalDocument(docs: LinkedDocument[]): LinkedDocument {
  const ranked = [...docs].sort((a, b) => {
    const aPublished = a._status === "published" ? 1 : 0;
    const bPublished = b._status === "published" ? 1 : 0;
    if (aPublished !== bPublished) return bPublished - aPublished;

    const aLinked = a.notionPageId ? 1 : 0;
    const bLinked = b.notionPageId ? 1 : 0;
    if (aLinked !== bLinked) return bLinked - aLinked;

    const aSynced = a.lastSyncedAt ? Date.parse(a.lastSyncedAt) : 0;
    const bSynced = b.lastSyncedAt ? Date.parse(b.lastSyncedAt) : 0;
    if (aSynced !== bSynced) return bSynced - aSynced;

    const aUpdated = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const bUpdated = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return bUpdated - aUpdated;
  });
  return ranked[0]!;
}

async function relinkDocument(
  payload: Payload,
  collection: SyncCollection,
  doc: LinkedDocument,
  page: NotionPage
) {
  if (
    doc.notionPageId === page.id &&
    doc.migrationKey === `notion:${page.id}`
  ) {
    return doc;
  }

  return (await payload.update({
    collection,
    id: doc.id,
    data: {
      notionPageId: page.id,
      notionUrl: notionPageUrl(page.id),
      migrationKey: `notion:${page.id}`
    } as never,
    locale: "es",
    draft: true,
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true, skipAutoTranslate: true }
  })) as unknown as LinkedDocument;
}

/**
 * Resolve the Payload document for a Notion page without creating duplicates.
 * Lookup order: notionPageId → migrationKey → Payload ID+Slug → slug alone.
 */
export async function findLinkedDocument(
  payload: Payload,
  collection: SyncCollection,
  page: NotionPage,
  options: { relink?: boolean } = {}
): Promise<LinkedDocument | undefined> {
  const relink = options.relink !== false;

  const byNotionId = await findDocs(payload, collection, {
    notionPageId: { equals: page.id }
  });
  if (byNotionId.length) {
    return pickCanonicalDocument(byNotionId);
  }

  const byMigrationKey = await findDocs(payload, collection, {
    migrationKey: { equals: `notion:${page.id}` }
  });
  if (byMigrationKey.length) {
    const canonical = pickCanonicalDocument(byMigrationKey);
    return relink ? relinkDocument(payload, collection, canonical, page) : canonical;
  }

  const payloadId = propertyText(page.properties["Payload ID"]);
  const slug = propertyText(page.properties.Slug);

  if (/^\d+$/.test(payloadId) && slug) {
    const byPayloadId = await findDocs(payload, collection, {
      and: [{ id: { equals: Number(payloadId) } }, { slug: { equals: slug } }]
    });
    if (byPayloadId.length) {
      const canonical = pickCanonicalDocument(byPayloadId);
      return relink ? relinkDocument(payload, collection, canonical, page) : canonical;
    }
  }

  if (slug) {
    const bySlug = await findDocs(payload, collection, { slug: { equals: slug } });
    if (bySlug.length) {
      const canonical = pickCanonicalDocument(bySlug);
      return relink ? relinkDocument(payload, collection, canonical, page) : canonical;
    }
  }

  return undefined;
}

export async function findDuplicateSlugGroups(
  payload: Payload,
  collection: SyncCollection
): Promise<DuplicatePair[]> {
  const result = await payload.find({
    collection,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1000,
    overrideAccess: true
  });
  const docs = result.docs
    .map((doc) => asDoc(doc))
    .filter((doc): doc is LinkedDocument => Boolean(doc?.slug));

  const bySlug = new Map<string, LinkedDocument[]>();
  for (const doc of docs) {
    const slug = String(doc.slug);
    const group = bySlug.get(slug) || [];
    group.push(doc);
    bySlug.set(slug, group);
  }

  const pairs: DuplicatePair[] = [];
  for (const [slug, group] of bySlug) {
    if (group.length < 2) continue;
    const keep = pickCanonicalDocument(group);
    const drop = group.filter((doc) => String(doc.id) !== String(keep.id));
    pairs.push({ collection, slug, keep, drop });
  }
  return pairs;
}
