import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopicEntries } from "@/components/topic-entries";
import { getResources, getTeachings, getTopicPublicationOverrides } from "@/lib/content";
import { localePath } from "@/lib/site";
import {
  getTopicContent,
  getTopicGroups,
  getTopicSummaries,
  isTopicIndexable,
  topicDescription
} from "@/lib/topics";
import type { Locale } from "@/lib/types";

export async function TopicsIndexPage({ locale }: { locale: Locale }) {
  const [teachings, resources, publication] = await Promise.all([
    getTeachings(locale),
    getResources(locale),
    getTopicPublicationOverrides()
  ]);
  const topics = getTopicSummaries(
    teachings,
    resources,
    publication.published,
    publication.unpublished
  ).filter(isTopicIndexable);
  const groups = getTopicGroups(topics, locale);
  const scriptureGroup = groups.find((group) => group.id === "scripture");
  const themeGroups = groups.filter((group) => group.id !== "scripture");
  const copy =
    locale === "es"
      ? {
          eyebrow: "Recursos",
          title: "Temáticas",
          intro:
            "Un índice de temas para explorar las enseñanzas y recursos de Iglesia Pilar."
        }
      : {
          eyebrow: "Resources",
          title: "Topics",
          intro:
            "A topic index for exploring Iglesia Pilar teachings and resources."
        };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <header className="topics-hero">
          <div className="container">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>
              <span className="about-intro-headline">
                <em>{copy.title}</em>
              </span>
            </h1>
            <p className="topics-hero-intro">{copy.intro}</p>
          </div>
        </header>

        <section className="section topics-index-section">
          <div className="container topics-index-layout">
            {scriptureGroup && (
              <div className="topic-directory-group topic-directory-scripture">
                <h2>{scriptureGroup.title}</h2>
                <ul>
                  {scriptureGroup.topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link
                        href={localePath(
                          locale,
                          `/recursos/temas/${topic.slug}`
                        )}
                      >
                        {topic.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {themeGroups.length > 0 && (
              <div className="topics-directory">
                {themeGroups.map((group) => (
                  <div className="topic-directory-group" key={group.id}>
                    <h2>{group.title}</h2>
                    <ul>
                      {group.topics.map((topic) => (
                        <li key={topic.slug}>
                          <Link
                            href={localePath(
                              locale,
                              `/recursos/temas/${topic.slug}`
                            )}
                          >
                            {topic.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export async function TopicPage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [teachings, resources, publication] = await Promise.all([
    getTeachings(locale),
    getResources(locale),
    getTopicPublicationOverrides()
  ]);
  const topic = getTopicContent(
    slug,
    teachings,
    resources,
    publication.published,
    publication.unpublished
  );
  if (!topic) return null;

  const copy =
    locale === "es"
      ? {
          back: "Todas las temáticas",
          eyebrow: "Temática",
          all: "Todos",
          teachings: "Enseñanzas",
          articles: "Artículos",
          teaching: "Enseñanza",
          article: "Artículo",
          empty: "No hay entradas en esta categoría."
        }
      : {
          back: "All topics",
          eyebrow: "Topic",
          all: "All",
          teachings: "Teachings",
          articles: "Articles",
          teaching: "Teaching",
          article: "Article",
          empty: "There are no entries in this category."
        };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <header className="topics-hero">
          <div className="container">
            <Link
              className="back-link"
              href={localePath(locale, "/recursos/temas")}
            >
              ← {copy.back}
            </Link>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>
              <span className="about-intro-headline">
                <em>{topic.name}</em>
              </span>
            </h1>
            <p className="topics-hero-intro">{topicDescription(topic.name, locale)}</p>
          </div>
        </header>

        <section className="section topic-content-section">
          <div className="container">
            <TopicEntries
              locale={locale}
              teachings={topic.teachings}
              resources={topic.resources}
              labels={copy}
            />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
