"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Musician } from "@/lib/musicians";

// Every hero photo is shown at this same fixed ratio, cropped and centered
// to fit it, rather than each photo keeping its own uploaded dimensions —
// keeps every profile visually consistent (no profile taller or wider than
// the next depending on what a musician happened to upload) while still
// giving more room than a hard square crop, which was cropping out the
// tops of instruments/heads on portrait shots.
const HERO_ASPECT = "aspect-[4/5]";

export default function MusicianGallery({ m }: { m: Musician }) {
  const allPhotos = [m.photo, ...(m.photos ?? [])].filter(
    (p): p is string => Boolean(p)
  );
  const [videoPlaying, setVideoPlaying] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (allPhotos.length === 0 && !m.video) {
    return (
      <div className={`relative ${HERO_ASPECT} bg-off flex items-center justify-center border border-rule`}>
        <span className="font-serif text-4xl text-rule">
          {m.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
      </div>
    );
  }

  // Advances the carousel by exactly one photo-card-width (the card's own
  // 84% width plus the gap between cards) — used by the invisible "next"
  // button layered over the peeking sliver on the right, so a click/tap
  // works the same as a swipe.
  function showNext() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.84 + 12, behavior: "smooth" });
  }

  return (
    <div>
      {allPhotos.length > 0 && (
        <div className="relative">
          {allPhotos.length === 1 ? (
            <div className={`relative ${HERO_ASPECT} overflow-hidden bg-off`}>
              <Image
                src={allPhotos[0]}
                alt={m.name}
                fill
                className="object-cover photo-mono"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ) : (
            <>
              {/* Each card is 84% of the container's width, so the next
                  photo's left sliver naturally peeks in on the right —
                  no separate thumbnail row needed. Native horizontal
                  scroll with snap handles swiping; the invisible button
                  below handles tap/click. */}
              <div
                ref={scrollerRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {allPhotos.map((p, i) => (
                  <div
                    key={p}
                    className={`relative w-[84%] shrink-0 ${HERO_ASPECT} snap-start overflow-hidden bg-off`}
                  >
                    <Image
                      src={p}
                      alt={`${m.name}, photo ${i + 1}`}
                      fill
                      className="object-cover photo-mono"
                      sizes="(max-width: 768px) 84vw, 340px"
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-blk/25" />
              <button
                type="button"
                onClick={showNext}
                aria-label="Show next photo"
                className="absolute inset-y-0 right-0 w-10"
              />
            </>
          )}
        </div>
      )}

      {m.video &&
        (allPhotos.length > 0 && !videoPlaying ? (
          // A small, separate thumbnail rather than a full-width player —
          // sits below the photo carousel but is never one of its swipeable
          // slides, so scrubbing/playing the video never fights with the
          // swipe gesture used to browse photos.
          <button
            type="button"
            onClick={() => setVideoPlaying(true)}
            aria-label="Play video"
            className="relative w-24 h-24 mt-3 overflow-hidden bg-off border border-rule flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-mid">
              <path d="M4 2.5v11l10-5.5-10-5.5z" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <video
            controls
            autoPlay={videoPlaying}
            className={`w-full photo-mono ${allPhotos.length > 0 ? "mt-3" : ""}`}
            src={m.video}
          />
        ))}
    </div>
  );
}
