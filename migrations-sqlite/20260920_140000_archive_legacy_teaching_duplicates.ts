import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

const legacyDuplicateIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 50];
const ids = legacyDuplicateIds.join(", ");

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`teachings\` SET \`deleted_at\` = CURRENT_TIMESTAMP WHERE \`id\` IN (${sql.raw(ids)});`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`teachings\` SET \`deleted_at\` = NULL WHERE \`id\` IN (${sql.raw(ids)});`);
}
