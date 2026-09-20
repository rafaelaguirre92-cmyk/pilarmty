import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`authors\` ADD COLUMN \`role\` text;
    ALTER TABLE \`authors\` ADD COLUMN \`active\` integer DEFAULT true;
    ALTER TABLE \`authors\` ADD COLUMN \`photo_url\` text;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`authors\` DROP COLUMN \`photo_url\`;
    ALTER TABLE \`authors\` DROP COLUMN \`active\`;
    ALTER TABLE \`authors\` DROP COLUMN \`role\`;
  `);
}
