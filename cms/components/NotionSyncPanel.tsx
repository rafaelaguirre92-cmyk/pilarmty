import { notionIsConfigured, notionWritebackIsEnabled } from "@/lib/notion";
import { NotionSyncButton } from "./NotionSyncButton";

// Keep the sync action available without replacing Payload's default dashboard.
export function NotionSyncPanel() {
  return (
    <section>
      <h2>Sincronización con Notion</h2>
      <p>Sincroniza los cambios entre Notion y el portal. El estado de cada documento aparece en sus campos de sincronización.</p>
      <NotionSyncButton enabled={notionIsConfigured() && notionWritebackIsEnabled()} />
    </section>
  );
}
