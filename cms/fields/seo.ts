import type { Field } from "payload";

export const seoFields: Field = {
  name: "seo",
  type: "group",
  label: "Metadatos para buscadores y redes",
  admin: {
    description: "Completa solo lo que necesite diferir del contenido principal. El sitio genera canonical, Open Graph y datos estructurados automáticamente."
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Título SEO",
      localized: true,
      maxLength: 65,
      admin: { description: "Opcional. Si se deja vacío se usa el título principal." }
    },
    {
      name: "description",
      type: "textarea",
      label: "Meta description",
      localized: true,
      maxLength: 170,
      admin: { description: "Describe con claridad el contenido. Si se deja vacío se usa el resumen." }
    },
    {
      name: "canonical",
      type: "text",
      label: "Canonical personalizado",
      localized: true,
      validate: (value: unknown) => {
        if (!value) return true;
        if (typeof value !== "string") return "Debe ser una URL.";
        try {
          new URL(value);
          return true;
        } catch {
          return "Debe ser una URL absoluta válida.";
        }
      }
    },
    { name: "noIndex", type: "checkbox", label: "Ocultar de buscadores", defaultValue: false, admin: { description: "Úsalo solo para contenido privado, duplicado o temporal." } },
    {
      name: "socialImage",
      type: "upload",
      relationTo: "media",
      label: "Imagen para compartir"
    },
    {
      name: "metadataPreview",
      type: "ui",
      admin: {
        components: {
          Field: {
            path: "./cms/components/MetadataPreview",
            exportName: "MetadataPreview"
          }
        }
      }
    }
  ]
};
