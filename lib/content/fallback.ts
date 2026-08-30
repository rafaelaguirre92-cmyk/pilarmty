import type {
  Collection,
  Teaching,
  TranslationTarget
} from "@/lib/types";

const collectionImage = (slug: string) =>
  `/images/series/${slug}.${slug === "marcos" ? "jpg" : "webp"}`;

const teachingImages: Record<string, string> = {
  marcos: collectionImage("marcos"),
  efesios: collectionImage("efesios"),
  "profetas-a-ninive": collectionImage("profetas-a-ninive"),
  "orador-invitado": collectionImage("orador-invitado"),
  ephesians: collectionImage("efesios"),
  "prophets-to-nineveh": collectionImage("profetas-a-ninive"),
  "guest-speaker": collectionImage("orador-invitado")
};

export const collections: Collection[] = [
  {
    slug: "marcos",
    name: "Marcos",
    kind: "serie",
    description: "",
    image: collectionImage("marcos"),
    locale: "es"
  },
  {
    slug: "efesios",
    name: "Efesios",
    kind: "serie",
    description: "",
    image: collectionImage("efesios"),
    locale: "es"
  },
  {
    slug: "profetas-a-ninive",
    name: "Profetas a Nínive",
    kind: "serie",
    description: "",
    image: collectionImage("profetas-a-ninive"),
    locale: "es"
  },
  {
    slug: "orador-invitado",
    name: "Orador Invitado",
    kind: "serie",
    description: "",
    image: collectionImage("orador-invitado"),
    locale: "es"
  },
  {
    slug: "fechas-especiales",
    name: "Fechas Especiales",
    kind: "evento",
    description: "",
    locale: "es"
  },
  {
    slug: "ephesians",
    name: "Ephesians",
    kind: "serie",
    description: "",
    image: collectionImage("efesios"),
    locale: "en"
  },
  {
    slug: "prophets-to-nineveh",
    name: "Prophets to Nineveh",
    kind: "serie",
    description: "",
    image: collectionImage("profetas-a-ninive"),
    locale: "en"
  },
  {
    slug: "guest-speaker",
    name: "Guest Speaker",
    kind: "serie",
    description: "",
    image: collectionImage("orador-invitado"),
    locale: "en"
  }
];

type Seed = [
  collection: string,
  slug: string,
  title: string,
  episode?: number,
  date?: string,
  author?: string
];

const spanishSeeds: Seed[] = [
  ["efesios", "el-dios-trino-te-ha-bendecido", "El Dios Trino Te Ha Bendecido", 1],
  ["efesios", "orando-por-un-conocimiento-íntimo-de-dios", "Orando por un conocimiento íntimo de Dios", 2],
  ["efesios", "pero-dios-de-la-muerte-a-la-vida-para-andar-en-sus-obras", "Pero Dios: de la muerte a la vida para andar en sus obras", 3],
  ["efesios", "no-olvides-de-dónde-vienes", "No Olvides de Dónde Vienes", 4],
  ["efesios", "la-iglesia-proclama-las-riquezas-de-cristo", "La Iglesia Proclama las Riquezas de Cristo", 5],
  ["efesios", "orando-conforme-a-la-palabra-de-dios-efesios-3-14-21", "Orando Conforme a la Palabra de Dios", 6],
  ["efesios", "persevera-en-la-unidad-del-cuerpo-de-cristo", "Persevera en la Unidad del Cuerpo de Cristo", 7],
  ["efesios", "el-uniforme-del-cristiano-vive-tu-nueva-identidad", "El Uniforme del Cristiano: Vive Tu Nueva Identidad", 8],
  ["efesios", "imita-a-tu-padre-celestial", "Imita a tu Padre Celestial", 9],
  ["efesios", "llenos-del-espíritu-en-nuestras-relaciones", "Llenos del Espíritu en Nuestras Relaciones", 10],
  ["efesios", "una-crianza-llena-del-espíritu", "Una crianza llena del Espíritu", 11],
  ["efesios", "cristo-en-tu-jornada-laboral", "Cristo en tu jornada laboral", 12],
  ["efesios", "la-armadura-de-dios-para-el-día-malo", "La armadura de Dios para el día malo", 13],
  ["fechas-especiales", "la-esperanza-de-un-cuerpo-como-el-de-cristo", "La esperanza de un cuerpo como el de Cristo", undefined, "2026-04-05", "Sergio González"],
  ["marcos", "cree-a-los-testigos-del-hijo-de-dios", "Cree a los Testigos del Hijo de Dios", 1, "2026-04-19", "Sergio González"],
  ["marcos", "la-autoridad-del-rey-que-vino-a-salvar", "La autoridad del Rey que vino a salvar", 2, "2026-05-03", "Sergio González"],
  ["marcos", "nadie-puede-salvarse-a-sí-mismo", "Nadie puede salvarse a sí mismo", 3, "2026-05-10", "Sergio González"],
  ["marcos", "el-verdadero-descanso-para-el-alma-cansada", "El verdadero descanso para el alma cansada", 4, "2026-05-24", "Sergio González"],
  ["marcos", "quién-es-la-familia-de-jesús", "¿Quién es la familia de Jesús?", 5, "2026-05-31", "Sergio González"],
  ["marcos", "la-palabra-que-da-fruto", "La Palabra que da fruto", 6, "2026-06-07", "Sergio González"],
  ["marcos", "la-semilla-que-crece-en-secreto", "La semilla que crece en secreto", 7, "2026-06-21", "Sergio González"],
  ["marcos", "jesús-autoridad-sobre-todo", "Jesús, autoridad sobre todo", 8, "2026-07-05", "Sergio González"],
  ["marcos", "el-mensaje-que-ofende", "El mensaje que ofende", 9, "2026-07-12", "Sergio González"],
  ["orador-invitado", "confiemos-en-el-buen-pastor", "Confiemos en el Buen Pastor"],
  ["orador-invitado", "el-refugio-que-te-hace-estar-firme", "El Refugio que te Hace Estar Firme"],
  ["orador-invitado", "desea-la-palabra-como-los-niños-desean-la-leche", "Desea la Palabra Como los Niños Desean la Leche"],
  ["orador-invitado", "en-cristo-hallamos-provisión-y-contentamiento", "En Cristo Hallamos Provisión y Contentamiento"],
  ["orador-invitado", "anímate-y-esfuérzate-en-el-señor", "Anímate y esfuérzate en el Señor"],
  ["orador-invitado", "la-iglesia-local-un-lugar-para-madurar", "La iglesia local: un lugar para madurar"],
  ["orador-invitado", "volviendo-a-la-palabra-una-iglesia-que-predica-fielmente", "Volviendo a la Palabra: Una Iglesia que Predica Fielmente"],
  ["orador-invitado", "hacia-dónde-apunta-tu-corazón", "¿Hacia Dónde Apunta Tu Corazón?"],
  ["orador-invitado", "siervos-del-pecado-o-de-la-justicia", "Siervos del Pecado o de la Justicia", undefined, "2026-04-12", "Armando Ortiz"],
  ["orador-invitado", "el-trabajo-invisible-del-creyente", "El Trabajo Invisible del Creyente", undefined, "2026-04-26", "Josué Lara"],
  ["orador-invitado", "continuemos-haciendo-discípulos", "Continuemos Haciendo Discípulos", undefined, "2026-05-17", "Alexis Pérez"],
  ["orador-invitado", "la-grandiosa-sabiduría-de-dios", "La grandiosa sabiduría de Dios", undefined, "2026-06-28", "Luis Mario Gudiño"],
  ["profetas-a-ninive", "el-evangelio-es-para-todos", "El Evangelio es para Todos", 1],
  ["profetas-a-ninive", "del-foso-a-la-gracia", "Del foso a la gracia", 2],
  ["profetas-a-ninive", "cinco-palabras-que-llaman-al-arrepentimiento", "Cinco palabras que llaman al arrepentimiento", 3],
  ["profetas-a-ninive", "gózate-cuando-dios-se-apiada", "Gózate cuando Dios se apiada", 4],
  ["profetas-a-ninive", "la-bondad-y-la-severidad-de-dios", "La bondad y la severidad de Dios", 5],
  ["profetas-a-ninive", "dios-pelea-por-la-libertad-de-su-pueblo", "Dios pelea por la libertad de su pueblo", 6],
  ["profetas-a-ninive", "la-caída-del-imperio-invencible", "La caída del imperio invencible", 7],
  ["profetas-a-ninive", "no-hay-lugar-seguro-para-los-enemigos-de-dios", "No hay lugar seguro para los enemigos de Dios", 8],
  ["profetas-a-ninive", "el-juicio-que-nadie-puede-evitar", "El juicio que nadie puede evitar", 9, "2026-03-29", "Sergio González"]
];

const enrichment: Record<
  string,
  Partial<Pick<Teaching, "excerpt" | "keyVerse" | "seoDescription" | "tags">>
> = {
  "la-grandiosa-sabiduría-de-dios": {
    keyVerse: "Romanos 11:33",
    excerpt:
      "Romanos 11:33-36 nos recuerda que no somos expertos en Dios: sus juicios son insondables y sus caminos inescrutables. Pero porque Él conoce y controla todo, y porque todas las cosas son de Él, por Él y para Él, podemos confiar en su voluntad y darle gloria con toda la vida.",
    seoDescription:
      "Romanos 11:33-36: los juicios y caminos de Dios son sabios. Como Dios conoce y controla todo, podemos confiar en su voluntad y vivir para su gloria.",
    tags: ["Romanos", "Soberanía", "Sabiduría de Dios"]
  },
  "la-semilla-que-crece-en-secreto": {
    excerpt:
      "En Marcos 4:26-34, Jesús compara el reino de Dios con una semilla que crece sin que el sembrador sepa cómo y con un grano de mostaza que comienza pequeño pero llega a ser grande. El mensaje consuela a quienes siembran sin ver fruto inmediato: el crecimiento del reino no depende de nosotros, sino del Rey que obra de manera paciente, segura y soberana.",
    seoDescription:
      "Marcos 4:26-34: Jesús enseña que el reino de Dios crece por la obra soberana del Rey, de forma paciente, segura y mayor de lo que sus comienzos humildes aparentan.",
    tags: ["Marcos", "Reino de Dios", "Parábolas"]
  },
  "la-palabra-que-da-fruto": {
    excerpt:
      "En Marcos 4:1-25, Jesús enseña la parábola del sembrador para mostrar que no basta con tener oídos: importa cómo se escucha. La familia de Jesús busca entender su palabra, la acepta con un corazón humilde y da fruto, mientras la dureza, la superficialidad y las distracciones revelan corazones que no abrazan el reino.",
    seoDescription:
      "Marcos 4:1-25: la familia de Jesús oye su palabra, la acepta y da fruto. La parábola del sembrador revela cómo el corazón responde al mensaje del reino.",
    tags: ["Marcos", "Palabra de Dios", "Parábolas"]
  },
  "el-verdadero-descanso-para-el-alma-cansada": {
    excerpt:
      "Somos expertos en sacarle la vuelta a las leyes, y los fariseos hicieron algo peor: convirtieron el día de reposo —diseñado por Dios para el gozo y el descanso— en una carga legalista. En Marcos 2:23-3:12, Jesús restaura el sentido del sábado, se declara su Señor y se ofrece a sí mismo como el verdadero reposo para toda alma cansada.",
    seoDescription:
      "Marcos 2:23-3:12: los fariseos convirtieron el día de reposo en una carga, pero Jesús es el Señor del sábado y el verdadero descanso para el alma cansada.",
    tags: ["Marcos", "Descanso", "Evangelio"]
  },
  "nadie-puede-salvarse-a-sí-mismo": {
    excerpt:
      "En Monterrey se respira que 'el que quiere, puede'; pero esa misma mentalidad se vuelve un ídolo cuando creemos que podemos salvarnos a nosotros mismos. En Marcos 2:13-22, Jesús se sienta a la mesa con pecadores y desarma tanto al que se sabe enfermo como al religioso que se cree sano: nadie se salva por su esfuerzo, porque Él vino a salvar pecadores.",
    seoDescription:
      "Marcos 2:13-22: Jesús vino a salvar pecadores. Nadie puede salvarse a sí mismo, ni por esfuerzo ni por religión; el Rey se sienta a la mesa con los enfermos para sanarlos.",
    tags: ["Marcos", "Gracia", "Arrepentimiento"]
  },
  "la-autoridad-del-rey-que-vino-a-salvar": {
    excerpt:
      "Marcos presenta a Jesús ejerciendo plena autoridad: para llamar discípulos, enseñar, expulsar demonios y sanar lo incurable. Pero toda esa autoridad apunta a algo mayor: el Hijo del Hombre tiene autoridad para perdonar pecados y para salvar.",
    seoDescription:
      "Marcos 1:16-2:12: Jesús tiene autoridad para llamar, enseñar, sanar y, sobre todo, para perdonar pecados. El Rey del reino de los cielos vino a salvar.",
    tags: ["Marcos", "Autoridad", "Evangelio"]
  },
  "cree-a-los-testigos-del-hijo-de-dios": {
    excerpt:
      "Antes de que Jesús diga una palabra, seis testigos declaran quién es: Marcos, los profetas, Juan el Bautista, el Espíritu, el Padre y aun Satanás. Y al final, el mismo Jesús inaugura su reino y exige una respuesta: arrepiéntete y cree.",
    seoDescription:
      "Marcos 1:1-15: seis testigos declaran que Jesús es el Hijo de Dios. Arrepiéntete y cree en el Evangelio.",
    tags: ["Marcos", "Hijo de Dios", "Arrepentimiento"]
  },
  "siervos-del-pecado-o-de-la-justicia": {
    keyVerse: "Romanos 6:18"
  },
  "el-juicio-que-nadie-puede-evitar": {
    keyVerse: "Nahum 3:7",
    excerpt:
      "¿Qué nación puede resistir el juicio de Dios? Nahum confronta a Nínive con una verdad inevitable: ni fortalezas, ni aliados, ni riquezas detienen la justicia divina. Una palabra de temor para sus enemigos y de profunda esperanza para su pueblo.",
    seoDescription:
      "El juicio de Dios alcanzará a toda nación rebelde. Descubre en Nahum 3 por qué solo en Cristo hay refugio ante la justicia divina.",
    tags: ["Nahúm", "Justicia", "Soberanía"]
  }
};

const legacySpanishSlugs = new Set(
  spanishSeeds
    .map(([, slug]) => slug)
    .filter(
      (slug) =>
        slug !== "jesús-autoridad-sobre-todo" &&
        slug !== "el-mensaje-que-ofende"
    )
);

function collectionNameFor(slug: string, locale: Collection["locale"]) {
  return collections.find(
    (collection) => collection.slug === slug && collection.locale === locale
  )?.name;
}

export const spanishTeachings: Teaching[] = spanishSeeds.map(
  ([collection, slug, title, episode, date, author]) => ({
    slug,
    collection,
    collectionName: collectionNameFor(collection, "es"),
    title,
    episode,
    date,
    author,
    locale: "es",
    legacy: legacySpanishSlugs.has(slug),
    image: teachingImages[collection],
    tags: enrichment[slug]?.tags ?? [],
    excerpt: enrichment[slug]?.excerpt,
    keyVerse: enrichment[slug]?.keyVerse,
    seoDescription: enrichment[slug]?.seoDescription
  })
);

const englishSeeds: Seed[] = [
  ["prophets-to-nineveh", "god-fights-for-the-freedom-of-his-people", "God Fights for the Freedom of His People"],
  ["prophets-to-nineveh", "the-gospel-is-for-everyone", "The Gospel Is for Everyone"],
  ["guest-speaker", "where-does-your-heart-point", "Where Does Your Heart Point?"],
  ["prophets-to-nineveh", "rejoice-when-god-shows-mercy", "Rejoice When God Shows Mercy"],
  ["ephesians", "christ-in-your-daily-work", "Christ in Your Daily Work"],
  ["ephesians", "god-s-armor-for-the-evil-day", "God's Armor for the Evil Day"],
  ["prophets-to-nineveh", "five-words-that-call-to-repentance", "Five Words That Call to Repentance"],
  ["prophets-to-nineveh", "la-caída-del-imperio-invencible-1", "The Fall of the Invincible Empire"],
  ["prophets-to-nineveh", "the-goodness-and-severity-of-god", "The Goodness and Severity of God"],
  ["prophets-to-nineveh", "del-foso-a-la-gracia-1", "From the Pit to Grace"],
  ["ephesians", "a-spirit-filled-upbringing", "A Spirit-Filled Upbringing"],
  ["prophets-to-nineveh", "no-safe-place-for-god-s-enemies", "No Safe Place for God's Enemies"]
];

export const englishTeachings: Teaching[] = englishSeeds.map(
  ([collection, slug, title]) => ({
    slug,
    collection,
    collectionName: collectionNameFor(collection, "en"),
    title,
    locale: "en",
    legacy: true,
    image: teachingImages[collection],
    tags: []
  })
);

export const translationPairs: Record<
  string,
  { es: TranslationTarget; en: TranslationTarget }
> = {
  evangelio: {
    es: { collection: "profetas-a-ninive", slug: "el-evangelio-es-para-todos" },
    en: { collection: "prophets-to-nineveh", slug: "the-gospel-is-for-everyone" }
  },
  foso: {
    es: { collection: "profetas-a-ninive", slug: "del-foso-a-la-gracia" },
    en: { collection: "prophets-to-nineveh", slug: "del-foso-a-la-gracia-1" }
  },
  arrepentimiento: {
    es: { collection: "profetas-a-ninive", slug: "cinco-palabras-que-llaman-al-arrepentimiento" },
    en: { collection: "prophets-to-nineveh", slug: "five-words-that-call-to-repentance" }
  },
  misericordia: {
    es: { collection: "profetas-a-ninive", slug: "gózate-cuando-dios-se-apiada" },
    en: { collection: "prophets-to-nineveh", slug: "rejoice-when-god-shows-mercy" }
  },
  severidad: {
    es: { collection: "profetas-a-ninive", slug: "la-bondad-y-la-severidad-de-dios" },
    en: { collection: "prophets-to-nineveh", slug: "the-goodness-and-severity-of-god" }
  },
  libertad: {
    es: { collection: "profetas-a-ninive", slug: "dios-pelea-por-la-libertad-de-su-pueblo" },
    en: { collection: "prophets-to-nineveh", slug: "god-fights-for-the-freedom-of-his-people" }
  },
  imperio: {
    es: { collection: "profetas-a-ninive", slug: "la-caída-del-imperio-invencible" },
    en: { collection: "prophets-to-nineveh", slug: "la-caída-del-imperio-invencible-1" }
  },
  enemigos: {
    es: { collection: "profetas-a-ninive", slug: "no-hay-lugar-seguro-para-los-enemigos-de-dios" },
    en: { collection: "prophets-to-nineveh", slug: "no-safe-place-for-god-s-enemies" }
  },
  crianza: {
    es: { collection: "efesios", slug: "una-crianza-llena-del-espíritu" },
    en: { collection: "ephesians", slug: "a-spirit-filled-upbringing" }
  },
  trabajo: {
    es: { collection: "efesios", slug: "cristo-en-tu-jornada-laboral" },
    en: { collection: "ephesians", slug: "christ-in-your-daily-work" }
  },
  armadura: {
    es: { collection: "efesios", slug: "la-armadura-de-dios-para-el-día-malo" },
    en: { collection: "ephesians", slug: "god-s-armor-for-the-evil-day" }
  },
  corazon: {
    es: { collection: "orador-invitado", slug: "hacia-dónde-apunta-tu-corazón" },
    en: { collection: "guest-speaker", slug: "where-does-your-heart-point" }
  }
};
