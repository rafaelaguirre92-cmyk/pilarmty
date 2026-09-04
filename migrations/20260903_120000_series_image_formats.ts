import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "series"
      ADD COLUMN "image_square_id" integer,
      ADD COLUMN "image_vertical_id" integer;

    ALTER TABLE "_series_v"
      ADD COLUMN "version_image_square_id" integer,
      ADD COLUMN "version_image_vertical_id" integer;

    ALTER TABLE "series"
      ADD CONSTRAINT "series_image_square_id_media_id_fk"
        FOREIGN KEY ("image_square_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "series_image_vertical_id_media_id_fk"
        FOREIGN KEY ("image_vertical_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_series_v"
      ADD CONSTRAINT "_series_v_version_image_square_id_media_id_fk"
        FOREIGN KEY ("version_image_square_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action,
      ADD CONSTRAINT "_series_v_version_image_vertical_id_media_id_fk"
        FOREIGN KEY ("version_image_vertical_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;

    CREATE INDEX "series_image_square_idx" ON "series" USING btree ("image_square_id");
    CREATE INDEX "series_image_vertical_idx" ON "series" USING btree ("image_vertical_id");
    CREATE INDEX "_series_v_version_version_image_square_idx"
      ON "_series_v" USING btree ("version_image_square_id");
    CREATE INDEX "_series_v_version_version_image_vertical_idx"
      ON "_series_v" USING btree ("version_image_vertical_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_series_v"
      DROP CONSTRAINT "_series_v_version_image_square_id_media_id_fk",
      DROP CONSTRAINT "_series_v_version_image_vertical_id_media_id_fk";

    ALTER TABLE "series"
      DROP CONSTRAINT "series_image_square_id_media_id_fk",
      DROP CONSTRAINT "series_image_vertical_id_media_id_fk";

    DROP INDEX "_series_v_version_version_image_square_idx";
    DROP INDEX "_series_v_version_version_image_vertical_idx";
    DROP INDEX "series_image_square_idx";
    DROP INDEX "series_image_vertical_idx";

    ALTER TABLE "_series_v"
      DROP COLUMN "version_image_square_id",
      DROP COLUMN "version_image_vertical_id";

    ALTER TABLE "series"
      DROP COLUMN "image_square_id",
      DROP COLUMN "image_vertical_id";
  `);
}
