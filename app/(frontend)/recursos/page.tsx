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
    title: "Recursos",
    description:
      "Enseñanzas, series, eventos, artículos y contenidos de Iglesia Pilar.",
    path: "/recursos",
    locale: "es",
    alternatePath: "/en/recursos",
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
      locale="es"
      query={q}
      filter={tipo}
      series={serie}
      topic={tema}
      speaker={predicador}
      order={orden}
    />
  );
}
