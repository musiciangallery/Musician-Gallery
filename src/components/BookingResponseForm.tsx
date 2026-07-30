"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingResponseForm({
  bookingId,
  token,
  canConfirm = true,
  frequency,
  initialSessions,
}: {
  bookingId: string;
  token: string;
  canConfirm?: boolean;
  /** The client's requested frequency ("Weekly", "Fortnightly", "One-off",
   * or a specific date for non-lesson bookings) — only "Weekly" and
   * "Fortnightly" turn this into a recurring subscription. */
  frequency?: string;
  /** The client's requested session count, editable here before confirming. */
  initialSessions?: number | null;
}) {
  const router = useRouter();
  const isRecurring = frequency === "Weekly" || frequency === "Fortnightly";
  const [amount, setAmount] = useState("");
  const [sessions, setSessions] = useState(initialSessions ? String(initialSessions) : "");
  const [submitting, setSubmitting] = useState<"confirm" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setError(null);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError(
        isRecurring
          ? "Enter your rate per lesson."
          : "Enter the amount you're quoting for this booking."
      );
      return;
    }
    const sessionsValue = Number(sessions);
    if (isRecurring && (!sessionsValue || sessionsValue <= 0)) {
      setError("Enter the number of lessons this covers.");
      return;
    }
    setSubmitting("confirm");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          amount: value,
          ...(isRecurring ? { sessions: sessionsValue } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(null);
    }
  }

  async function decline() {
    setError(null);
    setSubmitting("decline");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(null);
    }
  }

  return (
    <div className="border-t border-rule pt-6 mt-6">
      {canConfirm && (
        <>
          <label className="text-[10px] tracking-[0.08em] uppercase text-mid block mb-1">
            {isRecurring ? "Your rate per lesson ($)" : "Your quote for this booking ($)"}
          </label>
          <p className="text-xs text-mid mb-3">
            {isRecurring
              ? "The client pays this plus a 10% platform fee on top, every week/fortnight — you receive the full rate you quote here, automatically, each cycle."
              : "The client pays this plus a 10% platform fee on top — you receive the full amount you quote here."}
          </p>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={isRecurring ? "e.g. 60" : "e.g. 450"}
            className="w-full border border-rule bg-w px-3 py-2 text-sm focus:outline-none focus:border-accent mb-4"
          />
          {isRecurring && (
            <>
              <label className="text-[10px] tracking-[0.08em] uppercase text-mid block mb-1">
                Number of lessons
              </label>
              <p className="text-xs text-mid mb-3">
                The client asked for {initialSessions ?? "an unspecified number of"} lessons — adjust if you&rsquo;ve agreed on a different count. Billing stops automatically after this many.
              </p>
              <input
                type="number"
                min="1"
                step="1"
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                placeholder="e.g. 8"
                className="w-full border border-rule bg-w px-3 py-2 text-sm focus:outline-none focus:border-accent mb-4"
              />
            </>
          )}
        </>
      )}
      {error && <p className="text-xs text-accent mb-4">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {canConfirm && (
          <button
            onClick={confirm}
            disabled={submitting !== null}
            className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-2.5 px-6 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {submitting === "confirm" ? "Confirming..." : "Confirm & send payment link"}
          </button>
        )}
        <button
          onClick={decline}
          disabled={submitting !== null}
          className="border border-rule text-xs tracking-[0.1em] uppercase py-2.5 px-6 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
        >
          {submitting === "decline" ? "Declining..." : "Can't make it"}
        </button>
      </div>
    </div>
  );
}
