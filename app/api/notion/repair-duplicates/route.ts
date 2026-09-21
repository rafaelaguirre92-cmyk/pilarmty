import { getPayload } from "payload";

import { repairNotionPayloadDuplicates } from "@/lib/notion-payload-repair";
import config from "@payload-config";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!auth.user) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const result = await repairNotionPayloadDuplicates(payload, { write: false });
  return Response.json({ ok: true, result });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!auth.user) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  const url = new URL(request.url);
  const write =
    url.searchParams.get("write") === "1" ||
    url.searchParams.get("write") === "true";

  const result = await repairNotionPayloadDuplicates(payload, { write });
  return Response.json(
    {
      ok: result.errors.length === 0,
      result
    },
    { status: result.errors.length === 0 ? 200 : 207 }
  );
}
