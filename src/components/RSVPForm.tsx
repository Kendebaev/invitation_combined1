"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Minus, Plus, LoaderCircle } from "lucide-react";
import { config, type Attendance } from "@/data/config";
import { validateRSVP, type RSVPField } from "@/lib/rsvp";
import { Reveal } from "./Reveal";
import { SuccessModal } from "./SuccessModal";
import { Ornament } from "./Ornament";

export function RSVPForm() {
  const c = config.rsvp;
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance | "">("");
  const [guests, setGuests] = useState(1);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState<{ field?: RSVPField; message: string } | null>(null);
  const [success, setSuccess] = useState<Attendance | null>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const min = attendance === "couple" ? 2 : 1;

  function choose(value: Attendance) {
    setAttendance(value);
    setGuests(value === "no" ? 0 : Math.max(value === "couple" ? 2 : 1, guests));
    if (error?.field === "attendance" || error?.field === "guests") setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setError(null);
    const result = validateRSVP({ name, attendance, guests: attendance === "no" ? 0 : guests });
    if (!result.ok) {
      setError(result);
      const focusId = result.field === "attendance" ? "attendance-yes" : result.field;
      requestAnimationFrame(() => document.getElementById(focusId)?.focus());
      return;
    }
    inFlight.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json();
      if (!response.ok || payload.ok !== true) {
        setError({ message: response.status === 503 ? c.errors.unavailable : c.errors.failed });
        return;
      }
      setSuccess(result.data.attendance);
    } catch {
      setError({ message: c.errors.failed });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <section className="section rsvp-section" aria-labelledby="rsvp-title">
      <Reveal>
        <Ornament />
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 id="rsvp-title">{c.title}</h2>
        <p className="section-description">{c.description}</p>
      </Reveal>
      <Reveal>
        <form ref={form} onSubmit={submit} noValidate aria-busy={pending}>
          <fieldset disabled={pending} className="form-fields">
            <div className="field">
              <label htmlFor="name">
                {c.name}
                <span aria-hidden="true"> *</span>
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error?.field === "name") setError(null);
                }}
                maxLength={c.maxNameLength}
                placeholder={c.namePlaceholder}
                required
                aria-invalid={error?.field === "name"}
                aria-describedby={`name-hint${error?.field === "name" ? " form-error" : ""}`}
              />
              <p className="field-hint" id="name-hint">
                {c.nameHint}
              </p>
            </div>
            <fieldset
              className="attendance-field"
              aria-describedby={error?.field === "attendance" ? "form-error" : undefined}
            >
              <legend>
                {c.attendance}
                <span aria-hidden="true"> *</span>
              </legend>
              {c.options.map(option => (
                <label
                  className={`radio-option ${attendance === option.value ? "is-selected" : ""}`}
                  key={option.value}
                >
                  <input
                    id={`attendance-${option.value}`}
                    type="radio"
                    name="attendance"
                    value={option.value}
                    checked={attendance === option.value}
                    onChange={() => choose(option.value)}
                    required
                    aria-invalid={error?.field === "attendance"}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
            {attendance && attendance !== "no" && (
              <div className="guest-field">
                <label htmlFor="guests">{c.guests}</label>
                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => setGuests(g => Math.max(min, g - 1))}
                    disabled={guests <= min}
                    aria-label={c.subtract}
                  >
                    <Minus size={17} aria-hidden="true" />
                  </button>
                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={c.maxGuests}
                    step={1}
                    value={Number.isNaN(guests) ? "" : guests}
                    onChange={e => setGuests(e.target.value === "" ? NaN : Number(e.target.value))}
                    aria-invalid={error?.field === "guests"}
                    aria-describedby={error?.field === "guests" ? "form-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setGuests(g => Math.min(c.maxGuests, Number.isNaN(g) ? min : g + 1))}
                    disabled={guests >= c.maxGuests}
                    aria-label={c.add}
                  >
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </fieldset>
          {error && (
            <p id="form-error" className="form-error" role="alert">
              {error.message}
            </p>
          )}
          <button ref={submitButton} type="submit" className="button primary-button" disabled={pending}>
            {pending ? c.sending : c.submit}
            {pending ? (
              <LoaderCircle size={18} className="loading-icon" aria-hidden="true" />
            ) : (
              <ArrowUpRight size={19} aria-hidden="true" />
            )}
          </button>
          <p className="privacy-note">{c.privacy}</p>
        </form>
      </Reveal>
      <SuccessModal attendance={success} onClose={() => setSuccess(null)} returnFocus={submitButton} />
    </section>
  );
}
