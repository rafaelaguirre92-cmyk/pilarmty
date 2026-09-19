"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements
} from "@stripe/react-stripe-js/checkout";
import { loadStripe, type Appearance } from "@stripe/stripe-js";

import type { Locale } from "@/lib/types";

type GiveOnlineCopy = {
  title: string;
  body: string;
  cta: string;
};

type ModalStep = "amount" | "checkout" | "success";

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
  const [step, setStep] = useState<ModalStep>("amount");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string>(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  );

  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const [checkoutReturnUrl, setCheckoutReturnUrl] = useState<string>("");
  const [isDark, setIsDark] = useState(true);

  const stripePromise = useMemo(() => {
    return publishableKey ? loadStripe(publishableKey) : null;
  }, [publishableKey]);

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme) {
        setIsDark(theme === "dark");
      } else {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);

  const stripeAppearance: Appearance = useMemo(() => {
    const rules: Record<string, Record<string, string>> = isDark
      ? {
          ".Input": {
            backgroundColor: "#10202d",
            borderColor: "rgba(240, 236, 233, 0.2)",
            color: "#f0ece9",
            boxShadow: "none"
          },
          ".Input:focus": {
            borderColor: "#aeb592",
            boxShadow: "0 0 0 1px #aeb592"
          },
          ".Label": {
            color: "rgba(240, 236, 233, 0.85)",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          },
          ".Tab": {
            backgroundColor: "#10202d",
            borderColor: "rgba(240, 236, 233, 0.18)",
            color: "#f0ece9"
          },
          ".Tab:hover": {
            borderColor: "#aeb592"
          },
          ".Tab--selected": {
            backgroundColor: "#1d434b",
            borderColor: "#aeb592",
            color: "#f0ece9"
          },
          ".Block": {
            backgroundColor: "transparent",
            borderColor: "rgba(240, 236, 233, 0.15)"
          }
        }
      : {
          ".Input": {
            backgroundColor: "#f8f9fa",
            borderColor: "rgba(20, 37, 52, 0.18)",
            color: "#142534",
            boxShadow: "none"
          },
          ".Input:focus": {
            borderColor: "#142534",
            boxShadow: "0 0 0 1px #142534"
          },
          ".Label": {
            color: "#53616e",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          },
          ".Tab": {
            backgroundColor: "#f8f9fa",
            borderColor: "rgba(20, 37, 52, 0.15)",
            color: "#142534"
          },
          ".Tab:hover": {
            borderColor: "#142534"
          },
          ".Tab--selected": {
            backgroundColor: "#ffffff",
            borderColor: "#142534",
            color: "#142534"
          },
          ".Block": {
            backgroundColor: "transparent",
            borderColor: "rgba(20, 37, 52, 0.15)"
          }
        };

    if (isDark) {
      return {
        theme: "night",
        variables: {
          fontFamily:
            '"Montserrat Pilar", Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          colorPrimary: "#aeb592",
          colorBackground: "#142534",
          colorText: "#f0ece9",
          colorDanger: "#e57373",
          colorTextPlaceholder: "rgba(240, 236, 233, 0.45)",
          borderRadius: "8px",
          spacingUnit: "4px"
        },
        rules
      };
    }

    return {
      theme: "stripe",
      variables: {
        fontFamily:
          '"Montserrat Pilar", Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        colorPrimary: "#142534",
        colorBackground: "#ffffff",
        colorText: "#142534",
        colorDanger: "#c62828",
        colorTextPlaceholder: "#8898aa",
        borderRadius: "8px",
        spacingUnit: "4px"
      },
      rules
    };
  }, [isDark]);

  const isSpanish = locale === "es";
  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const formattedAmount = Number.isFinite(selectedAmount)
    ? `$${selectedAmount.toLocaleString(locale === "es" ? "es-MX" : "en-US")} MXN`
    : "—";
  const frequencyLabel =
    frequency === "once"
      ? isSpanish
        ? "Una vez"
        : "One time"
      : isSpanish
        ? "Mensualmente"
        : "Monthly";

  // Check URL query parameters on mount in case of 3DS redirect return
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const aportacion = params.get("aportacion");
    const sessionId = params.get("session_id");

    if (aportacion === "gracias" || aportacion === "resultado" || sessionId) {
      setStep("success");
      setIsOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    if (step === "success") {
      setStep("amount");
      setCheckoutClientSecret(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedAmount || selectedAmount < 50) {
      setError(
        isSpanish
          ? "El monto mínimo es de $50 MXN."
          : "The minimum amount is $50 MXN."
      );
      return;
    }

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
      const payload = (await response.json()) as {
        clientSecret?: string;
        publishableKey?: string;
        returnUrl?: string;
        error?: string;
        message?: string;
      };

      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.message || payload.error || "checkout_unavailable");
      }

      if (payload.publishableKey && !publishableKey) {
        setPublishableKey(payload.publishableKey);
      }

      if (payload.returnUrl) {
        setCheckoutReturnUrl(payload.returnUrl);
      }

      setCheckoutClientSecret(payload.clientSecret);
      setStep("checkout");
    } catch (err) {
      const customMsg =
        err instanceof Error &&
        err.message &&
        err.message !== "checkout_unavailable" &&
        err.message !== "stripe_checkout_failed"
          ? err.message
          : null;

      setError(
        customMsg ||
          (isSpanish
            ? "No pudimos iniciar el pago en este momento. Intenta nuevamente más tarde."
            : "We could not start the payment right now. Please try again later.")
      );
    } finally {
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
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
      >
        {isSpanish ? "Dar en línea" : "Give online"}
      </button>

      <dialog
        aria-labelledby={titleId}
        className={`community-inquiry-dialog give-online-dialog ${
          step === "checkout" ? "give-online-dialog--checkout" : ""
        }`}
        ref={dialogRef}
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="community-inquiry-dialog-inner">
          <button
            aria-label={isSpanish ? "Cerrar" : "Close"}
            className="community-inquiry-dialog-close"
            type="button"
            onClick={handleClose}
          >
            <span aria-hidden="true">×</span>
          </button>

          {step === "amount" && (
            <>
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
                        ? "Preparando pago seguro…"
                        : "Preparing payment…"
                      : copy.cta}
                  </button>
                </div>

                {error && (
                  <p aria-live="polite" className="give-online-error">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}

          {step === "checkout" && (
            <div className="give-online-checkout-step">
              <div className="give-online-checkout-topbar">
                <button
                  className="give-online-back-button"
                  type="button"
                  onClick={() => {
                    setStep("amount");
                    setError("");
                  }}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  {isSpanish ? "Cambiar monto" : "Change amount"}
                </button>

                <div className="give-online-checkout-badge">
                  <span>{formattedAmount}</span>
                  <span aria-hidden="true">·</span>
                  <span>{frequencyLabel}</span>
                </div>
              </div>

              <div className="give-online-elements-container">
                {stripePromise && checkoutClientSecret ? (
                  <CheckoutElementsProvider
                    key={checkoutClientSecret}
                    stripe={stripePromise}
                    options={{
                      clientSecret: checkoutClientSecret,
                      elementsOptions: {
                        appearance: stripeAppearance,
                        fonts: [
                          {
                            cssSrc:
                              "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
                          }
                        ]
                      }
                    }}
                  >
                    <CheckoutElementsForm
                      formattedAmount={formattedAmount}
                      frequencyLabel={frequencyLabel}
                      isSpanish={isSpanish}
                      onSuccess={() => {
                        setStep("success");
                        setError("");
                      }}
                      returnUrl={checkoutReturnUrl}
                    />
                  </CheckoutElementsProvider>
                ) : (
                  <div className="give-online-loading">
                    <span className="spinner" aria-hidden="true" />
                    <p>
                      {isSpanish
                        ? "Cargando pasarela de pago seguro…"
                        : "Loading secure payment form…"}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <p aria-live="polite" className="give-online-error">
                  {error}
                </p>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="give-online-success">
              <div className="give-online-success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2>{isSpanish ? "¡Muchas gracias!" : "Thank you!"}</h2>
              <p className="give-online-success-amount">
                <strong>{formattedAmount}</strong> · {frequencyLabel}
              </p>
              <p className="community-inquiry-dialog-description">
                {isSpanish
                  ? "Tu aportación ha sido procesada con éxito. Agradecemos profundamente tu generosidad y apoyo a la misión de Iglesia Pilar."
                  : "Your gift has been successfully processed. We deeply appreciate your generosity and support for the mission of Iglesia Pilar."}
              </p>
              <button
                className="button give-online-success-button"
                type="button"
                onClick={handleClose}
              >
                {isSpanish ? "Listo" : "Done"}
              </button>
            </div>
          )}
        </div>
      </dialog>
    </article>
  );
}

function CheckoutElementsForm({
  formattedAmount,
  frequencyLabel,
  isSpanish,
  onSuccess,
  returnUrl
}: {
  formattedAmount: string;
  frequencyLabel: string;
  isSpanish: boolean;
  onSuccess: () => void;
  returnUrl: string;
}) {
  const checkoutState = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (checkoutState.type === "loading") {
    return (
      <div className="give-online-loading">
        <span className="spinner" aria-hidden="true" />
        <p>
          {isSpanish
            ? "Cargando formulario seguro…"
            : "Loading secure form…"}
        </p>
      </div>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <div className="give-online-error">
        {checkoutState.error.message ||
          (isSpanish
            ? "Ocurrió un error al cargar la pasarela de pago."
            : "An error occurred while loading payment gateway.")}
      </div>
    );
  }

  const { checkout } = checkoutState;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await checkout.confirm({
        returnUrl: returnUrl || window.location.href,
        redirect: "if_required"
      });

      if (result.type === "error") {
        setErrorMessage(
          result.error.message ||
            (isSpanish
              ? "No se pudo procesar el pago. Por favor verifica los datos de tu tarjeta."
              : "Could not process payment. Please verify your card details.")
        );
        setSubmitting(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : isSpanish
            ? "Ocurrió un error inesperado al procesar el pago."
            : "An unexpected error occurred while processing payment."
      );
      setSubmitting(false);
    }
  };

  const displayTotal = checkout.total?.total?.amount || formattedAmount;

  return (
    <form className="give-online-elements-form" onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs"
        }}
      />

      {errorMessage && (
        <p aria-live="polite" className="give-online-error">
          {errorMessage}
        </p>
      )}

      <div className="give-online-actions">
        <p className="give-online-summary">
          <span>{isSpanish ? "Total a aportar" : "Total gift"}</span>
          <strong>
            {displayTotal} · {frequencyLabel}
          </strong>
        </p>
        <button
          className="button give-online-submit"
          disabled={submitting}
          type="submit"
        >
          {submitting
            ? isSpanish
              ? "Procesando pago…"
              : "Processing payment…"
            : isSpanish
              ? `Aportar ${formattedAmount}`
              : `Give ${formattedAmount}`}
        </button>
      </div>
    </form>
  );
}

