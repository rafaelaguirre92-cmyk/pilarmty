import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "authors"
      ADD COLUMN IF NOT EXISTS "notion_page_id" varchar;

    CREATE UNIQUE INDEX IF NOT EXISTS "authors_notion_page_id_idx"
      ON "authors" USING btree ("notion_page_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "authors_notion_page_id_idx";

    ALTER TABLE "authors"
      DROP COLUMN IF EXISTS "notion_page_id";
  `);
}
