import type { Payload } from "payload";

import {
  getNotionPage,
  propertyCheckbox,
  propertySelect,
  propertyText,
  propertyUrl,
  queryNotionAuthorPages,
  type NotionPage
} from "@/lib/notion";

type AuthorDocument = { id: number | string };

function authorName(page: NotionPage) {
  return propertyText(page.properties.Nombre);
}

async function findAuthor(payload: Payload, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: "authors",
    where: where as never,
    depth: 0,
    limit: 1,
    overrideAccess: true
  });
  return result.docs[0] as AuthorDocument | undefined;
}

async function existingAuthor(payload: Payload, page: NotionPage) {
  const linked = await findAuthor(payload, {
    migrationKey: { equals: `notion:author:${page.id}` }
  });
  if (linked) return linked;

  const name = authorName(page);
  return name ? findAuthor(payload, { name: { equals: name } }) : undefined;
}

function authorData(page: NotionPage) {
  const name = authorName(page);
  if (!name) throw new Error(`El autor ${page.id} no tiene Nombre en Notion.`);

  return {
    name,
    slug: propertyText(page.properties.Slug) || undefined,
    role: propertySelect(page.properties.Rol) || undefined,
    active: propertyCheckbox(page.properties.Activo),
    bio: propertyText(page.properties.Bio) || undefined,
    photoUrl: propertyUrl(page.properties["Foto URL"]) || undefined,
    migrationKey: `notion:author:${page.id}`
  };
}

export async function syncNotionAuthorToPayload(payload: Payload, pageId: string) {
  const page = await getNotionPage(pageId);
  const data = authorData(page);
  const existing = await existingAuthor(payload, page);

  if (existing) {
    return payload.update({
      collection: "authors",
      id: existing.id,
      data: data as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true }
    });
  }

  return payload.create({
    collection: "authors",
    data: data as never,
    depth: 0,
    overrideAccess: true,
    context: { skipNotionSync: true }
  });
}

export async function syncNotionAuthorsToPayload(payload: Payload) {
  const pages = await queryNotionAuthorPages();
  const authorIds = new Map<string, number | string>();

  for (const page of pages) {
    const author = await syncNotionAuthorToPayload(payload, page.id);
    authorIds.set(page.id, author.id);
  }

  return authorIds;
}

export async function authorIdForNotionRelation(payload: Payload, pageId: string) {
  const existing = await findAuthor(payload, {
    migrationKey: { equals: `notion:author:${pageId}` }
  });
  if (existing) return existing.id;
  const author = await syncNotionAuthorToPayload(payload, pageId);
  return author.id;
}
