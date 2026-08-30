import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`communities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`label\` text DEFAULT 'Comunidad misional',
  	\`description\` text,
  	\`image_id\` integer,
  	\`location\` text,
  	\`schedule\` text,
  	\`cta_label\` text DEFAULT 'Más información',
  	\`cta_url\` text DEFAULT '#unirme',
  	\`locale\` text DEFAULT 'es',
  	\`sort_order\` numeric DEFAULT 1,
  	\`slug\` text,
  	\`confirm_slug_change\` integer DEFAULT false,
  	\`migration_key\` text,
  	\`source_updated_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_image_idx\` ON \`communities\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`communities_locale_idx\` ON \`communities\` (\`locale\`);`)
  await db.run(sql`CREATE INDEX \`communities_slug_idx\` ON \`communities\` (\`slug\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`communities_migration_key_idx\` ON \`communities\` (\`migration_key\`);`)
  await db.run(sql`CREATE INDEX \`communities_updated_at_idx\` ON \`communities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`communities_created_at_idx\` ON \`communities\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`communities_deleted_at_idx\` ON \`communities\` (\`deleted_at\`);`)
  await db.run(sql`CREATE INDEX \`communities__status_idx\` ON \`communities\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_communities_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_name\` text,
  	\`version_label\` text DEFAULT 'Comunidad misional',
  	\`version_description\` text,
  	\`version_image_id\` integer,
  	\`version_location\` text,
  	\`version_schedule\` text,
  	\`version_cta_label\` text DEFAULT 'Más información',
  	\`version_cta_url\` text DEFAULT '#unirme',
  	\`version_locale\` text DEFAULT 'es',
  	\`version_sort_order\` numeric DEFAULT 1,
  	\`version_slug\` text,
  	\`version_confirm_slug_change\` integer DEFAULT false,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_communities_v_parent_idx\` ON \`_communities_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_image_idx\` ON \`_communities_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_locale_idx\` ON \`_communities_v\` (\`version_locale\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_slug_idx\` ON \`_communities_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_migration_key_idx\` ON \`_communities_v\` (\`version_migration_key\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_updated_at_idx\` ON \`_communities_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_created_at_idx\` ON \`_communities_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version_deleted_at_idx\` ON \`_communities_v\` (\`version_deleted_at\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_version_version__status_idx\` ON \`_communities_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_created_at_idx\` ON \`_communities_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_updated_at_idx\` ON \`_communities_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_latest_idx\` ON \`_communities_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_communities_v_autosave_idx\` ON \`_communities_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`communities_id\` integer REFERENCES communities(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_communities_id_idx\` ON \`payload_locked_documents_rels\` (\`communities_id\`);`)
  await db.run(sql`INSERT INTO \`communities\` (\`name\`, \`label\`, \`description\`, \`location\`, \`schedule\`, \`cta_label\`, \`cta_url\`, \`locale\`, \`sort_order\`, \`slug\`, \`migration_key\`, \`_status\`) VALUES
    ('Comunidad Sur', 'Comunidad misional', 'Comunidad Sur es la primera comunidad de Iglesia Pilar en la zona sur de Monterrey. Es un espacio para crecer en el evangelio, formar relaciones genuinas y aprender a seguir a Jesús en la vida diaria.', 'Sur de Monterrey', 'Viernes 8:00pm', 'Más información', '#unirme', 'es', 1, 'comunidad-sur', 'community-sur-es', 'published'),
    ('Comunidad Sur', 'Missionary community', 'Comunidad Sur is Iglesia Pilar''s first community in southern Monterrey. It is a place to grow in the gospel, form genuine relationships, and learn to follow Jesus in everyday life.', 'Southern Monterrey', 'Friday 8:00pm', 'More information', '#unirme', 'en', 1, 'comunidad-sur', 'community-sur-en', 'published');`)
  await db.run(sql`INSERT INTO \`_communities_v\` (\`parent_id\`, \`version_name\`, \`version_label\`, \`version_description\`, \`version_location\`, \`version_schedule\`, \`version_cta_label\`, \`version_cta_url\`, \`version_locale\`, \`version_sort_order\`, \`version_slug\`, \`version_migration_key\`, \`version_updated_at\`, \`version_created_at\`, \`version__status\`, \`latest\`, \`autosave\`)
    SELECT \`id\`, \`name\`, \`label\`, \`description\`, \`location\`, \`schedule\`, \`cta_label\`, \`cta_url\`, \`locale\`, \`sort_order\`, \`slug\`, \`migration_key\`, \`updated_at\`, \`created_at\`, \`_status\`, 1, 0 FROM \`communities\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`communities\`;`)
  await db.run(sql`DROP TABLE \`_communities_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`authors_id\` integer,
  	\`topics_id\` integer,
  	\`series_id\` integer,
  	\`teachings_id\` integer,
  	\`resources_id\` integer,
  	\`events_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`topics_id\`) REFERENCES \`topics\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`series_id\`) REFERENCES \`series\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`teachings_id\`) REFERENCES \`teachings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resources_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`events_id\`) REFERENCES \`events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "topics_id", "series_id", "teachings_id", "resources_id", "events_id", "redirects_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "topics_id", "series_id", "teachings_id", "resources_id", "events_id", "redirects_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_topics_id_idx\` ON \`payload_locked_documents_rels\` (\`topics_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_series_id_idx\` ON \`payload_locked_documents_rels\` (\`series_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_teachings_id_idx\` ON \`payload_locked_documents_rels\` (\`teachings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resources_id_idx\` ON \`payload_locked_documents_rels\` (\`resources_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
}
