"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { formatDate, localePath } from "@/lib/site";
import { TeachingCard } from "@/components/teaching-card";
import type { Collection, Locale, Teaching } from "@/lib/types";

type SortOrder = "chronological" | "newest";

export function CollectionChapters({
  collection,
  locale,
  teachings
}: {
  collection: Collection;
  locale: Locale;
  teachings: Teaching[];
}) {
  const [order, setOrder] = useState<SortOrder>("chronological");
  const isSpanish = locale === "es";
  const usesCards = ["tematicas", "orador-invitado"].includes(collection.slug);

  const sortedTeachings = useMemo(() => {
    const list = [...teachings];
    list.sort((a, b) => {
      if (a.episode != null && b.episode != null) {
        return order === "chronological"
          ? a.episode - b.episode
          : b.episode - a.episode;
      }
      if (a.date && b.date) {
        return order === "chronological"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      if (a.episode != null) return order === "chronological" ? -1 : 1;
      if (b.episode != null) return order === "chronological" ? 1 : -1;
      return 0;
    });
    return list;
  }, [teachings, order]);

  const kindLabel =
    collection.slug === "tematicas"
      ? isSpanish
        ? "Temáticas"
        : "Themes"
      : collection.slug === "orador-invitado"
        ? isSpanish
          ? "Oradores invitados"
          : "Guest speakers"
        : collection.kind === "evento"
      ? isSpanish
        ? "Evento especial"
        : "Special Event"
      : isSpanish
        ? "Serie expositiva"
        : "Expository Series";

  const countLabel = usesCards
    ? `${teachings.length} ${teachings.length === 1 ? (isSpanish ? "enseñanza" : "teaching") : (isSpanish ? "enseñanzas" : "teachings")}`
    : teachings.length === 1
      ? `${teachings.length} ${isSpanish ? "capítulo" : "chapter"}`
      : `${teachings.length} ${isSpanish ? "capítulos" : "chapters"}`;

  const labels = {
    orderChronological: isSpanish ? "Capítulo 1 primero" : "Chapter 1 first",
    orderNewest: isSpanish ? "Más recientes primero" : "Newest first",
    chapterPrefix: isSpanish ? "Capítulo" : "Chapter",
    sessionPrefix: isSpanish ? "Sesión" : "Session",
    empty: isSpanish
      ? "No hay enseñanzas publicadas en esta serie aún."
      : "No teachings published in this series yet."
  };

  return (
    <div className="collection-chapters-section">
      <div className="collection-chapters-header">
        <div className="collection-chapters-header-copy">
          <nav aria-label="Breadcrumb" className="breadcrumbs collection-breadcrumbs">
            <Link href={localePath(locale, "/recursos")}>
              {isSpanish ? "Recursos" : "Resources"}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{kindLabel}</span>
          </nav>

          <div className="collection-hero-kicker-row">
            <span className="collection-kind-pill">{kindLabel}</span>
            <span className="collection-count-pill">{countLabel}</span>
          </div>

          <h1 className="collection-clean-title">{collection.name}</h1>
          {collection.description && (
            <p className="collection-clean-description">{collection.description}</p>
          )}
        </div>

        {!usesCards && teachings.length > 1 && (
          <div
            aria-label={isSpanish ? "Orden de capítulos" : "Chapter order"}
            className="collection-chapters-sort"
            role="radiogroup"
          >
            <button
              aria-checked={order === "chronological"}
              className={`collection-sort-btn ${order === "chronological" ? "active" : ""}`}
              onClick={() => setOrder("chronological")}
              role="radio"
              type="button"
            >
              <span className="collection-sort-icon">↓</span>
              {labels.orderChronological}
            </button>
            <button
              aria-checked={order === "newest"}
              className={`collection-sort-btn ${order === "newest" ? "active" : ""}`}
              onClick={() => setOrder("newest")}
              role="radio"
              type="button"
            >
              <span className="collection-sort-icon">↑</span>
              {labels.orderNewest}
            </button>
          </div>
        )}
      </div>

      {sortedTeachings.length === 0 ? (
        <p className="collection-chapters-empty">{labels.empty}</p>
      ) : usesCards ? (
        <div className="teaching-grid collection-teaching-grid">
          {teachings.map((teaching) => (
            <TeachingCard key={teaching.slug} teaching={teaching} />
          ))}
        </div>
      ) : (
        <div className="collection-chapters-timeline">
          {sortedTeachings.map((teaching, index) => {
            const chapterNum =
              teaching.episode != null
                ? teaching.episode
                : order === "chronological"
                  ? index + 1
                  : sortedTeachings.length - index;

            const chapterFormatted = String(chapterNum).padStart(2, "0");
            const formattedDate = formatDate(teaching.date, locale);
            const teachingHref = localePath(
              locale,
              `/ensenanzas/${teaching.collection}/${teaching.slug}`
            );
            const imageSrc = teaching.image || collection.image;

            return (
              <div
                className="collection-chapter-item"
                id={`capitulo-${chapterNum}`}
                key={teaching.slug}
              >
                <div aria-hidden="true" className="collection-chapter-rail">
                  <div className="collection-chapter-node">
                    <span className="collection-chapter-node-num">
                      {chapterFormatted}
                    </span>
                  </div>
                  <div className="collection-chapter-line" />
                </div>

                <Link
                  aria-label={teaching.title}
                  className="collection-chapter-card home-latest-teaching"
                  href={teachingHref}
                >
                  {imageSrc && (
                    <span aria-hidden="true" className="home-latest-image">
                      <span className="home-latest-badge">
                        {collection.kind === "evento"
                          ? labels.sessionPrefix
                          : labels.chapterPrefix}{" "}
                        {chapterFormatted}
                      </span>
                      <Image
                        alt=""
                        className="collection-chapter-img"
                        fill
                        sizes="(max-width: 768px) calc(100vw - 32px), 48vw"
                        src={imageSrc}
                      />
                    </span>
                  )}

                  <div className="home-latest-copy">
                    {!imageSrc && (
                      <p className="eyebrow">
                        {collection.kind === "evento"
                          ? labels.sessionPrefix
                          : labels.chapterPrefix}{" "}
                        {chapterFormatted}
                      </p>
                    )}
                    <h3>{teaching.title}</h3>
                    {teaching.excerpt && <p>{teaching.excerpt}</p>}
                    <div className="card-meta">
                      {teaching.author && <span>{teaching.author}</span>}
                      {formattedDate && (
                        <time dateTime={teaching.date}>{formattedDate}</time>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
