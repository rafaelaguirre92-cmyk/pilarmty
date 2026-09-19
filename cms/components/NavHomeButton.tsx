"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavHomeButton() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/admin" || pathname === "/admin/";
  const isSyncActive = Boolean(pathname?.startsWith("/admin/sincronizacion"));

  return (
    <div className="pilar-nav-section" aria-label="Navegación principal">
      <Link
        href="/admin"
        className={`pilar-nav-item ${isHomeActive ? "is-active" : ""}`}
        title="Ir al inicio del panel"
      >
        <span className="pilar-nav-item__icon" aria-hidden="true">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <span className="pilar-nav-item__label">Inicio</span>
        {isHomeActive && <span className="pilar-nav-item__indicator" />}
      </Link>

      <Link
        href="/admin/sincronizacion"
        className={`pilar-nav-item ${isSyncActive ? "is-active" : ""}`}
        title="Tablero de sincronización con Notion"
      >
        <span className="pilar-nav-item__icon" aria-hidden="true">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </span>
        <span className="pilar-nav-item__label">Sincronización</span>
        {isSyncActive && <span className="pilar-nav-item__indicator" />}
      </Link>
    </div>
  );
}
