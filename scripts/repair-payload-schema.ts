import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, ".payload/pilar.db");

type Backfill = {
  label: string;
  sql: string;
};

const backfills: Backfill[] = [
  {
    label: "communities",
    sql: `
      INSERT INTO communities_locales (_parent_id, _locale, name, label, description, location, schedule, cta_label, slug)
      SELECT c.id, COALESCE(c.locale, 'es'), c.name, c.label, c.description, c.location, c.schedule, c.cta_label, c.slug
      FROM communities c
      WHERE c.name IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM communities_locales cl
          WHERE cl._parent_id = c.id AND cl._locale = COALESCE(c.locale, 'es')
        );
    `
  },
  {
    label: "_communities_v",
    sql: `
      INSERT INTO _communities_v_locales (
        _parent_id, _locale, version_name, version_label, version_description,
        version_location, version_schedule, version_cta_label, version_slug
      )
      SELECT v.id, COALESCE(v.version_locale, 'es'), v.version_name, v.version_label, v.version_description,
        v.version_location, v.version_schedule, v.version_cta_label, v.version_slug
      FROM _communities_v v
      WHERE v.version_name IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM _communities_v_locales vl
          WHERE vl._parent_id = v.id AND vl._locale = COALESCE(v.version_locale, 'es')
        );
    `
  },
  {
    label: "teachings",
    sql: `
      INSERT INTO teachings_locales (
        _parent_id, _locale, title, excerpt, body, key_verse, slug,
        seo_title, seo_description, seo_canonical
      )
      SELECT t.id, COALESCE(t.locale, 'es'), t.title, t.excerpt, t.body, t.key_verse, t.slug,
        t.seo_title, t.seo_description, t.seo_canonical
      FROM teachings t
      WHERE t.title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM teachings_locales tl
          WHERE tl._parent_id = t.id AND tl._locale = COALESCE(t.locale, 'es')
        );
    `
  },
  {
    label: "_teachings_v",
    sql: `
      INSERT INTO _teachings_v_locales (
        _parent_id, _locale, version_title, version_excerpt, version_body, version_key_verse,
        version_slug, version_seo_title, version_seo_description, version_seo_canonical
      )
      SELECT v.id, COALESCE(v.version_locale, 'es'), v.version_title, v.version_excerpt, v.version_body,
        v.version_key_verse, v.version_slug, v.version_seo_title, v.version_seo_description, v.version_seo_canonical
      FROM _teachings_v v
      WHERE (v.version_title IS NOT NULL OR v.version_slug IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM _teachings_v_locales vl
          WHERE vl._parent_id = v.id AND vl._locale = COALESCE(v.version_locale, 'es')
        );
    `
  },
  {
    label: "resources",
    sql: `
      INSERT INTO resources_locales (
        _parent_id, _locale, title, excerpt, body, slug,
        seo_title, seo_description, seo_canonical
      )
      SELECT r.id, COALESCE(r.locale, 'es'), r.title, r.excerpt, r.body, r.slug,
        r.seo_title, r.seo_description, r.seo_canonical
      FROM resources r
      WHERE r.title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM resources_locales rl
          WHERE rl._parent_id = r.id AND rl._locale = COALESCE(r.locale, 'es')
        );
    `
  },
  {
    label: "_resources_v",
    sql: `
      INSERT INTO _resources_v_locales (
        _parent_id, _locale, version_title, version_excerpt, version_body, version_slug,
        version_seo_title, version_seo_description, version_seo_canonical
      )
      SELECT v.id, COALESCE(v.version_locale, 'es'), v.version_title, v.version_excerpt, v.version_body,
        v.version_slug, v.version_seo_title, v.version_seo_description, v.version_seo_canonical
      FROM _resources_v v
      WHERE (v.version_title IS NOT NULL OR v.version_slug IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM _resources_v_locales vl
          WHERE vl._parent_id = v.id AND vl._locale = COALESCE(v.version_locale, 'es')
        );
    `
  },
  {
    label: "events",
    sql: `
      INSERT INTO events_locales (_parent_id, _locale, title, excerpt, location, registration_label)
      SELECT e.id, COALESCE(e.locale, 'es'), e.title, e.excerpt, e.location, e.registration_label
      FROM events e
      WHERE e.title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM events_locales el
          WHERE el._parent_id = e.id AND el._locale = COALESCE(e.locale, 'es')
        );
    `
  },
  {
    label: "_events_v",
    sql: `
      INSERT INTO _events_v_locales (
        _parent_id, _locale, version_title, version_excerpt, version_location, version_registration_label
      )
      SELECT v.id, COALESCE(v.version_locale, 'es'), v.version_title, v.version_excerpt,
        v.version_location, v.version_registration_label
      FROM _events_v v
      WHERE v.version_title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM _events_v_locales vl
          WHERE vl._parent_id = v.id AND vl._locale = COALESCE(v.version_locale, 'es')
        );
    `
  },
  {
    label: "series",
    sql: `
      INSERT INTO series_locales (
        _parent_id, _locale, title, description, slug,
        seo_title, seo_description, seo_canonical
      )
      SELECT s.id, COALESCE(s.locale, 'es'), s.title, s.description, s.slug,
        s.seo_title, s.seo_description, s.seo_canonical
      FROM series s
      WHERE s.title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM series_locales sl
          WHERE sl._parent_id = s.id AND sl._locale = COALESCE(s.locale, 'es')
        );
    `
  },
  {
    label: "_series_v",
    sql: `
      INSERT INTO _series_v_locales (
        _parent_id, _locale, version_title, version_description, version_slug,
        version_seo_title, version_seo_description, version_seo_canonical
      )
      SELECT v.id, COALESCE(v.version_locale, 'es'), v.version_title, v.version_description,
        v.version_slug, v.version_seo_title, v.version_seo_description, v.version_seo_canonical
      FROM _series_v v
      WHERE v.version_title IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM _series_v_locales vl
          WHERE vl._parent_id = v.id AND vl._locale = COALESCE(v.version_locale, 'es')
        );
    `
  }
];

const legacyIndexes: Record<string, string[]> = {
  communities: ["communities_locale_idx", "communities_slug_idx"],
  teachings: ["teachings_locale_idx", "teachings_slug_idx"],
  resources: ["resources_locale_idx", "resources_slug_idx"],
  events: ["events_locale_idx"],
  series: ["series_locale_idx", "series_slug_idx"],
  _communities_v: ["_communities_v_version_version_locale_idx", "_communities_v_version_version_slug_idx"],
  _teachings_v: ["_teachings_v_version_version_locale_idx", "_teachings_v_version_version_slug_idx"],
  _resources_v: ["_resources_v_version_version_locale_idx", "_resources_v_version_version_slug_idx"],
  _events_v: ["_events_v_version_version_locale_idx"],
  _series_v: ["_series_v_version_version_locale_idx", "_series_v_version_version_slug_idx"]
};

async function dropLegacyIndexes(client: ReturnType<typeof createClient>) {
  for (const indexes of Object.values(legacyIndexes)) {
    for (const index of indexes) {
      await client.execute(`DROP INDEX IF EXISTS ${index};`);
    }
  }
}

const legacyColumns: Record<string, string[]> = {
  communities: ["name", "label", "description", "location", "schedule", "cta_label", "locale", "slug"],
  _communities_v: [
    "version_name",
    "version_label",
    "version_description",
    "version_location",
    "version_schedule",
    "version_cta_label",
    "version_locale",
    "version_slug"
  ],
  teachings: ["title", "excerpt", "body", "locale", "slug", "key_verse", "seo_title", "seo_description", "seo_canonical"],
  _teachings_v: [
    "version_title",
    "version_excerpt",
    "version_body",
    "version_locale",
    "version_key_verse",
    "version_slug",
    "version_seo_title",
    "version_seo_description",
    "version_seo_canonical"
  ],
  resources: ["title", "excerpt", "body", "locale", "slug", "seo_title", "seo_description", "seo_canonical"],
  _resources_v: [
    "version_title",
    "version_excerpt",
    "version_body",
    "version_locale",
    "version_slug",
    "version_seo_title",
    "version_seo_description",
    "version_seo_canonical"
  ],
  events: ["title", "excerpt", "location", "locale", "registration_label"],
  _events_v: ["version_title", "version_excerpt", "version_location", "version_locale", "version_registration_label"],
  series: ["title", "description", "locale", "slug", "seo_title", "seo_description", "seo_canonical"],
  _series_v: [
    "version_title",
    "version_description",
    "version_locale",
    "version_slug",
    "version_seo_title",
    "version_seo_description",
    "version_seo_canonical"
  ]
};

async function tableHasColumn(client: ReturnType<typeof createClient>, table: string, column: string) {
  const result = await client.execute(`PRAGMA table_info(${table});`);
  return result.rows.some((row) => row.name === column);
}

async function backfillLocales(client: ReturnType<typeof createClient>) {
  for (const backfill of backfills) {
    try {
      const result = await client.execute(backfill.sql);
      console.log(`Backfilled ${backfill.label}: ${result.rowsAffected} row(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Skipped ${backfill.label}: ${message}`);
    }
  }
}

async function dropLegacyColumns(client: ReturnType<typeof createClient>) {
  await dropLegacyIndexes(client);

  for (const [table, columns] of Object.entries(legacyColumns)) {
    for (const column of columns) {
      if (!(await tableHasColumn(client, table, column))) {
        continue;
      }

      await client.execute(`ALTER TABLE ${table} DROP COLUMN ${column};`);
      console.log(`Dropped ${table}.${column}`);
    }
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    console.error("Este script repara la base SQLite local. En Postgres sincroniza con PAYLOAD_DB_PUSH=true tras respaldar.");
    process.exit(1);
  }

  const client = createClient({ url: `file:${dbPath}` });

  console.log("Reparando esquema Payload (SQLite)...");
  await backfillLocales(client);
  await dropLegacyColumns(client);
  console.log("Listo. Reinicia `npm run dev` y vuelve a abrir /admin.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
