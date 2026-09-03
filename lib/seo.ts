import type { Metadata } from "next";

import { absoluteUrl, localePath, SITE_NAME } from "@/lib/site";
import type { Locale, Teaching } from "@/lib/types";

export function pageMetadata({
  title,
  description,
  path,
  locale,
  alternatePath,
  canonical: canonicalOverride,
  noindex = false,
  image = "/images/church-community.webp",
  imageAlt
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  alternatePath?: string;
  canonical?: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const canonical = absoluteUrl(canonicalOverride || path);
  const languages: Record<string, string> = {
    [locale === "es" ? "es-MX" : "en"]: canonical
  };
  if (alternatePath) {
    languages[locale === "es" ? "en" : "es-MX"] =
      absoluteUrl(alternatePath);
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages
    },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "article",
      images: [{ url: absoluteUrl(image), alt: imageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)]
    }
  };
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

function youtubeVideoId(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

function isoDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

export function teachingStructuredData({
  teaching,
  locale,
  collection,
  slug
}: {
  teaching: Teaching;
  locale: Locale;
  collection: string;
  slug: string;
}) {
  const language = locale === "es" ? "es-MX" : "en-US";
  const teachingPath = localePath(
    locale,
    `/ensenanzas/${collection}/${slug}`
  );
  const pageUrl = absoluteUrl(teachingPath);
  const description =
    teaching.seoDescription ||
    teaching.excerpt ||
    (locale === "es"
      ? "Una enseñanza bíblica de Iglesia Pilar."
      : "A biblical teaching from Iglesia Pilar.");
  const author = teaching.author
    ? {
        "@type": "Person",
        name: teaching.author,
        ...(teaching.authorUrl ? { url: teaching.authorUrl } : {})
      }
    : { "@type": "Organization", name: SITE_NAME };
  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/iglesia-pilar.png")
    }
  };
  const graph: Array<Record<string, unknown>> = [
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: teaching.title,
      description,
      datePublished: teaching.date,
      dateModified: teaching.updatedAt || teaching.date,
      inLanguage: language,
      author,
      image: teaching.socialImage || teaching.image,
      publisher,
      mainEntityOfPage: pageUrl,
      about: teaching.tags
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "es" ? "Recursos" : "Resources",
          item: absoluteUrl(localePath(locale, "/recursos"))
        },
        {
          "@type": "ListItem",
          position: 2,
          name: teaching.collectionName || collection,
          item: absoluteUrl(
            localePath(locale, `/ensenanzas/${teaching.collection || collection}`)
          )
        },
        {
          "@type": "ListItem",
          position: 3,
          name: teaching.title,
          item: pageUrl
        }
      ]
    }
  ];

  const videoId = youtubeVideoId(teaching.youtubeUrl);
  if (videoId && teaching.date) {
    graph.push({
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      name: teaching.title,
      description,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      uploadDate: teaching.date,
      ...(isoDuration(teaching.durationMinutes)
        ? { duration: isoDuration(teaching.durationMinutes) }
        : {}),
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      contentUrl: teaching.youtubeUrl,
      inLanguage: language,
      isPartOf: { "@id": `${pageUrl}#article` }
    });
  }

  if (teaching.spotifyUrl) {
    graph.push({
      "@type": "PodcastEpisode",
      "@id": `${pageUrl}#podcast`,
      name: teaching.title,
      description,
      datePublished: teaching.date,
      ...(teaching.episode ? { episodeNumber: teaching.episode } : {}),
      ...(isoDuration(teaching.durationMinutes)
        ? { duration: isoDuration(teaching.durationMinutes) }
        : {}),
      url: teaching.spotifyUrl,
      inLanguage: language,
      partOfSeries: {
        "@type": "PodcastSeries",
        name: teaching.collectionName || SITE_NAME
      },
      mainEntityOfPage: pageUrl
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
