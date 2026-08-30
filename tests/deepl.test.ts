import assert from "node:assert/strict";
import test from "node:test";

import {
  DeepLTranslationError,
  translateLexical,
  translateText,
  translateTexts
} from "../lib/deepl";

test("translateText handles empty or falsy strings cleanly", async () => {
  assert.equal(await translateText(""), "");
  assert.equal(await translateText("   "), "   ");
});

test("translateTexts handles empty arrays", async () => {
  const result = await translateTexts([]);
  assert.deepEqual(result, []);
});

test("translateLexical handles null or missing root gracefully", async () => {
  assert.equal(await translateLexical(null), undefined);
  assert.equal(await translateLexical(undefined), undefined);
  assert.deepEqual(await translateLexical({}), {});
});

test("translateLexical preserves AST structure and formatting", async () => {
  const sampleLexical = {
    root: {
      type: "root",
      children: [
        {
          type: "heading",
          tag: "h2",
          children: [
            { type: "text", text: "Título", format: 1, style: "" }
          ]
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Párrafo", format: 0, style: "" }
          ]
        }
      ]
    }
  };

  const result = (await translateLexical(sampleLexical)) as {
    root?: {
      type?: string;
      children?: Array<{ tag?: string; children?: Array<{ format?: number }> }>;
    };
  };
  assert.ok(result);
  assert.equal(result.root?.type, "root");
  assert.equal(result.root?.children?.[0]?.tag, "h2");
  assert.equal(result.root?.children?.[0]?.children?.[0]?.format, 1);
});

test("translateTexts respects DeepL's 50-text batch limit", async () => {
  const previousKey = process.env.DEEPL_API_KEY;
  const previousFetch = globalThis.fetch;
  const batchSizes: number[] = [];
  process.env.DEEPL_API_KEY = "test-key:fx";
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { text: string[] };
    batchSizes.push(body.text.length);
    return new Response(
      JSON.stringify({
        translations: body.text.map((text) => ({
          detected_source_language: "ES",
          text: `EN:${text}`
        }))
      }),
      { status: 200 }
    );
  };

  try {
    const source = Array.from({ length: 51 }, (_, index) => `texto ${index}`);
    const translated = await translateTexts(source);
    assert.deepEqual(batchSizes, [50, 1]);
    assert.equal(translated[50], "EN:texto 50");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.DEEPL_API_KEY;
    else process.env.DEEPL_API_KEY = previousKey;
  }
});

test("translateTexts fails closed when DeepL rejects a request", async () => {
  const previousKey = process.env.DEEPL_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.DEEPL_API_KEY = "test-key:fx";
  globalThis.fetch = async () => new Response("quota exceeded", { status: 456 });

  try {
    await assert.rejects(
      () => translateTexts(["No copies el español como traducción"]),
      DeepLTranslationError
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.DEEPL_API_KEY;
    else process.env.DEEPL_API_KEY = previousKey;
  }
});
