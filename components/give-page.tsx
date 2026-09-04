import Image from "next/image";

import { BeliefsAccordion } from "@/components/beliefs-accordion";
import { CenterScrollLink } from "@/components/center-scroll-link";
import { CopyFieldButton } from "@/components/copy-field-button";
import { GiveOnlineSection } from "@/components/give-online-section";
import { ScriptureTooltip } from "@/components/scripture-tooltip";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getGiveBankDetails } from "@/lib/give";
import type { Locale } from "@/lib/types";

const copy = {
  es: {
    heroLead:
      "Damos porque Dios nos dio primero. Todo proviene de Él y, en Jesús, hemos recibido gracia abundante. Por eso ofrendamos con libertad, gratitud y confianza para participar en la misión de su iglesia.",
    heroCta: "Conoce las formas de dar",
    scriptureReference: "2 Corintios 9:7, NBLA",
    missionTitle: "Participamos juntos en la misión",
    missionIntro:
      "Las ofrendas permiten sostener la vida y la misión de Iglesia Pilar: proclamar fielmente el evangelio, hacer discípulos, cuidar a nuestra comunidad y servir a quienes nos rodean.",
    missionItems: [
      {
        title: "Proclamamos el evangelio",
        body: "Para que más personas conozcan la esperanza que encontramos en Jesús."
      },
      {
        title: "Hacemos discípulos",
        body: "Para formar una comunidad cimentada en la Palabra de Dios."
      },
      {
        title: "Servimos a nuestra comunidad",
        body: "Para responder con generosidad a las necesidades de la iglesia y de nuestra ciudad."
      }
    ],
    waysTitle: "Formas de dar",
    waysIntro: "Puedes contribuir de la manera que resulte más práctica para ti.",
    inPersonTitle: "Dar presencialmente",
    inPersonParagraphs: [
      "Puedes ofrendar en efectivo durante nuestras reuniones dominicales de manera libre y voluntaria."
    ],
    transferTitle: "Transferencia bancaria",
    transferBody:
      "Puedes realizar una transferencia directamente a la cuenta de Iglesia Pilar.",
    bankLabels: {
      bank: "Banco",
      holder: "Titular",
      account: "Cuenta",
      clabe: "CLABE",
      card: "Tarjeta",
      concept: "Concepto sugerido"
    },
    conceptValue: "Ofrenda",
    copyAccount: "Copiar cuenta",
    copyClabe: "Copiar CLABE",
    copyCard: "Copiar tarjeta",
    copied: "Copiado",
    onlineTitle: "Dar en línea",
    onlineBody:
      "Elige el monto y la frecuencia de tu aportación. Puedes pagar de forma segura con tarjeta de crédito o débito.",
    onlineCta: "Continuar",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        title: "¿Es obligatorio dar?",
        description:
          "Los miembros y socios ministeriales de Iglesia Pilar se han comprometido a apoyar financieramente a la misión de la iglesia. Dar es una decisión personal que es una respuesta a la generosidad sacrificial de nuestro Señor Jesús. Todo quien da lo hace de manera voluntaria, con libertad y gratitud.",
        references: []
      },
      {
        title: "¿Puedo programar una aportación recurrente?",
        description:
          "Esta opción estará disponible cuando se habilite la plataforma de pagos en línea. Antes de confirmar, podrás revisar claramente el monto y la frecuencia de tu aportación.",
        references: []
      },
      {
        title: "¿Las aportaciones son deducibles de impuestos?",
        description:
          "No, las aportaciones no son deducibles de impuestos. Pilar de la Verdad AC no está autorizada para dar facturas deducibles de impuestos.",
        references: []
      },
      {
        title: "¿Con quién puedo comunicarme si tengo una duda?",
        description:
          "Puedes ponerte en contacto con el equipo de Iglesia Pilar mediante nuestros canales oficiales.",
        references: []
      }
    ],
  },
  en: {
    heroLead:
      "We give because God gave first. Everything comes from him, and in Jesus we have received abundant grace. So we give freely, gratefully, and confidently to take part in the mission of his church.",
    heroCta: "See ways to give",
    scriptureReference: "2 Corinthians 9:7, CSB",
    missionTitle: "We take part in the mission together",
    missionIntro:
      "Offerings sustain the life and mission of Iglesia Pilar: faithfully proclaiming the gospel, making disciples, caring for our community, and serving those around us.",
    missionItems: [
      {
        title: "We proclaim the gospel",
        body: "So more people may know the hope we have found in Jesus."
      },
      {
        title: "We make disciples",
        body: "To form a community grounded in God's Word."
      },
      {
        title: "We serve our community",
        body: "To respond generously to the needs of the church and our city."
      }
    ],
    waysTitle: "Ways to give",
    waysIntro: "You can contribute in the way that works best for you.",
    inPersonTitle: "Give in person",
    inPersonParagraphs: [
      "You can give cash freely and voluntarily during our Sunday gatherings."
    ],
    transferTitle: "Bank transfer",
    transferBody:
      "You can transfer directly to Iglesia Pilar's account.",
    bankLabels: {
      bank: "Bank",
      holder: "Account holder",
      account: "Account",
      clabe: "CLABE",
      card: "Card",
      concept: "Suggested reference"
    },
    conceptValue: "Offering",
    copyAccount: "Copy account",
    copyClabe: "Copy CLABE",
    copyCard: "Copy card",
    copied: "Copied",
    onlineTitle: "Give online",
    onlineBody:
      "Choose the amount and frequency of your contribution. Pay securely with a credit or debit card.",
    onlineCta: "Continue",
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        title: "Is giving required?",
        description:
          "No. Giving is a personal decision that should be made voluntarily, with freedom and gratitude, not through pressure or obligation.",
        references: []
      },
      {
        title: "Can I schedule a recurring contribution?",
        description:
          "This option will be available when the online giving platform is enabled. Before confirming, you will be able to review the amount and frequency of your contribution clearly.",
        references: []
      },
      {
        title: "Are contributions tax deductible?",
        description:
          "No, contributions are not tax deductible. Pilar de la Verdad AC is not authorized to issue tax-deductible receipts.",
        references: []
      },
      {
        title: "Who can I contact if I have a question?",
        description:
          "You can reach the Iglesia Pilar team through our official channels.",
        references: []
      }
    ],
  }
};

export function GivePage({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const bank = getGiveBankDetails(locale);

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="give-page">
        <section className="about-page-hero give-hero">
          <div className="container">
            <div className="about-page-hero-inner give-hero-inner">
              <div className="about-page-hero-copy give-hero-copy">
                <h1>
                  <span className="about-intro-headline">
                    {locale === "es" ? (
                      <>
                        <em>Damos</em> porque <em>Dios</em> dio primero
                      </>
                    ) : (
                      <>
                        <em>We give</em> because <em>God</em> gave first
                      </>
                    )}
                  </span>
                </h1>
                <div className="about-page-copy">
                  <p>{content.heroLead}</p>
                  <p className="give-hero-reference">
                    — <ScriptureTooltip reference={content.scriptureReference.split(",")[0].trim()} locale={locale} />
                    {content.scriptureReference.includes(",") && `, ${content.scriptureReference.split(",").slice(1).join(",").trim()}`}
                  </p>
                </div>
                <CenterScrollLink className="button" href="#formas-de-dar">
                  {content.heroCta}
                </CenterScrollLink>
              </div>

              <div className="about-page-hero-media give-hero-media" data-parallax="0.05">
                <Image
                  src="/images/wix/visit/comunidad.webp"
                  alt={
                    locale === "es"
                      ? "Personas de Iglesia Pilar compartiendo en comunidad"
                      : "People from Iglesia Pilar sharing in community"
                  }
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="section give-section give-methods-section"
          id="formas-de-dar"
          data-reveal
        >
          <div className="container">
            <div className="communities-section-heading">
              <h2>{content.waysTitle}</h2>
              <p>{content.waysIntro}</p>
            </div>

            <div className="give-methods-grid">
              <div className="give-methods-col-left">
                <article className="give-method-card">
                  <span className="give-method-number">01</span>
                  <h3>{content.inPersonTitle}</h3>
                  {content.inPersonParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>

                <GiveOnlineSection
                  copy={{
                    body: content.onlineBody,
                    cta: content.onlineCta,
                    title: content.onlineTitle
                  }}
                  locale={locale}
                  number="03"
                />
              </div>

              <article className="give-method-card give-transfer-card">
                <div className="give-method-card-header">
                  <span className="give-method-number">02</span>
                  <h3>{content.transferTitle}</h3>
                  <p>{content.transferBody}</p>
                </div>

                <dl className="give-bank-card">
                  <div className="give-bank-row">
                    <dt>{content.bankLabels.bank}</dt>
                    <dd>{bank.bank}</dd>
                  </div>
                  <div className="give-bank-row">
                    <dt>{content.bankLabels.holder}</dt>
                    <dd>{bank.holder}</dd>
                  </div>
                  <div className="give-bank-row give-bank-row-actions">
                    <dt>{content.bankLabels.account}</dt>
                    <dd>
                      <span>{bank.account}</span>
                      <CopyFieldButton
                        copiedLabel={content.copied}
                        label={content.copyAccount}
                        value={bank.account}
                      />
                    </dd>
                  </div>
                  <div className="give-bank-row give-bank-row-actions">
                    <dt>{content.bankLabels.clabe}</dt>
                    <dd>
                      <span>{bank.clabe}</span>
                      <CopyFieldButton
                        copiedLabel={content.copied}
                        label={content.copyClabe}
                        value={bank.clabe}
                      />
                    </dd>
                  </div>
                  <div className="give-bank-row give-bank-row-actions">
                    <dt>{content.bankLabels.card}</dt>
                    <dd>
                      <span>{bank.card}</span>
                      <CopyFieldButton
                        copiedLabel={content.copied}
                        label={content.copyCard}
                        value={bank.cardCopy}
                      />
                    </dd>
                  </div>
                  <div className="give-bank-row">
                    <dt>{content.bankLabels.concept}</dt>
                    <dd>{content.conceptValue}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </div>
        </section>

        <section className="section give-section give-mission-section" data-reveal>
          <div className="container">
            <div className="give-mission-heading">
              <p className="eyebrow">
                {locale === "es" ? "Nuestra visión" : "Our vision"}
              </p>
              <h2>
                {locale === "es" ? (
                  <>Participamos juntos en la <em>misión</em></>
                ) : (
                  <>We take part in the <em>mission</em> together</>
                )}
              </h2>
              <p>{content.missionIntro}</p>
            </div>

            <div className="give-mission-grid">
              {content.missionItems.map((item, index) => (
                <article className="give-mission-card" key={item.title}>
                  <span className="give-mission-card-number">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section visit-faq-section" data-reveal>
          <div className="container">
            <div className="communities-section-heading">
              <h2>
                {locale === "es" ? (
                  <>Preguntas <em>frecuentes</em></>
                ) : (
                  <>Frequently asked <em>questions</em></>
                )}
              </h2>
            </div>
            <BeliefsAccordion beliefs={content.faqs} locale={locale} />
          </div>
        </section>

      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
