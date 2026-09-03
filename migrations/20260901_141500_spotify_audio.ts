import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "teachings"
      ADD COLUMN IF NOT EXISTS "spotify_url" varchar;
    ALTER TABLE "_teachings_v"
      ADD COLUMN IF NOT EXISTS "version_spotify_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "teachings"
      DROP COLUMN IF EXISTS "spotify_url";
    ALTER TABLE "_teachings_v"
      DROP COLUMN IF EXISTS "version_spotify_url";
  `);
}
