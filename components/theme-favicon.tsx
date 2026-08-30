"use client";

import { useEffect } from "react";

const LIGHT_FAVICON = "/brand/iso-iglesia-pilar.png";
const DARK_FAVICON = "/brand/iso-iglesia-pilar-white.png";

export function ThemeFavicon() {
  useEffect(() => {
    const root = document.documentElement;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let favicon = document.querySelector<HTMLLinkElement>("#pilar-theme-favicon");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = "pilar-theme-favicon";
      favicon.rel = "icon";
      favicon.type = "image/png";
      document.head.appendChild(favicon);
    }

    const update = () => {
      const isDark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : colorScheme.matches;
      favicon.href = isDark ? DARK_FAVICON : LIGHT_FAVICON;
    };

    const observer = new MutationObserver(update);
    observer.observe(root, { attributeFilter: ["data-theme"], attributes: true });
    colorScheme.addEventListener("change", update);
    update();

    return () => {
      observer.disconnect();
      colorScheme.removeEventListener("change", update);
    };
  }, []);

  return null;
}
