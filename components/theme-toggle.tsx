"use client";

import { useSyncExternalStore } from "react";

import type { Locale } from "@/lib/types";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("pilar-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pilar-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function ThemeToggle({ locale = "es" }: { locale?: Locale }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light");

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("pilar-theme", nextTheme);
    window.dispatchEvent(new Event("pilar-theme-change"));
  }

  const label =
    theme === "dark"
      ? locale === "es"
        ? "Dark mode"
        : "Dark mode"
      : locale === "es"
        ? "Light mode"
        : "Light mode";

  return (
    <button
      aria-label={
        locale === "es"
          ? `Cambiar a ${theme === "dark" ? "light mode" : "dark mode"}`
          : `Switch to ${theme === "dark" ? "light mode" : "dark mode"}`
      }
      aria-checked={theme === "dark"}
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      type="button"
    >
      <span>{label}</span>
      <i aria-hidden="true">
        <b />
      </i>
    </button>
  );
}
