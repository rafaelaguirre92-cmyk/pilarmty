import { ArticleBody } from "@/components/article-body";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import { TeachingToc } from "@/components/teaching-toc";
import { extractArticleHeadings } from "@/lib/article-headings";
import {
  getResource,
  getResources,
  getTeachings,
  getTopicPublicationOverrides
} from "@/lib/content";
import { formatDate, localePath } from "@/lib/site";
import { getPublishedTopicSlugs, topicSlug } from "@/lib/topics";
import type { Locale } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export async function ResourcePage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [resource, allTeachings, allResources, publication] = await Promise.all([
    getResource(locale, slug),
    getTeachings(locale),
    getResources(locale),
    getTopicPublicationOverrides()
  ]);
  if (!resource) return null;
  const related = allTeachings
    .filter((teaching) =>
      resource.relatedTeachingSlugs.includes(teaching.slug)
    )
    .slice(0, 3);
  const headings = extractArticleHeadings({
    blocks: resource.blocks,
    body: resource.body
  });
  const publishedTopicSlugs = getPublishedTopicSlugs(
    allTeachings,
    allResources,
    publication.published,
    publication.unpublished
  );
  const resourceKind =
    resource.kind === "contenido-pilar"
      ? locale === "es"
        ? "Contenido pilar"
        : "Pillar content"
      : locale === "es"
        ? "Artículo"
        : "Article";

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="teaching-page-main resource-page-main">
        <article className="teaching-article resource-article">
          <header className="teaching-article-header">
            <div className="container teaching-header-container">
              <div className="teaching-header-grid">
                <div className="teaching-header-aside">
                  <nav className="breadcrumbs teaching-header-breadcrumbs" aria-label="Breadcrumb">
                    <Link href={localePath(locale, "/recursos")}>
                      {locale === "es" ? "Recursos" : "Resources"}
                    </Link>
                  </nav>
                </div>

                <div className="teaching-header-main">
                  <div className="teaching-header-heading">
                    <p className="eyebrow teaching-eyebrow">{resourceKind}</p>
                    <h1 className="teaching-title">{resource.title}</h1>
                    {resource.excerpt && <p className="resource-header-excerpt">{resource.excerpt}</p>}
                  </div>

                  <div className="teaching-header-details">
                    <div className="teaching-meta-row">
                      {resource.author && (
                        <div className="teaching-meta-item teaching-meta-author">
                          {resource.authorUrl ? (
                            <Link className="teaching-author-link" href={resource.authorUrl}>
                              <span className="teaching-author-avatar">
                                {resource.authorImage ? (
                                  <Image
                                    alt=""
                                    className="teaching-author-avatar-image"
                                    height={36}
                                    src={resource.authorImage}
                                    width={36}
                                  />
                                ) : resource.author.charAt(0)}
                              </span>
                              <span className="teaching-meta-val">{resource.author}</span>
                            </Link>
                          ) : (
                            <>
                              <span className="teaching-author-avatar">
                                {resource.authorImage ? (
                                  <Image
                                    alt=""
                                    className="teaching-author-avatar-image"
                                    height={36}
                                    src={resource.authorImage}
                                    width={36}
                                  />
                                ) : resource.author.charAt(0)}
                              </span>
                              <span className="teaching-meta-val">{resource.author}</span>
                            </>
                          )}
                        </div>
                      )}
                      {resource.date && (
                        <div className="teaching-meta-item">
                          <span className="teaching-meta-label">{locale === "es" ? "Fecha" : "Date"}</span>
                          <time className="teaching-meta-val" dateTime={resource.date}>
                            {formatDate(resource.date, locale)}
                          </time>
                        </div>
                      )}
                    </div>

                    {resource.tags.length > 0 && (
                      <div className="teaching-tags" aria-label={locale === "es" ? "Temas" : "Topics"}>
                        {resource.tags.map((tag) => (
                          <Link
                            href={localePath(
                              locale,
                              publishedTopicSlugs.has(topicSlug(tag))
                                ? `/recursos/temas/${topicSlug(tag)}`
                                : "/recursos/temas"
                            )}
                            key={tag}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="container teaching-divider-container">
              <hr className="teaching-header-divider" />
            </div>
          </header>

          <div className="container teaching-body-container">
            <div className="teaching-body-grid">
              <div className="teaching-body-aside">
                {headings.length > 1 && <TeachingToc headings={headings} locale={locale} />}
              </div>
              <div className="teaching-content">
                <ArticleBody blocks={resource.blocks} body={resource.body} locale={locale} />
              </div>
            </div>
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
