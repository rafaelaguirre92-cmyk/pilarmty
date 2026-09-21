import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const write = process.argv.includes("--write");
const reportPath = resolve(".payload/notion-repair-report.json");

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const {
  findDuplicateSlugGroups,
  pickCanonicalDocument,
  type DuplicatePair,
  type LinkedDocument,
  type SyncCollection
} = await import("../lib/notion-payload-link");
const {
  notionIsConfigured,
  notionPageUrl,
  notionWritebackIsEnabled,
  queryResourcePages,
  updateNotionPageProperties
} = await import("../lib/notion");
const { syncNotionPageToPayload } = await import("../lib/notion-payload-sync");

type Report = {
  startedAt: string;
  finishedAt?: string;
  write: boolean;
  duplicates: Array<{
    collection: SyncCollection;
    slug: string;
    keepId: number | string;
    dropIds: Array<number | string>;
    keepStatus?: string | null;
    transferredNotionPageId?: string | null;
  }>;
  imported: Array<{ collection?: string; id?: number | string; notionPageId: string }>;
  skippedImports: Array<{ notionPageId: string; reason: string }>;
  errors: string[];
};

function transferLinkFields(keep: LinkedDocument, drop: LinkedDocument[]) {
  const donor = drop.find((doc) => doc.notionPageId) || keep;
  return {
    notionPageId: keep.notionPageId || donor.notionPageId || null,
    notionUrl: keep.notionUrl || donor.notionUrl || (donor.notionPageId ? notionPageUrl(String(donor.notionPageId)) : null),
    migrationKey: keep.migrationKey || donor.migrationKey || (donor.notionPageId ? `notion:${donor.notionPageId}` : null)
  };
}

async function mergePair(
  payload: Awaited<ReturnType<typeof getPayload>>,
  pair: DuplicatePair
) {
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

const report: Report = {
  startedAt: new Date().toISOString(),
  write,
  duplicates: [],
  imported: [],
  skippedImports: [],
  errors: []
};

const payload = await getPayload({ config });

for (const collection of ["teachings", "resources"] as const) {
  const pairs = await findDuplicateSlugGroups(payload, collection);
  for (const pair of pairs) {
    // Sanity: prefer the same choice the helper already made
    const keep = pickCanonicalDocument([pair.keep, ...pair.drop]);
    const normalized: DuplicatePair = {
      ...pair,
      keep,
      drop: [pair.keep, ...pair.drop].filter((doc) => String(doc.id) !== String(keep.id))
    };

    console.log(
      `${write ? "MERGE" : "DRY"} ${collection} slug=${normalized.slug} keep=${normalized.keep.id} drop=${normalized.drop.map((d) => d.id).join(",")}`
    );

    if (write) {
      try {
        report.duplicates.push(await mergePair(payload, normalized));
      } catch (error) {
        report.errors.push(
          `${collection}:${normalized.slug}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } else {
      report.duplicates.push({
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

if (notionIsConfigured() && write) {
  const pages = await queryResourcePages({ fresh: true });
  for (const page of pages) {
    try {
      const result = await syncNotionPageToPayload(payload, page.id);
      if ("id" in result) {
        report.imported.push({
          collection: result.collection,
          id: result.id,
          notionPageId: page.id
        });
      } else {
        report.skippedImports.push({ notionPageId: page.id, reason: result.skipped });
      }
    } catch (error) {
      report.errors.push(
        `import ${page.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

report.finishedAt = new Date().toISOString();
mkdirSync(resolve(".payload"), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(
  `\n${write ? "Repair applied" : "Dry-run complete"}: ${report.duplicates.length} duplicate groups, ${report.imported.length} imports, ${report.errors.length} errors`
);
console.log(`Report: ${reportPath}`);
