"use client";

import { FormEvent, useState } from "react";

import {
  MEMBERSHIP_KINDS,
  MEMBERSHIP_WANT_GOALS,
  MEMBERSHIP_SUBSCRIPTION_VALUES
} from "@/lib/membership-signup";

type Status = "idle" | "loading" | "success" | "error";

type MembershipSignupFormProps = {
  sourcePage?: string;
  compact?: boolean;
  id?: string;
};

export function MembershipSignupForm({
  sourcePage = "/inscriere",
  compact = false,
  id = "inscriere-studio"
}: MembershipSignupFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const want_goal = String(formData.get("want_goal") || "").trim();
    const subscription_type = String(formData.get("subscription_type") || "").trim();
    const member_kind = String(formData.get("member_kind") || "").trim();
    const company = String(formData.get("company") || "");

    const next: Record<string, string> = {};
    if (!want_goal) next.want_goal = "Alege o opțiune.";
    if (!subscription_type) next.subscription_type = "Alege tipul de abonament.";
    if (!member_kind) next.member_kind = "Alege varianta care te descrie.";
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setStatus("error");
      setMessage("Completează toate câmpurile.");
      return;
    }

    setFieldErrors({});
    setStatus("loading");
    setMessage("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let response: Response;
    try {
      response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          want_goal,
          subscription_type,
          member_kind,
          source_page: sourcePage,
          company
        }),
        signal: controller.signal
      });
    } catch {
      setStatus("error");
      setMessage("Nu am putut trimite. Verifică conexiunea și încearcă din nou.");
      clearTimeout(timeout);
      return;
    } finally {
      clearTimeout(timeout);
    }

    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

    if (response.status === 429) {
      setStatus("error");
      setMessage(data.error || "Prea multe cereri. Încearcă mai târziu.");
      return;
    }

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(data.error || "A apărut o eroare. Te rugăm să încerci din nou.");
      return;
    }

    form.reset();
    setStatus("success");
    setMessage("Înscrierea a fost înregistrată. Te contactăm în curând!");
  }

  return (
    <div id={id} className={`form-wrap membership-signup-wrap ${compact ? "membership-signup-wrap--compact" : ""}`}>
      {!compact ? (
        <header className="membership-signup-header">
          <h2 className="membership-signup-title">Alătură-te astăzi</h2>
          <p className="membership-signup-lead">
            Alege opțiunile de mai jos — îți pregătim experiența la studio fără pași complicați.
          </p>
        </header>
      ) : (
        <h3 className="membership-signup-title membership-signup-title--compact">Înscriere rapidă</h3>
      )}
      <form
        onSubmit={onSubmit}
        className="contact-form membership-form"
        aria-busy={status === "loading"}
        noValidate
      >
        <label htmlFor="membership-want">
          Vreau să:
          <select
            id="membership-want"
            name="want_goal"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.want_goal)}
            aria-describedby={fieldErrors.want_goal ? "membership-want-error" : undefined}
          >
            <option value="" disabled>
              Selectează…
            </option>
            {MEMBERSHIP_WANT_GOALS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldErrors.want_goal ? (
            <span id="membership-want-error" className="form-error" role="alert">
              {fieldErrors.want_goal}
            </span>
          ) : null}
        </label>

        <label htmlFor="membership-plan">
          Alege tipul de abonament:
          <select
            id="membership-plan"
            name="subscription_type"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.subscription_type)}
            aria-describedby={fieldErrors.subscription_type ? "membership-plan-error" : undefined}
          >
            <option value="" disabled>
              Selectează…
            </option>
            {MEMBERSHIP_SUBSCRIPTION_VALUES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {fieldErrors.subscription_type ? (
            <span id="membership-plan-error" className="form-error" role="alert">
              {fieldErrors.subscription_type}
            </span>
          ) : null}
        </label>

        <label htmlFor="membership-kind">
          Eu sunt:
          <select
            id="membership-kind"
            name="member_kind"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.member_kind)}
            aria-describedby={fieldErrors.member_kind ? "membership-kind-error" : undefined}
          >
            <option value="" disabled>
              Selectează…
            </option>
            {MEMBERSHIP_KINDS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldErrors.member_kind ? (
            <span id="membership-kind-error" className="form-error" role="alert">
              {fieldErrors.member_kind}
            </span>
          ) : null}
        </label>

        <label htmlFor="membership-company" className="hp-field">
          <span className="sr-only">Lasă gol acest câmp</span>
          <input id="membership-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>

        <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Se trimite…" : "Trimite înscrierea"}
        </button>
      </form>
      {message ? (
        <p
          className={status === "error" ? "form-error" : "form-success"}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
