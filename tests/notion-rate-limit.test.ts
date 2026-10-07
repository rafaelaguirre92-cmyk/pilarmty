import assert from "node:assert/strict";
import test from "node:test";

import { getNotionPage } from "../lib/notion";

test("Notion 429 honors Retry-After and retries the same request", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.NOTION_API_TOKEN;
  process.env.NOTION_API_TOKEN = "test-token";
  let calls = 0;
  const timestamps: number[] = [];

  globalThis.fetch = async () => {
    calls += 1;
    timestamps.push(Date.now());
    if (calls === 1) {
      return new Response(JSON.stringify({ code: "rate_limited" }), {
        status: 429,
        headers: { "Retry-After": "1" }
      });
    }
    return Response.json({ id: "test-page", properties: {} });
  };

  try {
    const page = await getNotionPage("test-page");
    assert.equal(page.id, "test-page");
    assert.equal(calls, 2);
    assert.ok(timestamps[1]! - timestamps[0]! >= 1000);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.NOTION_API_TOKEN;
    else process.env.NOTION_API_TOKEN = originalToken;
  }
});
