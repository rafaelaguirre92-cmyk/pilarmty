/**
 * DeepL Translation Service
 * Supports text, batch text, and Lexical RichText AST translation.
 */

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const MAX_TEXTS_PER_REQUEST = 50;

export class DeepLTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepLTranslationError";
  }
}

function getEndpoint(apiKey: string): string {
  // Free tier keys end in ':fx'
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

export async function translateTexts(
  texts: string[],
  targetLang: "EN-US" | "ES" = "EN-US",
  sourceLang: "ES" | "EN" = "ES"
): Promise<string[]> {
  if (!texts.length) return [];
  const apiKey = DEEPL_API_KEY || process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.warn("DEEPL_API_KEY is not configured; skipping auto-translation.");
    return texts;
  }

  // Filter out empty or whitespace-only strings while keeping indexes
  const indexedToTranslate: { index: number; text: string }[] = [];
  texts.forEach((text, index) => {
    if (text && text.trim().length > 0) {
      indexedToTranslate.push({ index, text });
    }
  });

  if (indexedToTranslate.length === 0) {
    return texts;
  }

  const endpoint = getEndpoint(apiKey);
  const result = [...texts];

  for (let offset = 0; offset < indexedToTranslate.length; offset += MAX_TEXTS_PER_REQUEST) {
    const batch = indexedToTranslate.slice(offset, offset + MAX_TEXTS_PER_REQUEST);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: batch.map((item) => item.text),
        target_lang: targetLang,
        source_lang: sourceLang
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new DeepLTranslationError(
        `DeepL API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as {
      translations?: { detected_source_language: string; text: string }[];
    };

    if (!data.translations || data.translations.length !== batch.length) {
      throw new DeepLTranslationError(
        "DeepL returned an unexpected translation payload."
      );
    }

    batch.forEach((item, i) => {
      result[item.index] = data.translations![i].text;
    });
  }

  return result;
}

export async function translateText(
  text: string,
  targetLang: "EN-US" | "ES" = "EN-US",
  sourceLang: "ES" | "EN" = "ES"
): Promise<string> {
  if (!text || !text.trim()) return text;
  const results = await translateTexts([text], targetLang, sourceLang);
  return results[0] || text;
}

type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

type LexicalRoot = {
  root?: LexicalNode;
  [key: string]: unknown;
};

/**
 * Traverses a Lexical JSON object, extracts all text nodes,
 * translates them in a single batch call to DeepL, and returns the translated AST.
 */
export async function translateLexical(
  lexicalJson: Record<string, unknown> | null | undefined,
  targetLang: "EN-US" | "ES" = "EN-US",
  sourceLang: "ES" | "EN" = "ES"
): Promise<Record<string, unknown> | undefined> {
  if (!lexicalJson || typeof lexicalJson !== "object") return undefined;

  const cloned = JSON.parse(JSON.stringify(lexicalJson)) as LexicalRoot;
  if (!cloned.root) return lexicalJson;

  const textNodes: LexicalNode[] = [];

  function collectTextNodes(node: LexicalNode) {
    if (node.type === "text" && typeof node.text === "string" && node.text.trim()) {
      textNodes.push(node);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(collectTextNodes);
    }
  }

  collectTextNodes(cloned.root);

  if (textNodes.length === 0) {
    return cloned;
  }

  const rawTexts = textNodes.map((n) => n.text || "");
  const translatedTexts = await translateTexts(rawTexts, targetLang, sourceLang);

  textNodes.forEach((node, i) => {
    node.text = translatedTexts[i] || node.text;
  });

  return cloned;
}
