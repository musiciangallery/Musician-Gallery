"use client";

import { useState } from "react";

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";

export default function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    instrument: "",
    region: "",
    type: "Event Musician",
    bio: "",
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/musician-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 border border-rule">
        <p className="eyebrow mb-4">Application received</p>
        <h2 className="font-serif text-3xl mb-4">Welcome to the gallery.</h2>
        <p className="text-sm text-mid max-w-sm mx-auto">
          We&rsquo;ll be in touch once your police vetting check is
          complete, then your profile goes live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className={labelClass}>Name</label>
        <input
          required
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          required
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Instrument</label>
          <input
            required
            className={inputClass}
            value={form.instrument}
            onChange={(e) => update("instrument", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Region</label>
          <input
            required
            className={inputClass}
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>I am a</label>
        <select
          className={inputClass}
          value={form.type}
          onChange={(e) => update("type", e.target.value)}
        >
          <option>Event Musician</option>
          <option>Teacher</option>
          <option>Teacher &amp; Events</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>A little about you</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
      <p className="text-[10px] text-mid leading-relaxed">
        Free to list, zero commission. All teachers are police vetted before
        their profile goes live.
      </p>
    </form>
  );
}
