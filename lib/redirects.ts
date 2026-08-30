import {
  englishTeachings,
  spanishTeachings
} from "./content/fallback";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

function teachingRedirects(): Redirect[] {
  const es = spanishTeachings
    .filter((teaching) => teaching.legacy)
    .flatMap((teaching) => [
      {
        source: `/ensenanzas/${teaching.slug}`,
        destination: `/ensenanzas/${teaching.collection}/${teaching.slug}`,
        permanent: true
      },
      {
        source: `/post/${teaching.slug}`,
        destination: `/ensenanzas/${teaching.collection}/${teaching.slug}`,
        permanent: true
      }
    ]);

  const en = englishTeachings.flatMap((teaching) => [
    {
      source: `/en/ensenanzas/${teaching.slug}`,
      destination: `/en/ensenanzas/${teaching.collection}/${teaching.slug}`,
      permanent: true
    },
    {
      source: `/en/post/${teaching.slug}`,
      destination: `/en/ensenanzas/${teaching.collection}/${teaching.slug}`,
      permanent: true
    }
  ]);

  return [...es, ...en];
}

export const legacyRedirects: Redirect[] = [
  ...teachingRedirects(),
  { source: "/home", destination: "/", permanent: true },
  { source: "/groups", destination: "/comunidades", permanent: true },
  {
    source: "/group/:path*",
    destination: "/comunidades",
    permanent: true
  },
  {
    source: "/recursos/categories/evangelio-de-marcos",
    destination: "/ensenanzas/marcos",
    permanent: true
  },
  {
    source: "/recursos/categories/orador-invitado",
    destination: "/ensenanzas/orador-invitado",
    permanent: true
  },
  {
    source: "/recursos/categories/efesios-identidad-y-vida-en-cristo",
    destination: "/ensenanzas/efesios",
    permanent: true
  },
  {
    source: "/recursos/categories/profetas-a-nínive",
    destination: "/ensenanzas/profetas-a-ninive",
    permanent: true
  },
  {
    source: "/recursos/categories/predicaciones",
    destination: "/recursos",
    permanent: true
  },
  { source: "/en/home", destination: "/en", permanent: true },
  {
    source: "/en/groups",
    destination: "/en/comunidades",
    permanent: true
  },
  {
    source: "/en/recursos/categories/guest-speaker",
    destination: "/en/ensenanzas/guest-speaker",
    permanent: true
  },
  {
    source: "/en/recursos/categories/sermons",
    destination: "/en/recursos",
    permanent: true
  },
  {
    source: "/en/recursos/categories/ephesians-identity-life-in-chris",
    destination: "/en/ensenanzas/ephesians",
    permanent: true
  },
  {
    source: "/en/recursos/categories/ephesians",
    destination: "/en/ensenanzas/ephesians",
    permanent: true
  },
  {
    source: "/en/recursos/categories/parenting",
    destination: "/en/ensenanzas/ephesians",
    permanent: true
  },
  {
    source: "/en/recursos/categories/prophets-to-nineveh",
    destination: "/en/ensenanzas/prophets-to-nineveh",
    permanent: true
  }
];
