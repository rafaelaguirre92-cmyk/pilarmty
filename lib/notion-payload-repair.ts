import type { Payload } from "payload";

import {
  findDuplicateSlugGroups,
  pickCanonicalDocument,
  type DuplicatePair,
  type LinkedDocument,
  type SyncCollection
} from "@/lib/notion-payload-link";
import {
  notionPageUrl,
  notionWritebackIsEnabled,
  updateNotionPageProperties
} from "@/lib/notion";

export type RepairDuplicateResult = {
  collection: SyncCollection;
  slug: string;
  keepId: number | string;
  dropIds: Array<number | string>;
  keepStatus?: string | null;
  transferredNotionPageId?: string | null;
};

export type RepairDuplicatesSummary = {
  startedAt: string;
  finishedAt: string;
  write: boolean;
  duplicates: RepairDuplicateResult[];
  errors: string[];
};

function transferLinkFields(keep: LinkedDocument, drop: LinkedDocument[]) {
  const donor = drop.find((doc) => doc.notionPageId) || keep;
  return {
    notionPageId: keep.notionPageId || donor.notionPageId || null,
    notionUrl:
      keep.notionUrl ||
      donor.notionUrl ||
      (donor.notionPageId ? notionPageUrl(String(donor.notionPageId)) : null),
    migrationKey:
      keep.migrationKey ||
      donor.migrationKey ||
      (donor.notionPageId ? `notion:${donor.notionPageId}` : null)
  };
}

async function mergePair(
  payload: Payload,
  pair: DuplicatePair
): Promise<RepairDuplicateResult> {
  const link = transferLinkFields(pair.keep, pair.drop);
  if (link.notionPageId || link.migrationKey) {
    await payload.update({
      collection: pair.collection,
      id: pair.keep.id,
      data: {
        ...link,
        syncError: null
      } as never,
      locale: "es",
      draft: true,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }

  if (link.notionPageId && notionWritebackIsEnabled()) {
    try {
      await updateNotionPageProperties(String(link.notionPageId), {
        "Payload ID": {
          rich_text: [{ type: "text", text: { content: String(pair.keep.id) } }]
        },
        "CMS URL": {
          url: `${(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/collections/${pair.collection}/${pair.keep.id}`
        },
        "Estado de sincronización": { select: { name: "Sincronizado" } },
        "Origen del último cambio": { select: { name: "Payload" } }
      });
    } catch (error) {
      console.warn(`Writeback failed for ${pair.slug}:`, error);
    }
  }

  for (const doc of pair.drop) {
    await payload.delete({
      collection: pair.collection,
      id: doc.id,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true }
    });
  }

  return {
    collection: pair.collection,
    slug: pair.slug,
    keepId: pair.keep.id,
    dropIds: pair.drop.map((doc) => doc.id),
    keepStatus: pair.keep._status,
    transferredNotionPageId: link.notionPageId
  };
}

function normalizePair(pair: DuplicatePair): DuplicatePair {
  const keep = pickCanonicalDocument([pair.keep, ...pair.drop]);
  return {
    ...pair,
    keep,
    drop: [pair.keep, ...pair.drop].filter((doc) => String(doc.id) !== String(keep.id))
  };
}

/**
 * Find and optionally merge Publicado+Borrador (and other slug) duplicates.
 * Dry-run when write=false; soft-deletes extras when write=true (trash).
 */
export async function repairNotionPayloadDuplicates(
  payload: Payload,
  options: { write?: boolean } = {}
): Promise<RepairDuplicatesSummary> {
  const write = Boolean(options.write);
  const startedAt = new Date().toISOString();
  const duplicates: RepairDuplicateResult[] = [];
  const errors: string[] = [];

  for (const collection of ["teachings", "resources"] as const) {
    const pairs = await findDuplicateSlugGroups(payload, collection);
    for (const pair of pairs) {
      const normalized = normalizePair(pair);
      if (write) {
        try {
          duplicates.push(await mergePair(payload, normalized));
        } catch (error) {
          errors.push(
            `${collection}:${normalized.slug}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      } else {
        duplicates.push({
          collection: normalized.collection,
          slug: normalized.slug,
          keepId: normalized.keep.id,
          dropIds: normalized.drop.map((doc) => doc.id),
          keepStatus: normalized.keep._status,
          transferredNotionPageId:
            normalized.keep.notionPageId ||
            normalized.drop.find((doc) => doc.notionPageId)?.notionPageId ||
            null
        });
      }
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    write,
    duplicates,
    errors
  };
}
