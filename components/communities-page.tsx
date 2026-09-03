import Image from "next/image";
import { Fragment } from "react";

import { BeliefsAccordion } from "@/components/beliefs-accordion";
import { CenterScrollLink } from "@/components/center-scroll-link";
import { CommunityInquiryModal } from "@/components/community-inquiry-modal";
import { ScriptureTooltip } from "@/components/scripture-tooltip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCommunities } from "@/lib/content";
import type { Locale } from "@/lib/types";

const communityImages = {
  hero: "/images/wix/visit/comunidad.webp",
  prayer: "/images/wix/visit/oramos.webp"
};

const copy = {
  es: {
    eyebrow: "Comunidades de Iglesia Pilar",
    title: (
      <>
        El <em>evangelio</em> se vive en <em>comunidad</em>
      </>
    ),
    heroBody:
      "Seguir a Jesús no es un camino que recorremos solos. El evangelio nos une a una familia que aprende, se cuida, comparte la mesa y vive en misión.",
    welcome:
      "No tienes que llegar con todas las respuestas. Puedes venir, escuchar y conocernos con calma.",
    heroCta: "Únete a una comunidad",
    purposeTitle: (
      <>
        No fuimos llamados a vivir la fe en <em>aislamiento</em>
      </>
    ),
    purposeParagraphs: [
      "El evangelio nos reconcilia con Dios por medio de Cristo y también nos integra a una familia.",
      "La vida de iglesia va más allá del domingo. Nos reunimos porque necesitamos recordar juntos la gracia de Cristo, no porque tengamos la vida resuelta.",
      "Así crecemos, nos servimos y nos animamos unos a otros en el camino."
    ],
    references: ["Hechos 2:42–47", "Hebreos 10:24–25", "Efesios 4:15–16"],
    experienceTitle: (
      <>
        ¿Cómo es una <em>comunidad</em> de Iglesia Pilar?
      </>
    ),
    experienceIntro:
      "Es un espacio sencillo para conocer personas, abrir la Biblia, compartir la comida y caminar juntos hacia Cristo.",
    experienceItems: [
      "Nos reunimos en un ambiente cercano y sencillo.",
      "Conversamos sobre la Palabra y su aplicación práctica.",
      "Oramos y cuidamos unos de otros.",
      "Compartimos la comida y construimos relaciones honestas alrededor de la mesa.",
      "Buscamos servir y llevar la esperanza de Jesús a nuestro entorno."
    ],
    communitiesTitle: (
      <>
        Una comunidad <em>cerca de ti</em>
      </>
    ),
    communityLabel: "Comunidad misional",
    communityName: "Comunidad Sur",
    communityBody:
      "Comunidad Sur es la primera comunidad de Iglesia Pilar en la zona sur de Monterrey. Es un espacio para crecer en el evangelio, formar relaciones genuinas y aprender a seguir a Jesús en la vida diaria.",
    zone: "Sur de Monterrey",
    schedule: "Viernes 8:00pm",
    communityCta: "Quiero saber más",
    communityDialogTitle: "Comunidad Sur",
    communityDialogBody:
      "Déjanos tus datos y alguien del equipo se pondrá en contacto contigo para platicarte cómo puedes visitarnos.",
    formTitle: (
      <>
        Te estamos <em>esperando</em>
      </>
    ),
    formBody:
      "Cuéntanos un poco sobre ti. Alguien del equipo de Iglesia Pilar se pondrá en contacto para conocerte, responder tus preguntas y orientarte.",
    formCta: "Encuentra tu comunidad",
    generalDialogTitle: "Encuentra tu comunidad",
    generalDialogBody:
      "Déjanos tus datos y alguien del equipo se pondrá en contacto contigo para orientarte.",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: (
      <>
        Antes de <em>llegar</em>
      </>
    ),
    faqs: [
      {
        title: "¿Necesito ser miembro de Iglesia Pilar?",
        description:
          "No. Puedes conocer una comunidad antes de decidir si quieres ser parte de Iglesia Pilar con más regularidad. El primer paso es simplemente conocernos.",
        references: []
      },
      {
        title: "¿Qué pasa en una reunión?",
        description:
          "Oramos, abrimos la Biblia, conversamos sobre cómo aplicarla en la vida diaria, compartimos la comida y nos cuidamos unos a otros. Cristo y su evangelio están al centro.",
        references: []
      },
      {
        title: "¿Puedo asistir si apenas estoy conociendo la fe cristiana?",
        description:
          "Sí. No necesitas cierto nivel de conocimiento ni sentirte listo. Puedes escuchar, hacer preguntas y conocer la fe cristiana a tu ritmo.",
        references: []
      },
      {
        title: "¿Las comunidades son para familias?",
        description:
          "Sí. Hay espacio para familias, parejas y personas solteras. Si vienes con niños, cuéntanos en el formulario para orientarte mejor.",
        references: []
      },
      {
        title: "¿Dónde se reúne Comunidad Sur?",
        description:
          "Se reúne en la zona sur de Monterrey. Por seguridad no publicamos la dirección exacta; te la compartimos después de ponernos en contacto contigo.",
        references: []
      },
      {
        title: "¿Qué sucede si no vivo cerca de Comunidad Sur?",
        description:
          "Cuéntanos dónde vives en el formulario. Queremos conocerte y avisarte si llega a haber una comunidad cerca de tu zona.",
        references: []
      }
    ]
  },
  en: {
    eyebrow: "Iglesia Pilar Communities",
    title: (
      <>
        The <em>gospel</em> is lived in <em>community</em>
      </>
    ),
    heroBody:
      "Following Jesus is not a path we walk alone. The gospel joins us to a family that learns, cares, shares the table, and lives on mission.",
    welcome:
      "You do not need to arrive with all the answers. You can come, listen, and get to know us at your own pace.",
    heroCta: "Join a community",
    purposeTitle: (
      <>
        We were not called to live the faith in <em>isolation</em>
      </>
    ),
    purposeParagraphs: [
      "The gospel reconciles us to God through Christ and also brings us into a family.",
      "Church life goes beyond Sunday. We gather because we need to remember Christ's grace together, not because we have life figured out.",
      "This is how we grow, serve, and encourage one another along the way."
    ],
    references: ["Acts 2:42–47", "Hebrews 10:24–25", "Ephesians 4:15–16"],
    experienceTitle: (
      <>
        What is a <em>community</em> of Iglesia Pilar like?
      </>
    ),
    experienceIntro:
      "It is a simple place to meet people, open the Bible, share food, and walk toward Christ together.",
    experienceItems: [
      "We gather in a close and simple environment.",
      "We discuss the Word and its practical application.",
      "We pray and care for one another.",
      "We share food and build honest relationships around the table.",
      "We seek to serve and bring the hope of Jesus to our neighbors."
    ],
    communitiesTitle: (
      <>
        A community <em>near you</em>
      </>
    ),
    communityLabel: "Missionary community",
    communityName: "Comunidad Sur",
    communityBody:
      "Comunidad Sur is Iglesia Pilar's first community in southern Monterrey. It is a place to grow in the gospel, form genuine relationships, and learn to follow Jesus in everyday life.",
    zone: "Southern Monterrey",
    schedule: "Friday 8:00pm",
    communityCta: "I want to know more",
    communityDialogTitle: "Comunidad Sur",
    communityDialogBody:
      "Leave us your details and someone from our team will contact you to tell you how you can visit.",
    formTitle: (
      <>
        We are <em>waiting for you</em>
      </>
    ),
    formBody:
      "Tell us a little about yourself. Someone from Iglesia Pilar will contact you, answer your questions, and help you consider the next step.",
    formCta: "Find your community",
    generalDialogTitle: "Find your community",
    generalDialogBody:
      "Leave us your details and someone from our team will contact you to guide you.",
    faqEyebrow: "Frequently asked questions",
    faqTitle: (
      <>
        Before you <em>arrive</em>
      </>
    ),
    faqs: [
      {
        title: "Do I need to be an Iglesia Pilar member?",
        description:
          "No. You can visit a community before deciding whether you want to become more regularly involved with Iglesia Pilar.",
        references: []
      },
      {
        title: "What happens at a gathering?",
        description:
          "We pray, open the Bible, discuss its application, share food, and care for one another. Christ and his gospel are at the center.",
        references: []
      },
      {
        title: "Can I attend if I am just exploring Christianity?",
        description:
          "Yes. You do not need a certain level of knowledge or to feel ready. You can listen, ask questions, and learn at your own pace.",
        references: []
      },
      {
        title: "Are communities for families?",
        description:
          "Yes. There is room for families, couples, and single people. If you are coming with children, tell us in the form.",
        references: []
      },
      {
        title: "Where does Comunidad Sur meet?",
        description:
          "It meets in southern Monterrey. For safety, we do not publish the exact address; we share it after contacting you.",
        references: []
      },
      {
        title: "What if I do not live near Comunidad Sur?",
        description:
          "Tell us where you live in the form. We would like to meet you and let you know if a community starts near your area.",
        references: []
      }
    ]
  }
};

export async function CommunitiesPage({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const managedCommunities = await getCommunities(locale);
  const communities = managedCommunities.length ? managedCommunities : [{
    slug: "comunidad-sur",
    name: content.communityName,
    label: content.communityLabel,
    description: content.communityBody,
    location: content.zone,
    schedule: content.schedule,
    ctaLabel: content.communityCta,
    ctaUrl: "#unirme",
    image: communityImages.hero,
    imageAlt: content.communityName
  }];

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="communities-page">
        <section className="about-page-hero communities-hero">
          <div className="container about-page-hero-inner communities-hero-inner">
            <div className="about-page-hero-copy communities-hero-copy">
              <p className="eyebrow">{content.eyebrow}</p>
              <h1>
                <span className="about-intro-headline">{content.title}</span>
              </h1>
              <div className="communities-hero-body">
                <p>{content.heroBody}</p>
                <p>{content.welcome}</p>
              </div>
              <CenterScrollLink className="button" href={`#${communities[0].slug}`}>
                {content.heroCta}
              </CenterScrollLink>
            </div>

            <div className="about-page-hero-media communities-hero-media" data-parallax="0.05">
              <Image
                src={communityImages.hero}
                alt={
                  locale === "es"
                    ? "Personas de Iglesia Pilar conversando en comunidad"
                    : "People from Iglesia Pilar sharing life in community"
                }
                fill
                priority
                sizes="(max-width: 979px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        <section className="section communities-purpose-section">
          <div className="container">
            <div className="communities-purpose-layout" data-reveal>
              <div className="communities-purpose-heading">
                <h2>{content.purposeTitle}</h2>
                <p className="communities-scripture communities-scripture-desktop">
                  {content.references.map((ref, i) => (
                    <Fragment key={ref}>
                      {i > 0 && " · "}
                      <ScriptureTooltip reference={ref} locale={locale} />
                    </Fragment>
                  ))}
                </p>
              </div>

              <div className="communities-purpose-copy">
                <div className="communities-prose">
                  {content.purposeParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <p className="communities-scripture communities-scripture-mobile">
                  {content.references.map((ref, i) => (
                    <Fragment key={ref}>
                      {i > 0 && " · "}
                      <ScriptureTooltip reference={ref} locale={locale} />
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>

            <div className="communities-purpose-bridge" data-reveal>
              <Image
                src={communityImages.prayer}
                alt={
                  locale === "es"
                    ? "Iglesia Pilar reunida en oración"
                    : "Iglesia Pilar gathered in prayer"
                }
                fill
                sizes="(max-width: 719px) 100vw, 90vw"
              />
            </div>
          </div>
        </section>

        <section className="section communities-experience-section">
          <div className="container" data-reveal>
            <div className="communities-experience-heading">
              <h2>{content.experienceTitle}</h2>
              <p>{content.experienceIntro}</p>
            </div>

            <div className="communities-experience-layout">
              <ol className="communities-practices">
                {content.experienceItems.map((item, index) => (
                  <li key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="section communities-list-section">
          <div className="container">
            <div className="communities-section-heading" data-reveal>
              <h2>{content.communitiesTitle}</h2>
            </div>

            {communities.map((community) => (
              <article className="communities-feature-card" id={community.slug} key={community.slug} data-reveal>
                <div className="communities-feature-image">
                  <Image
                    src={community.image || communityImages.hero}
                    alt={community.imageAlt || community.name}
                    fill
                    sizes="(max-width: 979px) 100vw, 50vw"
                  />
                </div>
                <div className="communities-feature-copy">
                  <p className="eyebrow">{community.label || content.communityLabel}</p>
                  <h3>{community.name}</h3>
                  <p>{community.description}</p>
                  <div className="communities-feature-footer">
                    <div className="communities-feature-meta">
                      <span className="communities-feature-meta-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
                          <circle cx="12" cy="10" r="2.2" />
                        </svg>
                      </span>
                      <div>
                        <span>{community.location}</span>
                        <span>{community.schedule}</span>
                      </div>
                    </div>
                    <CommunityInquiryModal
                      className="communities-feature-action"
                      community={community.name}
                      description={content.communityDialogBody}
                      locale={locale}
                      title={content.communityDialogTitle.replace("Comunidad Sur", community.name)}
                      triggerLabel={content.communityCta}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section communities-form-section" id="unirme">
          <div className="container communities-form-layout" data-reveal>
            <div className="communities-form-shell">
              <div className="communities-form-heading">
                <h2>{content.formTitle}</h2>
                <p>{content.formBody}</p>
                <CommunityInquiryModal
                  className="secondary"
                  description={content.generalDialogBody}
                  locale={locale}
                  showZone
                  title={content.generalDialogTitle}
                  triggerLabel={content.formCta}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section communities-faq-section">
          <div className="container" data-reveal>
            <div className="communities-section-heading">
              <p className="eyebrow">{content.faqEyebrow}</p>
              <h2>{content.faqTitle}</h2>
            </div>
            <BeliefsAccordion beliefs={content.faqs} locale={locale} />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
