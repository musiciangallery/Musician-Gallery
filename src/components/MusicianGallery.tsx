"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Musician } from "@/lib/musicians";

// Every hero photo is shown at this same fixed ratio, cropped and centered
// to fit it, rather than each photo keeping its own uploaded dimensions —
// keeps every profile visually consistent (no profile taller or wider than
// the next depending on what a musician happened to upload) while still
// giving more room than a hard square crop, which was cropping out the
// tops of instruments/heads on portrait shots.
const HERO_ASPECT = "aspect-[4/5]";

// Each photo card takes up this much of the carousel's width — the
// remainder is what peeks in from the next photo on the right (or the
// previous one on the left), a deliberate "there's more here" cue rather
// than a full swap to the next photo.
const CARD_WIDTH = 75;

export default function MusicianGallery({ m }: { m: Musician }) {
  const allPhotos = [m.photo, ...(m.photos ?? [])].filter(
    (p): p is string => Boolean(p)
  );
  const [videoOpen, setVideoOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // The browser's autoplay-with-sound policy only allows unmuted playback
  // when it's tied directly to a user gesture. Relying on the <video>
  // element's own autoPlay attribute is one step removed from the click
  // that opens it (React has to mount the element first), which some
  // browsers don't count as "direct" enough and quietly fall back to
  // playing muted. Calling .play() ourselves, right as the element mounts
  // after that same click, keeps the gesture close enough that sound
  // reliably comes through.
  useEffect(() => {
    if (videoOpen) {
      videoRef.current?.play().catch(() => {});
    }
  }, [videoOpen]);

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

  // Advances/steps back the carousel by exactly one photo-card-width (the
  // card's own CARD_WIDTH% plus the gap between cards) — shared by the
  // invisible "next"/"previous" buttons layered over the peeking slivers
  // on each edge, so a click/tap works the same as a swipe in either
  // direction.
  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * (CARD_WIDTH / 100) + 12), behavior: "smooth" });
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
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          ) : (
            <>
              {/* Each card is CARD_WIDTH% of the container's width, so the
                  next (and previous) photo's edge naturally peeks in — no
                  separate thumbnail row needed. Native horizontal scroll
                  with snap handles swiping; the invisible buttons below
                  handle tap/click in either direction. */}
              <div
                ref={scrollerRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {allPhotos.map((p, i) => (
                  <div
                    key={p}
                    className={`relative shrink-0 ${HERO_ASPECT} snap-start overflow-hidden bg-off`}
                    style={{ width: `${CARD_WIDTH}%` }}
                  >
                    <Image
                      src={p}
                      alt={`${m.name}, photo ${i + 1}`}
                      fill
                      className="object-cover photo-mono"
                      sizes="(max-width: 768px) 75vw, 360px"
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-l from-transparent to-blk/25" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-blk/25" />
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Show previous photo"
                className="absolute inset-y-0 left-0 w-16"
              />
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Show next photo"
                className="absolute inset-y-0 right-0 w-16"
              />
            </>
          )}
        </div>
      )}

      {m.video && (
        <>
          {/* A small, separate thumbnail rather than a full-width inline
              player — sits below the photo carousel but is never one of
              its swipeable slides, so it never fights with the swipe
              gesture used to browse photos. Opens a fullscreen overlay to
              play, rather than expanding in place, so playback controls
              never compete with the rest of the page. */}
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            aria-label="Play video"
            className={`relative w-24 h-24 overflow-hidden bg-off border border-rule flex items-center justify-center ${
              allPhotos.length > 0 ? "mt-3" : ""
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-mid">
              <path d="M4 2.5v11l10-5.5-10-5.5z" fill="currentColor" />
            </svg>
          </button>

          {videoOpen && (
            <div
              className="fixed inset-0 z-50 bg-blk/90 flex items-center justify-center p-6"
              onClick={() => setVideoOpen(false)}
            >
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                aria-label="Close video"
                className="absolute top-6 right-6 text-w text-3xl leading-none"
              >
                &times;
              </button>
              <video
                ref={videoRef}
                controls
                className="max-w-full max-h-full"
                src={m.video}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
