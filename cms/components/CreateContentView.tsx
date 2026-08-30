import { Gutter } from "@payloadcms/ui";
import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";

const options = [
  {
    description: "Comparte una prédica, devocional o enseñanza de una serie.",
    href: "/admin/collections/teachings/create",
    title: "Crear enseñanza"
  },
  {
    description: "Publica una reflexión, guía o contenido para el sitio.",
    href: "/admin/collections/resources/create",
    title: "Crear artículo"
  }
];

export function CreateContentView(props: AdminViewServerProps) {
  const { initPageResult } = props;
  if (!initPageResult.req.user) redirect("/admin/login?redirect=%2Fadmin%2Fcrear");

  return (
    <DefaultTemplate {...props} visibleEntities={initPageResult.visibleEntities}>
      <Gutter className="creator-view-gutter">
        <main className="creator-create-view">
          <Link aria-label="Cerrar creación" className="creator-create-close" href="/admin" title="Cerrar">
            <span aria-hidden="true">×</span>
          </Link>
          <p className="creator-eyebrow">Nueva publicación</p>
          <h1>¿Qué deseas crear?</h1>
          <p className="creator-lede">Elige un formato. Después te guiaremos por contenido, medios y metadatos.</p>
          <section aria-label="Tipos de contenido" className="creator-create-grid">
            {options.map((option, index) => (
              <Link href={option.href} key={option.href} className="creator-create-card">
                <span aria-hidden="true" className="creator-create-card__number">0{index + 1}</span>
                <span className="creator-create-card__arrow">↗</span>
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </Link>
            ))}
          </section>
        </main>
      </Gutter>
    </DefaultTemplate>
  );
}
