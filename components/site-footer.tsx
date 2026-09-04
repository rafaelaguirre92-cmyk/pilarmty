import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { NewsletterForm } from "@/components/newsletter-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/iglesiapilarmx/",
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
        width="16"
      >
        <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/iglesiapilarmx/",
    icon: (
      <svg
        aria-hidden="true"
        fill="currentColor"
        height="16"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/iglesiapilarmx",
    icon: (
      <svg
        aria-hidden="true"
        fill="currentColor"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
      </svg>
    ),
  },
];

const footerContent = {
  es: {
    homeLabel: "Iglesia Pilar, inicio",
    church: "Iglesia",
    about: "Conócenos",
    communities: "Comunidades",
    visit: "Visítanos",
    give: "Dar",
    contact: "Contáctanos",
    resources: "Recursos",
    teachings: "Enseñanzas",
    series: "Series bíblicas",
    topics: "Temas de estudio",
    allResources: "Todos los recursos",
    schedule: "Domingos a las 5:00 p.m.",
    address: "Carretera Nacional 777D - KM 268",
    cityState: "Monterrey, N.L., México",
    planVisit: "Visítanos",
    socialsLabel: "Redes sociales",
    copyright: "© Iglesia Pilar",
    navLabel: "Navegación del pie de página",
  },
  en: {
    homeLabel: "Iglesia Pilar, home",
    church: "Church",
    about: "About us",
    communities: "Communities",
    visit: "Visit us",
    give: "Give",
    contact: "Contact us",
    resources: "Resources",
    teachings: "Teachings",
    series: "Bible series",
    topics: "Study topics",
    allResources: "All resources",
    schedule: "Sundays at 5:00 p.m.",
    address: "Carretera Nacional 777D - KM 268",
    cityState: "Monterrey, N.L., Mexico",
    planVisit: "Visit us",
    socialsLabel: "Social media",
    copyright: "© Iglesia Pilar",
    navLabel: "Footer navigation",
  },
} as const;

export function SiteFooter({ locale = "es" }: { locale?: Locale }) {
  const copy = footerContent[locale];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid" aria-label={copy.navLabel}>
        <div className="footer-identity">
          <Link
            className="footer-brand"
            href={localePath(locale, "/")}
            aria-label={copy.homeLabel}
          >
            <Image
              className="brand-light"
              src="/brand/iglesia-pilar.png"
              alt="Iglesia Pilar"
              width={980}
              height={368}
              unoptimized
            />
            <Image
              className="brand-dark"
              src="/brand/iglesia-pilar-white.png"
              alt=""
              width={980}
              height={368}
              unoptimized
            />
          </Link>

          <div className="footer-meeting-details">
            <p className="footer-meeting-time">{copy.schedule}</p>
            <p className="footer-meeting-address">
              {copy.address}
              <br />
              <span className="footer-meeting-city">{copy.cityState}</span>
            </p>
          </div>

          <div className="footer-meeting-actions">
            <Link className="footer-action-link" href={localePath(locale, "/visitanos")}>
              {copy.planVisit}
              <span aria-hidden="true" className="footer-arrow">→</span>
            </Link>
          </div>

          <div className="footer-socials" aria-label={copy.socialsLabel}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                aria-label={social.name}
                className="footer-social-link"
                href={social.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <nav className="footer-links footer-links-church" aria-label={copy.church}>
          <p className="footer-column-title">{copy.church}</p>
          <Link href={localePath(locale, "/conocenos")}>{copy.about}</Link>
          <Link href={localePath(locale, "/comunidades")}>{copy.communities}</Link>
          <Link href={localePath(locale, "/visitanos")}>{copy.visit}</Link>
          <Link href={localePath(locale, "/dar")}>{copy.give}</Link>
          <Link href={localePath(locale, "/contactanos")}>{copy.contact}</Link>
        </nav>

        <nav className="footer-links footer-links-resources" aria-label={copy.resources}>
          <p className="footer-column-title">{copy.resources}</p>
          <Link href={localePath(locale, "/recursos?tipo=ensenanzas")}>{copy.teachings}</Link>
          <Link href={localePath(locale, "/recursos?tipo=series")}>{copy.series}</Link>
          <Link href={localePath(locale, "/recursos/temas")}>{copy.topics}</Link>
          <Link href={localePath(locale, "/recursos")}>{copy.allResources}</Link>
        </nav>

        <NewsletterForm locale={locale} />
      </div>

      <div className="container footer-bottom">
        <div className="footer-bottom-meta">
          <span>{copy.copyright} {currentYear}</span>
          <span className="footer-bullet" aria-hidden="true">·</span>
          <span>{copy.cityState}</span>
        </div>
        <div className="footer-preferences">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle locale={locale} />
        </div>
      </div>
    </footer>
  );
}
