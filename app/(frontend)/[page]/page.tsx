import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getStaticPage,
  StaticPage,
  staticPageSlugs
} from "@/components/static-page";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  return staticPageSlugs.map((page) => ({ page }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: slug } = await params;
  const page = getStaticPage("es", slug);
  if (!page) return {};
  const metadata = pageMetadata({
    title: page.seoTitle || page.eyebrow,
    description: page.seoDescription || page.intro[0],
    path: `/${slug}`,
    locale: "es",
    alternatePath: `/en/${slug}`,
    image: page.heroImage
  });
  return page.seoTitle
    ? { ...metadata, title: { absolute: page.seoTitle } }
    : metadata;
}

export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!getStaticPage("es", page)) notFound();
  return <StaticPage locale="es" slug={page} />;
}
