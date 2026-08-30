import { NextRequest, NextResponse } from "next/server";

import {
  englishTeachings,
  spanishTeachings
} from "@/lib/content/fallback";
import { normalizePathSegment } from "@/lib/site";

const spanishDestinations = new Map(
  spanishTeachings
    .filter((teaching) => teaching.legacy)
    .map((teaching) => [
      teaching.slug.normalize("NFC"),
      `/ensenanzas/${teaching.collection}/${teaching.slug}`
    ])
);

const englishDestinations = new Map(
  englishTeachings.map((teaching) => [
    teaching.slug.normalize("NFC"),
    `/en/ensenanzas/${teaching.collection}/${teaching.slug}`
  ])
);

function legacyTeachingDestination(pathname: string) {
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .map(normalizePathSegment);

  if (
    parts.length === 2 &&
    (parts[0] === "ensenanzas" || parts[0] === "post")
  ) {
    return spanishDestinations.get(parts[1]);
  }

  if (
    parts.length === 3 &&
    parts[0] === "en" &&
    (parts[1] === "ensenanzas" || parts[1] === "post")
  ) {
    return englishDestinations.get(parts[2]);
  }

  return undefined;
}

export function proxy(request: NextRequest) {
  const destination = legacyTeachingDestination(request.nextUrl.pathname);
  if (!destination) return NextResponse.next();
  return NextResponse.redirect(new URL(destination, request.url), 308);
}

export const config = {
  matcher: [
    "/ensenanzas/:path*",
    "/post/:path*",
    "/en/ensenanzas/:path*",
    "/en/post/:path*"
  ]
};
