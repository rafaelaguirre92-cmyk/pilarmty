import type { CollectionConfig } from "payload";

import { authenticated } from "@/cms/access";
import { slugField } from "@/cms/fields/slug";
import { afterEditorialChange, afterEditorialDelete } from "@/cms/hooks/content";

export const Topics: CollectionConfig = {
  slug: "topics",
  labels: { singular: "Tema", plural: "Temas" },
  admin: {
    useAsTitle: "name",
    group: "Contenido",
    defaultColumns: ["name", "slug"],
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "./cms/components/TopicPublishControl",
            exportName: "TopicPublishControl"
          }
        ],
        editMenuItems: [
          {
            path: "./cms/components/TopicUnpublishAction",
            exportName: "TopicUnpublishAction"
          }
        ]
      },
      views: {
        list: {
          Component: {
            path: "./cms/components/TopicCloudView",
            exportName: "TopicCloudView"
          }
        }
      }
    }
  },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  trash: true,
  hooks: {
    afterChange: [afterEditorialChange("topics")],
    afterDelete: [afterEditorialDelete("topics")]
  },
  fields: [
    { name: "name", type: "text", label: "Nombre", required: true, unique: true },
    slugField("name"),
    {
      name: "publishPage",
      type: "checkbox",
      label: "Publicar página manualmente",
      defaultValue: false,
      admin: {
        hidden: true
      }
    },
    {
      name: "unpublishPage",
      type: "checkbox",
      label: "Despublicar página manualmente",
      defaultValue: false,
      admin: {
        hidden: true
      }
    },
    { name: "migrationKey", type: "text", unique: true, index: true, admin: { hidden: true } }
  ]
};
