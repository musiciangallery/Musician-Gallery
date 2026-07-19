import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Musician Gallery",
};

const clientSteps = [
  {
    n: "I",
    t: "Browse the gallery",
    b: "Search by instrument, location, or occasion. Every profile shows rates and experience upfront, with vetted teachers clearly marked, so you know exactly who you're booking.",
  },
  {
    n: "II",
    t: "Send a booking request",
    b: "Reach out directly through the platform. Your musician gets the details and responds directly to you — no agency, no middleman.",
  },
  {
    n: "III",
    t: "Pay securely, once confirmed",
    b: "Once your musician confirms and quotes their rate, you'll get a secure payment link by email. Pay online in a few clicks — no cash, no chasing invoices.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Your musician gets paid automatically once you complete payment. We handle the rest.",
  },
];

const musicianPillars = [
  {
    n: "I",
    t: "A portfolio, ready to go",
    b: "Your profile is a professional portfolio — bio, experience, rates, and photos in one place, discoverable by instrument, region, and occasion.",
  },
  {
    n: "II",
    t: "Trusted",
    b: "Teachers are police vetted before their profile goes live. Clients see a vetted badge, so they know exactly who they're booking.",
  },
  {
    n: "III",
    t: "Backend, handled",
    b: "Payment collection and payout are handled automatically once your client pays. No invoicing, no chasing clients for payment.",
  },
  {
    n: "IV",
    t: "Independent",
    b: "Set your own rates and keep your own clients. This is a booking tool, not an agency — you're never locked in.",
  },
];

const galleryImages = [
  { src: "/brand/about-violin-bridge.jpg", alt: "Close detail of a violin bow and bridge" },
  { src: "/brand/hero-piano-doorway.jpg", alt: "A pianist performing live at a grand piano" },
  { src: "/brand/story-emily-cello.jpg", alt: "Emily, founder of Musician Gallery, playing cello" },
];

export default function AboutPage() {
  return (
    <>
      <section className="px-6 md:px-[52px] pt-12 pb-10">
        <span className="eyebrow">The Gallery Function</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-2xl">
          A functional, considered <em>space.</em>
        </h1>
        <p className="text-sm max-w-2xl mb-10">
          Musician Gallery is a directory and booking tool for musicians and
          teachers across Aotearoa, New Zealand. Musicians list a free
          profile, set their own rates, and retain the full amount.
          Clients search a curated gallery of musicians and vetted
          teachers, and pay a 10% platform fee at checkout. An amount that
          goes directly toward supporting New Zealand musicians through
          introduction, vetting, and streamlined support.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-xl">
          <div>
            <p className="font-serif text-2xl">100%</p>
            <p className="text-xs text-mid">Police vetted teachers</p>
          </div>
          <div>
            <p className="font-serif text-2xl">Accessible</p>
            <p className="text-xs text-mid">Browse and list on the gallery for free</p>
          </div>
          <div>
            <p className="font-serif text-2xl">0%</p>
            <p className="text-xs text-mid">Commission from musicians</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[52px] pt-8 pb-16">
        <div className="grid grid-cols-3 gap-6 md:gap-8 h-[42vh] md:h-[55vh]">
          {galleryImages.map((img) => (
            <div key={img.src} className="relative h-full">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover photo-mono"
                sizes="(max-width: 768px) 33vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-b border-rule grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">For clients &amp; students</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            Simple, start
            <br />
            to <em>finish.</em>
          </h2>
          <p className="text-sm text-mid mt-6 max-w-xs">
            Every profile is priced and ready to book, with vetted teachers
            clearly marked. Once your musician confirms, you&rsquo;ll pay
            securely online in a few clicks.
          </p>
          <Link
            href="/gallery"
            className="text-xs tracking-[0.1em] uppercase hover:text-accent mt-6 inline-block"
          >
            Browse the gallery &rarr;
          </Link>
        </div>
        <div className="space-y-8">
          {clientSteps.map((s) => (
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

      <section className="px-6 md:px-[52px] py-20 border-b border-rule">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">For musicians</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 max-w-md">
              A portfolio, built to <em>support you.</em>
            </h2>
          </div>
          <Link href="/join" className="text-xs tracking-[0.1em] uppercase hover:text-accent">
            Join the gallery &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {musicianPillars.map((p) => (
            <div key={p.n}>
              <span className="font-serif text-2xl text-mid">{p.n}</span>
              <h3 className="font-serif text-xl mt-3 mb-2">{p.t}</h3>
              <p className="text-sm text-mid leading-relaxed">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">Payments</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            How the money
            <br />
            <em>moves.</em>
          </h2>
        </div>
        <div className="space-y-6 max-w-2xl">
          <p className="text-sm leading-relaxed">
            All payments run through Stripe, with a secure payment link
            sent once your musician confirms and quotes their rate.
          </p>
          <p className="text-sm leading-relaxed">
            Payment goes straight to the musician&rsquo;s bank account
            automatically. Musicians receive their full quoted rate
            &mdash; nothing is withheld, deducted, or charged as
            commission.
          </p>
        </div>
      </section>
    </>
  );
}
