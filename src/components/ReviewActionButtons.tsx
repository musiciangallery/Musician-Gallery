"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function post(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Something went wrong.");
  }
}

export function PendingReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function act(action: "approve-review" | "decline-review") {
    setSubmitting(true);
    try {
      await post(`/api/admin/${action}`, { id });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={() => act("approve-review")}
        disabled={submitting}
        className="text-accent hover:underline underline-offset-2 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act("decline-review")}
        disabled={submitting}
        className="text-mid hover:text-accent underline underline-offset-2 disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}

export function ApprovedReviewActions({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function toggleFeatured() {
    setSubmitting(true);
    try {
      await post("/api/admin/feature-review", { id, featured: !featured });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!confirm("Remove this review permanently?")) return;
    setSubmitting(true);
    try {
      await post("/api/admin/remove-review", { id });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={toggleFeatured}
        disabled={submitting}
        className={`underline underline-offset-2 disabled:opacity-50 ${
          featured ? "text-accent hover:text-mid" : "text-mid hover:text-accent"
        }`}
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        onClick={remove}
        disabled={submitting}
        className="text-mid hover:text-accent underline underline-offset-2 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
