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
    b: "Reach out directly through the platform. Your musician gets the details and responds directly to you.",
  },
  {
    n: "III",
    t: "Pay securely, once confirmed",
    b: "You and your musician or teacher confirm the details that matter: set list or lesson plan, capability, availability, and rate. From there, your booking is secured with a payment link sent directly to your email.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Your musician gets paid automatically once you complete payment. Whether it's a musician for your event or a teacher to expand your musical language, your booking supports them directly.",
  },
];

const musicianPillars = [
  {
    n: "I",
    t: "A portfolio, ready to go",
    b: "Your curated profile acts as a professional portfolio: bio, experience, rates, and photos in one place. Share it directly with people you know, or be discovered by instrument, region, and occasion. Either way, you're accessible and ready to book.",
  },
  {
    n: "II",
    t: "Trusted",
    b: "All teachers are police vetted before their profile goes live, a standard the Gallery establishes on your behalf. Event musicians build that same trust independently, through client reviews and a portfolio of photos that speaks for itself.",
  },
  {
    n: "III",
    t: "Backend, handled",
    b: "Payment collection and payout are handled automatically once your client pays. No invoicing, no chasing clients for payment.",
  },
  {
    n: "IV",
    t: "Independent",
    b: "Set your own rates and keep your own clients. This is a booking tool, not an agency. We're here to support your career, or simply help you build an accessible income stream doing what you love.",
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
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="font-serif text-2xl">100%</p>
            <p className="text-xs text-mid">Police vetted teachers</p>
          </div>
          <div>
            <p className="font-serif text-2xl">Accessible</p>
            <p className="text-xs text-mid max-w-[180px]">Browse and list on the gallery for free</p>
          </div>
          <div>
            <p className="font-serif text-2xl">0%</p>
            <p className="text-xs text-mid">Commission from musicians</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[52px] pt-8 pb-16">
        <div className="grid grid-cols-3 gap-6 md:gap-8 h-[38vh] md:h-[45vh] max-h-[420px] md:max-h-[480px]">
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

      <section className="px-6 md:px-[52px] py-20 grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">For clients &amp; students</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            Simple, start
            <br />
            to <em>finish.</em>
          </h2>
          <p className="text-sm text-mid mt-6 max-w-xs">
            Every profile is priced and ready to book, with vetted teachers
            clearly marked. Once you and your musician confirm,
            you&rsquo;ll pay securely online in a few clicks.
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

      <section className="px-6 md:px-[52px] py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">For musicians</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 max-w-md">
              A portfolio, built to <em>support you.</em>
            </h2>
            <p className="text-sm text-mid mt-4 max-w-sm">
              Not sure what to have ready? Our Musician Toolkit walks you
              through profiles, rates, and getting booked.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link href="/join" className="text-xs tracking-[0.1em] uppercase hover:text-accent">
              Join the gallery &rarr;
            </Link>
            <Link href="/toolkit" className="text-xs tracking-[0.1em] uppercase hover:text-accent">
              See the Musician Toolkit &rarr;
            </Link>
          </div>
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
            All payments run through Stripe. Once your musician confirms
            your booking, you&rsquo;ll receive a secure payment link by
            email, no invoices needed.
          </p>
          <p className="text-sm leading-relaxed">
            On the musician&rsquo;s side, setup is simple: a one-time
            Stripe account linked directly to your bank account. From
            there, every payment lands automatically, in full, with
            nothing withheld, deducted, or charged as commission.
          </p>
        </div>
      </section>
    </>
  );
}
