import type { NotionBlock, RichText } from "@/lib/types";

type AssetResolver = (url: string, label: string) => Promise<number | string | undefined>;

const textFormat = (annotations?: RichText["annotations"]) =>
  (annotations?.bold ? 1 : 0) |
  (annotations?.italic ? 2 : 0) |
  (annotations?.strikethrough ? 4 : 0) |
  (annotations?.underline ? 8 : 0) |
  (annotations?.code ? 16 : 0);

function textNodes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return (value as RichText[]).map((item) => ({
    detail: 0,
    format: textFormat(item.annotations),
    mode: "normal",
    style: "",
    text: item.plain_text,
    type: "text",
    version: 1
  }));
}

function payload(block: NotionBlock) {
  return (block[block.type] || {}) as Record<string, unknown>;
}

function plainText(blocks: NotionBlock[] | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .flatMap((block) => {
      const value = payload(block);
      const own = Array.isArray(value.rich_text)
        ? (value.rich_text as RichText[]).map((item) => item.plain_text).join("")
        : "";
      const nested = plainText(block.children);
      return [own, nested].filter(Boolean);
    })
    .join("\n")
    .trim();
}

function fileUrl(value: Record<string, unknown>) {
  const file = value.file as { url?: string } | undefined;
  const external = value.external as { url?: string } | undefined;
  return file?.url || external?.url;
}

function element(type: string, children: unknown[], extra: Record<string, unknown> = {}) {
  return { children, direction: null, format: "", indent: 0, type, version: 1, ...extra };
}

export async function notionBlocksToLexical(
  blocks: NotionBlock[],
  resolveAsset?: AssetResolver,
  warnings: string[] = []
) {
  const children: Record<string, unknown>[] = [];

  for (const block of blocks) {
    const value = payload(block);
    const inline = textNodes(value.rich_text);
    switch (block.type) {
      case "paragraph":
        children.push(element("paragraph", inline));
        break;
      case "heading_1":
      case "heading_2":
      case "heading_3":
        children.push(element("heading", inline, { tag: `h${block.type.at(-1)}` }));
        break;
      case "quote":
        children.push(element("quote", inline));
        break;
      case "bulleted_list_item":
      case "numbered_list_item": {
        const listType = block.type === "numbered_list_item" ? "number" : "bullet";
        children.push(
          element("list", [element("listitem", inline, { value: 1 })], {
            listType,
            start: 1,
            tag: listType === "number" ? "ol" : "ul"
          })
        );
        break;
      }
      case "code":
        children.push({
          ...element("code", inline),
          language: (value.language as string) || undefined
        });
        break;
      case "divider":
        children.push(element("paragraph", [{ ...textNodes([{ plain_text: "—" }])[0] }]));
        break;
      case "callout":
        if (inline.length) {
          children.push({
            fields: {
              blockType: "callout",
              text: (value.rich_text as RichText[]).map((item) => item.plain_text).join(""),
              tone: "note"
            },
            type: "block",
            version: 2
          });
        }
        break;
      case "toggle": {
        const toggleTitle = (value.rich_text as RichText[] | undefined)
          ?.map((item) => item.plain_text)
          .join("")
          .trim();
        const toggleContent = plainText(block.children);
        if (toggleTitle && toggleContent) {
          children.push({
            fields: {
              blockType: "accordion",
              title: toggleTitle,
              content: toggleContent
            },
            type: "block",
            version: 2
          });
        } else if (inline.length) {
          children.push(element("paragraph", inline));
        }
        break;
      }
      case "image":
      case "file":
      case "pdf": {
        const url = fileUrl(value);
        const caption = (value.caption as RichText[] | undefined)?.map((item) => item.plain_text).join("") || block.type;
        const id = url && resolveAsset ? await resolveAsset(url, caption) : undefined;
        if (id && block.type === "image") {
          children.push({ fields: null, relationTo: "media", type: "upload", value: id, version: 3 });
        } else if (id) {
          children.push({ fields: { blockType: "download", file: id, label: caption }, type: "block", version: 2 });
        } else if (url) {
          children.push({ fields: { blockType: "embed", label: caption, url }, type: "block", version: 2 });
        }
        break;
      }
      case "embed":
      case "bookmark":
      case "video":
      case "audio": {
        const url = (value.url as string | undefined) || fileUrl(value);
        if (url) children.push({ fields: { blockType: "embed", url }, type: "block", version: 2 });
        break;
      }
      default:
        warnings.push(`${block.id}: bloque no compatible (${block.type})`);
    }
  }

  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1
    }
  };
}
