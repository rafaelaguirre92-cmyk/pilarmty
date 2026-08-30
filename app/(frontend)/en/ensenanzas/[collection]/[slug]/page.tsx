import type { Metadata } from "next";

import { TeachingPage } from "@/components/teaching-page";
import {
  getTeaching,
  getTeachings,
  getTeachingTranslation
} from "@/lib/content";
import { redirectOrNotFound } from "@/lib/content/navigation";
import { pageMetadata, safeJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ collection: string; slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const teachings = await getTeachings("en");
  return teachings.map((teaching) => ({
    collection: teaching.collection,
    slug: teaching.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params;
  const teaching = await getTeaching("en", collection, slug);
  if (!teaching) return {};
  const translation = teaching.translation || getTeachingTranslation("en", collection, slug);
  return pageMetadata({
    title: teaching.seoTitle || teaching.title,
    description:
      teaching.seoDescription ||
      teaching.excerpt ||
      "Exploring God's Word to live the gospel in our daily lives.",
    path: `/en/ensenanzas/${collection}/${slug}`,
    locale: "en",
    canonical: teaching.canonical,
    noindex: teaching.noindex,
    alternatePath: translation
      ? `/ensenanzas/${translation.collection}/${translation.slug}`
      : undefined,
    image: teaching.socialImage || teaching.image,
    imageAlt: teaching.imageAlt || teaching.title
  });
}

export default async function Page({ params }: Props) {
  const { collection, slug } = await params;
  const teaching = await getTeaching("en", collection, slug);
  if (!teaching) {
    return redirectOrNotFound(`/en/ensenanzas/${collection}/${slug}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: teaching.title,
    description: teaching.seoDescription || teaching.excerpt,
    datePublished: teaching.date,
    dateModified: teaching.updatedAt || teaching.date,
    inLanguage: "en",
    author: teaching.author
      ? { "@type": "Person", name: teaching.author, url: teaching.authorUrl }
      : { "@type": "Organization", name: "Iglesia Pilar" },
    image: teaching.socialImage || teaching.image,
    publisher: { "@type": "Organization", name: "Iglesia Pilar", url: absoluteUrl("/en"), logo: { "@type": "ImageObject", url: absoluteUrl("/brand/iglesia-pilar.png") } },
    mainEntityOfPage: absoluteUrl(`/en/ensenanzas/${collection}/${slug}`)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <TeachingPage
        locale="en"
        collectionSlug={collection}
        slug={slug}
      />
    </>
  );
}
