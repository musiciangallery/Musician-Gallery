"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Paid/completed bookings are real financial records, so deletion is
// disabled for them here (and refused again server-side, in case this
// component's disabled state is ever bypassed).
const LOCKED_STATUSES = new Set(["paid", "completed"]);

export default function RemoveBookingButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const locked = LOCKED_STATUSES.has(status);

  async function remove() {
    if (!confirm("Delete this booking request permanently? This can't be undone.")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/remove-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (locked) {
    return (
      <span
        className="text-mid text-xs"
        title="Paid or completed bookings can't be deleted — they're kept as a financial record."
      >
        —
      </span>
    );
  }

  return (
    <button
      onClick={remove}
      disabled={submitting}
      className="text-mid hover:text-accent underline underline-offset-2 disabled:opacity-50 text-xs"
    >
      {submitting ? "Deleting..." : "Delete"}
    </button>
  );
}
