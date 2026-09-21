import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const write = process.argv.includes("--write");
const reportPath = resolve(".payload/notion-repair-report.json");

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const { repairNotionPayloadDuplicates } = await import("../lib/notion-payload-repair");
const { notionIsConfigured, queryResourcePages } = await import("../lib/notion");
const { syncNotionPageToPayload } = await import("../lib/notion-payload-sync");

const payload = await getPayload({ config });
const result = await repairNotionPayloadDuplicates(payload, { write });

const imported: Array<{ collection?: string; id?: number | string; notionPageId: string }> = [];
const skippedImports: Array<{ notionPageId: string; reason: string }> = [];
const errors = [...result.errors];

if (notionIsConfigured() && write) {
  const pages = await queryResourcePages();
  for (const page of pages) {
    try {
      const syncResult = await syncNotionPageToPayload(payload, page.id);
      if ("id" in syncResult) {
        imported.push({
          collection: syncResult.collection,
          id: syncResult.id,
          notionPageId: page.id
        });
      } else {
        skippedImports.push({ notionPageId: page.id, reason: syncResult.skipped });
      }
    } catch (error) {
      errors.push(
        `import ${page.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

for (const item of result.duplicates) {
  console.log(
    `${write ? "MERGE" : "DRY"} ${item.collection} slug=${item.slug} keep=${item.keepId} drop=${item.dropIds.join(",")}`
  );
}

const report = {
  ...result,
  imported,
  skippedImports,
  errors
};

mkdirSync(resolve(".payload"), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(
  `\n${write ? "Repair applied" : "Dry-run complete"}: ${result.duplicates.length} duplicate groups, ${imported.length} imports, ${errors.length} errors`
);
console.log(`Report: ${reportPath}`);
