import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";
import { slugField } from "@/cms/fields/slug";
import { afterEditorialChange, afterEditorialDelete } from "@/cms/hooks/content";
import { teachingCountHook } from "@/cms/hooks/teaching-count";

export const Topics: CollectionConfig = {
  slug: "topics",
  labels: { singular: "Tema", plural: "Temas" },
  admin: {
    useAsTitle: "name",
    group: "Metadata",
    defaultColumns: ["name", "teachingsCount", "slug"]
  },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  trash: true,
  hooks: {
    afterRead: [teachingCountHook("topics")],
    afterChange: [afterEditorialChange("topics")],
    afterDelete: [afterEditorialDelete("topics")]
  },
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true, unique: true },
    slugField("name"),
    {
      name: "teachingsCount",
      type: "number",
      virtual: true,
      label: "Enseñanzas",
      admin: { readOnly: true }
    },
    {
      name: "publishPage",
      type: "checkbox",
      label: "Publicar página manualmente",
      defaultValue: false,
      admin: {
        description: "Publica la página cuando tenga contenido, aunque no alcance el mínimo automático de 3 publicaciones."
      }
    },
    {
      name: "unpublishPage",
      type: "checkbox",
      label: "Despublicar página manualmente",
      defaultValue: false,
      admin: {
        description: "Oculta la página del tema. Tiene prioridad sobre la publicación manual y automática."
      }
    },
    { name: "migrationKey", type: "text", unique: true, index: true, admin: { hidden: true } }
  ]
};
