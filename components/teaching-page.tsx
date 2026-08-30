import Link from "next/link";

import { ArticleBody } from "@/components/article-body";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import {
  getCollection,
  getTeaching,
  getTeachings
} from "@/lib/content";
import { formatDate, localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function TeachingPage({
  locale,
  collectionSlug,
  slug
}: {
  locale: Locale;
  collectionSlug: string;
  slug: string;
}) {
  const [teaching, collection, allTeachings] = await Promise.all([
    getTeaching(locale, collectionSlug, slug),
    getCollection(locale, collectionSlug),
    getTeachings(locale)
  ]);
  if (!teaching || !collection) return null;

  const related = allTeachings
    .filter(
      (item) =>
        item.collection === collectionSlug && item.slug !== teaching.slug
    )
    .slice(0, 3);
  const date = formatDate(teaching.date, locale);

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <article>
          <header className="article-hero">
            <div className="container article-hero-inner">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link href={localePath(locale, "/recursos")}>
                  {locale === "es" ? "Recursos" : "Resources"}
                </Link>
                <span>/</span>
                <Link
                  href={localePath(
                    locale,
                    `/ensenanzas/${collection.slug}`
                  )}
                >
                  {collection.name}
                </Link>
              </nav>
              <p className="eyebrow">
                {teaching.episode
                  ? `${locale === "es" ? "Episodio" : "Episode"} ${teaching.episode}`
                  : collection.name}
              </p>
              <h1>{teaching.title}</h1>
              <p className="article-deck">{teaching.excerpt}</p>
              <div className="article-meta">
                {teaching.author && <span>{teaching.author}</span>}
                {date && <time dateTime={teaching.date}>{date}</time>}
              </div>
              {teaching.tags.length > 0 && (
                <div className="tag-row article-tags">
                  {teaching.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              {(teaching.youtubeUrl || teaching.applePodcastsUrl) && (
                <div className="button-row">
                  {teaching.youtubeUrl && (
                    <a href={teaching.youtubeUrl} rel="noreferrer" target="_blank" className="button">
                      {locale === "es" ? "Ver en YouTube" : "Watch on YouTube"}
                    </a>
                  )}
                  {teaching.applePodcastsUrl && (
                    <a href={teaching.applePodcastsUrl} rel="noreferrer" target="_blank" className="button secondary">
                      {locale === "es" ? "Escuchar en Apple Podcasts" : "Listen on Apple Podcasts"}
                    </a>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="container article-layout">
            <aside className="article-aside">
              <p className="eyebrow">
                {locale === "es" ? "Parte de la serie" : "From the series"}
              </p>
              <Link
                href={localePath(
                  locale,
                  `/ensenanzas/${collection.slug}`
                )}
              >
                {collection.name} →
              </Link>
            </aside>
            <ArticleBody
              blocks={teaching.blocks}
              body={teaching.body}
            />
          </div>
        </article>

        {related.length > 0 && (
          <section className="section related-section">
            <div className="container">
              <div className="subsection-heading">
                <h2>
                  {locale === "es"
                    ? `Continúa con ${collection.name}`
                    : `Continue with ${collection.name}`}
                </h2>
              </div>
              <div className="teaching-grid">
                {related.map((item) => (
                  <TeachingCard key={item.slug} teaching={item} />
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
