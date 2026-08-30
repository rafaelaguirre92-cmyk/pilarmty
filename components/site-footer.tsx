import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function SiteFooter({ locale = "es" }: { locale?: Locale }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link
            className="footer-brand"
            href={localePath(locale, "/")}
            aria-label={locale === "es" ? "Iglesia Pilar, inicio" : "Iglesia Pilar, home"}
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
          <p className="footer-copy">
            {locale === "es"
              ? "Somos Iglesia Pilar, una comunidad en la zona sur de Monterrey. Caminamos juntos en el discipulado para vivir y anunciar el evangelio en nuestra ciudad."
              : "We are Pilar Church, a community in the southern part of Monterrey. We walk together in discipleship to live and proclaim the gospel in our city."}
          </p>
        </div>
        <div>
          <Link href={localePath(locale, "/recursos")}>
            {locale === "es" ? "Recursos" : "Resources"}
          </Link>
          <Link href={localePath(locale, "/comunidades")}>
            {locale === "es" ? "Comunidades" : "Communities"}
          </Link>
        </div>
        <div>
          <Link href={localePath(locale, "/visitanos")}>
            {locale === "es" ? "Visítanos" : "Visit us"}
          </Link>
          <Link href={localePath(locale, "/contactanos")}>
            {locale === "es" ? "Contáctanos" : "Contact us"}
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© Iglesia Pilar 2026</span>
        <div className="footer-preferences">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle locale={locale} />
        </div>
      </div>
    </footer>
  );
}
