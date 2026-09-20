import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";
import { slugField } from "@/cms/fields/slug";
import {
  afterRelatedContentChange,
  afterRelatedContentDelete
} from "@/cms/hooks/content";

export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: "Autor u orador", plural: "Autores y oradores" },
  admin: { useAsTitle: "name", group: "Metadata", defaultColumns: ["name", "slug"] },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    afterChange: [afterRelatedContentChange],
    afterDelete: [afterRelatedContentDelete]
  },
  trash: true,
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true, unique: true },
    slugField("name"),
    {
      name: "role",
      type: "select",
      label: "Rol",
      options: [
        { label: "Pastor", value: "Pastor" },
        { label: "Invitado", value: "Invitado" }
      ]
    },
    {
      name: "active",
      type: "checkbox",
      label: "Activo",
      defaultValue: true,
      admin: { hidden: true, disableListColumn: true, disableListFilter: true }
    },
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
    {
      name: "photoUrl",
      type: "text",
      label: "URL de fotografía",
      admin: {
        description: "Se sincroniza desde Notion cuando no se ha cargado una fotografía en la biblioteca."
      },
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
