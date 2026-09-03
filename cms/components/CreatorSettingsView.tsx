import { Gutter } from "@payloadcms/ui";
import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";

import { notionIsConfigured, notionWritebackIsEnabled } from "@/lib/notion";

import { NotionSyncButton } from "./NotionSyncButton";

function formatDate(value?: string | null) {
  if (!value) return "Aún no se ha ejecutado";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Monterrey"
  }).format(new Date(value));
}

export async function CreatorSettingsView(props: AdminViewServerProps) {
  const { initPageResult } = props;
  const { req } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fconfiguracion");

  const [pendingTeachings, pendingResources, syncedTeachings, syncedResources, errorTeachings, errorResources, recentTeachings, recentResources] = await Promise.all([
    req.payload.count({ collection: "teachings", where: { syncStatus: { equals: "pending" } }, req, overrideAccess: false }),
    req.payload.count({ collection: "resources", where: { syncStatus: { equals: "pending" } }, req, overrideAccess: false }),
    req.payload.count({ collection: "teachings", where: { syncStatus: { equals: "synced" } }, req, overrideAccess: false }),
    req.payload.count({ collection: "resources", where: { syncStatus: { equals: "synced" } }, req, overrideAccess: false }),
    req.payload.find({ collection: "teachings", where: { syncStatus: { equals: "error" } }, limit: 20, sort: "-updatedAt", depth: 0, req, overrideAccess: false }),
    req.payload.find({ collection: "resources", where: { syncStatus: { equals: "error" } }, limit: 20, sort: "-updatedAt", depth: 0, req, overrideAccess: false }),
    req.payload.find({ collection: "teachings", limit: 1, sort: "-lastSyncedAt", depth: 0, req, overrideAccess: false }),
    req.payload.find({ collection: "resources", limit: 1, sort: "-lastSyncedAt", depth: 0, req, overrideAccess: false })
  ]);

  const latest = [recentTeachings.docs[0]?.lastSyncedAt, recentResources.docs[0]?.lastSyncedAt]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const pending = pendingTeachings.totalDocs + pendingResources.totalDocs;
  const errors = errorTeachings.totalDocs + errorResources.totalDocs;
  const synced = syncedTeachings.totalDocs + syncedResources.totalDocs;
  const failedItems = [
    ...errorTeachings.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: "Enseñanza",
      error: doc.syncError,
      href: `/admin/collections/teachings/${doc.id}`
    })),
    ...errorResources.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: "Artículo",
      error: doc.syncError,
      href: `/admin/collections/resources/${doc.id}`
    }))
  ];
  const enabled = notionIsConfigured() && notionWritebackIsEnabled();
  const cronConfigured = Boolean(process.env.CRON_SECRET);

  return (
    <DefaultTemplate {...props} visibleEntities={initPageResult.visibleEntities}>
      <Gutter className="creator-view-gutter">
        <main className="creator-dashboard creator-settings">
          <header className="creator-page-header">
            <div>
              <p className="creator-eyebrow">Configuración</p>
              <h1>Conexiones y cuenta</h1>
              <p className="creator-lede">Administra la sincronización editorial y tu acceso al panel.</p>
            </div>
          </header>

          <section className="creator-settings-grid">
            <article className="creator-panel creator-sync-panel">
              <div className="creator-panel-heading">
                <div><p className="creator-eyebrow">Contenido</p><h2>Notion ↔ Payload</h2></div>
                <span className={`creator-status creator-status--${enabled ? "published" : "draft"}`}>{enabled ? "Conectado" : "Inactivo"}</span>
              </div>
              <p className="creator-settings-copy">
                {cronConfigured
                  ? "Se ejecuta automáticamente una vez al día. "
                  : "La sincronización manual está disponible; el horario diario se activará al configurar CRON_SECRET en Vercel. "}
                Si ambos lados cambiaron, prevalece Payload; si únicamente cambió Notion, se importa esa versión.
              </p>
              <dl className="creator-sync-facts">
                <div><dt>Última sincronización</dt><dd>{formatDate(latest)}</dd></div>
                <div><dt>Sincronizados</dt><dd>{synced}</dd></div>
                <div><dt>Pendientes</dt><dd>{pending}</dd></div>
                <div><dt>Con error</dt><dd>{errors}</dd></div>
              </dl>
              {failedItems.length > 0 && (
                <section className="creator-sync-errors" aria-labelledby="creator-sync-errors-title">
                  <div className="creator-sync-errors-heading">
                    <div>
                      <p className="creator-eyebrow">Requieren atención</p>
                      <h3 id="creator-sync-errors-title">No se pudieron sincronizar</h3>
                    </div>
                    <span>{errors}</span>
                  </div>
                  <ul>
                    {failedItems.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <div>
                          <span>{item.type}</span>
                          <strong>{item.title}</strong>
                          <p>{item.error || "No se recibió información adicional del error."}</p>
                        </div>
                        <Link href={item.href}>Revisar</Link>
                      </li>
                    ))}
                  </ul>
                  {errors > failedItems.length && <p className="creator-sync-errors-more">Se muestran los {failedItems.length} errores más recientes.</p>}
                </section>
              )}
              <NotionSyncButton enabled={enabled} />
            </article>

            <article className="creator-panel creator-account-panel">
              <p className="creator-eyebrow">Acceso</p>
              <h2>Tu cuenta</h2>
              <p className="creator-settings-copy">Actualiza tus datos personales, correo y contraseña de acceso.</p>
              <Link className="creator-secondary-action" href="/admin/account">Administrar cuenta</Link>
            </article>
          </section>
        </main>
      </Gutter>
    </DefaultTemplate>
  );
}
