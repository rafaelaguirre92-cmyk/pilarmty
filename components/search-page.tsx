import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { searchContent } from "@/lib/search";
import type { SearchKind } from "@/lib/search";
import { localePath } from "@/lib/site";
import type { Locale } from "@/lib/types";

const FILTERS: SearchKind[] = [
  "teaching",
  "collection",
  "resource",
  "topic",
  "page"
];

export async function SearchPage({
  kind,
  locale,
  query
}: {
  kind?: string;
  locale: Locale;
  query?: string;
}) {
  const isSpanish = locale === "es";
  const normalized = query?.trim() || "";
  const activeKind = FILTERS.includes(kind as SearchKind)
    ? (kind as SearchKind)
    : undefined;
  const allResults = normalized ? await searchContent(locale, normalized) : [];
  const results = activeKind
    ? allResults.filter((result) => result.kind === activeKind)
    : allResults;
  const searchPath = localePath(locale, isSpanish ? "/buscar" : "/search");
  const filterLabels: Record<SearchKind, string> = isSpanish
    ? {
        teaching: "Enseñanzas",
        collection: "Series y eventos",
        resource: "Recursos",
        topic: "Temáticas",
        page: "Páginas"
      }
    : {
        teaching: "Teachings",
        collection: "Series and events",
        resource: "Resources",
        topic: "Topics",
        page: "Pages"
      };
  const counts = Object.fromEntries(
    FILTERS.map((filter) => [
      filter,
      allResults.filter((result) => result.kind === filter).length
    ])
  ) as Record<SearchKind, number>;

  function filterHref(filter?: SearchKind) {
    const params = new URLSearchParams();
    if (normalized) params.set("q", normalized);
    if (filter) params.set("tipo", filter);
    return `${searchPath}?${params.toString()}`;
  }

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="search-page">
        <header className="search-page-header">
          <div className="container search-page-heading">
            <p className="eyebrow">{isSpanish ? "Biblioteca" : "Library"}</p>
            <h1>{isSpanish ? "Encuentra lo que necesitas" : "Find what you need"}</h1>
            <p>
              {isSpanish
                ? "Busca por tema, pasaje, serie, autor o palabra clave."
                : "Search by topic, passage, series, author, or keyword."}
            </p>
            <form action={searchPath} className="search-page-form">
              <label htmlFor="search-page-input">
                {isSpanish ? "Buscar en la biblioteca" : "Search the library"}
              </label>
              <div>
                <input
                  autoFocus
                  defaultValue={query}
                  id="search-page-input"
                  name="q"
                  placeholder={isSpanish ? "Ej. gracia, Efesios, familia" : "E.g. grace, Ephesians, family"}
                  type="search"
                />
                <button className="button" type="submit">
                  {isSpanish ? "Buscar" : "Search"}
                </button>
              </div>
            </form>
          </div>
        </header>

        <section className="section search-page-section">
          <div className="container">
            {normalized ? (
              <>
                <div className="search-results-heading">
                  <div>
                    <p className="eyebrow">
                      {isSpanish ? "Resultados" : "Results"}
                    </p>
                    <h2>
                      {allResults.length} {isSpanish ? "resultados para" : "results for"}{" "}
                      <span>“{normalized}”</span>
                    </h2>
                  </div>
                </div>

                {allResults.length > 0 && (
                  <nav
                    aria-label={isSpanish ? "Filtrar resultados" : "Filter results"}
                    className="search-filters"
                  >
                    <Link
                      aria-current={!activeKind ? "page" : undefined}
                      className={!activeKind ? "active" : undefined}
                      href={filterHref()}
                    >
                      {isSpanish ? "Todos" : "All"} <span>{allResults.length}</span>
                    </Link>
                    {FILTERS.filter((filter) => counts[filter] > 0).map((filter) => (
                      <Link
                        aria-current={activeKind === filter ? "page" : undefined}
                        className={activeKind === filter ? "active" : undefined}
                        href={filterHref(filter)}
                        key={filter}
                      >
                        {filterLabels[filter]} <span>{counts[filter]}</span>
                      </Link>
                    ))}
                  </nav>
                )}

                {results.length ? (
                  <div className="search-results-list">
                    {results.map((result) => (
                      <article key={`${result.kind}:${result.href}`}>
                        <Link href={result.href}>
                          <div>
                            <p className="eyebrow">{result.label}</p>
                            <h3>{result.title}</h3>
                            {result.excerpt && <p>{result.excerpt}</p>}
                          </div>
                          <div className="search-result-meta">
                            {result.author && (
                              <span>{isSpanish ? "Por" : "By"} {result.author}</span>
                            )}
                            {result.meta && <span>{result.meta}</span>}
                            <b aria-hidden="true">→</b>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="search-empty-state">
                    <h2>{isSpanish ? "No encontramos coincidencias" : "No matches found"}</h2>
                    <p>
                      {isSpanish
                        ? "Prueba con menos palabras, revisa la ortografía o busca un tema más amplio."
                        : "Try fewer words, check the spelling, or search for a broader topic."}
                    </p>
                    {activeKind && (
                      <Link className="text-link" href={filterHref()}>
                        {isSpanish ? "Ver resultados de todos los tipos" : "View results of all types"} →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="search-start-grid">
                <div>
                  <p className="eyebrow">{isSpanish ? "Empieza por aquí" : "Start here"}</p>
                  <h2>{isSpanish ? "Explora nuestra biblioteca" : "Explore our library"}</h2>
                </div>
                <div className="search-start-links">
                  <Link href={localePath(locale, "/ensenanzas")}>
                    <span>{isSpanish ? "Enseñanzas" : "Teachings"}</span>
                    <b aria-hidden="true">→</b>
                  </Link>
                  <Link href={localePath(locale, "/recursos")}>
                    <span>{isSpanish ? "Series y recursos" : "Series and resources"}</span>
                    <b aria-hidden="true">→</b>
                  </Link>
                  <Link href={localePath(locale, "/recursos/temas")}>
                    <span>{isSpanish ? "Temáticas" : "Topics"}</span>
                    <b aria-hidden="true">→</b>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
