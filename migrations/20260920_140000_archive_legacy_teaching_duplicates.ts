import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

// These records are the copies linked to the previous Notion workspace. Their
// current-workspace counterparts have the same slug and are kept active.
const legacyDuplicateIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 50];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "teachings"
    SET "deleted_at" = NOW()
    WHERE "id" IN (${sql.join(legacyDuplicateIds.map((id) => sql`${id}`), sql`, `)});
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "teachings"
    SET "deleted_at" = NULL
    WHERE "id" IN (${sql.join(legacyDuplicateIds.map((id) => sql`${id}`), sql`, `)});
  `);
}
