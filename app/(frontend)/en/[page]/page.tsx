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
  const page = getStaticPage("en", slug);
  if (!page) return {};
  const metadata = pageMetadata({
    title: page.seoTitle || page.eyebrow,
    description: page.seoDescription || page.intro[0],
    path: `/en/${slug}`,
    locale: "en",
    alternatePath: `/${slug}`,
    image: page.heroImage
  });
  return page.seoTitle
    ? { ...metadata, title: { absolute: page.seoTitle } }
    : metadata;
}

export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!getStaticPage("en", page)) notFound();
  return <StaticPage locale="en" slug={page} />;
}
