"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-[52px] py-6 bg-w/95 backdrop-blur-sm border-b transition-colors ${
        scrolled ? "border-rule" : "border-transparent"
      }`}
    >
      <Link
        href="/"
        className="font-serif text-sm tracking-[0.24em] uppercase text-blk"
      >
        Musician Gallery
      </Link>
      <ul className="hidden md:flex gap-10 list-none">
        {[
          ["Browse", "/gallery"],
          ["About", "/#about"],
          ["Our Story", "/#story"],
          ["Join", "/join"],
        ].map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-[10px] tracking-[0.18em] uppercase text-mid hover:text-blk transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
