import { CollectionCard } from "@/components/collection-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import { getCollections, getTeachings } from "@/lib/content";
import type { Locale } from "@/lib/types";

export async function TeachingsIndexPage({ locale }: { locale: Locale }) {
  const [availableCollections, teachings] = await Promise.all([
    getCollections(locale),
    getTeachings(locale)
  ]);
  const recent = teachings
    .filter((teaching) => teaching.date)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 6);

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <header className="page-hero">
          <div className="container page-hero-grid">
            <p className="eyebrow">
              {locale === "es" ? "Enseñanzas" : "Teachings"}
            </p>
            <h1>
              {locale === "es"
                ? "Explorando la Palabra de Dios"
                : "Exploring God's Word"}
            </h1>
            <p className="lead">
              {locale === "es"
                ? "Exposiciones bíblicas para conocer a Cristo y vivir el evangelio en nuestra vida diaria."
                : "Biblical teaching to know Christ and live the gospel in everyday life."}
            </p>
          </div>
        </header>

        <section className="section">
          <div className="container">
            <div className="subsection-heading">
              <h2>
                {locale === "es"
                  ? "Series y eventos"
                  : "Series and events"}
              </h2>
            </div>
            <div className="collection-grid">
              {availableCollections.map((collection) => (
                <CollectionCard
                  key={collection.slug}
                  collection={collection}
                  count={
                    teachings.filter(
                      (teaching) => teaching.collection === collection.slug
                    ).length
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section recent-section">
          <div className="container">
            <div className="subsection-heading">
              <h2>
                {locale === "es"
                  ? "Publicaciones recientes"
                  : "Recent publications"}
              </h2>
            </div>
            <div className="teaching-grid">
              {recent.map((teaching) => (
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
