import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_teachings_v" ADD COLUMN IF NOT EXISTS "version_youtube_description" varchar;
    ALTER TABLE "teachings" ADD COLUMN IF NOT EXISTS "notion_image_url" varchar;
    ALTER TABLE "_teachings_v" ADD COLUMN IF NOT EXISTS "version_notion_image_url" varchar;
    ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "notion_image_url" varchar;
    ALTER TABLE "_resources_v" ADD COLUMN IF NOT EXISTS "version_notion_image_url" varchar;
    UPDATE "_teachings_v" AS v
      SET "version_deleted_at" = t."deleted_at"
      FROM "teachings" AS t
      WHERE v."parent_id" = t."id" AND t."deleted_at" IS NOT NULL
        AND t."id" IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,50);
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Retain the additive repair and archive history when rolling code back.
}
