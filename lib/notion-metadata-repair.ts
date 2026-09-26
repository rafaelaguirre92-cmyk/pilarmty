import type { Payload } from "payload";

import { normalizeMetadataName } from "@/lib/notion-metadata-identity";

export type MetadataCollection = "series" | "authors" | "topics";

type MetadataDocument = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  kind?: string | null;
  migrationKey?: string | null;
  notionPageId?: string | null;
  _status?: "draft" | "published" | null;
  updatedAt?: string;
  [key: string]: unknown;
};

export type MetadataDuplicateGroup = {
  collection: MetadataCollection;
  key: string;
  label: string;
  kinds?: Array<"series" | "event">;
  keepKind?: "series" | "event";
  keepId: number | string;
  dropIds: Array<number | string>;
  affectedDocuments: number;
  migrationKey?: string;
  notionPageId?: string;
};

function displayName(collection: MetadataCollection, doc: MetadataDocument) {
  if (collection === "series") return doc.title || doc.slug || "Serie sin título";
  return doc.name || "Elemento sin nombre";
}

function groupKey(collection: MetadataCollection, doc: MetadataDocument) {
  if (collection === "series") {
    const title = doc.title || doc.slug;
    return title
      ? normalizeMetadataName(title)
      : "";
  }
  return doc.name ? normalizeMetadataName(doc.name) : "";
}

function isNotionLinked(doc: MetadataDocument) {
  return Boolean(doc.migrationKey?.startsWith("notion:"));
}

export function pickCanonicalMetadataDocument(docs: MetadataDocument[]) {
  return [...docs].sort((left, right) => {
    const leftPublished = left._status === "published" ? 1 : 0;
    const rightPublished = right._status === "published" ? 1 : 0;
    if (leftPublished !== rightPublished) return rightPublished - leftPublished;

    const leftLinked = isNotionLinked(left) ? 1 : 0;
    const rightLinked = isNotionLinked(right) ? 1 : 0;
    if (leftLinked !== rightLinked) return rightLinked - leftLinked;

    const leftUpdated = left.updatedAt ? Date.parse(left.updatedAt) : 0;
    const rightUpdated = right.updatedAt ? Date.parse(right.updatedAt) : 0;
    return rightUpdated - leftUpdated;
  })[0]!;
}

async function metadataDocuments(payload: Payload, collection: MetadataCollection) {
  const result = await payload.find({
    collection: collection as never,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true
  });
  return result.docs
    .filter((doc) => !(doc as MetadataDocument).deletedAt)
    .map((doc) => doc as unknown as MetadataDocument);
}

function relationIds(value: unknown): Array<number | string> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "number" || typeof item === "string") return item;
      if (item && typeof item === "object" && "id" in item) {
        const id = (item as { id?: unknown }).id;
        return typeof id === "number" || typeof id === "string" ? id : undefined;
      }
      return undefined;
    })
    .filter((id): id is number | string => id !== undefined);
}

function relationId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "number" || typeof id === "string" ? id : undefined;
  }
  return undefined;
}

async function replaceSingleRelation(
  payload: Payload,
  collection: "teachings" | "resources",
  field: "series" | "author",
  keepId: number | string,
  dropIds: Set<string>
) {
  const result = await payload.find({
    collection,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true
  });
  let count = 0;
  for (const doc of result.docs as unknown as Array<Record<string, unknown> & { id: number | string }>) {
    if (!dropIds.has(String(relationId(doc[field])))) continue;
    await payload.update({
      collection,
      id: doc.id,
      data: { [field]: keepId } as never,
      locale: "es",
      draft: true,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
    count += 1;
  }
  return count;
}

async function replaceTopicRelation(
  payload: Payload,
  collection: "teachings" | "resources",
  keepId: number | string,
  dropIds: Set<string>
) {
  const result = await payload.find({
    collection,
    locale: "es",
    draft: true,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true
  });
  let count = 0;
  for (const doc of result.docs as unknown as Array<Record<string, unknown> & { id: number | string }>) {
    const current = relationIds(doc.topics);
    if (!current.some((id) => dropIds.has(String(id)))) continue;
    const next = [...new Set([
      ...current.filter((id) => !dropIds.has(String(id))),
      keepId
    ])];
    await payload.update({
      collection,
      id: doc.id,
      data: { topics: next } as never,
      locale: "es",
      draft: true,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
    count += 1;
  }
  return count;
}

async function affectedCount(
  payload: Payload,
  collection: MetadataCollection,
  dropIds: Set<string>
) {
  const collections = collection === "series"
    ? ["teachings"] as const
    : ["teachings", "resources"] as const;
  let count = 0;
  for (const target of collections) {
    const result = await payload.find({
      collection: target,
      locale: "es",
      draft: true,
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true
    });
    for (const doc of result.docs as unknown as Array<Record<string, unknown>>) {
      const matches =
        collection === "topics"
          ? relationIds(doc.topics).some((id) => dropIds.has(String(id)))
          : dropIds.has(String(relationId(doc[collection === "series" ? "series" : "author"])));
      if (matches) count += 1;
    }
  }
  return count;
}

export async function findMetadataDuplicateGroups(payload: Payload) {
  const groups: MetadataDuplicateGroup[] = [];

  for (const collection of ["series", "authors", "topics"] as const) {
    const grouped = new Map<string, MetadataDocument[]>();
    for (const doc of await metadataDocuments(payload, collection)) {
      const key = groupKey(collection, doc);
      if (!key) continue;
      const group = grouped.get(key) || [];
      group.push(doc);
      grouped.set(key, group);
    }

    for (const [key, docs] of grouped) {
      if (docs.length < 2) continue;
      const keep = pickCanonicalMetadataDocument(docs);
      const drop = docs.filter((doc) => String(doc.id) !== String(keep.id));
      const dropIds = new Set(drop.map((doc) => String(doc.id)));
      const donor = [keep, ...drop].find(
        (doc) => isNotionLinked(doc) || Boolean(doc.notionPageId)
      );
      groups.push({
        collection,
        key,
        label: displayName(collection, keep),
        kinds: collection === "series"
          ? [...new Set(
              docs
                .map((doc) => doc.kind)
                .filter((kind): kind is "series" | "event" => kind === "series" || kind === "event")
            )]
          : undefined,
        keepKind:
          collection === "series" && (keep.kind === "series" || keep.kind === "event")
            ? keep.kind
            : undefined,
        keepId: keep.id,
        dropIds: drop.map((doc) => doc.id),
        affectedDocuments: await affectedCount(payload, collection, dropIds),
        migrationKey: donor?.migrationKey || undefined,
        notionPageId: donor?.notionPageId || undefined
      });
    }
  }

  return groups.sort((left, right) =>
    left.collection.localeCompare(right.collection) ||
    left.label.localeCompare(right.label, "es-MX")
  );
}

export async function mergeMetadataDuplicateGroup(
  payload: Payload,
  collection: MetadataCollection,
  key: string,
  options: { kind?: "series" | "event" } = {}
) {
  const group = (await findMetadataDuplicateGroups(payload)).find(
    (item) => item.collection === collection && item.key === key
  );
  if (!group) throw new Error("El grupo ya no existe o no tiene duplicados.");

  const dropIds = new Set(group.dropIds.map(String));
  for (const id of group.dropIds) {
    await payload.update({
      collection,
      id,
      data: {
        migrationKey: null,
        ...(collection === "authors" ? { notionPageId: null } : {})
      } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }
  if (
    group.migrationKey ||
    group.notionPageId ||
    (collection === "series" && options.kind)
  ) {
    await payload.update({
      collection,
      id: group.keepId,
      data: {
        ...(group.migrationKey ? { migrationKey: group.migrationKey } : {}),
        ...(collection === "series" && options.kind ? { kind: options.kind } : {}),
        ...(collection === "authors" && group.notionPageId
          ? { notionPageId: group.notionPageId }
          : {})
      } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }
  let affectedDocuments = 0;
  if (collection === "series") {
    affectedDocuments = await replaceSingleRelation(
      payload,
      "teachings",
      "series",
      group.keepId,
      dropIds
    );
  } else if (collection === "authors") {
    affectedDocuments += await replaceSingleRelation(payload, "teachings", "author", group.keepId, dropIds);
    affectedDocuments += await replaceSingleRelation(payload, "resources", "author", group.keepId, dropIds);
  } else {
    affectedDocuments += await replaceTopicRelation(payload, "teachings", group.keepId, dropIds);
    affectedDocuments += await replaceTopicRelation(payload, "resources", group.keepId, dropIds);
  }

  for (const id of group.dropIds) {
    await payload.delete({
      collection,
      id,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }

  return { ...group, affectedDocuments };
}
