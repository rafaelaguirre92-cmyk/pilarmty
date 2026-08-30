import type { Metadata } from "next";

import { SearchPage } from "@/components/search-page";
import { pageMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string; tipo?: string }> };

export const metadata: Metadata = pageMetadata({
  title: "Buscar",
  description: "Busca enseñanzas y recursos de Iglesia Pilar.",
  path: "/buscar",
  locale: "es",
  noindex: true
});

export default async function Page({ searchParams }: Props) {
  const { q, tipo } = await searchParams;
  return <SearchPage kind={tipo} locale="es" query={q} />;
}
