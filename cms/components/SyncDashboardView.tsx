import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewServerProps } from "payload";
import { getSyncHistory } from "@/lib/sync-history";
import { SyncDashboardClient } from "./SyncDashboardClient";

export async function SyncDashboardView(props: AdminViewServerProps) {
  const initialHistory = await getSyncHistory();

  return (
    <DefaultTemplate
      i18n={props.i18n}
      locale={props.initPageResult.locale}
      params={props.params}
      payload={props.initPageResult.req.payload || props.payload}
      permissions={props.initPageResult.permissions}
      req={props.initPageResult.req}
      searchParams={props.searchParams}
      user={props.initPageResult.req.user || props.user}
      visibleEntities={props.initPageResult.visibleEntities}
    >
      <SyncDashboardClient initialHistory={initialHistory} />
    </DefaultTemplate>
  );
}
