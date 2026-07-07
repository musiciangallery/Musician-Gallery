import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMusicianBySlug, musicians } from "@/lib/musicians";
import MusicianPhoto from "@/components/MusicianPhoto";

export function generateStaticParams() {
  return musicians.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMusicianBySlug(slug);
  return { title: m ? `${m.name} | Musician Gallery` : "Musician Gallery" };
}

export default async function MusicianProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getMusicianBySlug(slug);
  if (!m) notFound();

  return (
    <section className="max-w-4xl mx-auto px-6 md:px-[52px] py-16">
      <Link href="/gallery" className="text-xs text-mid hover:text-accent">
        &larr; Back to the gallery
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-8">
        <div>
          <span className="eyebrow">
            {m.region} &middot; {m.instrument}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl mt-3">{m.name}</h1>
          <p className="text-sm text-mid mt-2">{m.type}</p>
        </div>
        {m.vetted && (
          <span className="text-[10px] tracking-[0.14em] uppercase text-accent border border-accent/40 rounded-full px-3 py-1.5 h-fit">
            Police Vetted
          </span>
        )}
      </div>

      <div className="mt-10 max-w-xs">
        <MusicianPhoto m={m} aspect="aspect-square" />
      </div>

      <div className="grid md:grid-cols-3 gap-10 mt-10">
        <div className="md:col-span-2">
          <h2 className="font-serif text-2xl mb-3">About</h2>
          <p className="text-sm leading-relaxed">{m.longBio}</p>

          <h2 className="font-serif text-2xl mt-10 mb-3">Available for</h2>
          <ul className="flex flex-wrap gap-2">
            {m.occasions.map((o) => (
              <li
                key={o}
                className="text-xs border border-rule px-3 py-1.5 text-mid"
              >
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-rule bg-off/40 p-6 h-fit">
          <p className="text-xs text-mid mb-1">Starting from</p>
          <p className="font-serif text-3xl mb-1">${m.rateFrom}</p>
          <p className="text-xs text-mid mb-6">{m.rateUnit}</p>
          <p className="text-xs text-mid mb-6">
            {m.yearsExperience} years experience
          </p>
          <Link
            href={`/book/${m.slug}`}
            className="block text-center bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 hover:bg-accent transition-colors"
          >
            Request a booking
          </Link>
          <p className="text-[10px] text-mid mt-4 leading-relaxed">
            A 10% platform fee applies to bookings, added at checkout. No
            hidden costs.
          </p>
        </div>
      </div>
    </section>
  );
}
