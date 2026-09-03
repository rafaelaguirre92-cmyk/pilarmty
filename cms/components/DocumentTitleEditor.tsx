"use client";

import { useField } from "@payloadcms/ui";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

/**
 * Makes the document name editable where an editor expects to find it: in the
 * page header. The regular Payload field remains registered with the form, but
 * is visually replaced so there is only one title control on the page.
 */
export function DocumentTitleEditor() {
  const { disabled, setValue, value } = useField<string>({ path: "title" });
  const [header, setHeader] = useState<HTMLElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let titleField: HTMLElement | null = null;
    const frame = window.requestAnimationFrame(() => {
      const documentHeader = document.querySelector<HTMLElement>(".doc-header__header");
      titleField = document
        .querySelector<HTMLInputElement>('input[name="title"]')
        ?.closest<HTMLElement>(".field-type") ?? null;

      titleField?.classList.add("creator-document-title-field");
      setHeader(documentHeader);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      titleField?.classList.remove("creator-document-title-field");
    };
  }, []);

  useEffect(() => {
    const titleInput = titleInputRef.current;
    const editor = editorRef.current;
    if (!titleInput || !editor) return;

    const positionHint = () => {
      titleInput.style.height = "0px";
      titleInput.style.height = `${Math.min(titleInput.scrollHeight, 72)}px`;

      const styles = window.getComputedStyle(titleInput);
      const lineHeight = Number.parseFloat(styles.lineHeight) || 36;
      const availableWidth = titleInput.clientWidth - Number.parseFloat(styles.paddingRight);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context || !availableWidth) return;

      context.font = styles.font;
      const lines: string[] = [];
      for (const paragraph of (typeof value === "string" ? value : "").split("\n")) {
        let line = "";
        for (const word of paragraph.split(/\s+/)) {
          const candidate = line ? `${line} ${word}` : word;
          if (line && context.measureText(candidate).width > availableWidth) {
            lines.push(line);
            line = word;
          } else {
            line = candidate;
          }
        }
        lines.push(line);
      }

      const visibleLines = Math.min(Math.max(lines.length, 1), 2);
      const lastLine = lines[visibleLines - 1] || "";
      const left = Math.min(
        context.measureText(lastLine).width + 8,
        availableWidth - 18
      );

      editor.style.setProperty("--creator-title-hint-left", `${Math.max(left, 0)}px`);
      editor.style.setProperty(
        "--creator-title-hint-top",
        `${(visibleLines - 1) * lineHeight + lineHeight / 2}px`
      );
    };

    positionHint();
    const resizeObserver = new ResizeObserver(positionHint);
    resizeObserver.observe(titleInput);

    return () => resizeObserver.disconnect();
  }, [header, value]);

  if (!header) return null;

  return createPortal(
    <div className="creator-document-title-editor" ref={editorRef}>
      <label className="sr-only" htmlFor="creator-document-title">
        Título de la enseñanza
      </label>
      <textarea
        aria-label="Título de la enseñanza"
        disabled={disabled}
        id="creator-document-title"
        onChange={(event) => setValue(event.target.value)}
        ref={titleInputRef}
        rows={1}
        value={typeof value === "string" ? value : ""}
      />
      <span
        aria-hidden="true"
        className="creator-document-title-editor__hint"
      >
        <svg viewBox="0 0 20 20">
          <path d="M3.5 14.8 4.3 11l8-8a1.7 1.7 0 0 1 2.4 0l1.3 1.3a1.7 1.7 0 0 1 0 2.4l-8 8-3.8.8Z" />
          <path d="m11.2 4.1 4.7 4.7" />
        </svg>
      </span>
    </div>,
    header
  );
}
