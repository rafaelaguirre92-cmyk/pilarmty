"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function MetadataPreview() {
  const { collectionSlug } = useDocumentInfo();
  const values = useFormFields(([fields]) => ({
    author: fields.author?.value,
    date: fields.teachingDate?.value || fields.contentDate?.value,
    description: fields["seo.description"]?.value,
    excerpt: fields.excerpt?.value,
    image: fields["seo.socialImage"]?.value || fields.image?.value,
    slug: fields.slug?.value,
    title: fields.title?.value,
    seoTitle: fields["seo.title"]?.value,
    topics: fields.topics?.value
  }));

  const title = text(values.seoTitle) || text(values.title) || "Título de la publicación";
  const description = text(values.description) || text(values.excerpt) || "Agrega un resumen o una descripción SEO para explicar de qué trata esta publicación.";
  const slug = text(values.slug) || "url-de-la-publicacion";
  const basePath = collectionSlug === "teachings" ? "ensenanzas/serie" : "recursos";
  const checks = [
    { complete: Boolean(text(values.title)), label: "Título" },
    { complete: Boolean(text(values.excerpt)), label: "Resumen" },
    { complete: Boolean(values.author), label: "Autor" },
    { complete: Boolean(values.date), label: "Fecha" },
    { complete: Boolean(values.image), label: "Imagen social" },
    { complete: Array.isArray(values.topics) && values.topics.length > 0, label: "Tema" }
  ];
  const completed = checks.filter((item) => item.complete).length;

  return (
    <section className="metadata-preview" aria-label="Vista previa de metadatos">
      <div className="metadata-preview__heading">
        <div><p className="creator-eyebrow">Control de calidad</p><h3>Vista previa del contenido</h3></div>
        <span>{completed}/{checks.length} elementos listos</span>
      </div>
      <div className="metadata-preview__grid">
        <div className="metadata-preview__search">
          <p>iglesiapilar.mx › {basePath} › {slug}</p>
          <h4>{title.slice(0, 65)}</h4>
          <div>{description.slice(0, 170)}</div>
          <small>Título: {title.length}/65 · Descripción: {description.length}/170</small>
        </div>
        <div className="metadata-preview__social">
          <div className="metadata-preview__social-image">{values.image ? <span>Imagen social seleccionada</span> : <span>Falta imagen social</span>}</div>
          <div><small>IGLESIAPILAR.MX</small><strong>{title.slice(0, 80)}</strong><p>{description.slice(0, 110)}</p></div>
        </div>
      </div>
      <ul className="metadata-preview__checklist">
        {checks.map((item) => <li className={item.complete ? "is-complete" : undefined} key={item.label}><span>{item.complete ? "✓" : "○"}</span>{item.label}</li>)}
      </ul>
    </section>
  );
}
