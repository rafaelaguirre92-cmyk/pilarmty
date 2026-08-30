import type { Metadata } from "next";

import { SearchPage } from "@/components/search-page";
import { pageMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string; tipo?: string }> };

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Search Iglesia Pilar teachings and resources.",
  path: "/en/search",
  locale: "en",
  noindex: true
});

export default async function Page({ searchParams }: Props) {
  const { q, tipo } = await searchParams;
  return <SearchPage kind={tipo} locale="en" query={q} />;
}
