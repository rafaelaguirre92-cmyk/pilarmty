import type { BeforeDocumentControlsServerProps } from "payload";

import { PublishDatesClient } from "./PublishDatesClient";

function formatDate(value?: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Monterrey"
  }).format(new Date(value));
}

export async function PublishDates({ id, payload, user }: BeforeDocumentControlsServerProps) {
  if (!id) return null;

  const [document, publishedVersions] = await Promise.all([
    payload.findByID({
      collection: "teachings",
      id,
      depth: 0,
      overrideAccess: false,
      user,
      select: { createdAt: true }
    }),
    payload.findVersions({
      collection: "teachings",
      depth: 0,
      limit: 1,
      overrideAccess: false,
      sort: "createdAt",
      user,
      where: {
        and: [
          { parent: { equals: id } },
          { "version._status": { equals: "published" } }
        ]
      }
    })
  ]);

  return (
    <PublishDatesClient
      createdAt={formatDate(document.createdAt)}
      publishedAt={formatDate(publishedVersions.docs[0]?.createdAt)}
    />
  );
}
