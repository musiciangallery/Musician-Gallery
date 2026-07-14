"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/reviews-live";

export default function FeaturedReviews({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(id);
  }, [reviews.length]);

  if (reviews.length === 0) return null;
  const r = reviews[index];

  return (
    <section className="px-6 md:px-[52px] py-20">
      <span className="eyebrow">What people are saying</span>
      <div className="mt-6 max-w-2xl min-h-[7rem]">
        <p className="font-serif text-2xl md:text-3xl italic leading-snug">
          &ldquo;{r.body}&rdquo;
        </p>
        <p className="text-xs text-mid mt-4">
          {r.reviewerName}
          {r.context && <> &middot; {r.context}</>}
        </p>
      </div>
      {reviews.length > 1 && (
        <div className="flex gap-2 mt-8">
          {reviews.map((rev, i) => (
            <button
              key={rev.id}
              onClick={() => setIndex(i)}
              aria-label={`Show review ${i + 1}`}
              className={`w-6 h-px transition-colors ${
                i === index ? "bg-blk" : "bg-rule"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
