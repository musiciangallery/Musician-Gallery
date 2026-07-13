import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Musician Gallery",
};

const pillars = [
  {
    n: "I",
    t: "Discoverable",
    b: "Your profile is searchable by instrument, region, and occasion. Clients find you directly, without marketing spend or cold outreach.",
  },
  {
    n: "II",
    t: "Trusted",
    b: "Teachers are police vetted before their profile goes live. Clients see a vetted badge, so they know exactly who they're booking.",
  },
  {
    n: "III",
    t: "Supported",
    b: "No invoicing, no chasing payment. Withholding tax is calculated and deducted automatically, and you're never charged commission.",
  },
  {
    n: "IV",
    t: "Independent",
    b: "Set your own rates and keep your own clients. This is a booking tool, not an agency — you're never locked in.",
  },
];

const howSteps = [
  {
    n: "I",
    t: "Browse the gallery",
    b: "Search by instrument, location, or occasion. Every profile shows rates, experience, and vetting status upfront.",
  },
  {
    n: "II",
    t: "Send a booking request",
    b: "Reach out directly through the platform. Your musician gets the details and responds directly to you.",
  },
  {
    n: "III",
    t: "Payment held securely",
    b: "Funds are collected at checkout and held until your lesson or event is confirmed complete.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Your musician gets paid automatically once the booking is confirmed. We handle the rest.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="px-6 md:px-[52px] py-16 border-b border-rule">
        <span className="eyebrow">The Gallery Function</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-2xl">
          A functional, considered <em>space.</em>
        </h1>
        <p className="text-sm max-w-2xl mb-10">
          Musician Gallery is a directory and booking tool for musicians and
          teachers across Aotearoa, New Zealand. Clients search by
          instrument, region, and occasion. Musicians list a complete
          profile, set their own rates, and get booked directly through the
          platform. A functional gallery, giving talented people the
          platform they&rsquo;ve earned.
        </p>
        <div className="grid grid-cols-3 gap-6 max-w-xl">
          <div>
            <p className="font-serif text-2xl">100%</p>
            <p className="text-xs text-mid">Police vetted teachers</p>
          </div>
          <div>
            <p className="font-serif text-2xl">0%</p>
            <p className="text-xs text-mid">Commission on musician rates</p>
          </div>
          <div>
            <p className="font-serif text-2xl">Free</p>
            <p className="text-xs text-mid">To browse, free to list</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-[52px] py-20 border-b border-rule">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">For musicians</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 max-w-md">
              Free to list. Built to <em>support you.</em>
            </h2>
          </div>
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

      <section className="px-6 md:px-[52px] py-20 border-b border-rule grid md:grid-cols-[35%_65%] gap-12">
        <div>
          <span className="eyebrow">For clients &amp; students</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">
            Simple, from
            <br />
            both sides of
            <br />
            <em>the platform.</em>
          </h2>
          <p className="text-sm text-mid mt-6 max-w-xs">
            Every booking runs through the platform, from first enquiry to
            final payment.
          </p>
          <Link
            href="/gallery"
            className="text-xs tracking-[0.1em] uppercase hover:text-accent mt-6 inline-block"
          >
            Browse the gallery &rarr;
          </Link>
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
            All payments run through Stripe, the payment processor used by
            millions of businesses worldwide. When a client confirms a
            booking, payment is collected upfront and held securely until
            the lesson or event is complete.
          </p>
          <p className="text-sm leading-relaxed">
            Once confirmed, funds are released directly to the
            musician&rsquo;s bank account. Withholding tax is calculated and
            deducted automatically, so there&rsquo;s no end-of-year
            surprise.
          </p>
          <p className="text-sm leading-relaxed">
            A 10% platform fee is added to the client&rsquo;s total at
            checkout. Musicians are never charged commission and always
            receive their full listed rate.
          </p>
        </div>
      </section>
    </>
  );
}
