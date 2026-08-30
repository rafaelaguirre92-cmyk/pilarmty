import { draftMode } from "next/headers";
import { getPayload } from "payload";

import config from "@payload-config";

const allowedCollections = new Set(["series", "teachings", "resources"]);

function relationSlug(value: unknown) {
  return value && typeof value === "object" && "slug" in value
    ? String((value as { slug: unknown }).slug)
    : undefined;
}

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!auth.user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(request.url);
  const collection = url.searchParams.get("collection");
  const id = url.searchParams.get("id");
  if (!collection || !id || !allowedCollections.has(collection)) {
    return Response.json({ error: "Vista previa inválida" }, { status: 400 });
  }

  const requestedLocale = url.searchParams.get("locale") === "en" ? "en" : "es";

  const doc = await payload.findByID({
    collection: collection as "series" | "teachings" | "resources",
    id,
    locale: requestedLocale,
    depth: 1,
    draft: true,
    overrideAccess: true
  });

  const prefix = requestedLocale === "en" ? "/en" : "";
  let path: string;
  if (collection === "resources") {
    path = `${prefix}/recursos/${doc.slug}`;
  } else if (collection === "series") {
    path = `${prefix}/ensenanzas/${doc.slug}`;
  } else {
    const parent = relationSlug("series" in doc ? doc.series : undefined);
    if (!parent) return Response.json({ error: "La enseñanza no tiene serie" }, { status: 400 });
    path = `${prefix}/ensenanzas/${parent}/${doc.slug}`;
  }

  (await draftMode()).enable();
  return Response.redirect(new URL(path, request.url), 307);
}
