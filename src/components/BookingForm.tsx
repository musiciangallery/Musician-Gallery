"use client";

import { useState } from "react";
import type { Musician, Occasion } from "@/lib/musicians";

type Step = 1 | 2 | 3 | 4;

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";

const FREQUENCY_OPTIONS = ["Weekly", "Fortnightly", "One-off"];

export default function BookingForm({ musician }: { musician: Musician }) {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    occasion: musician.occasions[0] as Occasion,
    eventDate: "",
    location: "",
    details: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const isLessons = form.occasion === "Lessons";
  const canContinueStep1 = form.occasion && form.eventDate;
  const canContinueStep2 = form.clientName && form.clientEmail;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicianSlug: musician.slug, ...form }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${
                step >= n
                  ? "bg-blk text-w border-blk"
                  : "border-rule text-mid"
              }`}
            >
              {n}
            </span>
            {n < 3 && <span className="w-8 h-px bg-rule" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl mb-2">Tell us about the occasion</h2>
          <div>
            <label className={labelClass}>Occasion</label>
            <select
              className={inputClass}
              value={form.occasion}
              onChange={(e) => update("occasion", e.target.value)}
            >
              {musician.occasions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isLessons ? "Frequency" : "Date"}</label>
            {isLessons ? (
              <select
                className={inputClass}
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
              >
                <option value="" disabled>
                  Select one
                </option>
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                className={inputClass}
                value={form.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
              />
            )}
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              placeholder="e.g. Auckland CBD"
              className={inputClass}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Anything else {musician.name.split(" ")[0]} should know</label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.details}
              onChange={(e) => update("details", e.target.value)}
            />
          </div>
          <button
            disabled={!canContinueStep1}
            onClick={() => setStep(2)}
            className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl mb-2">Your details</h2>
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              className={inputClass}
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={form.clientEmail}
              onChange={(e) => update("clientEmail", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Phone (optional)</label>
            <input
              type="tel"
              className={inputClass}
              value={form.clientPhone}
              onChange={(e) => update("clientPhone", e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="text-xs tracking-[0.1em] uppercase text-mid hover:text-accent py-3 px-4"
            >
              Back
            </button>
            <button
              disabled={!canContinueStep2}
              onClick={() => setStep(3)}
              className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Review request
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl mb-2">Review &amp; submit</h2>
          <dl className="border border-rule divide-y divide-rule text-sm">
            {[
              ["Musician", musician.name],
              ["Occasion", form.occasion],
              [isLessons ? "Frequency" : "Date", form.eventDate],
              ["Location", form.location || "—"],
              ["Notes", form.details || "—"],
              ["Name", form.clientName],
              ["Email", form.clientEmail],
              ["Phone", form.clientPhone || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3">
                <dt className="text-mid">{k}</dt>
                <dd className="text-right max-w-[60%]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-mid">
            This sends a booking request to {musician.name} &mdash; it does
            not charge you yet. A 10% platform fee applies once the booking
            is confirmed and payment is processed.
          </p>
          {error && <p className="text-xs text-accent">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="text-xs tracking-[0.1em] uppercase text-mid hover:text-accent py-3 px-4"
            >
              Back
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send booking request"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-16 border border-rule">
          <p className="eyebrow mb-4">Request sent</p>
          <h2 className="font-serif text-3xl mb-4">
            {musician.name.split(" ")[0]} will be in touch shortly.
          </h2>
          <p className="text-sm text-mid max-w-sm mx-auto">
            We&rsquo;ve sent your request through. Most musicians respond
            within 48 hours &mdash; you&rsquo;ll hear back at {form.clientEmail}.
          </p>
        </div>
      )}
    </div>
  );
}
