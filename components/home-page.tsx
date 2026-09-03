import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { HomeCommunitiesSection } from "@/components/home-communities-section";
import { HomeContentSection } from "@/components/home-content-section";
import { UpcomingEventsSection } from "@/components/upcoming-events-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function HomePage({ locale }: { locale: Locale }) {
  const copy =
    locale === "es"
      ? {
          titleStart: "Una",
          titleAccent: "comunidad",
          titleLineOneEnd: "construida",
          titleLineTwo: "sobre un solo fundamento:",
          titleEnd: "Cristo.",
          primary: "Visítanos",
          about: "Conócenos",
          contactEyebrow: "Contáctanos",
          contactTitle: "Queremos Escucharte",
          contactIntro:
            "¿Tienes alguna pregunta, necesitas oración o quieres conocer más sobre Iglesia Pilar? Escríbenos. Nos dará mucho gusto escucharte."
        }
      : {
          titleStart: "A",
          titleAccent: "community",
          titleLineOneEnd: "built",
          titleLineTwo: "on one foundation only:",
          titleEnd: "Christ.",
          primary: "Visit us",
          about: "About us",
          contactEyebrow: "Contact us",
          contactTitle: "Contact us",
          contactIntro:
            "We're glad you'd like to meet us. We appreciate your prayers. If you have questions, want to know more about us, or just want to say hello, we'd love to hear from you."
        };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1>
                <span>
                  {copy.titleStart} <em>{copy.titleAccent}</em>{" "}
                  {copy.titleLineOneEnd}
                </span>
                <span>
                  {copy.titleLineTwo} <em>{copy.titleEnd}</em>
                </span>
              </h1>
              <div className="button-row">
                <Link
                  className="button"
                  href={localePath(locale, "/visitanos")}
                >
                  {copy.primary}
                </Link>
              </div>
            </div>
            <div className="hero-media" data-parallax="0.08">
              <Image
                src="/images/church-community.webp"
                alt={
                  locale === "es"
                    ? "Comunidad de Iglesia Pilar reunida"
                    : "Iglesia Pilar community gathered"
                }
                fill
                priority
                sizes="(max-width: 1240px) calc(100vw - 32px), 1200px"
              />
            </div>
          </div>
        </section>

        <section
          className="principles-section"
          aria-label={
            locale === "es"
              ? "Principios de Iglesia Pilar"
              : "Iglesia Pilar principles"
          }
        >
          <div className="container principles-grid">
            <article
              className="principle-card principle-centrality"
              data-reveal
              data-reveal-delay="100"
            >
              <span className="principle-icon" aria-hidden="true" />
              <h2>
                <em>{locale === "es" ? "Centralidad" : "Centrality"}</em>
                <strong>
                  {locale === "es" ? "en el Evangelio" : "in the Gospel"}
                </strong>
              </h2>
            </article>
            <article
              className="principle-card principle-community"
              data-reveal
              data-reveal-delay="180"
            >
              <span className="principle-icon" aria-hidden="true" />
              <h2>
                <em>{locale === "es" ? "Comunidad," : "Community,"}</em>
                <strong>
                  {locale === "es" ? "Discipular" : "Discipleship"}
                </strong>
              </h2>
            </article>
            <article
              className="principle-card principle-mission"
              data-reveal
              data-reveal-delay="260"
            >
              <span className="principle-icon" aria-hidden="true" />
              <h2>
                <em>{locale === "es" ? "Misión," : "Mission,"}</em>
                <strong>{locale === "es" ? "Alcanzar" : "Reach"}</strong>
              </h2>
            </article>
          </div>
        </section>

        <section className="section home-about-section">
          <div className="container home-about-shell" data-reveal>
            <p className="home-about-intro">
              {locale === "es" ? (
                <>
                  Somos <em>Iglesia</em> Pilar, una <em>comunidad</em> en la zona
                  sur de Monterrey. Caminamos juntos en el <em>discipulado</em>{" "}
                  para vivir y anunciar el <em>evangelio</em> en nuestra ciudad.
                </>
              ) : (
                <>
                  We are <em>Pilar Church</em>, a <em>community</em> in the
                  southern part of Monterrey. We walk together in{" "}
                  <em>discipleship</em> to live and proclaim the{" "}
                  <em>gospel</em> in our city.
                </>
              )}
            </p>

            <div className="home-about-gallery">
              <div
                className="home-about-photo home-about-photo-left"
                data-card-parallax="-0.03"
              >
                <Image
                  src="/images/wix/home/about-left.webp"
                  alt={
                    locale === "es"
                      ? "Iglesia Pilar reunida en comunidad"
                      : "Pilar Church gathered in community"
                  }
                  fill
                  sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
                />
              </div>
              <div className="home-about-photo home-about-photo-featured">
                <Image
                  src="/images/wix/home/about-center.jpg"
                  alt={
                    locale === "es"
                      ? "Enseñanza bíblica en Iglesia Pilar"
                      : "Bible teaching at Pilar Church"
                  }
                  fill
                  sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
                />
              </div>
              <div
                className="home-about-photo home-about-photo-right"
                data-card-parallax="0.03"
              >
                <Image
                  src="/images/wix/home/about-right.webp"
                  alt={
                    locale === "es"
                      ? "Lectura y discipulado en Iglesia Pilar"
                      : "Reading and discipleship at Pilar Church"
                  }
                  fill
                  sizes="(max-width: 719px) calc(100vw - 32px), 33vw"
                />
              </div>
            </div>

            <Link
              className="button home-about-action"
              href={localePath(locale, "/conocenos")}
            >
              {copy.about}
            </Link>
          </div>
        </section>

        <HomeCommunitiesSection locale={locale} />

        <HomeContentSection locale={locale} />

        <UpcomingEventsSection locale={locale} />

        <section className="section contact-section">
          <div className="container contact-grid" data-reveal>
            <div>
              <p className="eyebrow">{copy.contactEyebrow}</p>
              <h2>{copy.contactTitle}</h2>
              <p className="lead">{copy.contactIntro}</p>
            </div>
            <div>
              <ContactForm locale={locale} />
            </div>
          </div>
        </section>

        <section className="section home-scripture-section">
          <div className="container">
            <figure
              className="home-scripture-card"
              data-parallax="0.06"
              data-reveal
            >
              <Image
                src="/images/wix/about/huajuco.webp"
                alt={
                  locale === "es"
                    ? "Vista del Cañón del Huajuco"
                    : "View of the Huajuco Canyon"
                }
                fill
                priority
                unoptimized
                sizes="(max-width: 719px) calc(100vw - 32px), 1200px"
              />
              <div className="home-scripture-overlay" aria-hidden="true" />
              <blockquote className="home-scripture-quote">
                <p>
                  {locale === "es" ? (
                    <>
                      …te escribo para que sepas cómo debe conducirse uno en la
                      casa de Dios, que es la iglesia del Dios vivo,{" "}
                      <strong>columna y sostén de la verdad.</strong>
                    </>
                  ) : (
                    <>
                      …I write so that you will know how one ought to conduct
                      oneself in the household of God, which is the church of
                      the living God,{" "}
                      <strong>the pillar and support of the truth.</strong>
                    </>
                  )}
                </p>
                <cite>{locale === "es" ? "1 Timoteo 3:15" : "1 Timothy 3:15"}</cite>
              </blockquote>
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
