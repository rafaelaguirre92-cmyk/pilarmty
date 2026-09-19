import Link from "next/link";
import { notionIsConfigured, notionWritebackIsEnabled } from "@/lib/notion";
import { NotionSyncButton } from "./NotionSyncButton";

export function NotionSyncPanel() {
  return (
    <section className="pilar-notion-sync-panel">
      <div className="pilar-notion-sync-panel__header">
        <div>
          <h2>Sincronización con Notion</h2>
          <p>Sincroniza los cambios entre Notion y el portal. El estado de cada documento aparece en sus campos de sincronización.</p>
        </div>
        <Link href="/admin/sincronizacion" className="pilar-notion-sync-panel__history-link">
          Ver historial completo en Tablero →
        </Link>
      </div>
      <NotionSyncButton enabled={notionIsConfigured() && notionWritebackIsEnabled()} />
    </section>
  );
}

