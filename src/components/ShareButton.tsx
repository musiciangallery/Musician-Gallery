"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — fail silently.
    }
  }

  return (
    <button
      onClick={share}
      className="text-[10px] tracking-[0.14em] uppercase text-mid hover:text-accent border border-rule rounded-full px-3 py-1.5 h-fit transition-colors"
    >
      {copied ? "Link copied" : "Share profile"}
    </button>
  );
}
