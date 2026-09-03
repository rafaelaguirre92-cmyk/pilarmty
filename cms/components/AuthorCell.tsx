import { cache } from "react";
import type {
  DefaultServerCellComponentProps,
  Payload,
  RelationshipFieldClient
} from "payload";

import { payloadMediaUrl } from "@/lib/payload-media";
import type { Author } from "@/payload-types";

function relationshipId(value: unknown): number | string | undefined {
  if (typeof value === "number" || typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;

  if ("id" in value) return relationshipId(value.id);
  if ("value" in value) return relationshipId(value.value);
  return undefined;
}

const loadAuthor = cache(async (payload: Payload, id: number | string) =>
  payload.findByID({
    collection: "authors",
    id,
    depth: 2,
    overrideAccess: true
  })
);

export async function AuthorCell(
  props: DefaultServerCellComponentProps<RelationshipFieldClient>
) {
  const authorId = relationshipId(props.cellData ?? props.rowData.author);
  if (!authorId) return <span className="author-cell-empty">—</span>;

  const author = (await loadAuthor(props.payload, authorId)) as Author;
  const name = author.name || "Autor";
  const imageUrl = payloadMediaUrl(author.image);

  return (
    <div className="author-cell">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="author-cell__image" src={imageUrl} alt="" />
      ) : (
        <span className="author-cell__fallback" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="author-cell__name">{name}</span>
    </div>
  );
}
