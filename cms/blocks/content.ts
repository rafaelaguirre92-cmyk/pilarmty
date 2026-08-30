import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "callout",
  labels: { singular: "Destacado", plural: "Destacados" },
  fields: [
    { name: "text", type: "textarea", label: "Texto", required: true },
    {
      name: "tone",
      type: "select",
      label: "Estilo",
      defaultValue: "note",
      options: [
        { label: "Nota", value: "note" },
        { label: "Importante", value: "important" }
      ]
    }
  ]
};

export const EmbedBlock: Block = {
  slug: "embed",
  labels: { singular: "Enlace o video", plural: "Enlaces y videos" },
  fields: [
    { name: "url", type: "text", label: "URL", required: true },
    { name: "label", type: "text", label: "Texto del enlace" }
  ]
};

export const AccordionBlock: Block = {
  slug: "accordion",
  labels: { singular: "Desplegable", plural: "Desplegables" },
  fields: [
    { name: "title", type: "text", label: "Título", required: true },
    { name: "content", type: "textarea", label: "Contenido", required: true }
  ]
};

export const DownloadBlock: Block = {
  slug: "download",
  labels: { singular: "Archivo", plural: "Archivos" },
  fields: [
    { name: "file", type: "upload", relationTo: "media", required: true },
    { name: "label", type: "text", label: "Texto del botón" }
  ]
};

