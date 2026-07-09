"use client";

import { useMemo, useState } from "react";
import { ALL_INSTRUMENTS, ALL_REGIONS, occasionsList, type Musician, type Occasion } from "@/lib/musicians";
import MusicianCard from "@/components/MusicianCard";

export default function GalleryBrowser({ allMusicians }: { allMusicians: Musician[] }) {
  const [instrument, setInstrument] = useState("All");
  const [region, setRegion] = useState("All");
  const [occasion, setOccasion] = useState<Occasion | "All">("All");

  // The full lists (matching the Join form) so people can filter by an
  // instrument or region even before a musician in that category exists —
  // plus anything already in use that isn't on the canonical list (older
  // placeholder data), so nothing becomes unreachable via filters.
  const instruments = useMemo(() => {
    const inUse = allMusicians.map((m) => m.instrument);
    return Array.from(new Set([...ALL_INSTRUMENTS, ...inUse])).sort();
  }, [allMusicians]);
  const regions = useMemo(() => {
    const inUse = allMusicians.map((m) => m.region);
    return Array.from(new Set([...ALL_REGIONS, ...inUse])).sort();
  }, [allMusicians]);

  const filtered = useMemo(() => {
    return allMusicians.filter((m) => {
      if (instrument !== "All" && m.instrument !== instrument) return false;
      if (region !== "All" && m.region !== region) return false;
      if (occasion !== "All" && !m.occasions.includes(occasion)) return false;
      return true;
    });
  }, [allMusicians, instrument, region, occasion]);

  const selectClass =
    "border border-rule bg-w px-4 py-2 text-xs tracking-[0.08em] uppercase text-dark focus:outline-none focus:border-accent";

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-10">
        <select
          className={selectClass}
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
        >
          <option value="All">All instruments</option>
          {instruments.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="All">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={occasion}
          onChange={(e) => setOccasion(e.target.value as Occasion | "All")}
        >
          <option value="All">All occasions</option>
          {occasionsList.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {(instrument !== "All" || region !== "All" || occasion !== "All") && (
          <button
            onClick={() => {
              setInstrument("All");
              setRegion("All");
              setOccasion("All");
            }}
            className="text-xs tracking-[0.08em] uppercase text-mid hover:text-accent underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-mid mb-6">
        {filtered.length} musician{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-mid py-20 text-center border border-dashed border-rule">
          No musicians match those filters yet &mdash; try widening your search.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <MusicianCard key={m.slug} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
