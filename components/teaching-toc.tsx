"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleHeading } from "@/lib/article-headings";
import type { Locale } from "@/lib/types";

export function TeachingToc({
  headings,
  locale
}: {
  headings: ArticleHeading[];
  locale: Locale;
}) {
  const [activeId, setActiveId] = useState<string>("");
  const isManualScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrollRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-96px 0% -65% 0%",
        threshold: [0, 0.5, 1]
      }
    );

    const elements: HTMLElement[] = [];
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      isManualScrollRef.current = true;
      setActiveId(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
      }, 800);
    }
  };

  return (
    <aside
      aria-label={locale === "es" ? "En esta entrada" : "Table of contents"}
      className="teaching-toc"
    >
      <p className="eyebrow teaching-toc-title">
        {locale === "es" ? "En esta entrada" : "In this article"}
      </p>
      <ol>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const displayTitle = heading.title || heading.label;
          return (
            <li key={heading.id}>
              <a
                className={`teaching-toc-link ${isActive ? "is-active" : ""}`}
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
              >
                {displayTitle}
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
