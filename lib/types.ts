export type Locale = "es" | "en";

export type CollectionKind = "serie" | "evento";

export type Collection = {
  slug: string;
  name: string;
  kind: CollectionKind;
  description: string;
  image?: string;
  locale: Locale;
};

export type RichText = {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
};

export type Teaching = {
  payloadId?: number | string;
  notionId?: string;
  slug: string;
  collection: string;
  collectionName?: string;
  title: string;
  locale: Locale;
  date?: string;
  author?: string;
  authorUrl?: string;
  authorImage?: string;
  episode?: number;
  excerpt?: string;
  keyVerse?: string;
  seoDescription?: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  durationMinutes?: number;
  youtubeUrl?: string;
  spotifyUrl?: string;
  legacy: boolean;
  published?: boolean;
  blocks?: NotionBlock[];
  body?: Record<string, unknown>;
  seoTitle?: string;
  canonical?: string;
  noindex?: boolean;
  socialImage?: string;
  updatedAt?: string;
  translation?: TranslationTarget;
  viewCount?: number;
  commentCount?: number;
};

export type Resource = {
  payloadId?: number | string;
  notionId?: string;
  slug: string;
  title: string;
  locale: Locale;
  kind: "articulo" | "contenido-pilar";
  excerpt?: string;
  seoDescription?: string;
  author?: string;
  authorUrl?: string;
  date?: string;
  tags: string[];
  relatedTeachingSlugs: string[];
  blocks?: NotionBlock[];
  body?: Record<string, unknown>;
  image?: string;
  imageAlt?: string;
  seoTitle?: string;
  canonical?: string;
  noindex?: boolean;
  socialImage?: string;
  updatedAt?: string;
  translation?: TranslationTarget;
};

export type Event = {
  payloadId?: number | string;
  title: string;
  locale: Locale;
  excerpt?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  registrationUrl?: string;
  registrationLabel?: string;
  image?: string;
  imageAlt?: string;
};

export type Community = {
  payloadId?: number | string;
  slug: string;
  name: string;
  locale: Locale;
  label?: string;
  description: string;
  location: string;
  schedule: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sortOrder?: number;
  image?: string;
  imageAlt?: string;
};

export type TranslationTarget = {
  collection: string;
  slug: string;
};
