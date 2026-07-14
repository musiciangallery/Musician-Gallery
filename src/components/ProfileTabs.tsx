"use client";

import { useState, type ReactNode } from "react";

export default function ProfileTabs({
  reviewCount,
  about,
  reviews,
}: {
  reviewCount: number;
  about: ReactNode;
  reviews: ReactNode;
}) {
  const [tab, setTab] = useState<"about" | "reviews">("about");

  const tabClass = (active: boolean) =>
    `text-xs tracking-[0.1em] uppercase pb-3 border-b-2 ${
      active ? "border-blk text-blk" : "border-transparent text-mid hover:text-blk"
    }`;

  return (
    <div>
      <div className="flex gap-8 border-b border-rule mb-8">
        <button onClick={() => setTab("about")} className={tabClass(tab === "about")}>
          About
        </button>
        <button onClick={() => setTab("reviews")} className={tabClass(tab === "reviews")}>
          Reviews {reviewCount > 0 && `(${reviewCount})`}
        </button>
      </div>
      {tab === "about" ? about : reviews}
    </div>
  );
}
