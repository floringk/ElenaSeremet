"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "success_partial" | "error";

type ApiShape = {
  ok?: boolean;
  error?: string;
  emailSent?: boolean;
  message?: string;
};

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const body = String(formData.get("message") || "").trim();
    const company = String(formData.get("company") || "");

    const nextFieldErrors: Record<string, string> = {};
    if (name.length < 2) nextFieldErrors.name = "Introduceti numele (minim 2 caractere).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextFieldErrors.email = "Introduceti un email valid.";
    if (body.length < 10) nextFieldErrors.message = "Mesajul trebuie sa aiba cel putin 10 caractere.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setStatus("error");
      setMessage("Verificati campurile marcate.");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      message: body,
      company
    };

    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {
      setStatus("error");
      setMessage("Nu am putut trimite mesajul. Verificati conexiunea si incercati din nou.");
      return;
    }

    const data = (await response.json().catch(() => ({}))) as ApiShape;

    if (response.status === 429) {
      setStatus("error");
      setMessage(data.error || "Prea multe cereri. Incercati mai tarziu.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "A aparut o eroare. Te rugam sa incerci din nou.");
      return;
    }

    if (!data.ok) {
      setStatus("error");
      setMessage("Raspuns neasteptat de la server. Incercati din nou.");
      return;
    }

    form.reset();

    if (data.emailSent === false) {
      setStatus("success_partial");
      setMessage(
        data.message ||
          "Mesajul a fost inregistrat, dar notificarea email nu a putut fi trimisa. Echipa poate vedea mesajul in sistem."
      );
    } else {
      setStatus("success");
      setMessage("Mesaj trimis cu succes. Revenim in cel mai scurt timp.");
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "contact_submit", path: "/contact" })
    }).catch(() => {});
  }

  return (
    <section className="page-section" aria-labelledby="contact-heading">
      <div className="container form-wrap">
        <h1 id="contact-heading">Contact</h1>
        <p id="contact-intro">Trimite-ne un mesaj si iti raspundem rapid.</p>
        <form
          onSubmit={onSubmit}
          className="contact-form"
          aria-describedby="contact-intro"
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
              maxLength={3000}
              rows={6}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
            />
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
    </section>
  );
}
