import assert from "node:assert/strict";
import test from "node:test";

import { lexicalToNotionBlocks } from "../lib/lexical-to-notion";
import {
  fitExcerpt,
  normalizeResourcePage,
  normalizeTeachingPage
} from "../lib/content";
import { pickCanonicalDocument } from "../lib/notion-payload-link";
import { decideSyncDirection } from "../lib/notion-payload-reconcile";
import {
  authorMigrationKey,
  normalizeMetadataName,
  seriesMigrationKey,
  topicMigrationKey
} from "../lib/notion-metadata-identity";
import {
  propertyMultiSelectOptions,
  propertySelectOption
} from "../lib/notion";
import { pickCanonicalMetadataDocument } from "../lib/notion-metadata-repair";
import { retainRecentSyncHistory } from "../lib/sync-history";

const baseDoc = {
  id: 1,
  syncStatus: "synced" as const,
  lastSyncSource: "notion" as const,
  sourceUpdatedAt: "2026-08-29T10:00:00.000Z"
};

test("Notion wins when Payload has a pending change", () => {
  assert.equal(
    decideSyncDirection(
      { ...baseDoc, syncStatus: "pending", lastSyncSource: "payload" },
      "2026-08-29T10:00:00.000Z"
    ),
    "notion-to-payload"
  );
});

test("sync history retains only the most recent fifteen days", () => {
  const now = Date.parse("2026-09-26T12:00:00.000Z");
  const entry = (id: string, finishedAt: string) => ({
    id,
    finishedAt,
    status: "ready" as const,
    trigger: "manual" as const,
    payloadToNotion: 0,
    notionToPayload: 0,
    createdInNotion: 0,
    unchanged: 0,
    skipped: 0,
    errors: []
  });

  assert.deepEqual(
    retainRecentSyncHistory([
      entry("recent", "2026-09-11T12:00:00.000Z"),
      entry("expired", "2026-09-11T11:59:59.999Z"),
      entry("invalid", "not-a-date")
    ], now).map((item) => item.id),
    ["recent"]
  );
});

test("Notion wins when both sides changed", () => {
  assert.equal(
    decideSyncDirection(
      { ...baseDoc, syncStatus: "pending", lastSyncSource: "payload" },
      "2026-08-30T10:00:00.000Z"
    ),
    "notion-to-payload"
  );
});

test("Notion is imported when it is the only changed side", () => {
  assert.equal(
    decideSyncDirection(baseDoc, "2026-08-30T10:00:00.000Z"),
    "notion-to-payload"
  );
});

test("equal timestamps still trigger a full Notion import", () => {
  assert.equal(
    decideSyncDirection(baseDoc, "2026-08-29T10:00:00.000Z"),
    "notion-to-payload"
  );
});

test("Canonical picker prefers published docs over drafts even if the draft is linked", () => {
  const keep = pickCanonicalDocument([
    {
      id: 2,
      slug: "el-hacedor-de-panes",
      _status: "draft",
      notionPageId: "notion-draft",
      lastSyncedAt: "2026-09-01T00:00:00.000Z"
    },
    {
      id: 1,
      slug: "el-hacedor-de-panes",
      _status: "published",
      notionPageId: null,
      lastSyncedAt: "2026-08-01T00:00:00.000Z"
    }
  ]);
  assert.equal(keep.id, 1);
});

test("Canonical picker prefers a linked published doc when both are published", () => {
  const keep = pickCanonicalDocument([
    {
      id: 10,
      slug: "mismo-slug",
      _status: "published",
      notionPageId: null
    },
    {
      id: 11,
      slug: "mismo-slug",
      _status: "published",
      notionPageId: "abc-123",
      lastSyncedAt: "2026-09-10T00:00:00.000Z"
    }
  ]);
  assert.equal(keep.id, 11);
});

test("Lexical headings, paragraphs and formatting convert to Notion blocks", () => {
  const blocks = lexicalToNotionBlocks({
    root: {
      children: [
        {
          type: "heading",
          tag: "h2",
          children: [{ type: "text", text: "La gracia", format: 0 }]
        },
        {
          type: "paragraph",
          children: [{ type: "text", text: "Cristo es suficiente.", format: 1 }]
        }
      ]
    }
  });

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, "heading_2");
  assert.equal(blocks[1].type, "paragraph");
  assert.equal(
    ((blocks[1].paragraph as { rich_text: Array<{ annotations?: { bold?: boolean } }> }).rich_text[0].annotations?.bold),
    true
  );
});

test("normalizeTeachingPage generates slug and series from titles when empty", () => {
  const teaching = normalizeTeachingPage(
    {
      id: "page-teaching",
      properties: {
        Tipo: { select: { name: "Enseñanza" } },
        Nombre: { title: [{ plain_text: "Cristo edifica su iglesia" }] },
        Slug: { rich_text: [] },
        Serie: { select: { name: "Orador Invitado" } },
        Web: { checkbox: true }
      }
    },
    { includeUnpublished: true }
  );
  assert.ok(teaching);
  assert.equal(teaching.slug, "cristo-edifica-su-iglesia");
  assert.equal(teaching.collection, "orador-invitado");
});

test("Notion select and multi-select IDs create stable metadata keys", () => {
  const series = propertySelectOption({
    select: { id: "select-series-1", name: "Oradores Invitados" }
  });
  const topics = propertyMultiSelectOptions({
    multi_select: [{ id: "topic-1", name: "Gracia" }]
  });

  assert.deepEqual(series, { id: "select-series-1", name: "Oradores Invitados" });
  assert.deepEqual(topics, [{ id: "topic-1", name: "Gracia" }]);
  assert.equal(seriesMigrationKey(series?.id, "oradores-invitados"), "notion:series-option:select-series-1");
  assert.equal(topicMigrationKey(topics[0]!), "notion:topic-option:topic-1");
  assert.equal(authorMigrationKey("author-page-1"), "notion:author:author-page-1");
});

test("metadata name normalization ignores case, spacing and unicode form", () => {
  assert.equal(normalizeMetadataName("  GRACIA  "), "gracia");
  assert.equal(normalizeMetadataName("Jesu\u0301s"), "jesús");
});

test("metadata repair keeps the published Notion-linked record", () => {
  const keep = pickCanonicalMetadataDocument([
    {
      id: 2,
      name: "Gracia",
      migrationKey: "topic:gracia",
      updatedAt: "2026-09-20T00:00:00.000Z"
    },
    {
      id: 1,
      name: "Gracia",
      migrationKey: "notion:topic-option:topic-1",
      _status: "published",
      updatedAt: "2026-09-01T00:00:00.000Z"
    }
  ]);
  assert.equal(keep.id, 1);
});

test("normalizeResourcePage generates slug when empty", () => {
  const resource = normalizeResourcePage(
    {
      id: "page-resource",
      properties: {
        Tipo: { select: { name: "Articulo" } },
        Nombre: { title: [{ plain_text: "Efesios: guía de estudio" }] },
        Slug: { rich_text: [] },
        Web: { checkbox: false }
      }
    },
    { includeUnpublished: true }
  );
  assert.ok(resource);
  assert.equal(resource.slug, "efesios-guia-de-estudio");
});

test("fitExcerpt truncates long synopses to 500 characters", () => {
  const long = `${"palabra ".repeat(80)}final`;
  assert.ok(long.length > 500);
  const fitted = fitExcerpt(long);
  assert.ok(fitted);
  assert.ok(fitted.length <= 500);
  assert.equal(fitted.endsWith("…"), true);
});
