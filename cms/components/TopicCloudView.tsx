import { Gutter } from "@payloadcms/ui";
import Link from "next/link";
import type { ListViewServerProps } from "payload";

import { TOPIC_INDEX_MIN_CONTENT } from "@/lib/topics";

function relationId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (value && typeof value === "object" && "id" in value) return String(value.id);
  return null;
}

export async function TopicCloudView(props: ListViewServerProps) {
  const { hasCreatePermission, newDocumentURL, payload, user } = props;
  const [topics, teachings, resources] = await Promise.all([
    payload.find({ collection: "topics", depth: 0, limit: 1000, sort: "name", overrideAccess: false, user }),
    payload.find({
      collection: "teachings",
      depth: 0,
      draft: false,
      limit: 1000,
      where: { _status: { equals: "published" } },
      select: { topics: true },
      overrideAccess: false,
      user
    }),
    payload.find({
      collection: "resources",
      depth: 0,
      draft: false,
      limit: 1000,
      where: { _status: { equals: "published" } },
      select: { topics: true },
      overrideAccess: false,
      user
    })
  ]);

  const counts = new Map<string, number>();
  for (const doc of [...teachings.docs, ...resources.docs]) {
    const topicIds = new Set((doc.topics || []).map(relationId).filter((id): id is string => Boolean(id)));
    for (const id of topicIds) counts.set(id, (counts.get(id) || 0) + 1);
  }

  const items = topics.docs.map((topic) => {
    const count = counts.get(String(topic.id)) || 0;
    const automatic = count >= TOPIC_INDEX_MIN_CONTENT;
    const manual = Boolean(topic.publishPage) && count > 0 && !automatic;
    const unpublished = Boolean(topic.unpublishPage);
    return { ...topic, count, automatic, manual, unpublished, published: !unpublished && (automatic || manual) };
  });
  const publishedCount = items.filter((item) => item.published).length;

  return (
    <Gutter className="creator-view-gutter topic-cloud-view">
      <header className="topic-cloud-header">
        <div>
          <p className="creator-eyebrow">Biblioteca</p>
          <h1>Temas</h1>
          <p className="creator-lede">
            Cada tema abre su edición. Las páginas se publican automáticamente al reunir {TOPIC_INDEX_MIN_CONTENT} contenidos o pueden habilitarse manualmente.
          </p>
        </div>
        {hasCreatePermission && <Link className="creator-primary-action btn btn--style-primary" href={newDocumentURL}>Nuevo tema</Link>}
      </header>

      <section className="topic-cloud-panel" aria-labelledby="topic-cloud-title">
        <div className="topic-cloud-summary">
          <div>
            <h2 id="topic-cloud-title">Nube de temas</h2>
            <p>{items.length} temas · {publishedCount} con página publicada</p>
          </div>
          <div className="topic-cloud-legend" aria-label="Estados de página">
            <span><i className="is-published" /> Con página</span>
            <span><i /> Sin página</span>
          </div>
        </div>

        <div className="topic-cloud" role="list">
          {items.map((topic) => (
            <Link
              className={`topic-cloud-chip${topic.published ? " is-published" : ""}`}
              href={`/admin/collections/topics/${topic.id}`}
              key={topic.id}
              role="listitem"
              title={`${topic.name}: ${topic.count} ${topic.count === 1 ? "contenido" : "contenidos"}. ${topic.unpublished ? "Página despublicada manualmente" : topic.automatic ? "Página automática" : topic.manual ? "Página publicada manualmente" : "Sin página publicada"}.`}
            >
              <strong>{topic.name}</strong>
              <span>{topic.count}</span>
              <small>{topic.unpublished ? "Despublicada" : topic.automatic ? "Automática" : topic.manual ? "Manual" : "Sin página"}</small>
            </Link>
          ))}
        </div>
      </section>
    </Gutter>
  );
}
