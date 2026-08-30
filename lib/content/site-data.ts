import type { Community, Event, Locale } from "@/lib/types";

const communities: Record<Locale, Community[]> = {
  es: [
    {
      slug: "comunidad-sur",
      name: "Comunidad Sur",
      locale: "es",
      label: "Comunidad misional",
      description:
        "Comunidad Sur es la primera comunidad de Iglesia Pilar en la zona sur de Monterrey. Es un espacio para crecer en el evangelio, formar relaciones genuinas y aprender a seguir a Jesús en la vida diaria.",
      location: "Sur de Monterrey",
      schedule: "Viernes 8:00pm",
      ctaLabel: "Más información",
      ctaUrl: "#unirme",
      sortOrder: 1,
      image: "/images/wix/visit/comunidad.webp",
      imageAlt: "Comunidad Sur de Iglesia Pilar"
    }
  ],
  en: [
    {
      slug: "comunidad-sur",
      name: "Comunidad Sur",
      locale: "en",
      label: "Missionary community",
      description:
        "Comunidad Sur is Iglesia Pilar's first community in southern Monterrey. It is a place to grow in the gospel, form genuine relationships, and learn to follow Jesus in everyday life.",
      location: "Southern Monterrey",
      schedule: "Friday 8:00pm",
      ctaLabel: "More information",
      ctaUrl: "#unirme",
      sortOrder: 1,
      image: "/images/wix/visit/comunidad.webp",
      imageAlt: "Pilar Church South Community"
    }
  ]
};

// Agenda events are intentionally explicit. Add an object here only when an
// event needs to appear on the home page; past dates are filtered automatically.
const events: Record<Locale, Event[]> = { es: [], en: [] };

export function siteCommunities(locale: Locale) {
  return communities[locale].map((community) => ({ ...community }));
}

export function siteEvents(locale: Locale) {
  return events[locale].map((event) => ({ ...event }));
}
