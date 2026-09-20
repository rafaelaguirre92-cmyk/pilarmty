import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "authors"
      ADD COLUMN IF NOT EXISTS "role" varchar,
      ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "photo_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "authors"
      DROP COLUMN IF EXISTS "photo_url",
      DROP COLUMN IF EXISTS "active",
      DROP COLUMN IF EXISTS "role";
  `);
}
