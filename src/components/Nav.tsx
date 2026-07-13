"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS: [string, string][] = [
  ["Browse", "/gallery"],
  ["About", "/about"],
  ["Our Story", "/our-story"],
  ["Join", "/join"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-w/95 backdrop-blur-sm border-b transition-colors ${
        scrolled ? "border-rule" : "border-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-[52px] py-6">
        <Link
          href="/"
          className="font-serif text-sm tracking-[0.24em] uppercase text-blk"
          onClick={() => setMenuOpen(false)}
        >
          Musician Gallery
        </Link>
        <ul className="hidden md:flex gap-10 list-none">
          {LINKS.map(([label, href]) => (
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
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden relative w-6 h-5 shrink-0"
        >
          <span
            className={`absolute left-0 top-0 w-6 h-px bg-blk transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-2 w-6 h-px bg-blk transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-4 w-6 h-px bg-blk transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>
      {menuOpen && (
        <ul className="md:hidden flex flex-col border-t border-rule px-6 py-4 gap-4 list-none bg-w">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-xs tracking-[0.14em] uppercase text-dark hover:text-accent transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
