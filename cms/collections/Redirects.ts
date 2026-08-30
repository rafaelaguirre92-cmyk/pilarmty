import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";

export const Redirects: CollectionConfig = {
  slug: "redirects",
  labels: { singular: "Redirección", plural: "Redirecciones" },
  admin: { hidden: true, useAsTitle: "source", group: "SEO", defaultColumns: ["source", "destination"] },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    {
      name: "source",
      type: "text",
      label: "Ruta anterior",
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        typeof value === "string" && value.startsWith("/")
          ? true
          : "La ruta debe comenzar con /."
    },
    {
      name: "destination",
      type: "text",
      label: "Destino",
      required: true,
      validate: (value: unknown) =>
        typeof value === "string" && value.startsWith("/")
          ? true
          : "El destino debe comenzar con /."
    },
    { name: "permanent", type: "checkbox", label: "Permanente (308)", defaultValue: true }
  ]
};
