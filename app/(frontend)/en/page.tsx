import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Christian church in Monterrey",
  description:
    "A community in southern Monterrey, built on one foundation: Christ.",
  alternates: {
    canonical: absoluteUrl("/en"),
    languages: {
      "es-MX": absoluteUrl("/"),
      en: absoluteUrl("/en")
    }
  }
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/en"),
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/en/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <HomePage locale="en" />
    </>
  );
}
