import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_teachings_v\` ADD COLUMN \`version_youtube_description\` text;`);
  await db.run(sql`ALTER TABLE \`teachings\` ADD COLUMN \`notion_image_url\` text;`);
  await db.run(sql`ALTER TABLE \`_teachings_v\` ADD COLUMN \`version_notion_image_url\` text;`);
  await db.run(sql`ALTER TABLE \`resources\` ADD COLUMN \`notion_image_url\` text;`);
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD COLUMN \`version_notion_image_url\` text;`);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep additive fields so rollback cannot discard editorial data.
}
