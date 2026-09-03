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
import { markNotionSyncPending, syncPayloadToNotion } from "@/cms/hooks/notion-sync";
import {
  autoTranslateHook,
  markEnglishTranslationReviewed
} from "@/cms/hooks/translate";
import { previewUrl } from "@/cms/preview";
import { spotifyEpisodeId } from "@/lib/spotify";

function platformUrl(platform: "spotify" | "youtube") {
  return (value: unknown) => {
    if (!value) return true;
    if (typeof value !== "string") return "Debe ser una URL.";

    try {
      const allowed =
        platform === "youtube"
          ? ["youtube.com", "youtu.be"].includes(
              new URL(value).hostname.replace(/^www\./, "")
            )
          : Boolean(spotifyEpisodeId(value));
      return allowed
        ? true
        : platform === "youtube"
          ? "Usa un enlace válido de YouTube."
          : "Usa un enlace válido de un episodio de Spotify.";
    } catch {
      return "Debe ser una URL absoluta válida.";
    }
  };
}

export const Teachings: CollectionConfig = {
  slug: "teachings",
  defaultSort: "-teachingDate",
  labels: { singular: "Enseñanza", plural: "Enseñanzas" },
  admin: {
    hidden: false,
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "series", "author", "teachingDate", "_status"],
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "./cms/components/DocumentTitleEditor",
            exportName: "DocumentTitleEditor"
          },
          {
            path: "./cms/components/DocumentUrl",
            exportName: "DocumentUrl"
          },
          {
            path: "./cms/components/PublishDates",
            exportName: "PublishDates"
          },
        ]
      },
      views: {
        edit: {
          default: {
            Component: {
              path: "./cms/components/TeachingSEOView",
              exportName: "TeachingContentView"
            }
          },
          seo: {
            path: "/seo",
            Component: {
              path: "./cms/components/TeachingSEOView",
              exportName: "TeachingSEOView"
            },
            tab: {
              href: "/seo",
              label: "SEO",
              order: 200
            }
          }
        }
      },
      beforeList: [
        {
          path: "./cms/components/ListQuickFilters",
          exportName: "ListQuickFilters"
        }
      ]
    },
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
    beforeChange: [guardPublishedSlug, markNotionSyncPending, markEnglishTranslationReviewed],
    afterChange: [
      afterEditorialChange("teachings"),
      autoTranslateHook("teachings"),
      syncPayloadToNotion("teachings")
    ],
    afterDelete: [afterEditorialDelete("teachings")]
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contenido",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Título de la enseñanza",
              required: true,
              localized: true
            },
            {
              name: "body",
              type: "richText",
              label: "Notas y contenido",
              localized: true,
              editor: contentEditor
            },
          ]
        },
        {
          label: "SEO y Redes",
          fields: [
            slugField("title", true),
            seoFields,
            confirmSlugChangeField
          ]
        },
        {
          label: "Sincronización y Técnico",
          fields: [
            {
              name: "legacy",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description: "Marcar si pertenece a la importación legacy inicial."
              }
            },
            ...notionSyncFields,
            ...translationReviewFields,
            ...migrationFields
          ]
        }
      ]
    },
    // Sidebar fields (Metadata rápida)
    {
      name: "teachingDate",
      type: "date",
      label: "Fecha",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "MMMM do yyyy"
        }
      }
    },
    {
      name: "series",
      type: "relationship",
      relationTo: "series",
      label: "Serie o Evento",
      required: true,
      admin: {
        position: "sidebar",
        description: "Serie a la que pertenece esta enseñanza."
      }
    },
    {
      name: "episode",
      type: "number",
      label: "Número de episodio / capítulo",
      min: 1,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "authors",
      label: "Orador / Autor",
      admin: {
        position: "sidebar",
        components: {
          Cell: {
            path: "./cms/components/AuthorCell",
            exportName: "AuthorCell"
          }
        }
      }
    },
    {
      name: "durationMinutes",
      type: "number",
      label: "Duración (minutos)",
      min: 1,
      admin: {
        position: "sidebar"
      }
    },
    {
      name: "keyVerse",
      type: "text",
      label: "Pasaje bíblico clave",
      localized: true,
      maxLength: 120,
      admin: {
        position: "sidebar",
        placeholder: "ej. Marcos 8:22-9:1 o Juan 3:16",
        description: "Genera automáticamente tooltips con el texto bíblico."
      }
    },
    {
      name: "topics",
      type: "relationship",
      relationTo: "topics",
      hasMany: true,
      label: "Temas y Categorías",
      admin: {
        position: "sidebar",
        description: "Temas para clasificación y búsqueda."
      }
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Resumen editorial",
      localized: true,
      maxLength: 500,
      admin: {
        position: "sidebar",
        className: "creator-sidebar-section creator-sidebar-section--excerpt",
        description:
          "Una introducción breve para tarjetas, buscadores y redes sociales (máx. 500 caracteres)."
      }
    },
    {
      type: "group",
      label: "Multimedia y Enlaces",
      admin: {
        position: "sidebar",
        className: "creator-sidebar-section creator-sidebar-section--media"
      },
      fields: [
        {
          name: "youtubeUrl",
          type: "text",
          label: "Video de YouTube",
          validate: platformUrl("youtube"),
          admin: { placeholder: "https://www.youtube.com/watch?v=..." }
        },
        {
          name: "spotifyUrl",
          type: "text",
          label: "Episodio en Spotify",
          validate: platformUrl("spotify"),
          admin: { placeholder: "https://open.spotify.com/episode/..." }
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Portada o imagen principal"
        },
        {
          name: "mediaLinks",
          type: "array",
          label: "Recursos adjuntos",
          labels: { singular: "Recurso", plural: "Recursos" },
          fields: [
            {
              name: "label",
              type: "text",
              label: "Nombre del archivo / recurso",
              required: true,
              admin: { width: "50%" }
            },
            {
              name: "url",
              type: "text",
              label: "Enlace o URL",
              required: true,
              admin: { width: "50%" }
            }
          ]
        }
      ]
    }
  ]
};
