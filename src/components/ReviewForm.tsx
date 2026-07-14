"use client";

import { useState } from "react";

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";

export default function ReviewForm({
  musicianSlug,
  musicianFirstName,
}: {
  musicianSlug: string;
  musicianFirstName: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    reviewerName: "",
    context: "",
    reviewBody: "",
    website: "", // honeypot — left blank by real visitors
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canSubmit = form.reviewerName.trim() && form.reviewBody.trim();

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicianSlug, ...form }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-rule p-6 text-sm">
        <p className="font-serif text-lg mb-1">Thank you.</p>
        <p className="text-mid">
          Your review is awaiting a quick check before it goes live.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs tracking-[0.1em] uppercase border-b border-blk pb-1 hover:text-accent hover:border-accent"
      >
        Leave a review
      </button>
    );
  }

  return (
    <div className="border border-rule p-6 space-y-5">
      <p className="font-serif text-lg">Leave a review for {musicianFirstName}</p>

      {/* Honeypot field — hidden from real visitors via CSS, bots often fill
          every input they find. */}
      <input
        type="text"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="absolute -left-[9999px] w-px h-px opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label className={labelClass}>Your name</label>
        <input
          type="text"
          className={inputClass}
          value={form.reviewerName}
          onChange={(e) => update("reviewerName", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>What was it for (optional)</label>
        <input
          type="text"
          placeholder="e.g. Piano lessons for my daughter"
          className={inputClass}
          value={form.context}
          onChange={(e) => update("context", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Your review</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.reviewBody}
          onChange={(e) => update("reviewBody", e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
      <div className="flex gap-4">
        <button
          onClick={() => setOpen(false)}
          className="text-xs tracking-[0.1em] uppercase text-mid hover:text-accent py-3 px-4"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending..." : "Submit review"}
        </button>
      </div>
    </div>
  );
}
