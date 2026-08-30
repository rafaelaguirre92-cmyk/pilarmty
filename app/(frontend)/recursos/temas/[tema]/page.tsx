import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TopicPage } from "@/components/topics-page";
import { getResources, getTeachings } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata, safeJsonLd } from "@/lib/seo";
import {
  getTopicContent,
  getTopicSummaries,
  isTopicIndexable,
  topicDescription
} from "@/lib/topics";

type Props = { params: Promise<{ tema: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const [teachings, resources] = await Promise.all([
    getTeachings("es"),
    getResources("es")
  ]);
  return getTopicSummaries(teachings, resources).map((topic) => ({
    tema: topic.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tema } = await params;
  const [teachings, resources] = await Promise.all([
    getTeachings("es"),
    getResources("es")
  ]);
  const topic = getTopicContent(tema, teachings, resources);
  if (!topic) return {};

  return pageMetadata({
    title: topic.name,
    description: topicDescription(topic.name, "es"),
    path: `/recursos/temas/${topic.slug}`,
    locale: "es",
    noindex: !isTopicIndexable(topic)
  });
}

export default async function Page({ params }: Props) {
  const { tema } = await params;
  const [teachings, resources] = await Promise.all([
    getTeachings("es"),
    getResources("es")
  ]);
  const topic = getTopicContent(tema, teachings, resources);
  if (!topic) notFound();

  const description = topicDescription(topic.name, "es");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description,
    url: absoluteUrl(`/recursos/temas/${topic.slug}`),
    numberOfItems: topic.count
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <TopicPage locale="es" slug={topic.slug} />
    </>
  );
}
