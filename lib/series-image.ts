import type { Collection } from "@/lib/types";

export type SeriesImageFormat = "horizontal" | "square" | "vertical";

export function seriesImage(collection: Collection, format: SeriesImageFormat): string | undefined {
  if (format === "square") {
    return collection.imageSquare || collection.image || collection.imageVertical;
  }

  if (format === "vertical") {
    return collection.imageVertical || collection.imageSquare || collection.image;
  }

  return collection.image || collection.imageSquare || collection.imageVertical;
}
