import type { Metadata } from "next";

import { ResourcesPage } from "@/components/resources-page";
import { pageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{
    q?: string;
    tipo?: string;
    serie?: string;
    tema?: string;
    predicador?: string;
    orden?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, tipo, serie, tema, predicador, orden } = await searchParams;
  return pageMetadata({
    title: "Resources",
    description:
      "Teachings, series, events, articles, and content from Iglesia Pilar.",
    path: "/en/recursos",
    locale: "en",
    alternatePath: "/recursos",
    noindex: Boolean(
      q ||
        (tipo && tipo !== "todo") ||
        serie ||
        tema ||
        predicador ||
        orden
    )
  });
}

export default async function Page({ searchParams }: Props) {
  const { q, tipo, serie, tema, predicador, orden } = await searchParams;
  return (
    <ResourcesPage
      locale="en"
      query={q}
      filter={tipo}
      series={serie}
      topic={tema}
      speaker={predicador}
      order={orden}
    />
  );
}
