import type { Locale, Resource, Teaching } from "@/lib/types";

export const TOPIC_INDEX_MIN_CONTENT = 3;

export type TopicSummary = {
  name: string;
  slug: string;
  count: number;
};

export type TopicContent = TopicSummary & {
  teachings: Teaching[];
  resources: Resource[];
};

export type TopicGroup = {
  id: string;
  title: string;
  topics: TopicSummary[];
};

const SCRIPTURE_SLUGS = new Set([
  "genesis",
  "exodo",
  "levitico",
  "numeros",
  "deuteronomio",
  "josue",
  "jueces",
  "rut",
  "1-samuel",
  "2-samuel",
  "1-reyes",
  "2-reyes",
  "salmos",
  "proverbios",
  "eclesiastes",
  "isaias",
  "jeremias",
  "ezekiel",
  "daniel",
  "oseas",
  "joel",
  "amos",
  "jonas",
  "miqueas",
  "nahum",
  "habacuc",
  "sofonias",
  "hageo",
  "zacarias",
  "malaquias",
  "mateo",
  "marcos",
  "lucas",
  "juan",
  "hechos",
  "romanos",
  "1-corintios",
  "2-corintios",
  "galatas",
  "efesios",
  "filipenses",
  "colosenses",
  "1-tesalonicenses",
  "2-tesalonicenses",
  "1-timoteo",
  "2-timoteo",
  "tito",
  "filemon",
  "hebreos",
  "santiago",
  "1-pedro",
  "2-pedro",
  "1-juan",
  "2-juan",
  "3-juan",
  "judas",
  "apocalipsis"
]);

const GOSPEL_SLUGS = new Set([
  "dios",
  "evangelio",
  "fe",
  "gracia",
  "hijo-de-dios",
  "jesucristo",
  "justicia",
  "justificacion",
  "reino-de-dios",
  "salvacion",
  "soberania",
  "sabiduria-de-dios",
  "trinidad"
]);

const CHRISTIAN_LIFE_SLUGS = new Set([
  "arrepentimiento",
  "autoridad",
  "comunidad",
  "descanso",
  "discipulado",
  "familia",
  "oracion",
  "parabolas",
  "santidad",
  "sufrimiento"
]);

export function topicSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isScriptureTopic(name: string) {
  return SCRIPTURE_SLUGS.has(topicSlug(name));
}

export function getTopicSummaries(
  teachings: Teaching[],
  resources: Resource[]
): TopicSummary[] {
  const topics = new Map<string, TopicSummary>();

  for (const item of [...teachings, ...resources]) {
    for (const name of new Set(item.tags)) {
      const slug = topicSlug(name);
      if (!slug) continue;
      const current = topics.get(slug);
      topics.set(slug, {
        name: current?.name || name,
        slug,
        count: (current?.count || 0) + 1
      });
    }
  }

  return [...topics.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTopicGroups(
  topics: TopicSummary[],
  locale: Locale
): TopicGroup[] {
  const labels =
    locale === "es"
      ? {
          scripture: "La Biblia",
          gospel: "Dios y el evangelio",
          life: "La vida cristiana",
          more: "Más temas"
        }
      : {
          scripture: "The Bible",
          gospel: "God and the gospel",
          life: "The Christian life",
          more: "More topics"
        };

  const groups: TopicGroup[] = [
    { id: "scripture", title: labels.scripture, topics: [] },
    { id: "gospel", title: labels.gospel, topics: [] },
    { id: "life", title: labels.life, topics: [] },
    { id: "more", title: labels.more, topics: [] }
  ];

  for (const topic of topics) {
    if (SCRIPTURE_SLUGS.has(topic.slug)) {
      groups[0].topics.push(topic);
    } else if (GOSPEL_SLUGS.has(topic.slug)) {
      groups[1].topics.push(topic);
    } else if (CHRISTIAN_LIFE_SLUGS.has(topic.slug)) {
      groups[2].topics.push(topic);
    } else {
      groups[3].topics.push(topic);
    }
  }

  return groups.filter((group) => group.topics.length > 0);
}

export function getTopicContent(
  slug: string,
  teachings: Teaching[],
  resources: Resource[]
): TopicContent | null {
  const topic = getTopicSummaries(teachings, resources).find(
    (item) => item.slug === slug
  );
  if (!topic) return null;

  return {
    ...topic,
    teachings: teachings.filter((item) =>
      item.tags.some((tag) => topicSlug(tag) === slug)
    ),
    resources: resources.filter((item) =>
      item.tags.some((tag) => topicSlug(tag) === slug)
    )
  };
}

export function isTopicIndexable(topic: TopicSummary) {
  return topic.count >= TOPIC_INDEX_MIN_CONTENT;
}

export function topicDescription(topic: string, locale: Locale) {
  if (locale === "es") {
    return `Enseñanzas y recursos de Iglesia Pilar sobre ${topic}: para comprender la Palabra y vivir el evangelio con fidelidad.`;
  }

  return `Teachings and resources from Iglesia Pilar on ${topic}: to understand Scripture and live the gospel faithfully.`;
}
