"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ResourceFiltersDrawerProps = {
  resourcePath: string;
  activeCatalogTab: string;
  query?: string;
  selectedOrder?: string;
  series?: string;
  topic?: string;
  speaker?: string;
  catalogSeries: Array<{ slug: string; name: string }>;
  catalogTopics: string[];
  catalogSpeakers: string[];
  popularScriptureBooks: string[];
  popularTopics: string[];
  labels: {
    filterButton: string;
    title: string;
    close: string;
    seriesLabel: string;
    allSeries: string;
    topicLabel: string;
    allTopics: string;
    speakerLabel: string;
    allSpeakers: string;
    bibleBooks: string;
    popularTopics: string;
    allTopicsLink: string;
    applyFilters: string;
    clearFilters: string;
  };
  clearCatalogFiltersPath: string;
  allTopicsHref: string;
  activeCount: number;
};

export function ResourceFiltersDrawer({
  resourcePath,
  activeCatalogTab,
  query,
  selectedOrder,
  series,
  topic,
  speaker,
  catalogSeries,
  catalogTopics,
  catalogSpeakers,
  popularScriptureBooks,
  popularTopics,
  labels,
  clearCatalogFiltersPath,
  allTopicsHref,
  activeCount
}: ResourceFiltersDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  function getFilterTopicHref(nextTopic: string) {
    const params = new URLSearchParams({
      tipo: activeCatalogTab,
      tema: nextTopic
    });
    if (query?.trim()) params.set("q", query.trim());
    if (series) params.set("serie", series);
    if (speaker) params.set("predicador", speaker);
    if (selectedOrder === "oldest") params.set("orden", "oldest");
    return `${resourcePath}?${params.toString()}#catalogo`;
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.classList.remove("is-closing");
      dialog.showModal();
      document.body.classList.add("resource-filters-open");
    } else if (!open && dialog.open) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        dialog.close();
        return;
      }

      const closeTimer = window.setTimeout(() => dialog.close(), 320);
      return () => window.clearTimeout(closeTimer);
    }
  }, [open]);

  useEffect(
    () => () => document.body.classList.remove("resource-filters-open"),
    []
  );

  function closeDrawer() {
    const dialog = dialogRef.current;
    if (
      dialog?.open &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      dialog.classList.add("is-closing");
    }
    setOpen(false);
  }

  function handleFormSubmit() {
    closeDrawer();
  }

  return (
    <>
      <button
        aria-controls="resource-filters-drawer"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={labels.filterButton}
        className="resource-filters-trigger"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="resource-filters-trigger-icon">
          <svg
            fill="none"
            height="15"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="15"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
        </span>
        <span>{labels.filterButton}</span>
        {activeCount > 0 && (
          <span className="resource-filters-badge">{activeCount}</span>
        )}
      </button>

      <dialog
        aria-labelledby="resource-filters-drawer-title"
        className="resource-filters-drawer"
        id="resource-filters-drawer"
        onCancel={(event) => {
          event.preventDefault();
          closeDrawer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDrawer();
          }
        }}
        onClose={() => {
          document.body.classList.remove("resource-filters-open");
          dialogRef.current?.classList.remove("is-closing");
          setOpen(false);
          triggerRef.current?.focus();
        }}
        ref={dialogRef}
      >
        <div className="resource-filters-panel">
          <div className="resource-filters-panel-header">
            <div className="resource-filters-panel-title-wrap">
              <h2 id="resource-filters-drawer-title">{labels.title}</h2>
              {activeCount > 0 && (
                <span className="resource-filters-badge">{activeCount}</span>
              )}
            </div>
            <button
              aria-label={labels.close}
              className="resource-filters-close"
              onClick={closeDrawer}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          </div>

          <div className="resource-filters-panel-body">
            <form action={resourcePath} method="get" onSubmit={handleFormSubmit}>
              <input name="tipo" type="hidden" value={activeCatalogTab} />
              {query?.trim() && (
                <input name="q" type="hidden" value={query.trim()} />
              )}
              {selectedOrder === "oldest" && (
                <input name="orden" type="hidden" value="oldest" />
              )}

              {catalogSeries.length > 0 && (
                <label>
                  <span>{labels.seriesLabel}</span>
                  <select
                    aria-label={labels.seriesLabel}
                    defaultValue={series || ""}
                    name="serie"
                  >
                    <option value="">{labels.allSeries}</option>
                    {catalogSeries.map((collection) => (
                      <option key={collection.slug} value={collection.slug}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {catalogTopics.length > 0 && (
                <label>
                  <span>{labels.topicLabel}</span>
                  <select
                    aria-label={labels.topicLabel}
                    defaultValue={topic || ""}
                    name="tema"
                  >
                    <option value="">{labels.allTopics}</option>
                    {catalogTopics.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {catalogSpeakers.length > 0 && (
                <label>
                  <span>{labels.speakerLabel}</span>
                  <select
                    aria-label={labels.speakerLabel}
                    defaultValue={speaker || ""}
                    name="predicador"
                  >
                    <option value="">{labels.allSpeakers}</option>
                    {catalogSpeakers.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {popularScriptureBooks.length > 0 && (
                <div className="resource-filter-popular-topics">
                  <p>{labels.bibleBooks}</p>
                  <div>
                    {popularScriptureBooks.map((item) => (
                      <Link
                        aria-current={topic === item ? "true" : undefined}
                        className={topic === item ? "active" : undefined}
                        href={getFilterTopicHref(item)}
                        key={item}
                        onClick={closeDrawer}
                        scroll={false}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {popularTopics.length > 0 && (
                <div className="resource-filter-popular-topics">
                  <p>{labels.popularTopics}</p>
                  <div>
                    {popularTopics.map((item) => (
                      <Link
                        aria-current={topic === item ? "true" : undefined}
                        className={topic === item ? "active" : undefined}
                        href={getFilterTopicHref(item)}
                        key={item}
                        onClick={closeDrawer}
                        scroll={false}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                  <Link
                    className="resources-topics-all"
                    href={allTopicsHref}
                    onClick={closeDrawer}
                  >
                    {labels.allTopicsLink} →
                  </Link>
                </div>
              )}

              <div className="resource-filter-actions">
                <button className="button" type="submit">
                  {labels.applyFilters}
                </button>
                {activeCount > 0 && (
                  <Link
                    className="resource-filter-clear"
                    href={clearCatalogFiltersPath}
                    onClick={closeDrawer}
                    scroll={false}
                  >
                    {labels.clearFilters}
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
