"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeatureMusicianButton({
  id,
  featured,
}: {
  id: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/feature-musician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured: !featured }),
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
      onClick={toggle}
      disabled={submitting}
      className={`underline underline-offset-2 disabled:opacity-50 ${
        featured ? "text-accent hover:text-mid" : "text-mid hover:text-accent"
      }`}
    >
      {featured ? "Unfeature" : "Feature"}
    </button>
  );
}
