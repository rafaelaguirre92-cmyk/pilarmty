import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@libsql/client";

const dbPath = resolve(".payload/pilar.db");
if (!existsSync(dbPath)) throw new Error(`No existe la base local: ${dbPath}`);

const columns: Record<string, Record<string, string>> = {
  authors: {
    profile_url: "text"
  },
  teachings: {
    youtube_url: "text",
    spotify_url: "text",
    notion_page_id: "text",
    notion_url: "text",
    sync_status: "text",
    last_synced_at: "text",
    last_sync_source: "text",
    sync_error: "text"
  },
  _teachings_v: {
    version_youtube_url: "text",
    version_spotify_url: "text",
    version_notion_page_id: "text",
    version_notion_url: "text",
    version_sync_status: "text",
    version_last_synced_at: "text",
    version_last_sync_source: "text",
    version_sync_error: "text"
  },
  resources: {
    notion_page_id: "text",
    notion_url: "text",
    sync_status: "text",
    last_synced_at: "text",
    last_sync_source: "text",
    sync_error: "text"
  },
  _resources_v: {
    version_notion_page_id: "text",
    version_notion_url: "text",
    version_sync_status: "text",
    version_last_synced_at: "text",
    version_last_sync_source: "text",
    version_sync_error: "text"
  }
};

async function existingColumns(client: ReturnType<typeof createClient>, table: string) {
  const result = await client.execute(`PRAGMA table_info(${table});`);
  return new Set(result.rows.map((row) => String(row.name)));
}

async function main() {
  const client = createClient({ url: `file:${dbPath}` });
  for (const [table, definitions] of Object.entries(columns)) {
    const existing = await existingColumns(client, table);
    for (const [name, type] of Object.entries(definitions)) {
      if (existing.has(name)) continue;
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${type};`);
      console.log(`Added ${table}.${name}`);
    }
  }

  await client.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS teachings_notion_page_id_idx ON teachings (notion_page_id);"
  );
  await client.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS resources_notion_page_id_idx ON resources (notion_page_id);"
  );
  console.log("Notion sync schema ready.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
