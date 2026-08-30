import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";
import { slugField } from "@/cms/fields/slug";

export const Topics: CollectionConfig = {
  slug: "topics",
  labels: { singular: "Tema", plural: "Temas" },
  admin: { hidden: true, useAsTitle: "name", group: "Contenido" },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  trash: true,
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true, unique: true },
    slugField("name"),
    { name: "migrationKey", type: "text", unique: true, index: true, admin: { hidden: true } }
  ]
};
