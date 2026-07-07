import Link from "next/link";
import type { Musician } from "@/lib/musicians";

export default function MusicianCard({ m }: { m: Musician }) {
  return (
    <Link
      href={`/musicians/${m.slug}`}
      className="group block border border-rule bg-off/40 hover:bg-off transition-colors p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="eyebrow">{m.region}</span>
        {m.vetted && (
          <span className="text-[9px] tracking-[0.14em] uppercase text-accent border border-accent/40 rounded-full px-2 py-1">
            Vetted
          </span>
        )}
      </div>
      <h3 className="font-serif text-2xl mb-1 group-hover:text-accent transition-colors">
        {m.name}
      </h3>
      <p className="text-xs text-mid mb-3">
        {m.instrument} &middot; {m.type}
      </p>
      <p className="text-sm leading-relaxed mb-4">{m.bio}</p>
      <div className="flex items-center justify-between text-xs text-mid border-t border-rule pt-3">
        <span>
          From ${m.rateFrom} {m.rateUnit}
        </span>
        <span className="text-blk">View profile &rarr;</span>
      </div>
    </Link>
  );
}
