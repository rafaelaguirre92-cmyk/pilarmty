import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`topics\` ADD COLUMN \`unpublish_page\` integer DEFAULT false;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`topics\` DROP COLUMN \`unpublish_page\`;`);
}
