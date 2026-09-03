import { revalidatePath, revalidateTag } from "next/cache";
import { getPayload } from "payload";

import { runNotionPayloadSync } from "@/lib/notion-payload-reconcile";
import config from "@payload-config";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function execute() {
  const payload = await getPayload({ config });
  const result = await runNotionPayloadSync(payload);
  revalidateTag("notion-content", "max");
  revalidatePath("/", "layout");
  return Response.json({ ok: result.errors.length === 0, result }, {
    status: result.errors.length === 0 ? 200 : 207
  });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    return await execute();
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });
  if (!auth.user) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  try {
    const result = await runNotionPayloadSync(payload);
    revalidateTag("notion-content", "max");
    revalidatePath("/", "layout");
    return Response.json({ ok: result.errors.length === 0, result }, {
      status: result.errors.length === 0 ? 200 : 207
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
