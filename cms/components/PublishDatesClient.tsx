"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type PublishDatesClientProps = {
  createdAt: string | null;
  publishedAt: string | null;
};

export function PublishDatesClient({ createdAt, publishedAt }: PublishDatesClientProps) {
  const [meta, setMeta] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMeta(document.querySelector<HTMLElement>(".doc-controls__meta"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const syncStatus = () => {
      const status = document.querySelector<HTMLElement>(".doc-controls__status .status");
      const value = status?.querySelector<HTMLElement>(".status__value");
      if (!status || !value) return;

      const rawStatus = value.dataset.creatorStatus === "changed"
        ? "Borrador"
        : value.textContent?.trim() ?? "";
      const state = publishedAt && rawStatus === "Borrador"
        ? "changed"
        : rawStatus === "Publicado"
          ? "published"
          : "draft";

      value.classList.remove(
        "creator-status--draft",
        "creator-status--changed",
        "creator-status--published"
      );
      value.classList.add(`creator-status--${state}`);
      value.dataset.creatorStatus = state;

      if (state === "changed") {
        if (value.textContent?.trim() !== "Modificado") {
          value.textContent = "Modificado";
        }
        if (status.title !== "Estado: Modificado") {
          status.title = "Estado: Modificado";
        }
      }
    };

    syncStatus();
    const controls = document.querySelector<HTMLElement>(".doc-controls");
    if (!controls) return;
    const observer = new MutationObserver(syncStatus);
    observer.observe(controls, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [publishedAt]);

  if (!meta) return null;

  return createPortal(
    <li className="creator-publish-dates">
      {publishedAt ? <span>Publicado: <strong>{publishedAt}</strong></span> : null}
      {createdAt ? <span>Creado: <strong>{createdAt}</strong></span> : null}
    </li>,
    meta
  );
}
