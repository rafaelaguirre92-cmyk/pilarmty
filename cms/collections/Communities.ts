import type { CollectionConfig } from "payload";

import { authenticated, publishedOrAuthenticated } from "@/cms/access";
import { confirmSlugChangeField, migrationFields, translationReviewFields } from "@/cms/fields/common";
import { slugField } from "@/cms/fields/slug";
import { afterEditorialChange, afterEditorialDelete, guardPublishedSlug } from "@/cms/hooks/content";
import {
  autoTranslateHook,
  markEnglishTranslationReviewed
} from "@/cms/hooks/translate";

export const Communities: CollectionConfig = {
  slug: "communities",
  labels: { singular: "Comunidad", plural: "Comunidades" },
  admin: {
    hidden: false,
    useAsTitle: "name",
    group: "Contenido",
    defaultColumns: ["name", "location", "schedule", "_status"]
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
    afterChange: [afterEditorialChange("communities"), autoTranslateHook("communities")],
    afterDelete: [afterEditorialDelete("communities")]
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Información",
          fields: [
            { name: "name", type: "text", label: "Nombre", required: true, localized: true },
            { name: "label", type: "text", label: "Tipo o etiqueta", defaultValue: "Comunidad misional", localized: true },
            { name: "description", type: "textarea", label: "Descripción", required: true, maxLength: 700, localized: true },
            { name: "image", type: "upload", relationTo: "media", label: "Imagen principal" }
          ]
        },
        {
          label: "Ubicación y contacto",
          fields: [
            { name: "location", type: "text", label: "Zona o ubicación", required: true, localized: true },
            { name: "schedule", type: "text", label: "Horario", required: true, localized: true },
            { name: "ctaLabel", type: "text", label: "Texto del botón", defaultValue: "Más información", maxLength: 40, localized: true },
            { name: "ctaUrl", type: "text", label: "Enlace", defaultValue: "#unirme" }
          ]
        },
        {
          label: "Publicación",
          fields: [
            { type: "row", fields: [{ name: "sortOrder", type: "number", label: "Orden", defaultValue: 1, min: 1, admin: { width: "50%" } }] },
            slugField("name", true),
            confirmSlugChangeField
          ]
        }
      ]
    },
    ...translationReviewFields,
    ...migrationFields
  ]
};
