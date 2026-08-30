"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type CenterScrollLinkProps = ComponentProps<typeof Link>;

export function CenterScrollLink({
  href,
  onClick,
  ...props
}: CenterScrollLinkProps) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (typeof href !== "string" || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "center"
        });
        window.history.pushState(null, "", href);
      }}
      {...props}
    />
  );
}
