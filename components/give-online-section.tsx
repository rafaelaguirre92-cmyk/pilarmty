"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

import type { Locale } from "@/lib/types";

type GiveOnlineCopy = {
  title: string;
  body: string;
  cta: string;
};

const presetAmounts = [300, 500, 1000];

export function GiveOnlineSection({
  copy,
  locale,
  number = "03"
}: {
  locale: Locale;
  copy: GiveOnlineCopy;
  number?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const isSpanish = locale === "es";
  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const formattedAmount = Number.isFinite(selectedAmount)
    ? `$${selectedAmount.toLocaleString(locale === "es" ? "es-MX" : "en-US")}`
    : "—";
  const frequencyLabel =
    frequency === "once"
      ? isSpanish
        ? "Una vez"
        : "One time"
      : isSpanish
        ? "Mensualmente"
        : "Monthly";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          frequency,
          locale
        })
      });
      const payload = (await response.json()) as { url?: string };

      if (!response.ok || !payload.url) throw new Error("checkout_unavailable");
      window.location.assign(payload.url);
    } catch {
      setError(
        isSpanish
          ? "No pudimos iniciar el pago en este momento. Intenta nuevamente más tarde."
          : "We could not start the payment right now. Please try again later."
      );
      setLoading(false);
    }
  }

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount("");
    setError("");
  }

  return (
    <article className="give-method-card give-online-card">
      <span className="give-method-number">{number}</span>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
      <p className="give-online-security">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect height="11" rx="2" width="14" x="5" y="10" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        {isSpanish
          ? "Pago cifrado y procesado de forma segura por Stripe"
          : "Encrypted payment securely processed by Stripe"}
      </p>
      <button
        className="button give-online-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {isSpanish ? "Dar en línea" : "Give online"}
      </button>

      <dialog
        aria-labelledby={titleId}
        className="community-inquiry-dialog give-online-dialog"
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
            aria-label={isSpanish ? "Cerrar" : "Close"}
            className="community-inquiry-dialog-close"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
          <h2 id={titleId}>{copy.title}</h2>
          <p className="community-inquiry-dialog-description">{copy.body}</p>

          <form className="give-online-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>
                <span aria-hidden="true" className="give-online-step">01</span>
                {isSpanish ? "Frecuencia" : "Frequency"}
              </legend>
              <div className="give-option-group">
                <button
                  aria-pressed={frequency === "once"}
                  className={frequency === "once" ? "active" : ""}
                  onClick={() => {
                    setFrequency("once");
                    setError("");
                  }}
                  type="button"
                >
                  {isSpanish ? "Una vez" : "One time"}
                </button>
                <button
                  aria-pressed={frequency === "monthly"}
                  className={frequency === "monthly" ? "active" : ""}
                  onClick={() => {
                    setFrequency("monthly");
                    setError("");
                  }}
                  type="button"
                >
                  {isSpanish ? "Mensualmente" : "Monthly"}
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span aria-hidden="true" className="give-online-step">02</span>
                {isSpanish ? "Monto" : "Amount"}
              </legend>
              <div className="give-amount-grid">
                {presetAmounts.map((value) => (
                  <button
                    aria-pressed={!customAmount && amount === value}
                    className={!customAmount && amount === value ? "active" : ""}
                    key={value}
                    onClick={() => selectPreset(value)}
                    type="button"
                  >
                    ${value.toLocaleString(locale === "es" ? "es-MX" : "en-US")}
                  </button>
                ))}
                <label className={customAmount ? "active" : ""}>
                  <span className="sr-only">
                    {isSpanish ? "Otro monto" : "Custom amount"}
                  </span>
                  <span aria-hidden="true">$</span>
                  <input
                    inputMode="numeric"
                    min="50"
                    onChange={(event) => {
                      setCustomAmount(event.target.value);
                      setError("");
                    }}
                    placeholder={isSpanish ? "Otro" : "Other"}
                    type="number"
                    value={customAmount}
                  />
                </label>
              </div>
            </fieldset>

            <div className="give-online-actions">
              <p className="give-online-summary">
                <span>{isSpanish ? "Tu aportación" : "Your gift"}</span>
                <strong>{formattedAmount} · {frequencyLabel}</strong>
              </p>
              <button className="button give-online-submit" disabled={loading} type="submit">
                {loading
                  ? isSpanish
                    ? "Abriendo Stripe…"
                    : "Opening Stripe…"
                  : copy.cta}
              </button>
            </div>
            {error && (
              <p aria-live="polite" className="give-online-error">
                {error}
              </p>
            )}
          </form>
        </div>
      </dialog>
    </article>
  );
}
