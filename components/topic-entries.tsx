"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatDate, localePath } from "@/lib/site";
import type { Locale, Resource, Teaching } from "@/lib/types";

type TopicEntry =
  | {
      kind: "teaching";
      date: string;
      teaching: Teaching;
    }
  | {
      kind: "resource";
      date: string;
      resource: Resource;
    };

type EntryFilter = "todo" | "ensenanzas" | "articulos";

export function TopicEntries({
  locale,
  teachings,
  resources,
  labels
}: {
  locale: Locale;
  teachings: Teaching[];
  resources: Resource[];
  labels: {
    all: string;
    teachings: string;
    articles: string;
    teaching: string;
    article: string;
    empty: string;
  };
}) {
  const [filter, setFilter] = useState<EntryFilter>("todo");
  const entries = useMemo<TopicEntry[]>(
    () =>
      [
        ...teachings.map((teaching) => ({
          kind: "teaching" as const,
          date: teaching.date || "",
          teaching
        })),
        ...resources.map((resource) => ({
          kind: "resource" as const,
          date: resource.date || "",
          resource
        }))
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [teachings, resources]
  );
  const visible = entries.filter((entry) => {
    if (filter === "ensenanzas") return entry.kind === "teaching";
    if (filter === "articulos") return entry.kind === "resource";
    return true;
  });
  const allTabs: Array<{ id: EntryFilter; label: string; count: number }> = [
    { id: "todo", label: labels.all, count: entries.length },
    {
      id: "ensenanzas",
      label: labels.teachings,
      count: teachings.length
    },
    {
      id: "articulos",
      label: labels.articles,
      count: resources.length
    }
  ];
  const tabs = allTabs.filter((tab) => tab.id === "todo" || tab.count > 0);

  return (
    <div className="topic-entries">
      {tabs.length > 2 && (
        <nav className="resource-catalog-tabs" aria-label={labels.all}>
          {tabs.map((tab) => (
            <button
              aria-pressed={filter === tab.id}
              className={filter === tab.id ? "active" : undefined}
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {visible.length > 0 ? (
        <div className="topic-entry-list">
          {visible.map((entry) => {
            if (entry.kind === "teaching") {
              const teaching = entry.teaching;
              return (
                <article
                  className="topic-entry"
                  key={`teaching-${teaching.slug}`}
                >
                  <p className="eyebrow">{labels.teaching}</p>
                  <h2>
                    <Link
                      href={localePath(
                        locale,
                        `/ensenanzas/${teaching.collection}/${teaching.slug}`
                      )}
                    >
                      {teaching.title}
                    </Link>
                  </h2>
                  {teaching.excerpt && <p>{teaching.excerpt}</p>}
                  <div className="card-meta">
                    {teaching.author && <span>{teaching.author}</span>}
                    {teaching.date && (
                      <time dateTime={teaching.date}>
                        {formatDate(teaching.date, locale)}
                      </time>
                    )}
                  </div>
                </article>
              );
            }

            const resource = entry.resource;
            return (
              <article
                className="topic-entry"
                key={`resource-${resource.slug}`}
              >
                <p className="eyebrow">{labels.article}</p>
                <h2>
                  <Link href={localePath(locale, `/recursos/${resource.slug}`)}>
                    {resource.title}
                  </Link>
                </h2>
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
            );
          })}
        </div>
      ) : (
        <p className="topic-entries-empty">{labels.empty}</p>
      )}
    </div>
  );
}
