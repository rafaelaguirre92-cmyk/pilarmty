import type { Metadata } from "next";

import { TopicsIndexPage } from "@/components/topics-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Temáticas",
  description:
    "Explora las enseñanzas y recursos de Iglesia Pilar organizados por tema.",
  path: "/recursos/temas",
  locale: "es",
  alternatePath: "/en/recursos/temas"
});

export default function Page() {
  return <TopicsIndexPage locale="es" />;
}
