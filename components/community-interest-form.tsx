"use client";

import { FormEvent, useState } from "react";

import type { Locale } from "@/lib/types";

const zones = [
  "Monterrey Sur",
  "Monterrey Centro",
  "Cumbres",
  "San Pedro",
  "Santa Catarina",
  "San Nicolás",
  "Guadalupe",
  "Apodaca",
  "Escobedo",
  "García",
  "Santiago",
  "Otro"
];

export function CommunityInterestForm({
  locale,
  community,
  showZone = false
}: {
  locale: Locale;
  community?: string;
  showZone?: boolean;
}) {
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, community, formType: "community" })
    });

    if (response.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  const isSpanish = locale === "es";

  return (
    <form className="contact-form community-interest-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <input
            aria-label={isSpanish ? "Nombre" : "First name"}
            name="name"
            autoComplete="given-name"
            placeholder={isSpanish ? "Nombre" : "First name"}
            required
            minLength={2}
          />
        </label>

        <label>
          <input
            aria-label={isSpanish ? "Apellido" : "Last name"}
            name="lastName"
            autoComplete="family-name"
            placeholder={isSpanish ? "Apellido" : "Last name"}
            required
            minLength={2}
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          <input
            aria-label="WhatsApp"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="WhatsApp"
            required
            minLength={10}
            maxLength={15}
            pattern="[0-9]{10,15}"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(
                /\D/g,
                ""
              );
            }}
          />
        </label>

        <label>
          <input
            aria-label={
              isSpanish ? "Correo electrónico (opcional)" : "Email (optional)"
            }
            name="email"
            type="email"
            autoComplete="email"
            placeholder={
              isSpanish ? "Correo electrónico (opcional)" : "Email (optional)"
            }
          />
        </label>
      </div>

      {showZone && (
        <label>
          <select
            aria-label={isSpanish ? "Zona donde vives" : "Area where you live"}
            name="zone"
            required
            defaultValue=""
          >
            <option value="" disabled>
              {isSpanish ? "Zona donde vives" : "Area where you live"}
            </option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        <textarea
          aria-label={
            isSpanish
              ? "¿Qué te gustaría hacer o preguntarnos?"
              : "What would you like to do or ask us?"
          }
          name="message"
          placeholder={
            isSpanish
              ? "¿Qué te gustaría hacer o preguntarnos?"
              : "What would you like to do or ask us?"
          }
          required
          minLength={10}
          rows={5}
        />
      </label>

      <div className="community-form-footer">
        <button className="button" disabled={state === "sending"}>
          {state === "sending"
            ? isSpanish
              ? "Enviando…"
              : "Sending…"
            : isSpanish
              ? "Enviar"
              : "Send"}
        </button>
      </div>

      <label className="honey" aria-hidden="true">
        Sitio
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <p className="form-status" aria-live="polite">
        {state === "success" &&
          (isSpanish
            ? "¡Gracias por escribirnos! Recibimos tu información. Alguien del equipo de Iglesia Pilar se pondrá en contacto contigo pronto."
            : "Thank you for writing to us! We received your information. Someone from Iglesia Pilar will contact you soon.")}
        {state === "error" &&
          (isSpanish
            ? "No pudimos enviar tu información. Intenta de nuevo en unos minutos."
            : "We could not send your information. Please try again in a few minutes.")}
      </p>
    </form>
  );
}
