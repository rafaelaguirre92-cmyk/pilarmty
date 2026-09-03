import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_series_kind" AS ENUM('series', 'event');
  CREATE TYPE "public"."enum_series_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__series_v_version_kind" AS ENUM('series', 'event');
  CREATE TYPE "public"."enum__series_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__series_v_published_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_teachings_sync_status" AS ENUM('pending', 'synced', 'conflict', 'error');
  CREATE TYPE "public"."enum_teachings_last_sync_source" AS ENUM('notion', 'payload');
  CREATE TYPE "public"."enum_teachings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__teachings_v_version_sync_status" AS ENUM('pending', 'synced', 'conflict', 'error');
  CREATE TYPE "public"."enum__teachings_v_version_last_sync_source" AS ENUM('notion', 'payload');
  CREATE TYPE "public"."enum__teachings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__teachings_v_published_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_resources_kind" AS ENUM('article', 'pillar');
  CREATE TYPE "public"."enum_resources_sync_status" AS ENUM('pending', 'synced', 'conflict', 'error');
  CREATE TYPE "public"."enum_resources_last_sync_source" AS ENUM('notion', 'payload');
  CREATE TYPE "public"."enum_resources_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resources_v_version_kind" AS ENUM('article', 'pillar');
  CREATE TYPE "public"."enum__resources_v_version_sync_status" AS ENUM('pending', 'synced', 'conflict', 'error');
  CREATE TYPE "public"."enum__resources_v_version_last_sync_source" AS ENUM('notion', 'payload');
  CREATE TYPE "public"."enum__resources_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resources_v_published_locale" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_sessions" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) with time zone,
	"expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric DEFAULT 0,
	"lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"alt" varchar NOT NULL,
	"caption" varchar,
	"migration_key" varchar,
	"prefix" varchar DEFAULT 'payload-media',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone,
	"url" varchar,
	"thumbnail_u_r_l" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"focal_x" numeric,
	"focal_y" numeric,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_social_url" varchar,
	"sizes_social_width" numeric,
	"sizes_social_height" numeric,
	"sizes_social_mime_type" varchar,
	"sizes_social_filesize" numeric,
	"sizes_social_filename" varchar
  );

  CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"bio" varchar,
	"profile_url" varchar,
	"image_id" integer,
	"migration_key" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone
  );

  CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"publish_page" boolean DEFAULT false,
	"unpublish_page" boolean DEFAULT false,
	"migration_key" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone
  );

  CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "enum_series_kind" DEFAULT 'series',
	"image_id" integer,
	"seo_no_index" boolean DEFAULT false,
	"seo_social_image_id" integer,
	"confirm_slug_change" boolean DEFAULT false,
	"translation_auto_generated" boolean DEFAULT false,
	"migration_key" varchar,
	"source_updated_at" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone,
	"_status" "enum_series_status" DEFAULT 'draft'
  );

  CREATE TABLE "series_locales" (
	"title" varchar,
	"slug" varchar,
	"description" varchar,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "_series_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_kind" "enum__series_v_version_kind" DEFAULT 'series',
	"version_image_id" integer,
	"version_seo_no_index" boolean DEFAULT false,
	"version_seo_social_image_id" integer,
	"version_confirm_slug_change" boolean DEFAULT false,
	"version_translation_auto_generated" boolean DEFAULT false,
	"version_migration_key" varchar,
	"version_source_updated_at" timestamp(3) with time zone,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version_deleted_at" timestamp(3) with time zone,
	"version__status" "enum__series_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__series_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_series_v_locales" (
	"version_title" varchar,
	"version_slug" varchar,
	"version_description" varchar,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "teachings_media_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar,
	"url" varchar
  );

  CREATE TABLE "teachings" (
	"id" serial PRIMARY KEY NOT NULL,
	"teaching_date" timestamp(3) with time zone,
	"series_id" integer,
	"episode" numeric,
	"author_id" integer,
	"duration_minutes" numeric,
	"youtube_url" varchar,
	"apple_podcasts_url" varchar,
	"image_id" integer,
	"featured" boolean DEFAULT false,
	"seo_no_index" boolean DEFAULT false,
	"seo_social_image_id" integer,
	"confirm_slug_change" boolean DEFAULT false,
	"legacy" boolean DEFAULT false,
	"notion_page_id" varchar,
	"notion_url" varchar,
	"sync_status" "enum_teachings_sync_status",
	"last_synced_at" timestamp(3) with time zone,
	"last_sync_source" "enum_teachings_last_sync_source",
	"sync_error" varchar,
	"translation_auto_generated" boolean DEFAULT false,
	"migration_key" varchar,
	"source_updated_at" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone,
	"_status" "enum_teachings_status" DEFAULT 'draft'
  );

  CREATE TABLE "teachings_locales" (
	"title" varchar,
	"excerpt" varchar,
	"body" jsonb,
	"key_verse" varchar,
	"slug" varchar,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "teachings_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"topics_id" integer
  );

  CREATE TABLE "_teachings_v_version_media_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar,
	"url" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_teachings_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_teaching_date" timestamp(3) with time zone,
	"version_series_id" integer,
	"version_episode" numeric,
	"version_author_id" integer,
	"version_duration_minutes" numeric,
	"version_youtube_url" varchar,
	"version_apple_podcasts_url" varchar,
	"version_image_id" integer,
	"version_featured" boolean DEFAULT false,
	"version_seo_no_index" boolean DEFAULT false,
	"version_seo_social_image_id" integer,
	"version_confirm_slug_change" boolean DEFAULT false,
	"version_legacy" boolean DEFAULT false,
	"version_notion_page_id" varchar,
	"version_notion_url" varchar,
	"version_sync_status" "enum__teachings_v_version_sync_status",
	"version_last_synced_at" timestamp(3) with time zone,
	"version_last_sync_source" "enum__teachings_v_version_last_sync_source",
	"version_sync_error" varchar,
	"version_translation_auto_generated" boolean DEFAULT false,
	"version_migration_key" varchar,
	"version_source_updated_at" timestamp(3) with time zone,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version_deleted_at" timestamp(3) with time zone,
	"version__status" "enum__teachings_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__teachings_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_teachings_v_locales" (
	"version_title" varchar,
	"version_excerpt" varchar,
	"version_body" jsonb,
	"version_key_verse" varchar,
	"version_slug" varchar,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "_teachings_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"topics_id" integer
  );

  CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_date" timestamp(3) with time zone,
	"kind" "enum_resources_kind" DEFAULT 'article',
	"author_id" integer,
	"image_id" integer,
	"featured" boolean DEFAULT false,
	"seo_no_index" boolean DEFAULT false,
	"seo_social_image_id" integer,
	"confirm_slug_change" boolean DEFAULT false,
	"notion_page_id" varchar,
	"notion_url" varchar,
	"sync_status" "enum_resources_sync_status",
	"last_synced_at" timestamp(3) with time zone,
	"last_sync_source" "enum_resources_last_sync_source",
	"sync_error" varchar,
	"translation_auto_generated" boolean DEFAULT false,
	"migration_key" varchar,
	"source_updated_at" timestamp(3) with time zone,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(3) with time zone,
	"_status" "enum_resources_status" DEFAULT 'draft'
  );

  CREATE TABLE "resources_locales" (
	"title" varchar,
	"excerpt" varchar,
	"body" jsonb,
	"slug" varchar,
	"seo_title" varchar,
	"seo_description" varchar,
	"seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "resources_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"topics_id" integer,
	"teachings_id" integer
  );

  CREATE TABLE "_resources_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_content_date" timestamp(3) with time zone,
	"version_kind" "enum__resources_v_version_kind" DEFAULT 'article',
	"version_author_id" integer,
	"version_image_id" integer,
	"version_featured" boolean DEFAULT false,
	"version_seo_no_index" boolean DEFAULT false,
	"version_seo_social_image_id" integer,
	"version_confirm_slug_change" boolean DEFAULT false,
	"version_notion_page_id" varchar,
	"version_notion_url" varchar,
	"version_sync_status" "enum__resources_v_version_sync_status",
	"version_last_synced_at" timestamp(3) with time zone,
	"version_last_sync_source" "enum__resources_v_version_last_sync_source",
	"version_sync_error" varchar,
	"version_translation_auto_generated" boolean DEFAULT false,
	"version_migration_key" varchar,
	"version_source_updated_at" timestamp(3) with time zone,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version_deleted_at" timestamp(3) with time zone,
	"version__status" "enum__resources_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__resources_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_resources_v_locales" (
	"version_title" varchar,
	"version_excerpt" varchar,
	"version_body" jsonb,
	"version_slug" varchar,
	"version_seo_title" varchar,
	"version_seo_description" varchar,
	"version_seo_canonical" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "_resources_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"topics_id" integer,
	"teachings_id" integer
  );

  CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar NOT NULL,
	"destination" varchar NOT NULL,
	"permanent" boolean DEFAULT true,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"executed_at" timestamp(3) with time zone NOT NULL,
	"completed_at" timestamp(3) with time zone NOT NULL,
	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
	"task_i_d" varchar NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"state" "enum_payload_jobs_log_state" NOT NULL,
	"error" jsonb
  );

  CREATE TABLE "payload_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"input" jsonb,
	"completed_at" timestamp(3) with time zone,
	"total_tried" numeric DEFAULT 0,
	"has_error" boolean DEFAULT false,
	"error" jsonb,
	"task_slug" "enum_payload_jobs_task_slug",
	"queue" varchar DEFAULT 'default',
	"wait_until" timestamp(3) with time zone,
	"processing" boolean DEFAULT false,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"global_slug" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer,
	"media_id" integer,
	"authors_id" integer,
	"topics_id" integer,
	"series_id" integer,
	"teachings_id" integer,
	"resources_id" integer,
	"redirects_id" integer
  );

  CREATE TABLE "payload_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
  );

  CREATE TABLE "payload_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"batch" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series" ADD CONSTRAINT "series_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series" ADD CONSTRAINT "series_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_locales" ADD CONSTRAINT "series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_parent_id_series_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v_locales" ADD CONSTRAINT "_series_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_series_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teachings_media_links" ADD CONSTRAINT "teachings_media_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teachings" ADD CONSTRAINT "teachings_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teachings" ADD CONSTRAINT "teachings_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teachings" ADD CONSTRAINT "teachings_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teachings" ADD CONSTRAINT "teachings_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "teachings_locales" ADD CONSTRAINT "teachings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teachings_rels" ADD CONSTRAINT "teachings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teachings_rels" ADD CONSTRAINT "teachings_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teachings_v_version_media_links" ADD CONSTRAINT "_teachings_v_version_media_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teachings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teachings_v" ADD CONSTRAINT "_teachings_v_parent_id_teachings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."teachings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teachings_v" ADD CONSTRAINT "_teachings_v_version_series_id_series_id_fk" FOREIGN KEY ("version_series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teachings_v" ADD CONSTRAINT "_teachings_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teachings_v" ADD CONSTRAINT "_teachings_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teachings_v" ADD CONSTRAINT "_teachings_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teachings_v_locales" ADD CONSTRAINT "_teachings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teachings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teachings_v_rels" ADD CONSTRAINT "_teachings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_teachings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teachings_v_rels" ADD CONSTRAINT "_teachings_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_seo_social_image_id_media_id_fk" FOREIGN KEY ("seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources_locales" ADD CONSTRAINT "resources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_rels" ADD CONSTRAINT "resources_rels_teachings_fk" FOREIGN KEY ("teachings_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_parent_id_resources_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_seo_social_image_id_media_id_fk" FOREIGN KEY ("version_seo_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v_locales" ADD CONSTRAINT "_resources_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resources_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_resources_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_resources_v_rels" ADD CONSTRAINT "_resources_v_rels_teachings_fk" FOREIGN KEY ("teachings_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teachings_fk" FOREIGN KEY ("teachings_id") REFERENCES "public"."teachings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "media_migration_key_idx" ON "media" USING btree ("migration_key");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE INDEX "media_deleted_at_idx" ON "media" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_social_sizes_social_filename_idx" ON "media" USING btree ("sizes_social_filename");
  CREATE UNIQUE INDEX "authors_name_idx" ON "authors" USING btree ("name");
  CREATE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_image_idx" ON "authors" USING btree ("image_id");
  CREATE UNIQUE INDEX "authors_migration_key_idx" ON "authors" USING btree ("migration_key");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "authors_deleted_at_idx" ON "authors" USING btree ("deleted_at");
  CREATE UNIQUE INDEX "topics_name_idx" ON "topics" USING btree ("name");
  CREATE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE UNIQUE INDEX "topics_migration_key_idx" ON "topics" USING btree ("migration_key");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics_deleted_at_idx" ON "topics" USING btree ("deleted_at");
  CREATE INDEX "series_image_idx" ON "series" USING btree ("image_id");
  CREATE INDEX "series_seo_seo_social_image_idx" ON "series" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "series_migration_key_idx" ON "series" USING btree ("migration_key");
  CREATE INDEX "series_updated_at_idx" ON "series" USING btree ("updated_at");
  CREATE INDEX "series_created_at_idx" ON "series" USING btree ("created_at");
  CREATE INDEX "series_deleted_at_idx" ON "series" USING btree ("deleted_at");
  CREATE INDEX "series__status_idx" ON "series" USING btree ("_status");
  CREATE INDEX "series_slug_idx" ON "series_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "series_locales_locale_parent_id_unique" ON "series_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_series_v_parent_idx" ON "_series_v" USING btree ("parent_id");
  CREATE INDEX "_series_v_version_version_image_idx" ON "_series_v" USING btree ("version_image_id");
  CREATE INDEX "_series_v_version_seo_version_seo_social_image_idx" ON "_series_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_series_v_version_version_migration_key_idx" ON "_series_v" USING btree ("version_migration_key");
  CREATE INDEX "_series_v_version_version_updated_at_idx" ON "_series_v" USING btree ("version_updated_at");
  CREATE INDEX "_series_v_version_version_created_at_idx" ON "_series_v" USING btree ("version_created_at");
  CREATE INDEX "_series_v_version_version_deleted_at_idx" ON "_series_v" USING btree ("version_deleted_at");
  CREATE INDEX "_series_v_version_version__status_idx" ON "_series_v" USING btree ("version__status");
  CREATE INDEX "_series_v_created_at_idx" ON "_series_v" USING btree ("created_at");
  CREATE INDEX "_series_v_updated_at_idx" ON "_series_v" USING btree ("updated_at");
  CREATE INDEX "_series_v_snapshot_idx" ON "_series_v" USING btree ("snapshot");
  CREATE INDEX "_series_v_published_locale_idx" ON "_series_v" USING btree ("published_locale");
  CREATE INDEX "_series_v_latest_idx" ON "_series_v" USING btree ("latest");
  CREATE INDEX "_series_v_autosave_idx" ON "_series_v" USING btree ("autosave");
  CREATE INDEX "_series_v_version_version_slug_idx" ON "_series_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_series_v_locales_locale_parent_id_unique" ON "_series_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teachings_media_links_order_idx" ON "teachings_media_links" USING btree ("_order");
  CREATE INDEX "teachings_media_links_parent_id_idx" ON "teachings_media_links" USING btree ("_parent_id");
  CREATE INDEX "teachings_series_idx" ON "teachings" USING btree ("series_id");
  CREATE INDEX "teachings_author_idx" ON "teachings" USING btree ("author_id");
  CREATE INDEX "teachings_image_idx" ON "teachings" USING btree ("image_id");
  CREATE INDEX "teachings_seo_seo_social_image_idx" ON "teachings" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "teachings_notion_page_id_idx" ON "teachings" USING btree ("notion_page_id");
  CREATE UNIQUE INDEX "teachings_migration_key_idx" ON "teachings" USING btree ("migration_key");
  CREATE INDEX "teachings_updated_at_idx" ON "teachings" USING btree ("updated_at");
  CREATE INDEX "teachings_created_at_idx" ON "teachings" USING btree ("created_at");
  CREATE INDEX "teachings_deleted_at_idx" ON "teachings" USING btree ("deleted_at");
  CREATE INDEX "teachings__status_idx" ON "teachings" USING btree ("_status");
  CREATE INDEX "teachings_slug_idx" ON "teachings_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "teachings_locales_locale_parent_id_unique" ON "teachings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teachings_rels_order_idx" ON "teachings_rels" USING btree ("order");
  CREATE INDEX "teachings_rels_parent_idx" ON "teachings_rels" USING btree ("parent_id");
  CREATE INDEX "teachings_rels_path_idx" ON "teachings_rels" USING btree ("path");
  CREATE INDEX "teachings_rels_topics_id_idx" ON "teachings_rels" USING btree ("topics_id");
  CREATE INDEX "_teachings_v_version_media_links_order_idx" ON "_teachings_v_version_media_links" USING btree ("_order");
  CREATE INDEX "_teachings_v_version_media_links_parent_id_idx" ON "_teachings_v_version_media_links" USING btree ("_parent_id");
  CREATE INDEX "_teachings_v_parent_idx" ON "_teachings_v" USING btree ("parent_id");
  CREATE INDEX "_teachings_v_version_version_series_idx" ON "_teachings_v" USING btree ("version_series_id");
  CREATE INDEX "_teachings_v_version_version_author_idx" ON "_teachings_v" USING btree ("version_author_id");
  CREATE INDEX "_teachings_v_version_version_image_idx" ON "_teachings_v" USING btree ("version_image_id");
  CREATE INDEX "_teachings_v_version_seo_version_seo_social_image_idx" ON "_teachings_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_teachings_v_version_version_notion_page_id_idx" ON "_teachings_v" USING btree ("version_notion_page_id");
  CREATE INDEX "_teachings_v_version_version_migration_key_idx" ON "_teachings_v" USING btree ("version_migration_key");
  CREATE INDEX "_teachings_v_version_version_updated_at_idx" ON "_teachings_v" USING btree ("version_updated_at");
  CREATE INDEX "_teachings_v_version_version_created_at_idx" ON "_teachings_v" USING btree ("version_created_at");
  CREATE INDEX "_teachings_v_version_version_deleted_at_idx" ON "_teachings_v" USING btree ("version_deleted_at");
  CREATE INDEX "_teachings_v_version_version__status_idx" ON "_teachings_v" USING btree ("version__status");
  CREATE INDEX "_teachings_v_created_at_idx" ON "_teachings_v" USING btree ("created_at");
  CREATE INDEX "_teachings_v_updated_at_idx" ON "_teachings_v" USING btree ("updated_at");
  CREATE INDEX "_teachings_v_snapshot_idx" ON "_teachings_v" USING btree ("snapshot");
  CREATE INDEX "_teachings_v_published_locale_idx" ON "_teachings_v" USING btree ("published_locale");
  CREATE INDEX "_teachings_v_latest_idx" ON "_teachings_v" USING btree ("latest");
  CREATE INDEX "_teachings_v_autosave_idx" ON "_teachings_v" USING btree ("autosave");
  CREATE INDEX "_teachings_v_version_version_slug_idx" ON "_teachings_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_teachings_v_locales_locale_parent_id_unique" ON "_teachings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_teachings_v_rels_order_idx" ON "_teachings_v_rels" USING btree ("order");
  CREATE INDEX "_teachings_v_rels_parent_idx" ON "_teachings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_teachings_v_rels_path_idx" ON "_teachings_v_rels" USING btree ("path");
  CREATE INDEX "_teachings_v_rels_topics_id_idx" ON "_teachings_v_rels" USING btree ("topics_id");
  CREATE INDEX "resources_author_idx" ON "resources" USING btree ("author_id");
  CREATE INDEX "resources_image_idx" ON "resources" USING btree ("image_id");
  CREATE INDEX "resources_seo_seo_social_image_idx" ON "resources" USING btree ("seo_social_image_id");
  CREATE UNIQUE INDEX "resources_notion_page_id_idx" ON "resources" USING btree ("notion_page_id");
  CREATE UNIQUE INDEX "resources_migration_key_idx" ON "resources" USING btree ("migration_key");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "resources_deleted_at_idx" ON "resources" USING btree ("deleted_at");
  CREATE INDEX "resources__status_idx" ON "resources" USING btree ("_status");
  CREATE INDEX "resources_slug_idx" ON "resources_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "resources_locales_locale_parent_id_unique" ON "resources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "resources_rels_order_idx" ON "resources_rels" USING btree ("order");
  CREATE INDEX "resources_rels_parent_idx" ON "resources_rels" USING btree ("parent_id");
  CREATE INDEX "resources_rels_path_idx" ON "resources_rels" USING btree ("path");
  CREATE INDEX "resources_rels_topics_id_idx" ON "resources_rels" USING btree ("topics_id");
  CREATE INDEX "resources_rels_teachings_id_idx" ON "resources_rels" USING btree ("teachings_id");
  CREATE INDEX "_resources_v_parent_idx" ON "_resources_v" USING btree ("parent_id");
  CREATE INDEX "_resources_v_version_version_author_idx" ON "_resources_v" USING btree ("version_author_id");
  CREATE INDEX "_resources_v_version_version_image_idx" ON "_resources_v" USING btree ("version_image_id");
  CREATE INDEX "_resources_v_version_seo_version_seo_social_image_idx" ON "_resources_v" USING btree ("version_seo_social_image_id");
  CREATE INDEX "_resources_v_version_version_notion_page_id_idx" ON "_resources_v" USING btree ("version_notion_page_id");
  CREATE INDEX "_resources_v_version_version_migration_key_idx" ON "_resources_v" USING btree ("version_migration_key");
  CREATE INDEX "_resources_v_version_version_updated_at_idx" ON "_resources_v" USING btree ("version_updated_at");
  CREATE INDEX "_resources_v_version_version_created_at_idx" ON "_resources_v" USING btree ("version_created_at");
  CREATE INDEX "_resources_v_version_version_deleted_at_idx" ON "_resources_v" USING btree ("version_deleted_at");
  CREATE INDEX "_resources_v_version_version__status_idx" ON "_resources_v" USING btree ("version__status");
  CREATE INDEX "_resources_v_created_at_idx" ON "_resources_v" USING btree ("created_at");
  CREATE INDEX "_resources_v_updated_at_idx" ON "_resources_v" USING btree ("updated_at");
  CREATE INDEX "_resources_v_snapshot_idx" ON "_resources_v" USING btree ("snapshot");
  CREATE INDEX "_resources_v_published_locale_idx" ON "_resources_v" USING btree ("published_locale");
  CREATE INDEX "_resources_v_latest_idx" ON "_resources_v" USING btree ("latest");
  CREATE INDEX "_resources_v_autosave_idx" ON "_resources_v" USING btree ("autosave");
  CREATE INDEX "_resources_v_version_version_slug_idx" ON "_resources_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_resources_v_locales_locale_parent_id_unique" ON "_resources_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_resources_v_rels_order_idx" ON "_resources_v_rels" USING btree ("order");
  CREATE INDEX "_resources_v_rels_parent_idx" ON "_resources_v_rels" USING btree ("parent_id");
  CREATE INDEX "_resources_v_rels_path_idx" ON "_resources_v_rels" USING btree ("path");
  CREATE INDEX "_resources_v_rels_topics_id_idx" ON "_resources_v_rels" USING btree ("topics_id");
  CREATE INDEX "_resources_v_rels_teachings_id_idx" ON "_resources_v_rels" USING btree ("teachings_id");
  CREATE UNIQUE INDEX "redirects_source_idx" ON "redirects" USING btree ("source");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_series_id_idx" ON "payload_locked_documents_rels" USING btree ("series_id");
  CREATE INDEX "payload_locked_documents_rels_teachings_id_idx" ON "payload_locked_documents_rels" USING btree ("teachings_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "series" CASCADE;
  DROP TABLE "series_locales" CASCADE;
  DROP TABLE "_series_v" CASCADE;
  DROP TABLE "_series_v_locales" CASCADE;
  DROP TABLE "teachings_media_links" CASCADE;
  DROP TABLE "teachings" CASCADE;
  DROP TABLE "teachings_locales" CASCADE;
  DROP TABLE "teachings_rels" CASCADE;
  DROP TABLE "_teachings_v_version_media_links" CASCADE;
  DROP TABLE "_teachings_v" CASCADE;
  DROP TABLE "_teachings_v_locales" CASCADE;
  DROP TABLE "_teachings_v_rels" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "resources_locales" CASCADE;
  DROP TABLE "resources_rels" CASCADE;
  DROP TABLE "_resources_v" CASCADE;
  DROP TABLE "_resources_v_locales" CASCADE;
  DROP TABLE "_resources_v_rels" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_series_kind";
  DROP TYPE "public"."enum_series_status";
  DROP TYPE "public"."enum__series_v_version_kind";
  DROP TYPE "public"."enum__series_v_version_status";
  DROP TYPE "public"."enum__series_v_published_locale";
  DROP TYPE "public"."enum_teachings_sync_status";
  DROP TYPE "public"."enum_teachings_last_sync_source";
  DROP TYPE "public"."enum_teachings_status";
  DROP TYPE "public"."enum__teachings_v_version_sync_status";
  DROP TYPE "public"."enum__teachings_v_version_last_sync_source";
  DROP TYPE "public"."enum__teachings_v_version_status";
  DROP TYPE "public"."enum__teachings_v_published_locale";
  DROP TYPE "public"."enum_resources_kind";
  DROP TYPE "public"."enum_resources_sync_status";
  DROP TYPE "public"."enum_resources_last_sync_source";
  DROP TYPE "public"."enum_resources_status";
  DROP TYPE "public"."enum__resources_v_version_kind";
  DROP TYPE "public"."enum__resources_v_version_sync_status";
  DROP TYPE "public"."enum__resources_v_version_last_sync_source";
  DROP TYPE "public"."enum__resources_v_version_status";
  DROP TYPE "public"."enum__resources_v_published_locale";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
