import Image from "next/image";
import Link from "next/link";

import { seriesImage } from "@/lib/series-image";
import { localePath } from "@/lib/site";
import type { Collection } from "@/lib/types";

export function CollectionCard({
  collection,
  count,
  compact = false
}: {
  collection: Collection;
  count: number;
  compact?: boolean;
}) {
  const locale = collection.locale;
  const image = seriesImage(collection, "horizontal");
  return (
    <Link
      className={`collection-card${compact ? " compact" : ""}`}
      href={localePath(locale, `/ensenanzas/${collection.slug}`)}
    >
      <div className="collection-image">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 32vw"
          />
        ) : null}
      </div>
      <div className="collection-card-copy">
        {compact ? (
          <h2 className="sr-only">{collection.name}</h2>
        ) : (
          <>
            <p className="eyebrow">
              {collection.kind === "evento"
                ? locale === "es"
                  ? "Evento"
                  : "Event"
                : locale === "es"
                  ? "Serie"
                  : "Series"}
            </p>
            <h2>{collection.name}</h2>
            {collection.description && <p>{collection.description}</p>}
          </>
        )}
        <span className="text-link">
          {locale === "es"
            ? `Ver ${count} enseñanzas`
            : `View ${count} teachings`}{" "}
          →
        </span>
      </div>
    </Link>
  );
}
