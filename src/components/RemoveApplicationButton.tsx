"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveApplicationButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function remove() {
    if (!confirm(`Delete ${name}'s application permanently? This can't be undone.`)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/remove-application", {
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

  return (
    <button
      onClick={remove}
      disabled={submitting}
      className="text-[10px] tracking-[0.08em] uppercase text-mid hover:text-accent underline underline-offset-2 disabled:opacity-50"
    >
      {submitting ? "Deleting..." : "Delete"}
    </button>
  );
}
