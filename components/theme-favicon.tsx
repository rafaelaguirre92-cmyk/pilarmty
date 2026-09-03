"use client";

import { useEffect } from "react";

const LIGHT_FAVICON = "/brand/iso-iglesia-pilar.png";
const DARK_FAVICON = "/brand/iso-iglesia-pilar-white.png";

export function ThemeFavicon() {
  useEffect(() => {
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
      favicon.href = colorScheme.matches ? DARK_FAVICON : LIGHT_FAVICON;
    };

    colorScheme.addEventListener("change", update);
    update();

    return () => {
      colorScheme.removeEventListener("change", update);
    };
  }, []);

  return null;
}
