"use client";

import { FormEvent, useState } from "react";

import type { Locale } from "@/lib/types";

const content = {
  es: {
    title: "Boletín",
    desc: "Entérate de lo que sucede en Iglesia Pilar: eventos, nuevos recursos y enseñanzas para tu caminar en el evangelio.",
    placeholder: "Tu correo electrónico",
    button: "Suscribirme",
    success: "¡Gracias por suscribirte!",
    error: "No se pudo suscribir. Intenta de nuevo.",
  },
  en: {
    title: "Newsletter",
    desc: "Stay close to life at Iglesia Pilar: upcoming events, new teachings, and resources for your walk in the gospel.",
    placeholder: "Your email address",
    button: "Subscribe",
    success: "Thank you for subscribing!",
    error: "Could not subscribe. Please try again.",
  },
};

export function NewsletterForm({ locale = "es" }: { locale?: Locale }) {
  const copy = content[locale];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (response.ok) {
        form.reset();
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="footer-newsletter">
      <p className="footer-column-title">{copy.title}</p>
      <p className="footer-newsletter-desc">{copy.desc}</p>
      <form className="footer-newsletter-form" onSubmit={handleSubmit}>
        <div className="footer-newsletter-row">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={copy.placeholder}
            className="footer-newsletter-input"
            aria-label={copy.placeholder}
            disabled={status === "loading" || status === "success"}
          />
          <button
            type="submit"
            className="footer-newsletter-btn"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "..." : copy.button}
          </button>
        </div>
        {status === "success" && (
          <p className="footer-newsletter-status is-success" role="status">
            {copy.success}
          </p>
        )}
        {status === "error" && (
          <p className="footer-newsletter-status is-error" role="alert">
            {copy.error}
          </p>
        )}
      </form>
    </div>
  );
}
