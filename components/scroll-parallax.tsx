"use client";

import { useEffect } from "react";

export function ScrollParallax() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    ).map((element) => ({
      element,
      speed: Number(element.dataset.parallax) || 0.03
    }));
    let frame = 0;

    const update = () => {
      const viewportCenter = window.innerHeight / 2;

      for (const { element, speed } of items) {
        const bounds = element.getBoundingClientRect();
        const offset = Math.max(
          -18,
          Math.min(18, (viewportCenter - (bounds.top + bounds.height / 2)) * speed)
        );
        element.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
      }

      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
