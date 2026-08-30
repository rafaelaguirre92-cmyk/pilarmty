import Image from "next/image";
import Link from "next/link";

import {
  getCollections,
  getResources,
  getTeachings
} from "@/lib/content";
import { formatDate, localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function HomeContentSection({ locale }: { locale: Locale }) {
  const [teachings, collections, resources] = await Promise.all([
    getTeachings(locale),
    getCollections(locale),
    getResources(locale)
  ]);
  const sortedTeachings = [...teachings].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );
  const latestTeaching = sortedTeachings[0];
  const collectionOrder = new Map<string, string>();

  for (const teaching of sortedTeachings) {
    if (!collectionOrder.has(teaching.collection)) {
      collectionOrder.set(teaching.collection, teaching.date || "");
    }
  }

  const recentCollections = collections
    .filter((collection) => collection.kind === "serie")
    .sort((a, b) =>
      (collectionOrder.get(b.slug) || "").localeCompare(
        collectionOrder.get(a.slug) || ""
      )
    )
    .slice(0, 3);
  const recentResources = [...resources]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 3);

  const copy =
    locale === "es"
      ? {
          eyebrow: "Recursos",
          title: "Contenido para seguir creciendo.",
          latest: "Últimas enseñanzas",
          latestItem: "Última enseñanza",
          teachingsAction: "Ver enseñanzas",
          series: "Series recientes",
          seriesAction: "Ver series",
          resources: "Otros recursos",
          resourcesAction: "Ver recursos",
          article: "Artículo",
          pillar: "Contenido pilar",
          emptyResources: "Aún no hay entradas publicadas."
        }
      : {
          eyebrow: "Resources",
          title: "Content to keep growing.",
          latest: "Latest teachings",
          latestItem: "Latest teaching",
          teachingsAction: "View teachings",
          series: "Recent series",
          seriesAction: "View series",
          resources: "Other resources",
          resourcesAction: "View resources",
          article: "Article",
          pillar: "Pillar content",
          emptyResources: "There are no published entries yet."
        };

  return (
    <section className="section home-content-section">
      <div className="container home-content-shell">
        <div className="home-content-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>

        {latestTeaching && (
          <div className="home-content-group">
            <div className="home-content-heading">
              <h3>{copy.latest}</h3>
              <Link
                className="home-content-action"
                href={localePath(locale, "/recursos?tipo=ensenanzas")}
              >
                {copy.teachingsAction}
              </Link>
            </div>

            <div className="home-teachings-layout">
              <Link
                aria-label={latestTeaching.title}
                className="home-latest-teaching"
                href={localePath(
                  locale,
                  `/ensenanzas/${latestTeaching.collection}/${latestTeaching.slug}`
                )}
              >
                {latestTeaching.image && (
                  <span
                    className="home-latest-image"
                    aria-hidden="true"
                  >
                    <span className="home-latest-badge">
                      {copy.latestItem}
                    </span>
                    <Image
                      src={latestTeaching.image}
                      alt=""
                      fill
                      sizes="(max-width: 719px) calc(100vw - 32px), 48vw"
                    />
                  </span>
                )}
                <div className="home-latest-copy">
                  {!latestTeaching.image && (
                    <p className="eyebrow">{copy.latestItem}</p>
                  )}
                  <h3>{latestTeaching.title}</h3>
                  {latestTeaching.excerpt && <p>{latestTeaching.excerpt}</p>}
                  <div className="card-meta">
                    {latestTeaching.author && (
                      <span>{latestTeaching.author}</span>
                    )}
                    {latestTeaching.date && (
                      <time dateTime={latestTeaching.date}>
                        {formatDate(latestTeaching.date, locale)}
                      </time>
                    )}
                  </div>
                </div>
              </Link>

            </div>
          </div>
        )}

        {recentCollections.length > 0 && (
          <div className="home-content-group">
            <div className="home-content-heading">
              <h3>{copy.series}</h3>
              <Link
                className="home-content-action"
                href={localePath(locale, "/recursos?tipo=series")}
              >
                {copy.seriesAction}
              </Link>
            </div>
            <div className="home-series-grid">
              {recentCollections.map((collection) => (
                <Link
                  aria-label={collection.name}
                  className="home-series-card"
                  href={localePath(
                    locale,
                    `/ensenanzas/${collection.slug}`
                  )}
                  key={collection.slug}
                >
                  {collection.image && (
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 979px) calc(100vw - 32px), 33vw"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="home-content-group home-resources-group">
          <div className="home-content-heading">
            <h3>{copy.resources}</h3>
            <Link
              className="home-content-action"
              href={localePath(locale, "/recursos")}
            >
              {copy.resourcesAction}
            </Link>
          </div>
          {recentResources.length > 0 ? (
            <div className="home-resource-grid">
              {recentResources.map((resource) => (
                <article className="home-resource-card" key={resource.slug}>
                  <p className="eyebrow">
                    {resource.kind === "contenido-pilar"
                      ? copy.pillar
                      : copy.article}
                  </p>
                  <h3>
                    <Link
                      href={localePath(locale, `/recursos/${resource.slug}`)}
                    >
                      {resource.title}
                    </Link>
                  </h3>
                  {resource.excerpt && <p>{resource.excerpt}</p>}
                  <div className="card-meta">
                    {resource.author && <span>{resource.author}</span>}
                    {resource.date && (
                      <time dateTime={resource.date}>
                        {formatDate(resource.date, locale)}
                      </time>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-content-empty">{copy.emptyResources}</p>
          )}
        </div>
      </div>
    </section>
  );
}
