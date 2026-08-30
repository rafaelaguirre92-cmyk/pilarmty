import type { CollectionConfig } from "payload";

import { authenticated, publishedOrAuthenticated } from "@/cms/access";
import {
  confirmSlugChangeField,
  migrationFields,
  translationReviewFields
} from "@/cms/fields/common";
import { seoFields } from "@/cms/fields/seo";
import { slugField } from "@/cms/fields/slug";
import {
  afterEditorialChange,
  afterEditorialDelete,
  guardPublishedSlug
} from "@/cms/hooks/content";
import {
  autoTranslateHook,
  markEnglishTranslationReviewed
} from "@/cms/hooks/translate";
import { previewUrl } from "@/cms/preview";

export const Series: CollectionConfig = {
  slug: "series",
  labels: { singular: "Serie o evento", plural: "Series y eventos" },
  admin: {
    hidden: true,
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "kind", "_status"],
    preview: previewUrl("series"),
    livePreview: { url: previewUrl("series") }
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  trash: true,
  versions: {
    maxPerDoc: 50,
    drafts: { autosave: { interval: 2000 }, schedulePublish: true, validate: true }
  },
  hooks: {
    beforeChange: [guardPublishedSlug, markEnglishTranslationReviewed],
    afterChange: [afterEditorialChange("series"), autoTranslateHook("series")],
    afterDelete: [afterEditorialDelete("series")]
  },
  fields: [
    { name: "title", type: "text", label: "Título", required: true, localized: true },
    slugField("title", true),
    {
      name: "kind",
      type: "select",
      label: "Tipo",
      required: true,
      defaultValue: "series",
      options: [
        { label: "Serie", value: "series" },
        { label: "Evento", value: "event" }
      ]
    },
    { name: "description", type: "textarea", label: "Descripción", localized: true },
    { name: "image", type: "upload", relationTo: "media", label: "Imagen principal" },
    seoFields,
    confirmSlugChangeField,
    ...translationReviewFields,
    ...migrationFields
  ]
};
