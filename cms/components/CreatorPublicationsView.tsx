import { Gutter } from "@payloadcms/ui";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { redirect } from "next/navigation";
import type { AdminViewServerProps, Where } from "payload";

import { CreatorPublicationsTable, type CreatorPublication } from "@/cms/components/CreatorPublicationsTable";

function imageUrl(value: unknown) {
  return value && typeof value === "object" && "url" in value && typeof value.url === "string" ? value.url : undefined;
}

function metadataScore(doc: { author?: unknown; excerpt?: string | null; image?: unknown; slug?: string | null; topics?: unknown[] | null; seo?: { description?: string | null } | null }, date?: string | null) {
  const checks = [doc.slug, doc.excerpt, doc.author, doc.image, date, Array.isArray(doc.topics) && doc.topics.length > 0, doc.seo?.description || doc.excerpt];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function CreatorPublicationsView(props: AdminViewServerProps) {
  const { initPageResult, searchParams } = props;
  const { req } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fpublicaciones");

  const params = searchParams && typeof searchParams === "object" ? (searchParams as Record<string, string>) : {};
  const queryParam = typeof params.q === "string" ? params.q.trim() : "";
  const typeParam = params.tipo === "post" || params.tipo === "teaching" ? params.tipo : "all";
  const statusParam = params.estado === "published" || params.estado === "draft" ? params.estado : "all";

  function buildWhere(base: Record<string, unknown> = {}) {
    const and: Where[] = [];
    if (Object.keys(base).length) and.push(base as Where);
    if (statusParam !== "all") and.push({ _status: { equals: statusParam } });
    if (queryParam) and.push({ title: { like: queryParam } });
    return (and.length > 1 ? { and } : (and[0] ?? {})) as Where;
  }

  const [teachings, posts] = await Promise.all([
    typeParam !== "post"
      ? req.payload.find({ collection: "teachings", depth: 0, draft: true, limit: 50, sort: "-updatedAt", where: buildWhere(), req, overrideAccess: false })
      : null,
    typeParam !== "teaching"
      ? req.payload.find({ collection: "resources", depth: 0, draft: true, limit: 50, sort: "-updatedAt", where: buildWhere({ kind: { equals: "article" } }), req, overrideAccess: false })
      : null,
  ]);

  const publications: CreatorPublication[] = [
    ...(teachings?.docs ?? []).map((doc) => ({ id: doc.id, title: doc.title, type: "teaching" as const, status: doc._status === "published" ? "published" as const : "draft" as const, date: doc.teachingDate || undefined, updatedAt: doc.updatedAt, format: doc.format || undefined, image: imageUrl(doc.image), metadataScore: metadataScore(doc, doc.teachingDate), editHref: `/admin/collections/teachings/${doc.id}` })),
    ...(posts?.docs ?? []).map((doc) => ({ id: doc.id, title: doc.title, type: "post" as const, status: doc._status === "published" ? "published" as const : "draft" as const, date: doc.contentDate || undefined, updatedAt: doc.updatedAt, image: imageUrl(doc.image), metadataScore: metadataScore(doc, doc.contentDate), editHref: `/admin/collections/resources/${doc.id}` }))
  ].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  const totalDocs = (teachings?.totalDocs ?? 0) + (posts?.totalDocs ?? 0);
  const hasMore = (teachings?.hasNextPage ?? false) || (posts?.hasNextPage ?? false);

  return (
    <DefaultTemplate {...props} visibleEntities={initPageResult.visibleEntities}>
      <Gutter className="creator-view-gutter">
        <CreatorPublicationsTable
          publications={publications}
          totalDocs={totalDocs}
          hasMore={hasMore}
          initialType={typeParam}
          initialStatus={statusParam}
          initialQuery={queryParam}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
