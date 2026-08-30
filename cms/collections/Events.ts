import type { CollectionConfig } from "payload";

import { authenticated, publishedOrAuthenticated } from "@/cms/access";
import { migrationFields, translationReviewFields } from "@/cms/fields/common";
import { afterEditorialChange, afterEditorialDelete } from "@/cms/hooks/content";
import {
  autoTranslateHook,
  markEnglishTranslationReviewed
} from "@/cms/hooks/translate";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Evento", plural: "Eventos" },
  admin: {
    hidden: false,
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "startDate", "location", "_status"]
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
    beforeChange: [markEnglishTranslationReviewed],
    afterChange: [afterEditorialChange("events"), autoTranslateHook("events")],
    afterDelete: [afterEditorialDelete("events")]
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Información",
          fields: [
            { name: "title", type: "text", label: "Nombre del evento", required: true, localized: true },
            { name: "excerpt", type: "textarea", label: "Descripción breve", maxLength: 360, localized: true, admin: { description: "Se muestra en Inicio y Visítanos." } },
            {
              type: "row",
              fields: [
                { name: "startDate", type: "date", label: "Inicio", required: true, admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } } },
                { name: "endDate", type: "date", label: "Fin", admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } } }
              ]
            },
            { name: "location", type: "text", label: "Lugar", localized: true, admin: { description: "Ejemplo: Auditorio Iglesia Pilar o enlace de Zoom." } }
          ]
        },
        {
          label: "Imagen y registro",
          fields: [
            { name: "image", type: "upload", relationTo: "media", label: "Imagen principal" },
            { name: "registrationUrl", type: "text", label: "Enlace de información o registro" },
            { name: "registrationLabel", type: "text", label: "Texto del botón", defaultValue: "Conocer más", maxLength: 40, localized: true }
          ]
        }
      ]
    },
    ...translationReviewFields,
    ...migrationFields
  ]
};
