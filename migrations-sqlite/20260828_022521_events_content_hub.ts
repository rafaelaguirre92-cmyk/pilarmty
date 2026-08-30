import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`events\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text,
    \`excerpt\` text,
    \`start_date\` text,
    \`end_date\` text,
    \`location\` text,
    \`image_id\` integer,
    \`registration_url\` text,
    \`registration_label\` text DEFAULT 'Conocer más',
    \`locale\` text DEFAULT 'es',
    \`migration_key\` text,
    \`source_updated_at\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`deleted_at\` text,
    \`_status\` text DEFAULT 'draft',
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`);
  await db.run(sql`CREATE INDEX \`events_image_idx\` ON \`events\` (\`image_id\`);`);
  await db.run(sql`CREATE INDEX \`events_locale_idx\` ON \`events\` (\`locale\`);`);
  await db.run(sql`CREATE UNIQUE INDEX \`events_migration_key_idx\` ON \`events\` (\`migration_key\`);`);
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`);
  await db.run(sql`CREATE INDEX \`events_deleted_at_idx\` ON \`events\` (\`deleted_at\`);`);
  await db.run(sql`CREATE INDEX \`events__status_idx\` ON \`events\` (\`_status\`);`);
  await db.run(sql`CREATE TABLE \`_events_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`parent_id\` integer,
    \`version_title\` text,
    \`version_excerpt\` text,
    \`version_start_date\` text,
    \`version_end_date\` text,
    \`version_location\` text,
    \`version_image_id\` integer,
    \`version_registration_url\` text,
    \`version_registration_label\` text DEFAULT 'Conocer más',
    \`version_locale\` text DEFAULT 'es',
    \`version_migration_key\` text,
    \`version_source_updated_at\` text,
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`version_deleted_at\` text,
    \`version__status\` text DEFAULT 'draft',
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`latest\` integer,
    \`autosave\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`);
  await db.run(sql`CREATE INDEX \`_events_v_parent_idx\` ON \`_events_v\` (\`parent_id\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_image_idx\` ON \`_events_v\` (\`version_image_id\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_locale_idx\` ON \`_events_v\` (\`version_locale\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_migration_key_idx\` ON \`_events_v\` (\`version_migration_key\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_updated_at_idx\` ON \`_events_v\` (\`version_updated_at\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_created_at_idx\` ON \`_events_v\` (\`version_created_at\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version_deleted_at_idx\` ON \`_events_v\` (\`version_deleted_at\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_version_version__status_idx\` ON \`_events_v\` (\`version__status\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_created_at_idx\` ON \`_events_v\` (\`created_at\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_updated_at_idx\` ON \`_events_v\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_latest_idx\` ON \`_events_v\` (\`latest\`);`);
  await db.run(sql`CREATE INDEX \`_events_v_autosave_idx\` ON \`_events_v\` (\`autosave\`);`);
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`events_id\` integer REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade;`);
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`payload_locked_documents_rels_events_id_idx\`;`);
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`events_id\`;`);
  await db.run(sql`DROP TABLE \`_events_v\`;`);
  await db.run(sql`DROP TABLE \`events\`;`);
}
