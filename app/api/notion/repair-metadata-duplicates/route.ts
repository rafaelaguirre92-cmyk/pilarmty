import { getPayload } from "payload";

import {
  findMetadataDuplicateGroups,
  mergeMetadataDuplicateGroup,
  type MetadataCollection
} from "@/lib/notion-metadata-repair";
import config from "@payload-config";

export const dynamic = "force-dynamic";

async function authenticatedPayload(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!auth.user) return undefined;
  return payload;
}

export async function GET(request: Request) {
  const payload = await authenticatedPayload(request);
  if (!payload) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const groups = await findMetadataDuplicateGroups(payload);
  return Response.json({ ok: true, groups });
}

export async function POST(request: Request) {
  const payload = await authenticatedPayload(request);
  if (!payload) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const collection = body?.collection;
  const key = body?.key;
  const kind = body?.kind;
  if (
    !["series", "authors", "topics"].includes(collection) ||
    typeof key !== "string" ||
    !key
  ) {
    return Response.json({ error: "Grupo de duplicados inválido." }, { status: 400 });
  }
  if (
    kind !== undefined &&
    (collection !== "series" || (kind !== "series" && kind !== "event"))
  ) {
    return Response.json({ error: "Tipo de serie inválido." }, { status: 400 });
  }

  const result = await mergeMetadataDuplicateGroup(
    payload,
    collection as MetadataCollection,
    key,
    { kind }
  );
  return Response.json({ ok: true, result });
}
