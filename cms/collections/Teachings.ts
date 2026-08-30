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

function platformUrl(platform: "apple" | "youtube") {
  return (value: unknown) => {
    if (!value) return true;
    if (typeof value !== "string") return "Debe ser una URL.";

    try {
      const hostname = new URL(value).hostname.replace(/^www\./, "");
      const allowed =
        platform === "youtube"
          ? hostname === "youtube.com" || hostname === "youtu.be"
          : hostname === "podcasts.apple.com";
      return allowed
        ? true
        : platform === "youtube"
          ? "Usa un enlace válido de YouTube."
          : "Usa un enlace válido de Apple Podcasts.";
    } catch {
      return "Debe ser una URL absoluta válida.";
    }
  };
}

export const Teachings: CollectionConfig = {
  slug: "teachings",
  labels: { singular: "Enseñanza", plural: "Enseñanzas" },
  admin: {
    hidden: false,
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "series", "teachingDate", "format", "_status"],
    preview: previewUrl("teachings"),
    livePreview: { url: previewUrl("teachings") }
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
      afterEditorialChange("teachings"),
      autoTranslateHook("teachings"),
      syncPayloadToNotion("teachings")
    ],
    afterDelete: [afterEditorialDelete("teachings")]
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
            { type: "row", fields: [{ name: "teachingDate", type: "date", label: "Fecha de la enseñanza", admin: { width: "50%", date: { pickerAppearance: "dayOnly", displayFormat: "MMMM do yyyy" } } }] },
            { type: "row", fields: [{ name: "series", type: "relationship", relationTo: "series", label: "Serie o evento", required: true, admin: { width: "70%" } }, { name: "episode", type: "number", label: "Episodio", min: 1, admin: { width: "30%" } }] },
            { name: "author", type: "relationship", relationTo: "authors", label: "Autor u orador" },
            { name: "keyVerse", type: "text", label: "Versículo clave", localized: true, maxLength: 120 },
            { name: "topics", type: "relationship", relationTo: "topics", hasMany: true, label: "Temas", admin: { description: "Usa pocos temas consistentes para mejorar navegación y búsqueda." } }
      ]
    },
    {
      type: "collapsible",
      label: "Medios",
      admin: { initCollapsed: false },
      fields: [
            { type: "row", fields: [{ name: "format", type: "select", label: "Formato principal", defaultValue: "video", options: [{ label: "Video", value: "video" }, { label: "Audio", value: "audio" }, { label: "Audio + video", value: "mixed" }, { label: "Texto", value: "text" }], admin: { width: "50%" } }, { name: "durationMinutes", type: "number", label: "Duración en minutos", min: 1, admin: { width: "50%" } }] },
            { type: "row", fields: [
              { name: "youtubeUrl", type: "text", label: "Video de YouTube", validate: platformUrl("youtube"), admin: { width: "50%", description: "Pega el enlace completo del video." } },
              { name: "applePodcastsUrl", type: "text", label: "Episodio en Apple Podcasts", validate: platformUrl("apple"), admin: { width: "50%", description: "Pega el enlace completo del episodio." } }
            ] },
            { name: "image", type: "upload", relationTo: "media", label: "Imagen principal" },
            { name: "mediaLinks", type: "array", label: "Audio, video y materiales", fields: [{ name: "label", type: "text", label: "Nombre", required: true }, { name: "url", type: "text", label: "URL", required: true }] }
      ]
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
    { name: "legacy", type: "checkbox", defaultValue: false, admin: { hidden: true } },
    ...notionSyncFields,
    ...translationReviewFields,
    ...migrationFields
  ]
};
