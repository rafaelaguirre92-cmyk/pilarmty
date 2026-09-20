import { type MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`teachings\` ADD COLUMN \`youtube_description\` text;`);
}

export async function down(): Promise<void> {
  // SQLite cannot drop this column without rebuilding the table. It is safe to
  // retain it because the field is optional and historical values are preserved.
}
