import type { Metadata } from "next";

import { TopicsIndexPage } from "@/components/topics-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Topics",
  description:
    "Explore Iglesia Pilar teachings and resources organized by topic.",
  path: "/en/recursos/temas",
  locale: "en",
  alternatePath: "/recursos/temas"
});

export default function Page() {
  return <TopicsIndexPage locale="en" />;
}
