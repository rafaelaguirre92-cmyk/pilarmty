import type { Field } from "payload";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const slugField = (source = "title", localized = false): Field => ({
  name: "slug",
  type: "text",
  label: "URL (slug)",
  required: true,
  index: true,
  localized,
  admin: {
    description:
      "Se genera automáticamente. Cambiarlo después de publicar creará una redirección permanente."
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        if (typeof value === "string" && value.trim()) return value.trim();
        const sourceValue = siblingData?.[source];
        return typeof sourceValue === "string" ? slugify(sourceValue) : value;
      }
    ]
  }
});

