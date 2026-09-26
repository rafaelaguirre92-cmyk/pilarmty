import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL o POSTGRES_URL es obligatorio.");
}

const { Client } = await import("pg");
const client = new Client({ connectionString });

try {
  await client.connect();
  const duplicates = await client.query(`
    SELECT "slug", "_locale", array_agg("_parent_id" ORDER BY "_parent_id") AS "seriesIds"
    FROM "series_locales"
    WHERE "slug" IS NOT NULL
    GROUP BY "slug", "_locale"
    HAVING COUNT(*) > 1
    ORDER BY "_locale", "slug"
  `);

  if (duplicates.rows.length > 0) {
    console.error("No se puede activar la restricción: aún existen series duplicadas.");
    for (const row of duplicates.rows) {
      console.error(`${row._locale}:${row.slug} → ${row.seriesIds.join(", ")}`);
    }
    process.exitCode = 1;
  } else {
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "series_slug_locale_unique"
        ON "series_locales" USING btree ("slug", "_locale")
    `);
    console.log("Restricción única de slug y locale para series activada.");
  }
} finally {
  await client.end();
}
