import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`authors\` ADD COLUMN \`notion_page_id\` text;
    CREATE UNIQUE INDEX \`authors_notion_page_id_idx\`
      ON \`authors\` (\`notion_page_id\`);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    DROP INDEX \`authors_notion_page_id_idx\`;
    ALTER TABLE \`authors\` DROP COLUMN \`notion_page_id\`;
  `);
}
