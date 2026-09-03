"use client";

import { useField } from "@payloadcms/ui";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function DocumentUrlClient({ collection }: { collection: string }) {
  const { setValue, value } = useField<string>({ path: "slug" });
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const slug = typeof value === "string" ? value : "";
  const href = collection && slug ? `/ensenanzas/${collection}/${slug}` : "#";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setTarget(document.querySelector<HTMLElement>(".creator-document-title-editor"))
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!target) return null;

  return createPortal(
    <div className="creator-document-url">
      <span>/ensenanzas/{collection ? `${collection}/` : ""}</span>
      <input
        aria-label="URL de la enseñanza"
        onChange={(event) => setValue(event.target.value)}
        value={slug}
      />
      {href !== "#" ? <a href={href} rel="noreferrer" target="_blank">Abrir</a> : null}
    </div>,
    target
  );
}
