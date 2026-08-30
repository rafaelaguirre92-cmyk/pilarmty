"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { localePath } from "@/lib/site";
import type { SearchKind, SearchResult } from "@/lib/search";
import type { Locale } from "@/lib/types";

const KIND_ORDER: SearchKind[] = [
  "teaching",
  "collection",
  "resource",
  "topic",
  "page"
];

export function SearchOverlay({
  locale,
  instanceId = "site",
  showLabel = false
}: {
  locale: Locale;
  instanceId?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isSpanish = locale === "es";
  const searchPath = localePath(locale, isSpanish ? "/buscar" : "/search");
  const titleId = `${instanceId}-search-title`;
  const inputId = `${instanceId}-search-input`;
  const suggestionsId = `${instanceId}-search-suggestions`;

  const orderedResults = useMemo(
    () => KIND_ORDER.flatMap((kind) => results.filter((result) => result.kind === kind)),
    [results]
  );

  const groupedResults = useMemo(
    () =>
      KIND_ORDER.map((kind) => ({
        kind,
        results: orderedResults.filter((result) => result.kind === kind)
      })).filter((group) => group.results.length),
    [orderedResults]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.classList.add("search-overlay-open");
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => document.body.classList.remove("search-overlay-open");
  }, [open]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?locale=${locale}&q=${encodeURIComponent(normalized)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(data.results || []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [locale, query]);

  function closeSearch() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function openSearch() {
    setOpen(true);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    if (activeIndex < 0 || !orderedResults[activeIndex]) return;
    event.preventDefault();
    router.push(orderedResults[activeIndex].href);
    closeSearch();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0 && orderedResults[activeIndex]) {
      event.preventDefault();
      router.push(orderedResults[activeIndex].href);
      closeSearch();
      return;
    }
    if (!orderedResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % orderedResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? orderedResults.length - 1 : current - 1
      );
    }
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={isSpanish ? "Abrir búsqueda" : "Open search"}
        className="search-link"
        onClick={openSearch}
        type="button"
      >
        <span aria-hidden="true" className="search-link-icon" />
        {showLabel && (
          <span className="search-link-label">
            {isSpanish ? "Buscar" : "Search"}
          </span>
        )}
      </button>

      <dialog
        aria-labelledby={titleId}
        className="search-overlay"
        onCancel={(event) => {
          event.preventDefault();
          closeSearch();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
        onClose={() => {
          document.body.classList.remove("search-overlay-open");
          setOpen(false);
        }}
        ref={dialogRef}
      >
        <div className="search-overlay-panel">
          <div className="search-overlay-heading">
            <div>
              <h2 id={titleId}>
                {isSpanish ? "¿Qué estás buscando?" : "What are you looking for?"}
              </h2>
            </div>
            <button
              aria-label={isSpanish ? "Cerrar búsqueda" : "Close search"}
              className="search-overlay-close"
              onClick={closeSearch}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          </div>

          <form action={searchPath} className="search-overlay-form" onSubmit={submitSearch}>
            <label htmlFor={inputId}>
              {isSpanish
                ? "Buscar enseñanzas, series, recursos y temas"
                : "Search teachings, series, resources, and topics"}
            </label>
            <div className="search-overlay-field">
              <input
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${instanceId}-search-suggestion-${activeIndex}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={suggestionsId}
                aria-expanded={query.trim().length >= 2}
                autoComplete="off"
                id={inputId}
                name="q"
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  setActiveIndex(-1);
                  if (value.trim().length < 2) {
                    setResults([]);
                    setLoading(false);
                  }
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={isSpanish ? "Ej. gracia, Efesios, familia" : "E.g. grace, Ephesians, family"}
                ref={inputRef}
                role="combobox"
                type="search"
                value={query}
              />
              <button className="button" type="submit">
                {isSpanish ? "Buscar" : "Search"}
              </button>
            </div>
          </form>

          <div aria-live="polite" className="search-overlay-content">
            {query.trim().length < 2 ? (
              <div className="search-overlay-start">
                <div>
                  <Link href={localePath(locale, "/ensenanzas")} onClick={closeSearch}>
                    {isSpanish ? "Enseñanzas" : "Teachings"}
                  </Link>
                  <Link href={localePath(locale, "/recursos")} onClick={closeSearch}>
                    {isSpanish ? "Series y recursos" : "Series and resources"}
                  </Link>
                  <Link href={localePath(locale, "/recursos/temas")} onClick={closeSearch}>
                    {isSpanish ? "Temáticas" : "Topics"}
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <p className="search-overlay-status">
                {isSpanish ? "Buscando…" : "Searching…"}
              </p>
            ) : orderedResults.length ? (
              <div className="search-suggestions" id={suggestionsId} role="listbox">
                {groupedResults.map((group) => (
                  <section key={group.kind}>
                    <p>{group.results[0].label}</p>
                    <div>
                      {group.results.map((result) => {
                        const currentIndex = orderedResults.findIndex(
                          (item) => item.kind === result.kind && item.href === result.href
                        );
                        return (
                          <Link
                            aria-selected={activeIndex === currentIndex}
                            className={activeIndex === currentIndex ? "active" : undefined}
                            href={result.href}
                            id={`${instanceId}-search-suggestion-${currentIndex}`}
                            key={`${result.kind}:${result.href}`}
                            onClick={closeSearch}
                            role="option"
                          >
                            <span>{result.title}</span>
                            {(result.author || result.meta || result.excerpt) && (
                              <small className="search-suggestion-meta">
                                {result.author &&
                                  (result.kind === "teaching" || result.kind === "resource") && (
                                    <span>
                                      {isSpanish ? "Por" : "By"} {result.author}
                                    </span>
                                  )}
                                {result.meta && <span>{result.meta}</span>}
                                {!result.author && !result.meta && result.excerpt && (
                                  <span>{result.excerpt}</span>
                                )}
                              </small>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p className="search-overlay-status">
                {isSpanish ? "No encontramos coincidencias." : "No matches found."}
              </p>
            )}
          </div>

          {query.trim().length >= 2 && (
            <Link
              className="search-overlay-all"
              href={`${searchPath}?q=${encodeURIComponent(query.trim())}`}
              onClick={closeSearch}
              onMouseEnter={() => setActiveIndex(-1)}
            >
              {isSpanish
                ? `Ver todos los resultados para “${query.trim()}”`
                : `View all results for “${query.trim()}”`}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </dialog>
    </>
  );
}
