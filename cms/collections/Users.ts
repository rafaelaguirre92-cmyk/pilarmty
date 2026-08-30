import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Administrador", plural: "Administradores" },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60
  },
  admin: { hidden: true, useAsTitle: "email", group: "Administración" },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    create: async ({ req }) => {
      if (req.user) return true;
      const result = await req.payload.count({
        collection: "users",
        overrideAccess: true
      });
      return result.totalDocs === 0;
    }
  },
  fields: [{ name: "name", type: "text", label: "Nombre", required: true }]
};
