import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Archivo", plural: "Biblioteca multimedia" },
  admin: { hidden: false, useAsTitle: "filename", group: "Contenido" },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated
  },
  upload: {
    staticDir: "public/payload-media",
    mimeTypes: ["image/*", "audio/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 250, position: "centre" },
      { name: "card", width: 900, height: 560, position: "centre" },
      { name: "social", width: 1200, height: 630, position: "centre" }
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true
  },
  trash: true,
  fields: [
    { name: "alt", type: "text", label: "Texto alternativo", required: true },
    { name: "caption", type: "text", label: "Pie de imagen" },
    { name: "migrationKey", type: "text", unique: true, index: true, admin: { hidden: true } }
  ]
};
