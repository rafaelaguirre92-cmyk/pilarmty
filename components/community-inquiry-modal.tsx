"use client";

import { useEffect, useId, useRef, useState } from "react";

import { CommunityInterestForm } from "@/components/community-interest-form";
import type { Locale } from "@/lib/types";

type CommunityInquiryModalProps = {
  locale: Locale;
  triggerLabel: string;
  title: string;
  description: string;
  community?: string;
  showZone?: boolean;
  className?: string;
};

export function CommunityInquiryModal({
  locale,
  triggerLabel,
  title,
  description,
  community,
  showZone,
  className
}: CommunityInquiryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <>
      <button
        className={`button ${className || ""}`.trim()}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {triggerLabel}
      </button>

      <dialog
        aria-labelledby={titleId}
        className="community-inquiry-dialog"
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <div className="community-inquiry-dialog-inner">
          <button
            aria-label={locale === "es" ? "Cerrar formulario" : "Close form"}
            className="community-inquiry-dialog-close"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
          <h2 id={titleId}>{title}</h2>
          <p className="community-inquiry-dialog-description">{description}</p>
          <CommunityInterestForm
            community={community}
            locale={locale}
            showZone={showZone}
          />
        </div>
      </dialog>
    </>
  );
}
