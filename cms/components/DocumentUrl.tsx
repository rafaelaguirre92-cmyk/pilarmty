import type { BeforeDocumentControlsServerProps } from "payload";

import { DocumentUrlClient } from "./DocumentUrlClient";

export async function DocumentUrl({ id, payload, user }: BeforeDocumentControlsServerProps) {
  if (!id) return null;

  const teaching = await payload.findByID({
    collection: "teachings",
    id,
    depth: 1,
    overrideAccess: false,
    user,
    select: { slug: true, series: true }
  });
  const series = teaching.series;
  const collection =
    series && typeof series === "object" && "slug" in series && typeof series.slug === "string"
      ? series.slug
      : "";

  return <DocumentUrlClient collection={collection} />;
}
