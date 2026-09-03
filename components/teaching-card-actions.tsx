"use client";

import type { Locale } from "@/lib/types";

type TeachingCardActionsProps = {
  href: string;
  title: string;
  locale: Locale;
};

export function TeachingCardActions({
  href,
  title,
  locale
}: TeachingCardActionsProps) {
  async function handleShare() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.iglesiapilar.mx";
    const url = new URL(href, `${origin}/`).toString();

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Ignore dismiss or permission errors.
    }
  }

  return (
    <div className="teaching-card-actions">
      <button
        type="button"
        className="teaching-card-share"
        aria-label={locale === "es" ? "Compartir enseñanza" : "Share teaching"}
        onClick={handleShare}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98" />
          <path d="m15.42 6.51-6.83 3.98" />
        </svg>
      </button>
      <button
        type="button"
        className="teaching-card-favorite"
        aria-label={locale === "es" ? "Guardar en favoritos" : "Save to favorites"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>
    </div>
  );
}
