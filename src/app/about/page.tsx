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
    b: "Search by instrument, region, or occasion to find exactly who you need.",
  },
  {
    n: "II",
    t: "Send a booking request",
    b: "Reach out directly through the platform. Your musician gets the details and responds directly to you.",
  },
  {
    n: "III",
    t: "Pay securely, once confirmed",
    b: "You and your musician or teacher confirm the details that matter: set list or lesson structure, capability, availability, and rate. Once your musician confirms, your booking is secured with a payment link sent directly to your email.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Your musician gets paid automatically once you complete payment. Whether it's a musician for an event or a teacher to expand your musical language, your booking supports them directly.",
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
    b: "Teachers complete a one-off NZ Police Vetting Check through CVCheck before their profile goes live, earning a Police Vetted badge. Event musicians build trust independently, through client reviews and a detailed portfolio.",
  },
  {
    n: "III",
    t: "Backend, handled",
    b: "Payment collection and payout are handled automatically once your client pays. No invoicing, no chasing clients for payment, and every transaction is logged in your own Stripe dashboard, ready for tax time.",
  },
  {
    n: "IV",
    t: "Independent",
    b: "Set your own rates and keep your own clients. This is a booking tool, not an agency. We're here to support your career, or simply help you build an accessible income stream doing what you love.",
  },
];

const galleryImages = [
  { src: "/brand/marina-bay-band.jpg", alt: "A live band performing outdoors at Marina Bay Sands" },
  { src: "/brand/street-accordion-player.jpg", alt: "A street musician playing accordion beneath stone archways" },
  { src: "/brand/orchestra-rehearsal.jpg", alt: "Musicians rehearsing together on stage with cello and double bass" },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="px-6 md:px-[52px] pt-12 pb-10">
        <span className="eyebrow">The Gallery Function</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-2xl">
          A functional, considered <em>space.</em>
        </h1>
        <p className="text-sm max-w-2xl mb-10 text-mid">
          Musician Gallery is a directory and booking tool for musicians and
          teachers across Aotearoa, New Zealand. Musicians list a free
          profile, set their own rates, and retain the full amount.
          Clients search a curated gallery of musicians and teachers, and
          pay a 10% platform fee at checkout, an amount that keeps the
          gallery free and accessible for musicians to join and be
          discovered.
        </p>
        {/* NOTE (19 July 2026): "100% Police vetted teachers" stat removed —
            Musician Gallery's NZ Police Vetting Service authorised-agency
            application is still pending, so no teachers have actually been
            vetted yet. Restore once real vetting is live. */}
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <p className="font-serif text-2xl">Accessible</p>
            <p className="text-xs text-mid">Free to browse &amp; list</p>
          </div>
          <div>
            <p className="font-serif text-2xl">0%</p>
            <p className="text-xs text-mid">Commission from musicians</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[52px] pt-10 pb-0">
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

      <section className="px-6 md:px-[52px] py-20 border-b border-rule grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">For clients &amp; students</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            Simple, start
            <br />
            to <em>finish.</em>
          </h2>
          <p className="text-sm text-mid mt-6 max-w-xs">
            Every profile shows an indicative rate and experience upfront,
            so you know what to expect before you send a request.
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
              <span className="font-serif text-2xl text-mid w-8 shrink-0">{s.n}</span>
              <div>
                <h3 className="font-serif text-xl mb-1">{s.t}</h3>
                <p className="text-sm text-mid leading-relaxed">{s.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-b border-rule">
        <div className="flex flex-wrap items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">For musicians</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 max-w-md">
              A portfolio, built to <em>support you.</em>
            </h2>
            <p className="text-sm text-mid mt-4 max-w-sm">
              Not sure what to have ready? Our Musician Toolkit walks you
              through your portfolio, your first booking, and setting
              yourself up as a business.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
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
          <p className="text-sm text-mid leading-relaxed">
            Stripe is the secure payment processor that powers every
            transaction on Musician Gallery, used by millions of businesses
            worldwide. Once your musician confirms your booking,
            you&rsquo;ll receive a secure payment link by email, no
            invoices needed.
          </p>
          <p className="text-sm text-mid leading-relaxed">
            On the musician&rsquo;s side, setup is simple: a one-time
            Stripe account linked directly to your bank account. From
            there, every payment lands automatically, in full, with
            nothing withheld, deducted, or charged as commission.
          </p>
        </div>
      </section>
    </div>
  );
}
