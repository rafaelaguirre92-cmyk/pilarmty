import type { Payload } from "payload";

import {
  getNotionPage,
  propertySelect,
  propertyText,
  propertyUrl,
  queryNotionAuthorPages,
  type NotionPage
} from "@/lib/notion";
import {
  authorMigrationKey,
  normalizeMetadataName
} from "@/lib/notion-metadata-identity";

type AuthorDocument = {
  id: number | string;
  name?: string;
  notionPageId?: string | null;
  migrationKey?: string | null;
};

function authorName(page: NotionPage) {
  return propertyText(page.properties.Nombre);
}

async function findAuthor(payload: Payload, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: "authors",
    where: where as never,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true
  });
  return result.docs as unknown as AuthorDocument[];
}

async function existingAuthor(payload: Payload, page: NotionPage) {
  const byNotionId = await findAuthor(payload, {
    notionPageId: { equals: page.id }
  });
  if (byNotionId.length === 1) return byNotionId[0]!;
  if (byNotionId.length > 1) {
    throw new Error(`Hay ${byNotionId.length} autores vinculados a la página de Notion ${page.id}. Únelos manualmente.`);
  }

  const migrationKey = authorMigrationKey(page.id);
  const byMigrationKey = await findAuthor(payload, {
    migrationKey: { equals: migrationKey }
  });
  if (byMigrationKey.length === 1) return byMigrationKey[0]!;
  if (byMigrationKey.length > 1) {
    throw new Error(`Hay ${byMigrationKey.length} autores con la clave ${migrationKey}. Únelos manualmente.`);
  }

  const name = authorName(page);
  if (!name) return undefined;
  const authors = await findAuthor(payload, {});
  const matches = authors.filter(
    (author) =>
      typeof author.name === "string" &&
      normalizeMetadataName(author.name) === normalizeMetadataName(name)
  );
  if (matches.length > 1) {
    throw new Error(`Hay ${matches.length} autores que coinciden con "${name}". Únelos manualmente.`);
  }
  return matches[0];
}

function authorData(page: NotionPage) {
  const name = authorName(page);
  if (!name) throw new Error(`El autor ${page.id} no tiene Nombre en Notion.`);

  return {
    name,
    slug: propertyText(page.properties.Slug) || undefined,
    role: propertySelect(page.properties.Rol) || undefined,
    bio: propertyText(page.properties.Bio) || undefined,
    photoUrl: propertyUrl(page.properties["Foto URL"]) || undefined,
    notionPageId: page.id,
    migrationKey: authorMigrationKey(page.id)
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

  try {
    return await payload.create({
      collection: "authors",
      data: data as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true }
    });
  } catch (error) {
    const concurrent = await existingAuthor(payload, page);
    if (!concurrent) throw error;
    return payload.update({
      collection: "authors",
      id: concurrent.id,
      data: data as never,
      depth: 0,
      overrideAccess: true,
      context: { skipNotionSync: true }
    });
  }
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
    notionPageId: { equals: pageId }
  });
  if (existing.length === 1) return existing[0]!.id;
  if (existing.length > 1) {
    throw new Error(`Hay ${existing.length} autores vinculados a la página de Notion ${pageId}. Únelos manualmente.`);
  }
  const byMigrationKey = await findAuthor(payload, {
    migrationKey: { equals: authorMigrationKey(pageId) }
  });
  if (byMigrationKey.length === 1) return byMigrationKey[0]!.id;
  if (byMigrationKey.length > 1) {
    throw new Error(`Hay ${byMigrationKey.length} autores con la clave de Notion ${pageId}. Únelos manualmente.`);
  }
  const author = await syncNotionAuthorToPayload(payload, pageId);
  return author.id;
}
