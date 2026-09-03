import { getPayload } from "payload";

import { isDatabaseConfigured } from "@/lib/database-url";
import config from "@payload-config";

export async function GET() {
  let payloadConnected = false;
  try {
    const payload = await getPayload({ config });
    await payload.count({ collection: "users", overrideAccess: true });
    payloadConnected = true;
  } catch {
    payloadConnected = false;
  }

  const productionSecret = Boolean(process.env.PAYLOAD_SECRET);
  const databaseConfigured = isDatabaseConfigured();
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const schedulerConfigured = Boolean(
    process.env.QSTASH_TOKEN &&
      process.env.QSTASH_CURRENT_SIGNING_KEY &&
      process.env.QSTASH_NEXT_SIGNING_KEY
  );
  const notionSyncConfigured = Boolean(
    process.env.NOTION_API_TOKEN &&
      process.env.NOTION_WRITEBACK_ENABLED === "true" &&
      process.env.CRON_SECRET
  );
  return Response.json({
    ok: payloadConnected,
    payload: { connected: payloadConnected, secretConfigured: productionSecret },
    postgres: { configured: databaseConfigured, connected: databaseConfigured && payloadConnected },
    blob: { configured: blobConfigured },
    scheduler: { configured: schedulerConfigured },
    notionSync: { configured: notionSyncConfigured },
    timestamp: new Date().toISOString()
  }, { status: payloadConnected ? 200 : 503 });
}
