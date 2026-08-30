"use client";

import { Account } from "@payloadcms/ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AdminIcon } from "./AdminBrand";

type IconName = "home" | "posts" | "teachings" | "media" | "series" | "authors" | "topics" | "external";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
    posts: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    teachings: <><path d="M5 8h14l-2 5H7L5 8Z"/><path d="M9 13v7M15 13v7M6 20h12"/><path d="M10 5h4v3"/></>,
    media: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m4 17 5-4 3 2 3-3 5 5"/></>,
    series: <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
    authors: <><circle cx="12" cy="8" r="3"/><path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6"/></>,
    topics: <><path d="M3 12V5h7l9 9-7 7-9-9Z"/><circle cx="7.5" cy="9.5" r="1"/></>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/></>
  };
  return <svg aria-hidden="true" className="creator-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AdminCreateLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("aside.nav");
    if (!nav) return;

    const desktop = window.matchMedia("(min-width: 769px)");

    const ensureDesktopInteractive = () => {
      if (desktop.matches && nav.hasAttribute("inert")) {
        nav.removeAttribute("inert");
      }
    };

    const observer = new MutationObserver(ensureDesktopInteractive);
    observer.observe(nav, { attributeFilter: ["inert"], attributes: true });
    desktop.addEventListener("change", ensureDesktopInteractive);
    ensureDesktopInteractive();

    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", ensureDesktopInteractive);
    };
  }, []);

  const items: Array<{ href: string; icon: IconName; label: string; matches?: string[] }> = [
    { href: "/admin", icon: "home", label: "Inicio" },
    { href: "/admin/collections/teachings", icon: "teachings", label: "Enseñanzas" },
    { href: "/admin/collections/resources", icon: "posts", label: "Artículos" },
    { href: "/admin/collections/authors", icon: "authors", label: "Autores" },
    { href: "/admin/collections/series", icon: "series", label: "Categorías" },
    { href: "/admin/collections/topics", icon: "topics", label: "Etiquetas" },
    { href: "/admin/collections/media", icon: "media", label: "Biblioteca" }
  ];

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (path === "/admin") return pathname === path;
    if (!pathname.startsWith(path)) return false;
    if (!query) return pathname === path && !searchParams.get("tipo");
    return searchParams.get("tipo") === new URLSearchParams(query).get("tipo");
  };

  return (
    <div className="creator-nav-block">
      <div className="creator-nav-brand-slot">
        <div className="creator-nav-workspace">
          <Image
            alt="Iglesia Pilar"
            className="creator-nav-workspace-logo"
            height={376}
            priority
            src="/brand/iglesia-pilar.png"
            unoptimized
            width={828}
          />
        </div>
        <Link aria-label="Ir al inicio" className="creator-nav-compact-brand" href="/admin" title="Iglesia Pilar">
          <AdminIcon />
        </Link>
      </div>
      <nav aria-label="Administración editorial" className="creator-nav-links">
        {items.map((item) => (
          <Link className={isActive(item.href) ? "is-active" : undefined} href={item.href} key={item.href} title={item.label}>
            <Icon name={item.icon} />
            <span className="creator-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="creator-nav-utilities">
        <Link
          className={pathname.startsWith("/admin/account") ? "is-active" : undefined}
          href="/admin/account"
          title="Configuración"
        >
          <span className="creator-nav-account" aria-hidden="true">
            <Account />
          </span>
          <span className="creator-nav-label">Configuración</span>
        </Link>
        <Link href="/" target="_blank" title="Ver sitio"><Icon name="external" /><span className="creator-nav-label">Ver sitio</span></Link>
      </div>
    </div>
  );
}
