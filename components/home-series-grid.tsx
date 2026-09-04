"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/lib/site";
import { seriesImage } from "@/lib/series-image";
import type { Collection, Locale } from "@/lib/types";

export function HomeSeriesGrid({
  collections,
  locale
}: {
  collections: Collection[];
  locale: Locale;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hasHint, setHasHint] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const el = gridRef.current;
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
            // Check if grid is horizontally scrollable (mobile/tablet) and near start
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
      ref={gridRef}
      className={`home-series-grid ${hasHint ? "has-scroll-hint" : ""}`}
    >
      {collections.map((collection) => {
        const image = seriesImage(collection, "horizontal");

        return (
          <Link
            aria-label={collection.name}
            className="home-series-card"
            href={localePath(locale, `/ensenanzas/${collection.slug}`)}
            key={collection.slug}
          >
          {image && (
            <Image
              src={image}
              alt={collection.name}
              fill
              sizes="(max-width: 979px) calc(100vw - 32px), 33vw"
            />
          )}
          </Link>
        );
      })}
    </div>
  );
}
