"use client";

import { useState } from "react";
import Image from "next/image";
import type { Musician } from "@/lib/musicians";

export default function MusicianGallery({ m }: { m: Musician }) {
  const allPhotos = [m.photo, ...(m.photos ?? [])].filter(
    (p): p is string => Boolean(p)
  );
  const [active, setActive] = useState(0);

  if (allPhotos.length === 0 && !m.video) {
    return (
      <div className="relative aspect-square bg-off flex items-center justify-center border border-rule">
        <span className="font-serif text-4xl text-rule">
          {m.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
      </div>
    );
  }

  return (
    <div>
      {allPhotos.length > 0 && (
        <>
          <div className="relative aspect-square overflow-hidden bg-off">
            <Image
              src={allPhotos[active]}
              alt={m.name}
              fill
              className="object-cover photo-mono"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          {allPhotos.length > 1 && (
            <div className="flex gap-2 mt-3">
              {allPhotos.map((p, i) => (
                <button
                  key={p}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative w-14 h-14 overflow-hidden shrink-0 ${
                    i === active ? "ring-2 ring-blk" : "opacity-60 hover:opacity-100"
                  } transition-opacity`}
                >
                  <Image
                    src={p}
                    alt=""
                    fill
                    className="object-cover photo-mono"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {m.video && (
        <video
          controls
          className={`w-full photo-mono ${allPhotos.length > 0 ? "mt-6" : ""}`}
          src={m.video}
        />
      )}
    </div>
  );
}
