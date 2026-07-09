import Link from "next/link";
import Image from "next/image";
import { musicians } from "@/lib/musicians";
import MusicianCard from "@/components/MusicianCard";
import Ticker from "@/components/Ticker";

const pillars = [
  {
    n: "I",
    t: "Discoverable",
    b: "A complete, considered profile, searchable by instrument, region, and occasion. Clients find you, not the other way around.",
  },
  {
    n: "II",
    t: "Trusted",
    b: "All teachers are police vetted before listing. A trusted badge clients and families can rely on, built into the platform from the start.",
  },
  {
    n: "III",
    t: "Supported",
    b: "Professional marketing, handled admin, no invoicing. Withholding tax managed automatically so you can focus on the music.",
  },
  {
    n: "IV",
    t: "Independent",
    b: "Set your own rates. Keep your own clients. Grow a sustainable practice entirely on your terms.",
  },
];

const howSteps = [
  {
    n: "I",
    t: "Browse the gallery",
    b: "Search by instrument, location, or occasion. Every profile is complete and considered. No chasing, no guessing.",
  },
  {
    n: "II",
    t: "Send a booking request",
    b: "Reach out directly through the platform. Your musician receives the details and responds within 48 hours.",
  },
  {
    n: "III",
    t: "Payment held securely",
    b: "Funds are held until your lesson or event is confirmed. Withholding tax handled automatically on your behalf.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Your musician shows up, plays beautifully, and gets paid. We take care of everything in between.",
  },
];

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

      <section className="px-6 md:px-[52px] py-20 grid md:grid-cols-2 gap-12 items-center" id="about">
        <div>
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
        </div>
        <div className="relative aspect-[4/5]">
          <Image
            src="/brand/about-violin-bridge.jpg"
            alt="Close detail of a violin bow and bridge"
            fill
            className="object-cover photo-mono"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-t border-rule">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <h2 className="font-serif text-3xl md:text-4xl max-w-md">
            Built to support <em>the whole musician.</em>
          </h2>
          <Link href="/join" className="text-xs tracking-[0.1em] uppercase hover:text-accent">
            Join the gallery &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p) => (
            <div key={p.n}>
              <span className="font-serif text-2xl text-mid">{p.n}</span>
              <h3 className="font-serif text-xl mt-3 mb-2">{p.t}</h3>
              <p className="text-sm text-mid leading-relaxed">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 bg-off/40 border-y border-rule grid md:grid-cols-2 gap-10">
        <div>
          <span className="eyebrow">The Gallery</span>
          <h3 className="font-serif text-3xl mt-3">
            Every musician, <em>considered.</em>
          </h3>
          <p className="text-sm text-mid mt-4 max-w-xs">
            Browse event musicians and teachers across Aotearoa New Zealand,
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

      <section className="px-6 md:px-[52px] py-20 grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">How it works</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            Simple, from
            <br />
            both sides of
            <br />
            <em>the screen.</em>
          </h2>
          <p className="text-sm text-mid mt-6 max-w-xs">
            Every booking is handled through the platform, from first enquiry
            to final payment.
          </p>
        </div>
        <div className="space-y-8">
          {howSteps.map((s) => (
            <div key={s.n} className="flex gap-6 border-t border-rule pt-6">
              <span className="font-serif text-2xl text-mid">{s.n}</span>
              <div>
                <h3 className="font-serif text-xl mb-1">{s.t}</h3>
                <p className="text-sm text-mid leading-relaxed">{s.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-t border-rule grid md:grid-cols-[45%_55%] gap-12 items-center" id="story">
        <div className="relative aspect-[4/5] order-2 md:order-1">
          <Image
            src="/brand/story-emily-cello.jpg"
            alt="Emily, founder of Musician Gallery, playing cello"
            fill
            className="object-cover photo-mono"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
        <div className="order-1 md:order-2 max-w-lg">
          <span className="eyebrow">Our Story</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-6">
            Six years in the too hard <em>basket.</em>
          </h2>
          <p className="text-sm mb-4">
            I&rsquo;m Emily, a cellist, a contractor, and someone who grew up
            watching two self-employed creatives make their work happen.
          </p>
          <p className="text-sm mb-4">
            I&rsquo;ve spent years performing at weddings and events,
            teaching, and most prominently, working alongside property
            sector clients to bring structure to the behind the scenes of
            their businesses. Two worlds that don&rsquo;t obviously go
            together, until now.
          </p>
          <p className="text-sm mb-4">
            On too many occasions have I been amongst a cohort of musicians
            who are phenomenally talented and committed, riding the wave of
            word of mouth and undercut gigs. Contrastingly, my world has
            brought me individuals searching for exactly that. Musician
            Gallery gives them a foot in the door. A place built with
            structure, to ease the load on others.
          </p>
          <p className="text-sm mb-4">
            Whether you&rsquo;re a musician ready to grow, or someone
            looking for the perfect fit &mdash; this was made with you in
            mind.
          </p>
          <p className="text-sm mb-4">
            Six or so years of this in the &ldquo;too hard basket&rdquo;.
            Some things are worth the wait.
          </p>
          <p className="font-serif italic text-lg mt-6">With warmth, Emily</p>
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-t border-rule grid md:grid-cols-2 gap-12" id="join-preview">
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
