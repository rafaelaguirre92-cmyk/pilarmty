import { getCollections, getResources, getTeachings } from "@/lib/content";
import { localePath } from "@/lib/site";
import { getTopicSummaries } from "@/lib/topics";
import type { Locale } from "@/lib/types";

export type SearchKind =
  | "teaching"
  | "collection"
  | "resource"
  | "topic"
  | "page";

export type SearchResult = {
  kind: SearchKind;
  label: string;
  title: string;
  author?: string;
  excerpt?: string;
  meta?: string;
  href: string;
};

export type IndexedSearchItem = SearchResult & {
  keywords: string;
};

const STATIC_PAGES = {
  es: [
    ["Conócenos", "Quiénes somos, nuestras creencias y socios ministeriales.", "/conocenos"],
    ["Comunidades", "Conoce y únete a una comunidad de Iglesia Pilar.", "/comunidades"],
    ["Visítanos", "Horarios, ubicación y qué esperar en Iglesia Pilar.", "/visitanos"],
    ["Dar", "Formas de participar con generosidad en la misión de Iglesia Pilar.", "/dar"]
  ],
  en: [
    ["About us", "Who we are, what we believe, and our ministry partners.", "/conocenos"],
    ["Communities", "Learn about and join an Iglesia Pilar community.", "/comunidades"],
    ["Visit us", "Times, location, and what to expect at Iglesia Pilar.", "/visitanos"],
    ["Give", "Ways to participate generously in Iglesia Pilar's mission.", "/dar"]
  ]
} satisfies Record<Locale, Array<[string, string, string]>>;

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isNearMatch(value: string, candidate: string) {
  if (value.length < 5 || Math.abs(value.length - candidate.length) > 1) {
    return false;
  }

  let edits = 0;
  let valueIndex = 0;
  let candidateIndex = 0;
  while (valueIndex < value.length && candidateIndex < candidate.length) {
    if (value[valueIndex] === candidate[candidateIndex]) {
      valueIndex += 1;
      candidateIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (value.length > candidate.length) valueIndex += 1;
    else if (candidate.length > value.length) candidateIndex += 1;
    else {
      valueIndex += 1;
      candidateIndex += 1;
    }
  }

  return edits + Number(valueIndex < value.length || candidateIndex < candidate.length) <= 1;
}

function fieldScore(field: string, query: string, weight: number) {
  const normalized = normalizeSearchText(field);
  if (!normalized) return 0;
  if (normalized === query) return weight * 4;
  if (normalized.startsWith(query)) return weight * 2.5;
  if (normalized.includes(query)) return weight * 1.5;

  const words = normalized.split(" ");
  return query.split(" ").reduce((score, token) => {
    if (words.some((word) => word === token)) return score + weight;
    if (words.some((word) => word.startsWith(token))) return score + weight * 0.7;
    if (words.some((word) => word.includes(token))) return score + weight * 0.45;
    if (words.some((word) => isNearMatch(token, word))) return score + weight * 0.3;
    return score;
  }, 0);
}

function matchesEveryToken(item: IndexedSearchItem, query: string) {
  const corpus = normalizeSearchText(
    [item.title, item.author, item.meta, item.keywords, item.excerpt]
      .filter(Boolean)
      .join(" ")
  );
  const words = corpus.split(" ");
  return query.split(" ").every((token) =>
    words.some(
      (word) =>
        word.includes(token) ||
        (word.length >= 4 && token.includes(word)) ||
        isNearMatch(token, word)
    )
  );
}

export function rankSearchItems(
  items: IndexedSearchItem[],
  query: string,
  limit = 100
): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];

  return items
    .filter((item) => matchesEveryToken(item, normalizedQuery))
    .map((item) => ({
      item,
      score:
        fieldScore(item.title, normalizedQuery, 60) +
        fieldScore(item.author || "", normalizedQuery, 32) +
        fieldScore(item.meta || "", normalizedQuery, 28) +
        fieldScore(item.keywords, normalizedQuery, 20) +
        fieldScore(item.excerpt || "", normalizedQuery, 8)
    }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map(({ item }) => {
      const result: SearchResult = {
        kind: item.kind,
        label: item.label,
        title: item.title,
        href: item.href
      };
      if (item.author) result.author = item.author;
      if (item.excerpt) result.excerpt = item.excerpt;
      if (item.meta) result.meta = item.meta;
      return result;
    });
}

export async function buildSearchIndex(locale: Locale): Promise<IndexedSearchItem[]> {
  const [teachings, resources, collections] = await Promise.all([
    getTeachings(locale),
    getResources(locale),
    getCollections(locale)
  ]);
  const topics = getTopicSummaries(teachings, resources);
  const labels =
    locale === "es"
      ? {
          teaching: "Enseñanza",
          resource: "Recurso",
          topic: "Temática",
          page: "Página",
          series: "Serie",
          event: "Evento",
          contents: "contenidos"
        }
      : {
          teaching: "Teaching",
          resource: "Resource",
          topic: "Topic",
          page: "Page",
          series: "Series",
          event: "Event",
          contents: "items"
        };

  return [
    ...teachings.map((item): IndexedSearchItem => ({
      kind: "teaching",
      label: labels.teaching,
      title: item.title,
      excerpt: item.excerpt,
      author: item.author,
      meta: item.collectionName,
      href: localePath(locale, `/ensenanzas/${item.collection}/${item.slug}`),
      keywords: [item.author, item.collectionName, ...item.tags].filter(Boolean).join(" ")
    })),
    ...collections.map((item): IndexedSearchItem => ({
      kind: "collection",
      label: item.kind === "evento" ? labels.event : labels.series,
      title: item.name,
      excerpt: item.description,
      href: localePath(locale, `/ensenanzas/${item.slug}`),
      keywords: `${item.kind} ${item.name}`
    })),
    ...resources.map((item): IndexedSearchItem => ({
      kind: "resource",
      label: labels.resource,
      title: item.title,
      excerpt: item.excerpt,
      author: item.author,
      href: localePath(locale, `/recursos/${item.slug}`),
      keywords: [item.author, ...item.tags].filter(Boolean).join(" ")
    })),
    ...topics.map((item): IndexedSearchItem => ({
      kind: "topic",
      label: labels.topic,
      title: item.name,
      meta: `${item.count} ${labels.contents}`,
      href: localePath(locale, `/recursos/temas/${item.slug}`),
      keywords: item.name
    })),
    ...STATIC_PAGES[locale].map(([title, excerpt, path]): IndexedSearchItem => ({
      kind: "page",
      label: labels.page,
      title,
      excerpt,
      href: localePath(locale, path),
      keywords: `${title} ${excerpt}`
    }))
  ];
}

export async function searchContent(locale: Locale, query: string, limit = 100) {
  return rankSearchItems(await buildSearchIndex(locale), query, limit);
}
