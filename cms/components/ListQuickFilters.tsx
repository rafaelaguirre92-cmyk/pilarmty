"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { normalizeColumnsParam } from "../../lib/admin-list-query";

type FilterOption = { label: string; value: string };

const statusOptions = [
  { label: "Todos", value: "all" },
  { label: "Publicados", value: "published" },
  { label: "Borrador", value: "draft" }
];

const defaultSeriesOption: FilterOption = { label: "Serie o evento", value: "all" };

function Chevron() {
  return (
    <svg className="icon icon--chevron" height="100%" viewBox="0 0 20 20" width="100%" xmlns="http://www.w3.org/2000/svg">
      <path className="stroke" d="M14 8L10 12L6 8" strokeLinecap="square" />
    </svg>
  );
}

function isCollection(value: string | null): value is "teachings" | "resources" {
  return value === "teachings" || value === "resources";
}

export function ListQuickFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [seriesOptions, setSeriesOptions] = useState<FilterOption[]>([defaultSeriesOption]);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const collectionsIndex = segments.indexOf("collections");
  const collection = collectionsIndex !== -1 ? segments[collectionsIndex + 1] : null;
  const isTrash = segments.at(-1) === "trash";
  const isTeachings = collection === "teachings" && !isTrash;
  const isResources = collection === "resources" && !isTrash;

  useEffect(() => {
    if (!isCollection(collection)) return;

    const findTarget = () => {
      const list = document.querySelector<HTMLElement>(".collection-list");
      const actions = list?.querySelector<HTMLElement>(".search-bar__actions");

      if (list) list.dataset.creatorPresets = collection;
      if (actions) {
        setTarget(actions);
        if (isTrash) {
          const emptyTrashBtn = document.getElementById("empty-trash-button");
          if (emptyTrashBtn && !actions.contains(emptyTrashBtn)) {
            actions.appendChild(emptyTrashBtn);
          }
        }
      }
    };

    findTarget();
    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelector<HTMLElement>(".collection-list")?.removeAttribute("data-creator-presets");
    };
  }, [collection, isTrash]);

  useEffect(() => {
    if (!isCollection(collection)) return;

    const next = new URLSearchParams(searchParams.toString());
    const permittedKeys = new Set(["where[_status][equals]"]);
    if (collection === "teachings") permittedKeys.add("where[series][equals]");

    const hasLegacyFilter = Array.from(next.keys()).some(
      (key) => key.startsWith("where[") && !permittedKeys.has(key)
    );
    const normalizedColumns = normalizeColumnsParam(next);

    if (!hasLegacyFilter && !normalizedColumns) return;

    if (hasLegacyFilter) {
      Array.from(next.keys())
        .filter((key) => key.startsWith("where["))
        .forEach((key) => next.delete(key));
      next.set("page", "1");
    }

    router.replace(`${pathname}?${next.toString()}`);
  }, [collection, pathname, router, searchParams]);

  useEffect(() => {
    if (!isTeachings) return;

    let cancelled = false;
    fetch("/api/series?depth=0&limit=100&sort=title&locale=es")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.docs)) return;
        setSeriesOptions([
          defaultSeriesOption,
          ...data.docs
            .filter(
              (item: { id?: unknown; title?: unknown }) =>
                (typeof item.id === "string" || typeof item.id === "number") && typeof item.title === "string"
            )
            .map((item: { id: string | number; title: string }) => ({ label: item.title, value: String(item.id) }))
        ]);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isTeachings]);

  useEffect(() => {
    if (!seriesOpen && !statusOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(".creator-list-preset")) {
        setSeriesOpen(false);
        setStatusOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSeriesOpen(false);
        setStatusOpen(false);
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [seriesOpen, statusOpen]);

  if (!target || (!isTeachings && !isResources)) return null;

  const status = searchParams.get("where[_status][equals]") ?? "all";
  const series = searchParams.get("where[series][equals]") ?? "all";

  function updateFilters(field: "status" | "series", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    normalizeColumnsParam(next);
    Array.from(next.keys())
      .filter((key) => key.startsWith("where["))
      .forEach((key) => next.delete(key));

    const nextStatus = field === "status" ? value : status;
    const nextSeries = field === "series" ? value : series;

    if (nextStatus !== "all") next.set("where[_status][equals]", nextStatus);
    if (isTeachings && nextSeries !== "all") next.set("where[series][equals]", nextSeries);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  }

  function renderDropdown(
    name: "series" | "status",
    label: string,
    value: string,
    options: FilterOption[]
  ) {
    if (name === "series") {
      return (
        <div className="creator-list-preset" key={name}>
          <button
            aria-expanded={seriesOpen}
            className="pill pill--style-light pill--size-small pill--has-action pill--has-icon pill--align-icon-right creator-list-preset__trigger creator-list-preset__trigger--series"
            onClick={() => {
              setSeriesOpen((current) => !current);
              setStatusOpen(false);
            }}
            type="button"
          >
            <span className="pill__label">{label}</span>
            <span className="pill__icon"><Chevron /></span>
          </button>
          {seriesOpen && (
            <div className="creator-list-preset__menu creator-list-preset__menu--series" role="menu">
              {options.map((option) => (
                <button
                  aria-checked={value === option.value}
                  className={value === option.value ? "is-selected" : undefined}
                  key={option.value}
                  onClick={() => {
                    updateFilters("series", option.value);
                    setSeriesOpen(false);
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (name === "status") {
      return (
        <div className="creator-list-preset" key={name}>
          <button
            aria-expanded={statusOpen}
            className="pill pill--style-light pill--size-small pill--has-action pill--has-icon pill--align-icon-right creator-list-preset__trigger creator-list-preset__trigger--status"
            onClick={() => {
              setStatusOpen((current) => !current);
              setSeriesOpen(false);
            }}
            type="button"
          >
            <span className="pill__label">{label}</span>
            <span className="pill__icon"><Chevron /></span>
          </button>
          {statusOpen && (
            <div className="creator-list-preset__menu" role="menu">
              {options.map((option) => (
                <button
                  aria-checked={value === option.value}
                  className={value === option.value ? "is-selected" : undefined}
                  key={option.value}
                  onClick={() => {
                    updateFilters("status", option.value);
                    setStatusOpen(false);
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  const selectedSeries = seriesOptions.find((option) => option.value === series)?.label ?? defaultSeriesOption.label;
  const selectedStatus = status === "all" ? "Estado" : statusOptions.find((option) => option.value === status)?.label ?? "Estado";

  if (isTrash) return null;

  return createPortal(
    <div className="creator-list-presets" aria-label="Filtros rápidos">
      {isTeachings && renderDropdown("series", selectedSeries, series, seriesOptions)}
      {renderDropdown("status", selectedStatus, status, statusOptions)}
      <a className="btn list-create-new-doc__create-new-button creator-list-create-button" href={`${pathname}/create`}>
        <span className="btn__content" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>＋ Nuevo</span>
      </a>
    </div>,
    target
  );
}
