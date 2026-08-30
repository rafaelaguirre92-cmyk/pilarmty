import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const dryRun = process.argv.includes("--dry-run");
const reportPath = resolve(".payload/migration-report.json");

const {
  collections,
} = await import("../lib/content/fallback");
const {
  normalizeResourcePage,
  normalizeTeachingPage
} = await import("../lib/content/index");
const {
  getPageBlocks,
  notionPageUrl,
  notionIsConfigured,
  notionWritebackIsEnabled,
  queryResourcePages,
  updateNotionPageProperties
} = await import("../lib/notion");
const { notionBlocksToLexical } = await import("../lib/notion-to-lexical");

const warnings: string[] = [];
const failures: string[] = [];

function fitSeoDescription(value: string | undefined, label: string) {
  if (!value || value.length <= 170) return value;
  const candidate = value.slice(0, 170);
  const boundary = candidate.lastIndexOf(" ");
  const fitted = `${candidate.slice(0, boundary > 120 ? boundary : 167).trimEnd()}…`;
  warnings.push(`${label}: meta description ajustada de ${value.length} a ${fitted.length} caracteres`);
  return fitted;
}

function fitExcerpt(value: string | undefined, label: string) {
  if (!value || value.length <= 500) return value;
  const candidate = value.slice(0, 500);
  const boundary = candidate.lastIndexOf(" ");
  const fitted = `${candidate.slice(0, boundary > 420 ? boundary : 497).trimEnd()}…`;
  warnings.push(`${label}: resumen ajustado de ${value.length} a ${fitted.length} caracteres`);
  return fitted;
}
if (!dryRun && !notionIsConfigured()) {
  throw new Error(
    "La migración real requiere NOTION_API_TOKEN de solo lectura. Usa --dry-run para validar únicamente el inventario local."
  );
}
const notionPages = notionIsConfigured() ? await queryResourcePages() : [];
const notionTeachings = notionPages
  .map((page) => normalizeTeachingPage(page, { includeUnpublished: true }))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));
const notionResources = notionPages
  .map(normalizeResourcePage)
  .filter((item) => Boolean(item));

const teachings = notionTeachings;

const notionSeries = [...teachings.reduce((grouped, teaching) => {
  const current = grouped.get(teaching.collection);
  const candidate = teaching.collectionName || teaching.collection;
  const names = current?.names || new Map<string, number>();
  names.set(candidate, (names.get(candidate) || 0) + 1);
  grouped.set(teaching.collection, {
    slug: teaching.collection,
    kind: teaching.collection === "fechas-especiales" ? "evento" : "serie",
    names
  });
  return grouped;
}, new Map<string, { slug: string; kind: "serie" | "evento"; names: Map<string, number> }>()).values()]
  .map((item) => ({
    slug: item.slug,
    kind: item.kind,
    name: [...item.names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || item.slug,
    locale: "es" as const
  }));

const report = {
  mode: dryRun ? "dry-run" : "write",
  generatedAt: new Date().toISOString(),
  source: { notionConfigured: notionIsConfigured(), notionPages: notionPages.length },
  writeback: { enabled: notionWritebackIsEnabled() },
  expected: {
    seriesEs: notionSeries.length,
    seriesEn: 0,
    teachingsEs: teachings.length,
    teachingsEn: 0,
    translationPairs: 0
  },
  discovered: {
    seriesEs: notionSeries.length,
    seriesEn: 0,
    teachingsEs: teachings.filter((item) => item.locale === "es").length,
    teachingsEn: teachings.filter((item) => item.locale === "en").length,
    resources: notionResources.length,
    translationPairs: 0
  },
  urls: teachings.map((item) =>
    `${item.locale === "en" ? "/en" : ""}/ensenanzas/${item.collection}/${item.slug}`
  ),
  missingSeo: teachings
    .filter((item) => !item.seoDescription)
    .map((item) => `${item.locale}:${item.collection}/${item.slug}`),
  warnings,
  failures
};

if (!dryRun) {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  async function findByMigrationKey(collection: string, migrationKey: string) {
    const result = await payload.find({
      collection: collection as never,
      where: { migrationKey: { equals: migrationKey } },
      depth: 0,
      limit: 1,
      overrideAccess: true
    });
    return result.docs[0] as { id: number | string } | undefined;
  }

  async function upsert(collection: string, migrationKey: string, data: Record<string, unknown>) {
    const existing = await findByMigrationKey(collection, migrationKey);
    if (existing) {
      return payload.update({
        collection: collection as never,
        id: existing.id,
        locale: "es",
        data: { ...data, migrationKey } as never,
        depth: 0,
        overrideAccess: true,
        context: { skipNotionSync: true, skipAutoTranslate: true, skipSlugGuard: true }
      }) as Promise<{ id: number | string }>;
    }
    return payload.create({
      collection: collection as never,
      locale: "es",
      data: { ...data, migrationKey } as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true, skipAutoTranslate: true, skipSlugGuard: true }
    }) as Promise<{ id: number | string }>;
  }

  async function markNotionSynced(
    pageId: string,
    collection: "teachings" | "resources",
    payloadId: number | string
  ) {
    if (!notionWritebackIsEnabled()) return;
    const syncedAt = new Date().toISOString();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    try {
      await updateNotionPageProperties(pageId, {
        "Payload ID": {
          rich_text: [{ type: "text", text: { content: String(payloadId) } }]
        },
        "CMS URL": {
          url: `${siteUrl}/admin/collections/${collection}/${payloadId}`
        },
        "Estado de sincronización": { select: { name: "Sincronizado" } },
        "Última sincronización": { date: { start: syncedAt } },
        "Origen del último cambio": { select: { name: "Notion" } }
      });
    } catch (error) {
      warnings.push(
        `${pageId}: importado en Payload, pero no se pudo confirmar en Notion (${String(error)})`
      );
      await payload.update({
        collection,
        id: payloadId,
        data: {
          syncStatus: "error",
          syncError: error instanceof Error ? error.message : String(error)
        } as never,
        depth: 0,
        overrideAccess: true,
        context: { skipNotionSync: true }
      });
    }
  }

  async function asset(source: string | undefined, alt: string) {
    if (!source) return undefined;
    const migrationKey = `asset:${source}`;
    const existing = await findByMigrationKey("media", migrationKey);
    if (existing) return existing.id;
    try {
      let data: Buffer;
      let contentType: string;
      let name: string;
      if (source.startsWith("http://") || source.startsWith("https://")) {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = Buffer.from(await response.arrayBuffer());
        contentType = response.headers.get("content-type") || "application/octet-stream";
        name = basename(new URL(source).pathname) || `notion-${Date.now()}`;
      } else {
        const localPath = resolve("public", source.replace(/^\//, ""));
        data = readFileSync(localPath);
        name = basename(localPath);
        contentType = ({
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".pdf": "application/pdf",
          ".mp3": "audio/mpeg"
        } as Record<string, string>)[extname(name).toLowerCase()] || "application/octet-stream";
      }
      const created = await payload.create({
        collection: "media",
        data: { alt, migrationKey },
        file: { data, mimetype: contentType, name, size: data.byteLength },
        overrideAccess: true
      });
      return created.id;
    } catch (error) {
      failures.push(`${source}: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }

  const seriesIds = new Map<string, number | string>();
  for (const item of notionSeries) {
    const fallback = collections.find(
      (candidate) => candidate.locale === "es" && candidate.slug === item.slug
    );
    const id = await upsert("series", `inventory:series:${item.locale}:${item.slug}`, {
      title: item.name,
      slug: item.slug,
      kind: item.kind === "evento" ? "event" : "series",
      description: fallback?.description,
      image: await asset(fallback?.image, item.name),
      _status: "published"
    });
    seriesIds.set(`${item.locale}:${item.slug}`, id.id);
  }

  const authorIds = new Map<string, number | string>();
  const topicIds = new Map<string, number | string>();
  for (const name of new Set(
    [...teachings, ...notionResources.filter((item) => Boolean(item))]
      .map((item) => item?.author)
      .filter(Boolean) as string[]
  )) {
    const doc = await upsert("authors", `author:${name.toLocaleLowerCase("es-MX")}`, { name });
    authorIds.set(name, doc.id);
  }
  for (const name of new Set([
    ...teachings.flatMap((item) => item.tags),
    ...notionResources.filter((item) => Boolean(item)).flatMap((item) => item?.tags || [])
  ])) {
    const doc = await upsert("topics", `topic:${name.toLocaleLowerCase("es-MX")}`, { name });
    topicIds.set(name, doc.id);
  }

  const teachingIds = new Map<string, number | string>();
  for (const item of teachings.filter((candidate) => candidate.locale === "es")) {
    const notionKey = item.notionId ? `notion:${item.notionId}` : `inventory:teaching:${item.locale}:${item.slug}`;
    let body: Record<string, unknown> | undefined;
    if (item.notionId) {
      try {
        body = await notionBlocksToLexical(
          await getPageBlocks(item.notionId),
          (url, label) => asset(url, label),
          warnings
        );
      } catch (error) {
        warnings.push(`${item.notionId}: no se pudo convertir el cuerpo (${String(error)})`);
      }
    }
    const doc = await upsert("teachings", notionKey, {
      title: item.title,
      slug: item.slug,
      series: seriesIds.get(`${item.locale}:${item.collection}`),
      episode: item.episode,
      teachingDate: item.date,
      author: item.author ? authorIds.get(item.author) : undefined,
      excerpt: fitExcerpt(
        item.excerpt,
        `${item.locale}:${item.collection}/${item.slug}`
      ),
      body,
      youtubeUrl: item.youtubeUrl,
      applePodcastsUrl: item.applePodcastsUrl,
      image: await asset(item.image, item.title),
      topics: item.tags.map((name) => topicIds.get(name)).filter(Boolean),
      legacy: item.legacy,
      seo: {
        description: fitSeoDescription(
          item.seoDescription,
          `${item.locale}:${item.collection}/${item.slug}`
        )
      },
      sourceUpdatedAt: item.updatedAt,
      notionPageId: item.notionId,
      notionUrl: item.notionId ? notionPageUrl(item.notionId) : undefined,
      syncStatus: item.notionId ? "synced" : undefined,
      lastSyncedAt: item.notionId ? new Date().toISOString() : undefined,
      lastSyncSource: item.notionId ? "notion" : undefined,
      syncError: null,
      _status: item.published ? "published" : "draft"
    });
    teachingIds.set(`${item.locale}:${item.collection}/${item.slug}`, doc.id);
    if (item.notionId) await markNotionSynced(item.notionId, "teachings", doc.id);
  }


  for (const item of notionResources) {
    if (!item?.notionId) continue;
    const notionId = item.notionId;
    let body: Record<string, unknown> | undefined;
    if (item.notionId) {
      body = await notionBlocksToLexical(
        await getPageBlocks(item.notionId),
        (url, label) => asset(url, label),
        warnings
      );
    }
    const doc = await upsert("resources", `notion:${notionId}`, {
      title: item.title,
      slug: item.slug,
      kind: item.kind === "contenido-pilar" ? "pillar" : "article",
      contentDate: item.date,
      author: item.author ? authorIds.get(item.author) : undefined,
      excerpt: item.excerpt,
      body,
      image: await asset(item.image, item.title),
      topics: item.tags.map((name) => topicIds.get(name)).filter(Boolean),
      seo: {
        description: fitSeoDescription(item.seoDescription, `es:recursos/${item.slug}`)
      },
      sourceUpdatedAt: item.updatedAt,
      notionPageId: notionId,
      notionUrl: notionPageUrl(notionId),
      syncStatus: "synced",
      lastSyncedAt: new Date().toISOString(),
      lastSyncSource: "notion",
      syncError: null,
      _status: "published"
    });
    await markNotionSynced(notionId, "resources", doc.id);
  }
}

mkdirSync(resolve(".payload"), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ reportPath, ...report.discovered, warnings: warnings.length, failures: failures.length }, null, 2));
process.exit(failures.length ? 1 : 0);
