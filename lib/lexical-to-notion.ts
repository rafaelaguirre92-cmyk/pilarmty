type LexicalNode = Record<string, unknown> & {
  children?: LexicalNode[];
  fields?: Record<string, unknown> | null;
  format?: number | string;
  tag?: string;
  text?: string;
  type?: string;
};

type NotionRichText = {
  type: "text";
  text: { content: string };
  annotations?: Record<string, boolean>;
};

const MAX_TEXT_LENGTH = 2000;

function richText(nodes: LexicalNode[] = []): NotionRichText[] {
  return nodes.flatMap((node) => {
    if (node.type !== "text" || typeof node.text !== "string") return [];
    const format = typeof node.format === "number" ? node.format : 0;
    const chunks = node.text.match(new RegExp(`.{1,${MAX_TEXT_LENGTH}}`, "gs")) || [];
    return chunks.map((content) => ({
      type: "text" as const,
      text: { content },
      annotations: {
        bold: Boolean(format & 1),
        italic: Boolean(format & 2),
        strikethrough: Boolean(format & 4),
        underline: Boolean(format & 8),
        code: Boolean(format & 16)
      }
    }));
  });
}

function paragraph(content: string) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: richText([{ type: "text", text: content }]) }
  };
}

function lexicalNodeToNotion(node: LexicalNode): Record<string, unknown>[] {
  const inline = richText(node.children);

  if (node.type === "paragraph") {
    return [{ object: "block", type: "paragraph", paragraph: { rich_text: inline } }];
  }
  if (node.type === "heading") {
    const heading = ["h1", "h2", "h3"].includes(node.tag || "") ? node.tag!.replace("h", "heading_") : "heading_2";
    return [{ object: "block", type: heading, [heading]: { rich_text: inline } }];
  }
  if (node.type === "quote") {
    return [{ object: "block", type: "quote", quote: { rich_text: inline } }];
  }
  if (node.type === "code") {
    return [{
      object: "block",
      type: "code",
      code: { rich_text: inline, language: typeof node.language === "string" ? node.language : "plain text" }
    }];
  }
  if (node.type === "list") {
    const type = node.listType === "number" ? "numbered_list_item" : "bulleted_list_item";
    return (node.children || []).map((item) => ({
      object: "block",
      type,
      [type]: { rich_text: richText(item.children) }
    }));
  }
  if (node.type === "block" && node.fields) {
    const blockType = node.fields.blockType;
    if (blockType === "callout") {
      return [{
        object: "block",
        type: "callout",
        callout: {
          rich_text: richText([{ type: "text", text: String(node.fields.text || "") }]),
          icon: { type: "emoji", emoji: "💡" }
        }
      }];
    }
    if (blockType === "accordion") {
      return [{
        object: "block",
        type: "toggle",
        toggle: {
          rich_text: richText([{ type: "text", text: String(node.fields.title || "") }]),
          children: [paragraph(String(node.fields.content || ""))]
        }
      }];
    }
    if (blockType === "embed" && typeof node.fields.url === "string") {
      return [{ object: "block", type: "embed", embed: { url: node.fields.url } }];
    }
    if (blockType === "download" && typeof node.fields.url === "string") {
      return [{ object: "block", type: "bookmark", bookmark: { url: node.fields.url } }];
    }
    throw new Error(`Bloque de Payload no compatible con Notion: ${String(blockType || "desconocido")}`);
  }
  if (node.type === "upload") {
    // Payload uploads require resolving a media relation. Refuse to replace the
    // Notion body rather than silently dropping an image.
    throw new Error("El contenido contiene una imagen que aún no puede escribirse de forma segura en Notion.");
  }
  if (node.type === "linebreak") return [paragraph("")];

  throw new Error(`Nodo de Payload no compatible con Notion: ${String(node.type || "desconocido")}`);
}

export function lexicalToNotionBlocks(value: unknown) {
  const root = value && typeof value === "object" ? (value as { root?: LexicalNode }).root : undefined;
  if (!root?.children) return [];
  return root.children.flatMap(lexicalNodeToNotion);
}
