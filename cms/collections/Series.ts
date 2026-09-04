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
    {
      type: "collapsible",
      label: "Portadas de la serie",
      admin: {
        condition: (_data, siblingData) => siblingData?.kind === "series",
        description:
          "Carga cada composición por separado para que el sitio elija automáticamente la más adecuada.",
        initCollapsed: false
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Horizontal · 16:9",
          filterOptions: { mimeType: { contains: "image" } },
          admin: {
            description: "Formato recomendado: 1600 × 900 px. Es la portada principal y conserva las imágenes existentes."
          }
        },
        {
          name: "imageSquare",
          type: "upload",
          relationTo: "media",
          label: "Cuadrada · 1:1",
          filterOptions: { mimeType: { contains: "image" } },
          admin: { description: "Formato recomendado: 1200 × 1200 px." }
        },
        {
          name: "imageVertical",
          type: "upload",
          relationTo: "media",
          label: "Vertical · 9:16",
          filterOptions: { mimeType: { contains: "image" } },
          admin: { description: "Formato recomendado: 1080 × 1920 px." }
        }
      ]
    },
    seoFields,
    confirmSlugChangeField,
    ...translationReviewFields,
    ...migrationFields
  ]
};
