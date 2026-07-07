import Link from "next/link";
import { musicians } from "@/lib/musicians";
import MusicianCard from "@/components/MusicianCard";

export default function Home() {
  const featured = musicians.slice(0, 3);

  return (
    <>
      <section className="min-h-[85vh] grid md:grid-cols-[55%_45%] border-b border-rule">
        <div className="flex flex-col justify-center px-6 md:pl-[52px] md:pr-10 py-16 md:border-r border-rule">
          <span className="eyebrow mb-7">Est. 2026 &middot; Aotearoa, New Zealand</span>
          <h1 className="font-serif font-light text-[clamp(48px,7.5vw,100px)] leading-[0.95] tracking-tight text-blk mb-7">
            A home
            <br />
            for New
            <br />
            Zealand
            <br />
            <em>musicians.</em>
          </h1>
          <p className="max-w-md text-sm mb-8">
            A considered space where professional musicians are discoverable,
            trusted, and supported. Clients and students can find exactly who
            they need.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link
              href="/gallery"
              className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-7 hover:bg-accent transition-colors"
            >
              Browse the gallery
            </Link>
            <Link
              href="/join"
              className="text-xs tracking-[0.1em] uppercase text-dark hover:text-accent py-3 border-b border-blk"
            >
              Join as a musician
            </Link>
          </div>
        </div>
        <div className="hidden md:block bg-off" />
      </section>

      <section className="px-6 md:px-[52px] py-20" id="about">
        <span className="eyebrow">The Gallery Function</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-6 max-w-lg">
          A functional, considered <em>space.</em>
        </h2>
        <p className="text-sm max-w-lg mb-3">
          Musician Gallery exists to create capacity. A place where
          professional musicians are discoverable and trusted, and where
          clients and students can find exactly who they need.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-lg mt-10">
          <div>
            <p className="font-serif text-2xl">100%</p>
            <p className="text-xs text-mid">Police vetted teachers</p>
          </div>
          <div>
            <p className="font-serif text-2xl">Free</p>
            <p className="text-xs text-mid">To list your profile</p>
          </div>
          <div>
            <p className="font-serif text-2xl">NZ</p>
            <p className="text-xs text-mid">Built for New Zealand</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 bg-off/40 border-y border-rule">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <h2 className="font-serif text-3xl md:text-4xl max-w-md">
            From the <em>gallery.</em>
          </h2>
          <Link href="/gallery" className="text-xs tracking-[0.1em] uppercase hover:text-accent">
            View all musicians &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((m) => (
            <MusicianCard key={m.slug} m={m} />
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 max-w-2xl" id="story">
        <span className="eyebrow">Our Story</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-6">
          Six years in the too hard <em>basket.</em>
        </h2>
        <p className="text-sm mb-4">
          I am Emily, a cellist, a contractor, and someone who grew up
          watching two self-employed creatives build their work from the
          ground up.
        </p>
        <p className="text-sm mb-4">
          Musician Gallery gives talented musicians a foot in the door. A
          place built with structure, to ease the load on others.
        </p>
        <p className="font-serif italic text-lg mt-6">With warmth, Emily</p>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-t border-rule grid md:grid-cols-2 gap-12" id="join-preview">
        <div>
          <span className="eyebrow">For Musicians</span>
          <h2 className="font-serif text-2xl mt-3 mb-4">
            List your profile. Set your rates.
          </h2>
          <p className="text-sm text-mid mb-6">
            Free to list, no commission. Professional marketing, admin
            handled, no invoicing.
          </p>
          <Link href="/join" className="text-xs tracking-[0.1em] uppercase border-b border-blk pb-1 hover:text-accent hover:border-accent">
            Join the gallery
          </Link>
        </div>
        <div>
          <span className="eyebrow">For Clients &amp; Students</span>
          <h2 className="font-serif text-2xl mt-3 mb-4">
            Find the right musician. Book with confidence.
          </h2>
          <p className="text-sm text-mid mb-6">
            Browse a considered gallery of vetted professional musicians and
            teachers. A 10% platform fee applies to bookings, no hidden costs.
          </p>
          <Link href="/gallery" className="text-xs tracking-[0.1em] uppercase border-b border-blk pb-1 hover:text-accent hover:border-accent">
            Find a musician
          </Link>
        </div>
      </section>
    </>
  );
}
