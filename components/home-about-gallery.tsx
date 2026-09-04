"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/types";

export function HomeAboutGallery({ locale }: { locale: Locale }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [hasHint, setHasHint] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const cancelHint = () => {
      triggeredRef.current = true;
      setHasHint(false);
    };

    el.addEventListener("touchstart", cancelHint, { passive: true });
    el.addEventListener("pointerdown", cancelHint, { passive: true });
    el.addEventListener("scroll", cancelHint, { passive: true });

    let hintTimer: ReturnType<typeof setTimeout> | null = null;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !triggeredRef.current) {
            // Check if gallery is horizontally scrollable (mobile/tablet) and near start
            if (el.scrollWidth > el.clientWidth && el.scrollLeft < 10) {
              hintTimer = setTimeout(() => {
                if (el.scrollLeft < 10 && !triggeredRef.current) {
                  triggeredRef.current = true;
                  setHasHint(true);
                  finishTimer = setTimeout(() => {
                    setHasHint(false);
                  }, 1200);
                }
              }, 450);
            }
          } else if (!entry.isIntersecting && !triggeredRef.current) {
            if (hintTimer) {
              clearTimeout(hintTimer);
              hintTimer = null;
            }
          }
        }
      },
      {
        threshold: 0.3
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("touchstart", cancelHint);
      el.removeEventListener("pointerdown", cancelHint);
      el.removeEventListener("scroll", cancelHint);
      if (hintTimer) clearTimeout(hintTimer);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      ref={galleryRef}
      className={`home-about-gallery ${hasHint ? "has-scroll-hint" : ""}`}
    >
      <div
        className="home-about-photo home-about-photo-left"
        data-card-parallax="-0.03"
      >
        <Image
          src="/images/wix/home/about-left.webp"
          alt={
            locale === "es"
              ? "Iglesia Pilar reunida en comunidad"
              : "Pilar Church gathered in community"
          }
          fill
          sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
        />
      </div>
      <div className="home-about-photo home-about-photo-featured">
        <Image
          src="/images/wix/home/about-center.jpg"
          alt={
            locale === "es"
              ? "Enseñanza bíblica en Iglesia Pilar"
              : "Bible teaching at Pilar Church"
          }
          fill
          sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
        />
      </div>
      <div
        className="home-about-photo home-about-photo-right"
        data-card-parallax="0.03"
      >
        <Image
          src="/images/wix/home/about-right.webp"
          alt={
            locale === "es"
              ? "Lectura y discipulado en Iglesia Pilar"
              : "Reading and discipleship at Pilar Church"
          }
          fill
          sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
        />
      </div>
    </div>
  );
}
