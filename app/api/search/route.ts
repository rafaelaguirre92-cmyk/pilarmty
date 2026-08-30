import { NextResponse } from "next/server";

import { searchContent } from "@/lib/search";
import type { Locale } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale: Locale = url.searchParams.get("locale") === "en" ? "en" : "es";
  const query = url.searchParams.get("q")?.trim() || "";

  if (query.length < 2) {
    return NextResponse.json({ query, results: [] });
  }

  const results = await searchContent(locale, query, 8);
  return NextResponse.json(
    { query, results },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
