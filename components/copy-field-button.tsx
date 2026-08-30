"use client";

import { useState } from "react";

export function CopyFieldButton({
  value,
  label,
  copiedLabel
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    let didCopy = false;

    try {
      await navigator.clipboard.writeText(value);
      didCopy = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      didCopy = document.execCommand("copy");
      textarea.remove();
    }

    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      className="give-copy-button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect height="13" rx="1.5" width="11" x="8" y="3" />
          <path d="M16 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3" />
        </svg>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : label}
      </span>
    </button>
  );
}
