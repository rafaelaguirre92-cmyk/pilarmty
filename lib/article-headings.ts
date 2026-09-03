import type { NotionBlock } from "@/lib/types";

export type ArticleHeading = {
  id: string;
  label: string;
  title?: string;
  reference?: string;
};

export type ParsedHeading = {
  title: string;
  reference?: string;
};

export function parseHeadingText(raw: string): ParsedHeading {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match && match[1].trim() && match[2].trim()) {
    return {
      title: match[1].trim(),
      reference: match[2].trim()
    };
  }
  return { title: trimmed };
}

function normalizeHeading(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "seccion";
}

export function articleHeadingId(label: string, index: number) {
  return `${normalizeHeading(label)}-${index + 1}`;
}

export function notionHeadingText(block: NotionBlock) {
  const payload = block[block.type];
  if (!payload || typeof payload !== "object") return "";
  const richText = (payload as { rich_text?: unknown }).rich_text;
  if (!Array.isArray(richText)) return "";
  return richText
    .map((item) =>
      item && typeof item === "object" && "plain_text" in item
        ? String(item.plain_text || "")
        : ""
    )
    .join("")
    .trim();
}

function lexicalText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const record = node as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (!Array.isArray(record.children)) return "";
  return record.children.map(lexicalText).join("");
}

export function extractArticleHeadings({
  blocks,
  body
}: {
  blocks?: NotionBlock[];
  body?: Record<string, unknown>;
}): ArticleHeading[] {
  if (body?.root && typeof body.root === "object") {
    const children = (body.root as { children?: unknown }).children;
    if (!Array.isArray(children)) return [];
    return children.flatMap((node, index) => {
      if (!node || typeof node !== "object") return [];
      const heading = node as Record<string, unknown>;
      if (heading.type !== "heading" || !["h1", "h2"].includes(String(heading.tag))) {
        return [];
      }
      const label = lexicalText(heading).trim();
      if (!label) return [];
      const parsed = parseHeadingText(label);
      return [
        {
          id: articleHeadingId(label, index),
          label,
          title: parsed.title,
          reference: parsed.reference
        }
      ];
    });
  }

  return (blocks || []).flatMap((block, index) => {
    if (block.type !== "heading_1" && block.type !== "heading_2") return [];
    const label = notionHeadingText(block);
    if (!label) return [];
    const parsed = parseHeadingText(label);
    return [
      {
        id: articleHeadingId(label, index),
        label,
        title: parsed.title,
        reference: parsed.reference
      }
    ];
  });
}

export function lexicalHeadingText(node: unknown) {
  return lexicalText(node).trim();
}
