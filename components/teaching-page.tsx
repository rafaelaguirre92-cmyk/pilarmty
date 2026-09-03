import Link from "next/link";
import { Fragment } from "react";

import { ArticleBody } from "@/components/article-body";
import { ScriptureTooltip } from "@/components/scripture-tooltip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import { TeachingToc } from "@/components/teaching-toc";
import { TeachingVideoPlayer } from "@/components/teaching-video-player";
import { extractArticleHeadings } from "@/lib/article-headings";
import { extractBibleReferences } from "@/lib/bible";
import {
  getCollection,
  getTeaching,
  getTeachings
} from "@/lib/content";
import { formatDate, localePath } from "@/lib/site";
import { spotifyEpisodeEmbedUrl } from "@/lib/spotify";
import { topicSlug } from "@/lib/topics";
import type { Locale } from "@/lib/types";

function youtubeVideoId(value?: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");
    const videoId =
      hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") ||
          (url.pathname.startsWith("/embed/")
            ? url.pathname.split("/").filter(Boolean)[1]
            : undefined);

    return videoId || undefined;
  } catch {
    return undefined;
  }
}

function youtubeEmbedUrl(value?: string) {
  const videoId = youtubeVideoId(value);
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
    : undefined;
}

function youtubePosterUrl(value?: string) {
  const videoId = youtubeVideoId(value);
  return videoId
    ? `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`
    : undefined;
}

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

  const collectionTeachings = allTeachings.filter(
    (item) => item.collection === collectionSlug
  );
  const currentIndex = collectionTeachings.findIndex(
    (item) => item.slug === teaching.slug
  );
  const previousTeaching =
    currentIndex > 0 ? collectionTeachings[currentIndex - 1] : null;
  const nextTeaching =
    currentIndex >= 0 && currentIndex < collectionTeachings.length - 1
      ? collectionTeachings[currentIndex + 1]
      : null;

  const related = collectionTeachings
    .filter((item) => item.slug !== teaching.slug)
    .slice(0, 3);
  const date = formatDate(teaching.date, locale);
  const youtubeEmbed = youtubeEmbedUrl(teaching.youtubeUrl);
  const youtubePoster = youtubePosterUrl(teaching.youtubeUrl);
  const spotifyEmbed = spotifyEpisodeEmbedUrl(teaching.spotifyUrl);
  const headings = extractArticleHeadings({
    blocks: teaching.blocks,
    body: teaching.body
  });

  const authorHref = teaching.author
    ? teaching.authorUrl ||
      localePath(
        locale,
        `/recursos?predicador=${encodeURIComponent(teaching.author)}#catalogo`
      )
    : undefined;

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="teaching-page-main">
        <article className="teaching-article">
          <header className="teaching-article-header">
            <div className="container teaching-header-container">
              <div className="teaching-header-grid">
                <div className="teaching-header-aside">
                  <nav className="breadcrumbs teaching-header-breadcrumbs" aria-label="Breadcrumb">
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
                </div>

                <div className="teaching-header-main">
                  <div className="teaching-header-heading">
                    <p className="eyebrow teaching-eyebrow">
                      {locale === "es"
                        ? `Serie: ${collection.name}${teaching.episode ? ` · Capítulo ${teaching.episode}` : ""}`
                        : `Series: ${collection.name}${teaching.episode ? ` · Chapter ${teaching.episode}` : ""}`}
                    </p>
                    <h1 className="teaching-title">{teaching.title}</h1>
                  </div>

                  <div className="teaching-header-details">
                    <div className="teaching-meta-row">
                      {teaching.author && authorHref && (
                        <div className="teaching-meta-item teaching-meta-author">
                          <Link className="teaching-author-link" href={authorHref}>
                            <span className="teaching-author-avatar">
                              {teaching.author.charAt(0)}
                            </span>
                            <span className="teaching-meta-val">{teaching.author}</span>
                          </Link>
                        </div>
                      )}

                      {teaching.keyVerse && (
                        <div className="teaching-meta-item">
                          <span className="teaching-meta-label">
                            {locale === "es" ? "Pasaje" : "Passage"}
                          </span>
                          <span className="teaching-meta-val">
                            {extractBibleReferences(teaching.keyVerse).map((part, i) =>
                              part.type === "reference" ? (
                                <ScriptureTooltip key={i} reference={part.content} locale={locale} />
                              ) : (
                                <Fragment key={i}>{part.content}</Fragment>
                              )
                            )}
                          </span>
                        </div>
                      )}

                      {date && (
                        <div className="teaching-meta-item">
                          <span className="teaching-meta-label">
                            {locale === "es" ? "Fecha" : "Date"}
                          </span>
                          <time className="teaching-meta-val" dateTime={teaching.date}>
                            {date}
                          </time>
                        </div>
                      )}

                      {teaching.durationMinutes ? (
                        <div className="teaching-meta-item">
                          <span className="teaching-meta-label">
                            {locale === "es" ? "Duración" : "Duration"}
                          </span>
                          <span className="teaching-meta-val">
                            {teaching.durationMinutes} min
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {teaching.tags.length > 0 && (
                      <div
                        className="tag-row teaching-tags"
                        aria-label={locale === "es" ? "Temas" : "Topics"}
                      >
                        {teaching.tags.map((tag) => (
                          <Link
                            href={localePath(
                              locale,
                              `/recursos/temas/${topicSlug(tag)}`
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

          {youtubeEmbed && (
            <section className="teaching-video-section">
              <div className="container teaching-video-container">
                <TeachingVideoPlayer
                  locale={locale}
                  title={teaching.title}
                  youtubeEmbed={youtubeEmbed}
                  youtubePoster={youtubePoster}
                />
              </div>
            </section>
          )}

          {spotifyEmbed && (
            <section className="teaching-audio-section">
              <div className="container teaching-audio-container">
                <div className="teaching-audio-frame">
                  <iframe
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="teaching-audio-iframe"
                    height="150"
                    loading="lazy"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                    src={spotifyEmbed}
                    title={`${teaching.title} · Spotify`}
                  />
                </div>
              </div>
            </section>
          )}

          <div className="container teaching-body-container">
            <div className="teaching-body-grid">
              <div className="teaching-body-aside">
                {headings.length > 1 && (
                  <TeachingToc headings={headings} locale={locale} />
                )}
              </div>

              <div className="teaching-content" id="contenido-ensenanza">
                <ArticleBody
                  blocks={teaching.blocks}
                  body={teaching.body}
                  locale={locale}
                />
              </div>
            </div>
          </div>

          {(previousTeaching || nextTeaching) && (
            <nav
              className="container teaching-nav-container"
              aria-label={locale === "es" ? "Navegación de capítulos" : "Chapter navigation"}
            >
              <div className="teaching-nav">
                {previousTeaching ? (
                  <Link
                    className="teaching-nav-link teaching-nav-prev"
                    href={localePath(
                      locale,
                      `/ensenanzas/${collectionSlug}/${previousTeaching.slug}`
                    )}
                  >
                    <span className="teaching-nav-label">
                      ← {locale === "es" ? "Capítulo anterior" : "Previous chapter"}
                    </span>
                    <span className="teaching-nav-title">
                      {previousTeaching.title}
                    </span>
                  </Link>
                ) : (
                  <div className="teaching-nav-placeholder" />
                )}

                <Link
                  className="button secondary teaching-nav-series-link"
                  href={localePath(
                    locale,
                    `/ensenanzas/${collection.slug}`
                  )}
                >
                  {locale === "es" ? "Ver toda la serie" : "View entire series"}
                </Link>

                {nextTeaching ? (
                  <Link
                    className="teaching-nav-link teaching-nav-next"
                    href={localePath(
                      locale,
                      `/ensenanzas/${collectionSlug}/${nextTeaching.slug}`
                    )}
                  >
                    <span className="teaching-nav-label">
                      {locale === "es" ? "Siguiente capítulo" : "Next chapter"} →
                    </span>
                    <span className="teaching-nav-title">
                      {nextTeaching.title}
                    </span>
                  </Link>
                ) : (
                  <div className="teaching-nav-placeholder" />
                )}
              </div>
            </nav>
          )}
        </article>

        {related.length > 0 && (
          <section className="section related-section">
            <div className="container">
              <div className="communities-section-heading">
                <h2>
                  {locale === "es"
                    ? "Recursos relacionados"
                    : "Related resources"}
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
