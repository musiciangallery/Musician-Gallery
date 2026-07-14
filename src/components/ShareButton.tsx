"use client";

import { useEffect, useRef, useState } from "react";

export default function ShareButton({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  function getUrl() {
    return `${window.location.origin}${path}`;
  }

  async function copyLink(message: string) {
    try {
      await navigator.clipboard.writeText(getUrl());
      setStatus(message);
      setTimeout(() => setStatus(null), 2500);
    } catch {
      // Clipboard not available — fail silently.
    }
  }

  async function nativeShare() {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      setOpen(false);
      return;
    }
    await copyLink("Link copied");
    setOpen(false);
  }

  function shareToFacebook() {
    const url = encodeURIComponent(getUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
    setOpen(false);
  }

  async function shareToInstagram() {
    // Instagram has no web share endpoint for arbitrary links — the best
    // we can do from a browser is copy the link and prompt the person to
    // paste it into their bio, story, or a DM.
    await copyLink("Link copied — paste into Instagram");
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] tracking-[0.14em] uppercase text-mid hover:text-accent border border-rule rounded-full px-3 py-1.5 h-fit transition-colors"
      >
        {status ?? "Share profile"}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 border border-rule bg-w z-10 py-1">
          <button
            onClick={nativeShare}
            className="block w-full text-left text-xs px-4 py-2 hover:bg-off/60 hover:text-accent transition-colors"
          >
            Share...
          </button>
          <button
            onClick={shareToFacebook}
            className="block w-full text-left text-xs px-4 py-2 hover:bg-off/60 hover:text-accent transition-colors"
          >
            Facebook
          </button>
          <button
            onClick={shareToInstagram}
            className="block w-full text-left text-xs px-4 py-2 hover:bg-off/60 hover:text-accent transition-colors"
          >
            Instagram
          </button>
          <button
            onClick={() => {
              copyLink("Link copied");
              setOpen(false);
            }}
            className="block w-full text-left text-xs px-4 py-2 hover:bg-off/60 hover:text-accent transition-colors"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
