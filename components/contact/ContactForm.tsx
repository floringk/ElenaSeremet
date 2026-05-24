"use client";

import { FormEvent, useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "success_partial" | "error";

type ApiShape = {
  ok?: boolean;
  error?: string;
  emailSent?: boolean;
  message?: string;
};

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  source_page: string;
  company: string;
};

const MESSAGE_MAX = 3000;

type ContactFormProps = {
  introId?: string;
  sourcePage?: string;
};

export function ContactForm({ introId = "contact-intro", sourcePage = "/contact" }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [messageLength, setMessageLength] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  const lastPayloadRef = useRef<ContactPayload | null>(null);

  const sendPayload = useCallback(async (payload: ContactPayload, form?: HTMLFormElement) => {
    setStatus("loading");
    setMessage("");
    setFieldErrors({});
    setCanRetry(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch {
      setStatus("error");
      setMessage("Nu am putut trimite mesajul. Verifică conexiunea și încearcă din nou.");
      setCanRetry(true);
      return;
    } finally {
      clearTimeout(timeout);
    }

    const data = (await response.json().catch(() => ({}))) as ApiShape;

    if (response.status === 429) {
      setStatus("error");
      setMessage(data.error || "Prea multe cereri. Încearcă mai târziu.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "A apărut o eroare. Te rugăm să încerci din nou.");
      return;
    }

    if (!data.ok) {
      setStatus("error");
      setMessage("Răspuns neașteptat de la server. Încearcă din nou.");
      return;
    }

    if (form) {
      form.reset();
      setMessageLength(0);
    }

    if (data.emailSent === false) {
      const dbOnly =
        Boolean(data.message?.includes("publicare")) || Boolean(data.message?.includes("înregistrat"));
      setStatus(dbOnly ? "success" : "success_partial");
      setMessage(
        data.message ||
          "Mesajul a fost înregistrat, dar notificarea email nu a putut fi trimisă. Echipa îl poate vedea în panoul de administrare."
      );
    } else {
      setStatus("success");
      setMessage("Mesaj trimis cu succes. Revenim în cel mai scurt timp.");
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "contact_submit", path: sourcePage }),
      keepalive: true
    }).catch(() => {});
  }, [sourcePage]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const body = String(formData.get("message") || "").trim();
    const company = String(formData.get("company") || "");

    const nextFieldErrors: Record<string, string> = {};
    if (name.length < 2) nextFieldErrors.name = "Introdu numele (minim 2 caractere).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextFieldErrors.email = "Introdu un email valid.";
    if (body.length < 10) nextFieldErrors.message = "Mesajul trebuie să aibă cel puțin 10 caractere.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setStatus("error");
      setMessage("Verifică câmpurile marcate.");
      setCanRetry(false);
      return;
    }

    const payload: ContactPayload = {
      name,
      email,
      phone,
      message: body,
      source_page: sourcePage,
      company
    };
    lastPayloadRef.current = payload;
    await sendPayload(payload, form);
  }

  function handleRetry() {
    const payload = lastPayloadRef.current;
    if (!payload) return;
    void sendPayload(payload);
  }

  return (
    <div className="form-wrap">
      <form
        onSubmit={onSubmit}
        className="contact-form"
        aria-describedby={introId}
        aria-busy={status === "loading"}
        noValidate
      >
        <label htmlFor="contact-name">
          Nume
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          />
          {fieldErrors.name ? (
            <span id="contact-name-error" className="form-error" role="alert">
              {fieldErrors.name}
            </span>
          ) : null}
        </label>
        <label htmlFor="contact-email">
          Email
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
          />
          {fieldErrors.email ? (
            <span id="contact-email-error" className="form-error" role="alert">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>
        <label htmlFor="contact-phone">
          Telefon
          <input id="contact-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </label>
        <label htmlFor="contact-message">
          Mesaj
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={MESSAGE_MAX}
            rows={6}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={["contact-message-hint", fieldErrors.message ? "contact-message-error" : null]
              .filter(Boolean)
              .join(" ")}
            onChange={(e) => setMessageLength(e.target.value.length)}
          />
          <span id="contact-message-hint" className="muted char-counter" aria-live="polite">
            {messageLength} / {MESSAGE_MAX}
          </span>
          {fieldErrors.message ? (
            <span id="contact-message-error" className="form-error" role="alert">
              {fieldErrors.message}
            </span>
          ) : null}
        </label>
        <label htmlFor="contact-company" className="hp-field">
          <span className="sr-only">Lasa gol acest camp</span>
          <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Se trimite..." : "Trimite mesaj"}
        </button>
      </form>
      {canRetry ? (
        <p className="form-actions-row">
          <button type="button" className="btn btn-secondary focus-ring" onClick={handleRetry} disabled={status === "loading"}>
            Încearcă din nou
          </button>
        </p>
      ) : null}
      {message ? (
        <p
          className={
            status === "error"
              ? "form-error"
              : status === "success_partial"
                ? "form-warning"
                : "form-success"
          }
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
