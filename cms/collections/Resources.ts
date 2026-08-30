import type { CollectionConfig } from "payload";

import { authenticated, publishedOrAuthenticated } from "@/cms/access";
import {
  confirmSlugChangeField,
  migrationFields,
  notionSyncFields,
  translationReviewFields
} from "@/cms/fields/common";
import { contentEditor } from "@/cms/fields/editor";
import { seoFields } from "@/cms/fields/seo";
import { slugField } from "@/cms/fields/slug";
import {
  afterEditorialChange,
  afterEditorialDelete,
  guardPublishedSlug
} from "@/cms/hooks/content";
import { syncPayloadToNotion } from "@/cms/hooks/notion-sync";
import {
  autoTranslateHook,
  markEnglishTranslationReviewed
} from "@/cms/hooks/translate";
import { previewUrl } from "@/cms/preview";

export const Resources: CollectionConfig = {
  slug: "resources",
  labels: { singular: "Artículo", plural: "Artículos" },
  admin: {
    hidden: false,
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "kind", "contentDate", "_status"],
    preview: previewUrl("resources"),
    livePreview: { url: previewUrl("resources") }
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
    afterChange: [
      afterEditorialChange("resources"),
      autoTranslateHook("resources"),
      syncPayloadToNotion("resources")
    ],
    afterDelete: [afterEditorialDelete("resources")]
  },
  fields: [
    {
      type: "collapsible",
      label: "Contenido",
      admin: { initCollapsed: false },
      fields: [
            { name: "title", type: "text", label: "Título", required: true, localized: true },
            { name: "excerpt", type: "textarea", label: "Resumen", localized: true, maxLength: 500, admin: { description: "Una introducción breve para tarjetas, buscadores y redes sociales." } },
            { name: "body", type: "richText", label: "Contenido", localized: true, editor: contentEditor }
      ]
    },
    {
      type: "collapsible",
      label: "Detalles",
      admin: { initCollapsed: false },
      fields: [
            { type: "row", fields: [{ name: "contentDate", type: "date", label: "Fecha editorial", admin: { width: "50%", date: { pickerAppearance: "dayOnly" } } }] },
            { name: "kind", type: "select", label: "Tipo", required: true, defaultValue: "article", options: [{ label: "Artículo", value: "article" }, { label: "Contenido pilar", value: "pillar" }] },
            { name: "author", type: "relationship", relationTo: "authors", label: "Autor" },
            { name: "topics", type: "relationship", relationTo: "topics", hasMany: true, label: "Temas", admin: { description: "Usa pocos temas consistentes para mejorar navegación y búsqueda." } },
            { name: "relatedTeachings", type: "relationship", relationTo: "teachings", hasMany: true, label: "Enseñanzas relacionadas" }
      ]
    },
    {
      type: "collapsible",
      label: "Imagen",
      admin: { initCollapsed: false },
      fields: [{ name: "image", type: "upload", relationTo: "media", label: "Imagen principal", admin: { description: "La biblioteca solicita texto alternativo y genera versiones para tarjeta y redes." } }]
    },
    {
      type: "collapsible",
      label: "Distribución y SEO",
      admin: { initCollapsed: false },
      fields: [
            { name: "featured", type: "checkbox", label: "Destacar en el sitio", defaultValue: false },
            slugField("title", true),
            seoFields,
            confirmSlugChangeField
      ]
    },
    ...notionSyncFields,
    ...translationReviewFields,
    ...migrationFields
  ]
};
