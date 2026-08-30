import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import { getCollection, getTeachings } from "@/lib/content";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function CollectionPage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [collection, allTeachings] = await Promise.all([
    getCollection(locale, slug),
    getTeachings(locale)
  ]);
  if (!collection) return null;
  const teachings = allTeachings
    .filter((teaching) => teaching.collection === slug)
    .sort((a, b) => {
      if (a.episode && b.episode) return a.episode - b.episode;
      return (b.date || "").localeCompare(a.date || "");
    });

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <header className="collection-hero">
          <div className="container collection-hero-grid">
            <div>
              <Link
                className="back-link"
                href={localePath(locale, "/recursos")}
              >
                ← {locale === "es" ? "Todos los recursos" : "All resources"}
              </Link>
              <p className="eyebrow">
                {collection.kind === "evento"
                  ? locale === "es"
                    ? "Evento"
                    : "Event"
                  : locale === "es"
                    ? "Serie"
                    : "Series"}
              </p>
              <h1>{collection.name}</h1>
              {collection.description && (
                <p className="lead">{collection.description}</p>
              )}
              <p className="collection-count">
                {teachings.length}{" "}
                {locale === "es" ? "enseñanzas" : "teachings"}
              </p>
            </div>
            {collection.image ? (
              <div className="collection-hero-image">
                <Image
                  src={collection.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 800px) 92vw, 44vw"
                />
              </div>
            ) : null}
          </div>
        </header>

        <section className="section">
          <div className="container">
            <div className="teaching-list">
              {teachings.map((teaching) => (
                <TeachingCard key={teaching.slug} teaching={teaching} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
