"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/types";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const spanishPath = pathname.startsWith("/en")
    ? pathname.replace(/^\/en(?=\/|$)/, "") || "/"
    : pathname;
  const englishPath = pathname.startsWith("/en")
    ? pathname
    : pathname === "/"
      ? "/en"
      : `/en${pathname}`;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="language-switcher" ref={switcherRef}>
      {isOpen ? (
        <div className="language-menu" role="menu">
          <Link
            href={spanishPath}
            hrefLang="es-MX"
            role="menuitem"
            aria-current={locale === "es" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            Español
          </Link>
          <Link
            href={englishPath}
            hrefLang="en"
            role="menuitem"
            aria-current={locale === "en" ? "page" : undefined}
            onClick={() => setIsOpen(false)}
          >
            English
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        className="footer-language"
        aria-label={locale === "es" ? "Seleccionar idioma" : "Select language"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <strong>{locale === "es" ? "Español" : "English"}</strong>
        <span className="language-chevron" aria-hidden="true" />
      </button>
    </div>
  );
}
