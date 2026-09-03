import type { EditMenuItemsServerProps } from "payload";

import { TOPIC_INDEX_MIN_CONTENT } from "@/lib/topics";
import { TopicUnpublishActionClient } from "./TopicUnpublishActionClient";

function relationId(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (value && typeof value === "object" && "id" in value) return String(value.id);
  return null;
}

export async function TopicUnpublishAction({ id, payload, user }: EditMenuItemsServerProps) {
  if (!id) return null;

  const [topic, teachings, resources] = await Promise.all([
    payload.findByID({
      collection: "topics",
      id,
      depth: 0,
      overrideAccess: false,
      user,
      select: { publishPage: true, unpublishPage: true }
    }),
    payload.find({
      collection: "teachings",
      depth: 0,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      user,
      where: { _status: { equals: "published" } },
      select: { topics: true }
    }),
    payload.find({
      collection: "resources",
      depth: 0,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      user,
      where: { _status: { equals: "published" } },
      select: { topics: true }
    })
  ]);

  const topicId = String(id);
  const contentCount = [...teachings.docs, ...resources.docs].reduce((count, document) => {
    const topicIds = new Set(
      (document.topics || []).map(relationId).filter((value): value is string => Boolean(value))
    );
    return count + (topicIds.has(topicId) ? 1 : 0);
  }, 0);
  const published = !topic.unpublishPage && (
    contentCount >= TOPIC_INDEX_MIN_CONTENT || (contentCount > 0 && Boolean(topic.publishPage))
  );

  return published ? <TopicUnpublishActionClient /> : null;
}
