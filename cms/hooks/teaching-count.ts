import type { CollectionAfterReadHook } from "payload";

type TeachingRelation = "series" | "author" | "topics";

export function teachingCountHook(
  relation: TeachingRelation
): CollectionAfterReadHook {
  return async ({ doc, req }) => {
    if (!doc?.id) return doc;

    const result = await req.payload.count({
      collection: "teachings",
      where: {
        [relation]: {
          [relation === "topics" ? "contains" : "equals"]: doc.id
        }
      } as never,
      overrideAccess: true
    });

    return {
      ...doc,
      teachingsCount: result.totalDocs
    };
  };
}
