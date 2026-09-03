import { ArticleBody } from "@/components/article-body";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import { getResource, getTeachings } from "@/lib/content";
import { formatDate } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function ResourcePage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [resource, allTeachings] = await Promise.all([
    getResource(locale, slug),
    getTeachings(locale)
  ]);
  if (!resource) return null;
  const related = allTeachings
    .filter((teaching) =>
      resource.relatedTeachingSlugs.includes(teaching.slug)
    )
    .slice(0, 3);

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <article>
          <header className="article-hero resource-article-hero">
            <div className="container article-hero-inner">
              <p className="eyebrow">
                {resource.kind === "contenido-pilar"
                  ? locale === "es"
                    ? "Contenido pilar"
                    : "Pillar content"
                  : locale === "es"
                    ? "Artículo"
                    : "Article"}
              </p>
              <h1>{resource.title}</h1>
              {resource.excerpt && (
                <p className="article-deck">{resource.excerpt}</p>
              )}
              <div className="article-meta">
                {resource.author && <span>{resource.author}</span>}
                {resource.date && (
                  <time dateTime={resource.date}>
                    {formatDate(resource.date, locale)}
                  </time>
                )}
              </div>
            </div>
          </header>
          <div className="container article-layout">
            <aside className="article-aside">
              <p className="eyebrow">
                {locale === "es" ? "Recurso" : "Resource"}
              </p>
              <p>
                {locale === "es"
                  ? "Preparado por Iglesia Pilar para ayudarte a profundizar."
                  : "Prepared by Iglesia Pilar to help you go deeper."}
              </p>
            </aside>
            <ArticleBody
              blocks={resource.blocks}
              body={resource.body}
              locale={locale}
            />
          </div>
        </article>
        {related.length > 0 && (
          <section className="section related-section">
            <div className="container">
              <div className="subsection-heading">
                <h2>
                  {locale === "es"
                    ? "Enseñanzas relacionadas"
                    : "Related teachings"}
                </h2>
              </div>
              <div className="teaching-grid">
                {related.map((teaching) => (
                  <TeachingCard key={teaching.slug} teaching={teaching} />
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
