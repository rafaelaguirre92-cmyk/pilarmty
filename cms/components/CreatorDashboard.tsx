import { Gutter } from "@payloadcms/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export async function CreatorDashboard({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin");

  const articleWhere = { kind: { equals: "article" as const } };
  const [teachingCount, postCount, publishedTeachings, publishedPosts, recentTeachings, recentPosts] = await Promise.all([
    req.payload.count({ collection: "teachings", req, overrideAccess: false }),
    req.payload.count({ collection: "resources", where: articleWhere, req, overrideAccess: false }),
    req.payload.count({ collection: "teachings", where: { _status: { equals: "published" } }, req, overrideAccess: false }),
    req.payload.count({ collection: "resources", where: { and: [articleWhere, { _status: { equals: "published" } }] }, req, overrideAccess: false }),
    req.payload.find({ collection: "teachings", depth: 0, draft: true, limit: 4, sort: "-updatedAt", req, overrideAccess: false }),
    req.payload.find({ collection: "resources", depth: 0, draft: true, limit: 4, sort: "-updatedAt", where: articleWhere, req, overrideAccess: false })
  ]);

  const recent = [
    ...recentTeachings.docs.map((doc) => ({ id: doc.id, title: doc.title, type: "Enseñanza", status: doc._status, date: doc.updatedAt, href: `/admin/collections/teachings/${doc.id}` })),
    ...recentPosts.docs.map((doc) => ({ id: doc.id, title: doc.title, type: "Artículo", status: doc._status, date: doc.updatedAt, href: `/admin/collections/resources/${doc.id}` }))
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6);

  const firstName = typeof req.user.name === "string" ? req.user.name.split(" ")[0] : "equipo";
  const total = teachingCount.totalDocs + postCount.totalDocs;
  const published = publishedTeachings.totalDocs + publishedPosts.totalDocs;

  return (
      <Gutter className="creator-view-gutter">
        <main className="creator-dashboard">
          <header className="creator-page-header">
            <div><p className="creator-eyebrow">Panel editorial</p><h1>Hola, {firstName}</h1><p className="creator-lede">Todo lo necesario para preparar y publicar el contenido de Iglesia Pilar.</p></div>
            <Link className="creator-primary-action" href="/admin/crear">＋ Nuevo</Link>
          </header>

          <section className="creator-stat-grid" aria-label="Resumen de publicaciones">
            <article><span>Total</span><strong>{total}</strong><p>Enseñanzas y artículos</p></article>
            <article><span>Publicados</span><strong>{published}</strong><p>Visibles en el sitio</p></article>
            <article><span>Borradores</span><strong>{Math.max(total - published, 0)}</strong><p>Pendientes de terminar</p></article>
            <article className="is-accent"><span>Actividad reciente</span><strong>{recent.length}</strong><p>Últimas actualizaciones</p></article>
          </section>

          <section className="creator-dashboard-grid">
            <div className="creator-panel creator-recent-panel">
              <div className="creator-panel-heading"><div><p className="creator-eyebrow">Actividad</p><h2>Publicaciones recientes</h2></div><Link href="/admin/publicaciones">Ver todas</Link></div>
              <div className="creator-recent-list">
                {recent.length ? recent.map((item) => (
                  <Link href={item.href} key={`${item.type}-${item.id}`}>
                    <span className={`creator-type-mark creator-type-mark--${item.type === "Artículo" ? "post" : "teaching"}`}>{item.type === "Artículo" ? "A" : "E"}</span>
                    <span className="creator-recent-title"><strong>{item.title}</strong><small>{item.type} · {formatDate(item.date)}</small></span>
                    <span className={`creator-status creator-status--${item.status === "published" ? "published" : "draft"}`}>{item.status === "published" ? "Publicado" : "Borrador"}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )) : <div className="creator-empty">Aún no hay publicaciones. Empieza creando la primera.</div>}
              </div>
            </div>
            <aside className="creator-panel creator-quick-panel">
              <p className="creator-eyebrow">Accesos rápidos</p><h2>Administra el contenido</h2>
              <Link href="/admin/collections/teachings"><span>Enseñanzas</span><strong>→</strong></Link>
              <Link href="/admin/collections/resources"><span>Artículos</span><strong>→</strong></Link>
              <Link href="/admin/collections/media"><span>Biblioteca</span><strong>→</strong></Link>
            </aside>
          </section>
        </main>
      </Gutter>
  );
}
