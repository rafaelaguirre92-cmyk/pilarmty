import type { ReactNode } from "react";
import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";

import type { NotionBlock, RichText } from "@/lib/types";

type CmsBlockNode = {
  fields: {
    text?: ReactNode;
    url?: string;
    label?: ReactNode;
    title?: ReactNode;
    content?: ReactNode;
    file?: { url?: string } | number | string | null;
  };
};

function richText(value: unknown): ReactNode {
  if (!Array.isArray(value)) return null;
  return (value as RichText[]).map((item, index) => {
    let content: ReactNode = item.plain_text;
    if (item.annotations?.code) content = <code>{content}</code>;
    if (item.annotations?.bold) content = <strong>{content}</strong>;
    if (item.annotations?.italic) content = <em>{content}</em>;
    if (item.annotations?.strikethrough) content = <s>{content}</s>;
    if (item.annotations?.underline) content = <u>{content}</u>;
    if (item.href) {
      content = (
        <a href={item.href} rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <span key={`${index}-${item.plain_text}`}>{content}</span>;
  });
}

function blockPayload(block: NotionBlock) {
  return (block[block.type] || {}) as Record<string, unknown>;
}

function fileUrl(payload: Record<string, unknown>) {
  const file = payload.file as { url?: string } | undefined;
  const external = payload.external as { url?: string } | undefined;
  return file?.url || external?.url;
}

function renderBlock(block: NotionBlock): ReactNode {
  const payload = blockPayload(block);
  const text = richText(payload.rich_text);
  const children = block.children?.map(renderBlock);

  switch (block.type) {
    case "paragraph":
      return <p key={block.id}>{text}</p>;
    case "heading_1":
      return <h2 key={block.id}>{text}</h2>;
    case "heading_2":
      return <h2 key={block.id}>{text}</h2>;
    case "heading_3":
      return <h3 key={block.id}>{text}</h3>;
    case "quote":
      return <blockquote key={block.id}>{text}</blockquote>;
    case "callout":
      return (
        <aside className="article-callout" key={block.id}>
          {text}
        </aside>
      );
    case "bulleted_list_item":
      return (
        <ul key={block.id}>
          <li>
            {text}
            {children}
          </li>
        </ul>
      );
    case "numbered_list_item":
      return (
        <ol key={block.id}>
          <li>
            {text}
            {children}
          </li>
        </ol>
      );
    case "to_do":
      return (
        <p className="article-todo" key={block.id}>
          <span aria-hidden="true">{payload.checked ? "✓" : "○"}</span> {text}
        </p>
      );
    case "divider":
      return <hr key={block.id} />;
    case "code":
      return (
        <pre key={block.id}>
          <code>{text}</code>
        </pre>
      );
    case "toggle":
      return (
        <details className="article-toggle" key={block.id}>
          <summary>{text}</summary>
          <div>{children}</div>
        </details>
      );
    case "image": {
      const url = fileUrl(payload);
      const caption = richText(payload.caption);
      if (!url) return null;
      return (
        <figure key={block.id}>
          {/* Notion media dimensions are not included in the API payload. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" loading="lazy" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "video": {
      const url = fileUrl(payload);
      if (!url) return null;
      return (
        <p key={block.id}>
          <a className="button secondary" href={url}>
            Ver video
          </a>
        </p>
      );
    }
    case "bookmark":
    case "embed": {
      const url = payload.url as string | undefined;
      return url ? (
        <p key={block.id}>
          <a href={url} rel="noopener noreferrer">
            {url}
          </a>
        </p>
      ) : null;
    }
    default:
      return children?.length ? <div key={block.id}>{children}</div> : null;
  }
}

export function ArticleBody({
  blocks,
  body,
  fallback
}: {
  blocks?: NotionBlock[];
  body?: Record<string, unknown>;
  fallback?: string;
}) {
  if (body?.root) {
    return (
      <PayloadRichText
        className="article-body"
        data={body as never}
        converters={({ defaultConverters }) => ({
          ...defaultConverters,
          blocks: {
            callout: ({ node }: { node: CmsBlockNode }) => (
              <aside className="article-callout">{node.fields.text}</aside>
            ),
            embed: ({ node }: { node: CmsBlockNode }) => (
              <p>
                <a href={node.fields.url} rel="noopener noreferrer">
                  {node.fields.label || node.fields.url}
                </a>
              </p>
            ),
            accordion: ({ node }: { node: CmsBlockNode }) => (
              <details className="article-toggle">
                <summary>{node.fields.title}</summary>
                <p>{node.fields.content}</p>
              </details>
            ),
            download: ({ node }: { node: CmsBlockNode }) => {
              const file = node.fields.file;
              const url = typeof file === "object" ? file?.url : undefined;
              return url ? (
                <p>
                  <a className="button secondary" href={url}>
                    {node.fields.label || "Descargar archivo"}
                  </a>
                </p>
              ) : null;
            }
          }
        })}
      />
    );
  }

  if (blocks?.length) {
    return <div className="article-body">{blocks.map(renderBlock)}</div>;
  }

  return (
    <div className="article-body">
      {fallback && <p>{fallback}</p>}
    </div>
  );
}
