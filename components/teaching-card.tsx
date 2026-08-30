import Image from "next/image";
import Link from "next/link";

import { formatDate, localePath } from "@/lib/site";
import { getSpeakerImage } from "@/lib/speakers";
import { topicSlug } from "@/lib/topics";
import type { Teaching } from "@/lib/types";

import { TeachingCardActions } from "@/components/teaching-card-actions";

export function TeachingCard({ teaching }: { teaching: Teaching }) {
  const formattedDate = formatDate(teaching.date, teaching.locale);
  const speakerImage = getSpeakerImage(teaching.author, teaching.authorImage);
  const teachingHref = localePath(
    teaching.locale,
    `/ensenanzas/${teaching.collection}/${teaching.slug}`
  );

  return (
    <article className="teaching-card">
      {teaching.image && (
        <div className="teaching-card-image">
          <Image
            src={teaching.image}
            alt=""
            fill
            sizes="(max-width: 719px) 92vw, (max-width: 979px) 46vw, 30vw"
          />
        </div>
      )}
      <div className="teaching-card-copy">
        <div className="teaching-card-top">
          {(teaching.author || formattedDate) && (
            <div className="teaching-card-byline">
              {speakerImage && (
                <span className="teaching-card-byline-photo" aria-hidden="true">
                  <Image src={speakerImage} alt="" width={28} height={28} />
                </span>
              )}
              <div className="teaching-card-byline-copy">
                {teaching.author && (
                  <span className="teaching-card-byline-author">
                    {teaching.author}
                  </span>
                )}
                {formattedDate && (
                  <p className="teaching-card-byline-meta">
                    <time dateTime={teaching.date}>{formattedDate}</time>
                  </p>
                )}
              </div>
            </div>
          )}
          <TeachingCardActions
            href={teachingHref}
            title={teaching.title}
            locale={teaching.locale}
          />
        </div>
        <h3>
          <Link className="teaching-card-stretched-link" href={teachingHref}>
            {teaching.title}
          </Link>
        </h3>
        {teaching.keyVerse && (
          <p className="teaching-card-series">{teaching.keyVerse}</p>
        )}
        {teaching.excerpt && (
          <p className="teaching-card-excerpt">{teaching.excerpt}</p>
        )}
        <div className="teaching-card-footer" aria-label={teaching.locale === "es" ? "Actividad" : "Activity"}>
          {teaching.tags.length > 0 && (
            <div className="tag-row" aria-label={teaching.locale === "es" ? "Temas" : "Topics"}>
              {teaching.tags.slice(0, 2).map((tag) => (
                <Link
                  href={localePath(
                    teaching.locale,
                    `/recursos/temas/${topicSlug(tag)}`
                  )}
                  key={tag}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
          <div className="teaching-card-stats">
            <span className="teaching-card-stat">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="2.75" />
              </svg>
              <span>{teaching.viewCount ?? 0}</span>
              <span className="sr-only">
                {teaching.locale === "es" ? "vistas" : "views"}
              </span>
            </span>
            <span className="teaching-card-stat">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
              </svg>
              <span>{teaching.commentCount ?? 0}</span>
              <span className="sr-only">
                {teaching.locale === "es" ? "comentarios" : "comments"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
