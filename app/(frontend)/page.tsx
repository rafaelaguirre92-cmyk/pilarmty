import { HomePage } from "@/components/home-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { safeJsonLd } from "@/lib/seo";

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Church",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Monterrey",
        addressRegion: "Nuevo León",
        addressCountry: "MX"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      inLanguage: "es-MX",
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/buscar")}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <HomePage locale="es" />
    </>
  );
}
