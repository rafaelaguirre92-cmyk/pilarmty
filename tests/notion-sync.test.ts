import assert from "node:assert/strict";
import test from "node:test";

import { lexicalToNotionBlocks } from "../lib/lexical-to-notion";
import { pickCanonicalDocument } from "../lib/notion-payload-link";
import { decideSyncDirection } from "../lib/notion-payload-reconcile";

const baseDoc = {
  id: 1,
  syncStatus: "synced" as const,
  lastSyncSource: "notion" as const,
  sourceUpdatedAt: "2026-08-29T10:00:00.000Z"
};

test("Payload wins when it has a pending change", () => {
  assert.equal(
    decideSyncDirection(
      { ...baseDoc, syncStatus: "pending", lastSyncSource: "payload" },
      "2026-08-29T10:00:00.000Z"
    ),
    "payload-to-notion"
  );
});

test("Conflict is declared when Payload is pending and Notion also changed", () => {
  assert.equal(
    decideSyncDirection(
      { ...baseDoc, syncStatus: "pending", lastSyncSource: "payload" },
      "2026-08-30T10:00:00.000Z"
    ),
    "conflict"
  );
});

test("Notion is imported when it is the only changed side", () => {
  assert.equal(
    decideSyncDirection(baseDoc, "2026-08-30T10:00:00.000Z"),
    "notion-to-payload"
  );
});

test("unchanged timestamps do not trigger a remote write", () => {
  assert.equal(
    decideSyncDirection(baseDoc, "2026-08-29T10:00:00.000Z"),
    "unchanged"
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
