import Image from "next/image";
import Link from "next/link";

import { getCommunities } from "@/lib/content";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

export async function HomeCommunitiesSection({ locale }: { locale: Locale }) {
  const managedCommunities = await getCommunities(locale);
  const communities = managedCommunities.length ? managedCommunities : [{
    slug: "comunidad-sur",
    name: "Comunidad Sur",
    label: locale === "es" ? "Comunidad misional" : "Missionary community",
    image: "/images/wix/visit/comunidad.webp",
    imageAlt: locale === "es" ? "Comunidad Sur de Iglesia Pilar" : "Pilar Church South Community"
  }];

  return (
    <section className="section home-communities-section">
      <div className="container home-communities-shell" data-reveal>
        <div className="home-communities-intro">
          <p className="eyebrow">
            {locale === "es"
              ? "Comunidades Misionales"
              : "Missionary Communities"}
          </p>
          <h2>
            {locale === "es" ? (
              <>
                El <em>discipulado</em> se vive en <em>comunidad</em>
              </>
            ) : (
              <>
                <em>Discipleship</em> is lived in <em>community</em>
              </>
            )}
          </h2>
          <p className="lead">
            {locale === "es"
              ? "Nuestras comunidades misionales son espacios para conocernos, acompañarnos y aprender juntos a vivir el evangelio cada día."
              : "Our missionary communities are spaces where we can get to know one another, support each other, and learn together to live out the gospel each day."}
          </p>
          <div className="button-row">
            <Link className="button home-communities-cta" href={localePath(locale, "/comunidades")}>
              {locale === "es" ? "Ver comunidades" : "View communities"}
            </Link>
          </div>
        </div>

        <div className="home-communities-grid">
          {communities.map((community) => (
            <Link
              className="home-community-card"
              href={`${localePath(locale, "/comunidades")}#${community.slug}`}
              key={community.slug}
            >
              <div className="home-community-image">
                <Image
                  src={community.image || "/images/wix/visit/comunidad.webp"}
                  alt={community.imageAlt || community.name}
                  fill
                  sizes="(max-width: 719px) calc(100vw - 32px), 50vw"
                />
              </div>
              <div className="home-community-copy">
                <p className="eyebrow">{community.label || (locale === "es" ? "Comunidad misional" : "Missionary community")}</p>
                <h3>{community.name}</h3>
                <span className="home-community-action">
                  {locale === "es" ? "Conocer comunidad" : "Meet the community"} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
