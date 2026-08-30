import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/lib/types";

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
