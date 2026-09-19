import { revalidatePath, revalidateTag } from "next/cache";
import { getPayload } from "payload";

import { runNotionPayloadSync } from "@/lib/notion-payload-reconcile";
import { recordSyncRun } from "@/lib/sync-history";
import config from "@payload-config";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function execute(trigger: "manual" | "cron") {
  const payload = await getPayload({ config });
  const result = await runNotionPayloadSync(payload);

  await recordSyncRun({
    id: result.runId || `sync_${Date.now().toString(36)}`,
    finishedAt: result.finishedAt || new Date().toISOString(),
    status: result.errors.length > 0 ? "incident" : "ready",
    trigger,
    payloadToNotion: result.payloadToNotion,
    notionToPayload: result.notionToPayload,
    createdInNotion: result.createdInNotion,
    unchanged: result.unchanged,
    skipped: result.skipped,
    errors: result.errors
  });

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
    return await execute("cron");
  } catch (error) {
    await recordSyncRun({
      id: `sync_${Date.now().toString(36)}`,
      finishedAt: new Date().toISOString(),
      status: "error",
      trigger: "cron",
      payloadToNotion: 0,
      notionToPayload: 0,
      createdInNotion: 0,
      unchanged: 0,
      skipped: 0,
      errors: [{ message: error instanceof Error ? error.message : String(error) }]
    });

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
    return await execute("manual");
  } catch (error) {
    await recordSyncRun({
      id: `sync_${Date.now().toString(36)}`,
      finishedAt: new Date().toISOString(),
      status: "error",
      trigger: "manual",
      payloadToNotion: 0,
      notionToPayload: 0,
      createdInNotion: 0,
      unchanged: 0,
      skipped: 0,
      errors: [{ message: error instanceof Error ? error.message : String(error) }]
    });

    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

