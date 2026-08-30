import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";
import { slugField } from "@/cms/fields/slug";

export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: "Autor u orador", plural: "Autores y oradores" },
  admin: { hidden: true, useAsTitle: "name", group: "Contenido", defaultColumns: ["name", "slug"] },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  trash: true,
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true, unique: true },
    slugField("name"),
    { name: "bio", type: "textarea", label: "Biografía" },
    {
      name: "profileUrl",
      type: "text",
      label: "Página o perfil del autor",
      admin: { description: "Ayuda a identificar al autor en los datos estructurados." },
      validate: (value: unknown) => {
        if (!value) return true;
        if (typeof value !== "string") return "Debe ser una URL.";
        try { new URL(value); return true; } catch { return "Debe ser una URL absoluta válida."; }
      }
    },
    { name: "image", type: "upload", relationTo: "media", label: "Fotografía" },
    { name: "migrationKey", type: "text", unique: true, index: true, admin: { hidden: true } }
  ]
};
