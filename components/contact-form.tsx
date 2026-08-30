"use client";

import { FormEvent, useState } from "react";

import type { Locale } from "@/lib/types";

export function ContactForm({ locale = "es" }: { locale?: Locale }) {
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
      body: JSON.stringify(body)
    });

    if (response.ok) {
      form.reset();
      setState("success");
    } else {
      setState("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <input
            aria-label={locale === "es" ? "Nombre" : "Name"}
            name="name"
            autoComplete="name"
            placeholder={locale === "es" ? "Nombre" : "Name"}
            required
            minLength={2}
          />
        </label>
        <label>
          <input
            aria-label={locale === "es" ? "Apellido" : "Last name"}
            name="lastName"
            autoComplete="family-name"
            placeholder={locale === "es" ? "Apellido" : "Last name"}
          />
        </label>
        <label className="form-field-full">
          <input
            aria-label={locale === "es" ? "Correo" : "Email"}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={locale === "es" ? "Correo" : "Email"}
            required
          />
        </label>
      </div>
      <label>
        <input
          aria-label={locale === "es" ? "Teléfono / WhatsApp" : "Phone / WhatsApp"}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={locale === "es" ? "Teléfono / WhatsApp" : "Phone / WhatsApp"}
        />
      </label>
      <label>
        <textarea
          aria-label={locale === "es" ? "Mensaje" : "Message"}
          name="message"
          placeholder={locale === "es" ? "Mensaje" : "Message"}
          required
          minLength={10}
          rows={4}
        />
      </label>
      <label className="honey" aria-hidden="true">
        Sitio
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button" disabled={state === "sending"}>
        {state === "sending"
          ? locale === "es"
            ? "Enviando…"
            : "Sending…"
          : locale === "es"
            ? "Enviar"
            : "Send"}
      </button>
      <p className="form-status" aria-live="polite">
        {state === "success" &&
          (locale === "es"
            ? "Gracias. Recibimos tu mensaje."
            : "Thank you. We received your message.")}
        {state === "error" &&
          (locale === "es"
            ? "No pudimos enviarlo. Escríbenos de nuevo en unos minutos."
            : "We could not send it. Please try again in a few minutes.")}
      </p>
    </form>
  );
}
