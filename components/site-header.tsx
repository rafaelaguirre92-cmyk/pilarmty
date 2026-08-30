"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SearchOverlay } from "@/components/search-overlay";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

const labels = {
  es: {
    about: "Conócenos",
    communities: "Comunidades",
    resources: "Recursos",
    visit: "Visítanos",
    give: "Dar"
  },
  en: {
    about: "About us",
    communities: "Communities",
    resources: "Resources",
    visit: "Visit us",
    give: "Give"
  }
};

export function SiteHeader({ locale = "es" }: { locale?: Locale }) {
  const pathname = usePathname();
  const copy = labels[locale];
  const menuDialogRef = useRef<HTMLDialogElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { href: localePath(locale, "/conocenos"), label: copy.about },
    { href: localePath(locale, "/comunidades"), label: copy.communities },
    { href: localePath(locale, "/recursos"), label: copy.resources },
    { href: localePath(locale, "/visitanos"), label: copy.visit },
    { href: localePath(locale, "/dar"), label: copy.give }
  ];

  function isActive(href: string) {
    if (href === "/" || href === "/en") return pathname === href;
    if (
      href === localePath(locale, "/recursos") &&
      (pathname === localePath(locale, "/ensenanzas") ||
        pathname.startsWith(`${localePath(locale, "/ensenanzas")}/`))
    ) {
      return true;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    const dialog = menuDialogRef.current;
    if (!dialog) return;

    if (menuOpen && !dialog.open) {
      dialog.classList.remove("is-closing");
      dialog.showModal();
      document.body.classList.add("mobile-menu-open");
    } else if (!menuOpen && dialog.open) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dialog.close();
        return;
      }

      const closeTimer = window.setTimeout(() => dialog.close(), 420);

      return () => window.clearTimeout(closeTimer);
    }

  }, [menuOpen]);

  useEffect(
    () => () => document.body.classList.remove("mobile-menu-open"),
    []
  );

  function closeMenu() {
    const dialog = menuDialogRef.current;
    if (
      dialog?.open &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      dialog.classList.add("is-closing");
    }
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link
          className="brand"
          href={localePath(locale, "/")}
          aria-label={locale === "es" ? "Iglesia Pilar, inicio" : "Iglesia Pilar, home"}
        >
          <Image
            className="brand-light"
            src="/brand/iglesia-pilar.png"
            alt="Iglesia Pilar"
            width={980}
            height={368}
            priority
            unoptimized
          />
          <Image
            className="brand-dark"
            src="/brand/iglesia-pilar-white.png"
            alt=""
            width={980}
            height={368}
            priority
            unoptimized
          />
        </Link>

        <nav
          className="desktop-nav"
          aria-label={locale === "es" ? "Principal" : "Main"}
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={isActive(item.href) ? "active" : undefined}
              key={item.href}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="desktop-search-action">
            <SearchOverlay instanceId="desktop" locale={locale} />
          </div>
        </div>

        <div className="mobile-menu">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label={locale === "es" ? "Abrir menú" : "Open menu"}
            className="mobile-menu-trigger"
            onClick={() => setMenuOpen(true)}
            ref={menuTriggerRef}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <dialog
            aria-labelledby="mobile-navigation-title"
            className="mobile-menu-drawer"
            id="mobile-navigation"
            onCancel={(event) => {
              event.preventDefault();
              closeMenu();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeMenu();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
              }
            }}
            onClose={() => {
              document.body.classList.remove("mobile-menu-open");
              menuDialogRef.current?.classList.remove("is-closing");
              setMenuOpen(false);
              menuTriggerRef.current?.focus();
            }}
            ref={menuDialogRef}
          >
            <div className="mobile-menu-panel">
              <div className="mobile-menu-heading">
                <p id="mobile-navigation-title">
                  {locale === "es" ? "Navegación" : "Navigation"}
                </p>
                <button
                  aria-label={locale === "es" ? "Cerrar menú" : "Close menu"}
                  className="mobile-menu-close"
                  onClick={closeMenu}
                  type="button"
                >
                  <span aria-hidden="true" />
                </button>
              </div>
              <nav aria-label={locale === "es" ? "Menú móvil" : "Mobile menu"}>
                {navigation.map((item) => (
                  <Link
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={isActive(item.href) ? "active" : undefined}
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </nav>
              <div className="mobile-menu-search">
                <SearchOverlay instanceId="mobile" locale={locale} showLabel />
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </header>
  );
}
