"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavHomeButton() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/admin" || pathname === "/admin/";
  const isSyncActive = Boolean(pathname?.startsWith("/admin/sincronizacion"));

  const [navSlot, setNavSlot] = useState<HTMLElement | null>(null);
  const [cardSlot, setCardSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    function findAndAttachSlots() {
      // 1. Sidebar link under "Administradores" (#nav-users)
      const navUsers = document.getElementById("nav-users");
      if (navUsers && navUsers.parentElement) {
        let slot = document.getElementById("pilar-nav-sync-slot");
        if (!slot) {
          slot = document.createElement("div");
          slot.id = "pilar-nav-sync-slot";
          slot.style.display = "contents";
          navUsers.parentElement.insertBefore(slot, navUsers.nextSibling);
        }
        setNavSlot(slot);
      } else {
        setNavSlot(null);
      }

      // 2. Dashboard card next to "Administradores" (#card-users)
      const cardUsers = document.getElementById("card-users");
      if (cardUsers) {
        const userLi = cardUsers.closest("li");
        if (userLi && userLi.parentElement) {
          let slot = document.getElementById("pilar-card-sync-slot");
          if (!slot) {
            slot = document.createElement("li");
            slot.id = "pilar-card-sync-slot";
            userLi.parentElement.insertBefore(slot, userLi.nextSibling);
          }
          setCardSlot(slot);
        } else {
          setCardSlot(null);
        }
      } else {
        setCardSlot(null);
      }
    }

    findAndAttachSlots();

    const observer = new MutationObserver(() => {
      findAndAttachSlots();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {/* 1. Clean "Inicio" link at top of sidebar (matches regular nav items) */}
      <div className="pilar-nav-home-wrapper">
        <Link
          href="/admin"
          className={`nav__link pilar-nav-home-link ${isHomeActive ? "active is-active" : ""}`}
          id="nav-home"
        >
          {isHomeActive && <div className="nav__link-indicator" />}
          <span className="nav__link-label">Inicio</span>
        </Link>
      </div>

      {/* 2. "Sincronización" link in sidebar under Administración */}
      {navSlot &&
        createPortal(
          <Link
            href="/admin/sincronizacion"
            className={`nav__link pilar-nav-sync-link ${isSyncActive ? "active is-active" : ""}`}
            id="nav-sincronizacion"
          >
            {isSyncActive && <div className="nav__link-indicator" />}
            <span className="nav__link-label">Sincronización</span>
          </Link>,
          navSlot
        )}

      {/* 3. "Sincronización" card on dashboard next to Administradores */}
      {cardSlot &&
        createPortal(
          <div
            className="card card-sync card--has-onclick pilar-card-sync"
            id="card-sincronizacion"
          >
            <h3 className="card__title">Sincronización</h3>
            <Link
              href="/admin/sincronizacion"
              className="btn btn--style-none card__click"
              aria-label="Ir a Sincronización"
            />
          </div>,
          cardSlot
        )}
    </>
  );
}
