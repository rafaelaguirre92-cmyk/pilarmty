import type { Metadata } from "next";

import { TeachingPage } from "@/components/teaching-page";
import {
  getTeaching,
  getTeachings,
  getTeachingTranslation
} from "@/lib/content";
import { redirectOrNotFound } from "@/lib/content/navigation";
import { absoluteUrl, localePath } from "@/lib/site";
import { pageMetadata, safeJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ collection: string; slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const teachings = await getTeachings("es");
  return teachings.map((teaching) => ({
    collection: teaching.collection,
    slug: teaching.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, slug } = await params;
  const teaching = await getTeaching("es", collection, slug);
  if (!teaching) return {};
  const translation = teaching.translation || getTeachingTranslation("es", collection, slug);
  return pageMetadata({
    title: teaching.seoTitle || teaching.title,
    description:
      teaching.seoDescription ||
      teaching.excerpt ||
      "Explorando la Palabra de Dios para vivir el evangelio en nuestra vida diaria.",
    path: `/ensenanzas/${collection}/${slug}`,
    locale: "es",
    canonical: teaching.canonical,
    noindex: teaching.noindex,
    alternatePath: translation
      ? localePath(
          "en",
          `/ensenanzas/${translation.collection}/${translation.slug}`
        )
      : undefined,
    image: teaching.socialImage || teaching.image,
    imageAlt: teaching.imageAlt || teaching.title
  });
}

export default async function Page({ params }: Props) {
  const { collection, slug } = await params;
  const teaching = await getTeaching("es", collection, slug);
  if (!teaching) {
    return redirectOrNotFound(`/ensenanzas/${collection}/${slug}`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: teaching.title,
    description: teaching.seoDescription || teaching.excerpt,
    datePublished: teaching.date,
    dateModified: teaching.updatedAt || teaching.date,
    inLanguage: "es-MX",
    author: teaching.author
      ? { "@type": "Person", name: teaching.author, url: teaching.authorUrl }
      : { "@type": "Organization", name: "Iglesia Pilar" },
    image: teaching.socialImage || teaching.image,
    publisher: { "@type": "Organization", name: "Iglesia Pilar", url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/brand/iglesia-pilar.png") } },
    mainEntityOfPage: absoluteUrl(`/ensenanzas/${collection}/${slug}`),
    about: teaching.tags
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <TeachingPage
        locale="es"
        collectionSlug={collection}
        slug={slug}
      />
    </>
  );
}
