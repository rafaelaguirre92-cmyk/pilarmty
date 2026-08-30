import type { Locale } from "./types";

export const SITE_NAME = "Iglesia Pilar";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.iglesiapilar.mx";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function localePath(locale: Locale, path = "/") {
  if (locale === "en") {
    return path === "/" ? "/en" : `/en${path}`;
  }
  return path;
}

export function formatDate(date: string | undefined, locale: Locale) {
  if (!date) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date}T12:00:00Z`
    : date;
  const value = new Date(normalized);
  if (Number.isNaN(value.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizePathSegment(value: string) {
  try {
    return decodeURIComponent(value).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}
