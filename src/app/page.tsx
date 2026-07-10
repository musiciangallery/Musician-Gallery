import Link from "next/link";
import Image from "next/image";
import { musicians } from "@/lib/musicians";
import MusicianCard from "@/components/MusicianCard";
import Ticker from "@/components/Ticker";

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
            A gallery inspired by function and growth, built to be a
            considered introduction between talented musicians and those
            seeking them.
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
        <div className="relative bg-off aspect-[4/3] md:aspect-auto">
          <Image
            src="/brand/hero-piano-doorway.jpg"
            alt="A pianist glimpsed through a doorway"
            fill
            priority
            className="object-cover photo-mono"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </section>

      <Ticker />

      <section className="px-6 md:px-[52px] py-20 bg-off/40 border-y border-rule grid md:grid-cols-2 gap-10">
        <div>
          <span className="eyebrow">The Gallery</span>
          <h3 className="font-serif text-3xl mt-3">
            Every musician, <em>considered.</em>
          </h3>
          <p className="text-sm text-mid mt-4 max-w-xs">
            Browse event musicians and teachers across Aotearoa, New Zealand,
            all in one place.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <span className="eyebrow mb-3">Est. 2026</span>
          <p className="font-serif text-xl md:text-2xl italic leading-snug">
            &ldquo;Art is how we decorate space.
            <br />
            Music is how we decorate time.&rdquo;
          </p>
          <p className="text-xs text-mid mt-3">Jean-Michel Basquiat</p>
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20">
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

      <section className="px-6 md:px-[52px] py-20 border-t border-rule">
        <div className="max-w-2xl mb-14">
          <span className="eyebrow">The Gallery Function</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-4">
            Built for <em>both sides.</em>
          </h2>
          <p className="text-sm text-mid">
            A place built with structure, not guesswork &mdash; vetted
            teachers, complete profiles, and a curated space for musicians
            to be found in.{" "}
            <Link
              href="/about"
              className="text-dark underline underline-offset-4 hover:text-accent"
            >
              See exactly how it works &rarr;
            </Link>
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-[16/10] mb-6">
              <Image
                src="/brand/join-cello-case.jpg"
                alt="A cello case in a hallway"
                fill
                className="object-cover photo-mono"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
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
            <div className="relative aspect-[16/10] mb-6">
              <Image
                src="/brand/join-plane.jpg"
                alt="A person looking up at a plane overhead"
                fill
                className="object-cover photo-mono"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
            <span className="eyebrow">For Clients &amp; Students</span>
            <h2 className="font-serif text-2xl mt-3 mb-4">
              Find the right musician. Book with confidence.
            </h2>
            <p className="text-sm text-mid mb-6">
              Browse a considered gallery of professional musicians and
              teachers, with vetting shown on each profile. A 10% platform
              fee applies to bookings, no hidden costs.
            </p>
            <Link href="/gallery" className="text-xs tracking-[0.1em] uppercase border-b border-blk pb-1 hover:text-accent hover:border-accent">
              Find a musician
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
