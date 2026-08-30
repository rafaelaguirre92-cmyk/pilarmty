import type { Metadata } from "next";

import { CollectionPage } from "@/components/collection-page";
import { getCollection, getCollections } from "@/lib/content";
import { redirectOrNotFound } from "@/lib/content/navigation";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ collection: string }> };

export async function generateStaticParams() {
  const available = await getCollections("en");
  return available.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = await getCollection("en", slug);
  if (!collection) return {};
  return pageMetadata({
    title: collection.name,
    description: collection.description,
    path: `/en/ensenanzas/${collection.slug}`,
    locale: "en"
  });
}

export default async function Page({ params }: Props) {
  const { collection } = await params;
  if (!(await getCollection("en", collection))) {
    await redirectOrNotFound(`/en/ensenanzas/${collection}`);
  }
  return <CollectionPage locale="en" slug={collection} />;
}
