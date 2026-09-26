import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const write = process.argv.includes("--write");
const reportPath = resolve(".payload/notion-metadata-repair-report.json");

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const {
  findMetadataDuplicateGroups
} = await import("../lib/notion-metadata-repair");
const {
  notionIsConfigured,
  propertySelect,
  queryResourcePages
} = await import("../lib/notion");
const {
  syncNotionPageToPayload
} = await import("../lib/notion-payload-sync");

const payload = await getPayload({ config });
const pages = notionIsConfigured() ? await queryResourcePages() : [];
const teachingPages = pages.filter(
  (page) => propertySelect(page.properties.Tipo) === "Enseñanza"
);
const synced: Array<{ id: number | string; notionPageId: string }> = [];
const errors: string[] = [];

if (write) {
  for (const page of teachingPages) {
    try {
      const result = await syncNotionPageToPayload(payload, page.id);
      if ("id" in result && result.collection === "teachings") {
        synced.push({ id: result.id, notionPageId: page.id });
      }
    } catch (error) {
      errors.push(`${page.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

const groups = await findMetadataDuplicateGroups(payload);
for (const group of groups) {
  console.log(
    `REVISAR ${group.collection} key=${group.key} keep=${group.keepId} drop=${group.dropIds.join(",")}`
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  write,
  teachingPages: teachingPages.length,
  synced,
  groups,
  errors
};

mkdirSync(resolve(".payload"), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(
  `\n${write ? "Vínculos actualizados" : "Vista previa"}: ${groups.length} grupo(s) para revisión manual, ${errors.length} error(es).`
);
console.log(`Reporte: ${reportPath}`);
