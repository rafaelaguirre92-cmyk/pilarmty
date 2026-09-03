import Link from "next/link";

import { CollectionCard } from "@/components/collection-card";
import { CollectionChapters } from "@/components/collection-chapters";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCollection, getCollections, getTeachings } from "@/lib/content";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function CollectionPage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [collection, allCollections, allTeachings] = await Promise.all([
    getCollection(locale, slug),
    getCollections(locale),
    getTeachings(locale)
  ]);
  if (!collection) return null;

  const isSpanish = locale === "es";
  const teachings = allTeachings.filter(
    (teaching) => teaching.collection === slug
  );

  const recommendedCollections = allCollections
    .filter((c) => c.slug !== slug && c.kind === "serie")
    .slice(0, 3);

  if (recommendedCollections.length < 3) {
    const extra = allCollections
      .filter(
        (c) =>
          c.slug !== slug &&
          !recommendedCollections.some((r) => r.slug === c.slug)
      )
      .slice(0, 3 - recommendedCollections.length);
    recommendedCollections.push(...extra);
  }

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="collection-page-main">
        <section className="section collection-body-section">
          <div className="container">
            <CollectionChapters
              collection={collection}
              locale={locale}
              teachings={teachings}
            />
          </div>
        </section>

        {recommendedCollections.length > 0 && (
          <section className="section resource-hub-section collection-recommended-section">
            <div className="container">
              <div className="subsection-heading with-link">
                <h2>
                  {isSpanish
                    ? "Otras series recomendadas"
                    : "Other recommended series"}
                </h2>
                <Link href={localePath(locale, "/recursos?tipo=series")}>
                  {isSpanish ? "Ver todas las series" : "View all series"} →
                </Link>
              </div>

              <div className="collection-grid">
                {recommendedCollections.map((item) => (
                  <CollectionCard
                    compact
                    key={item.slug}
                    collection={item}
                    count={
                      allTeachings.filter(
                        (teaching) => teaching.collection === item.slug
                      ).length
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
