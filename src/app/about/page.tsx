import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About | Musician Gallery",
};

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
    b: "Search by instrument, location, or occasion. Every profile is complete and considered.",
  },
  {
    n: "II",
    t: "Send a booking request",
    b: "Reach out directly through the platform. Your musician receives the details and gets back to you directly.",
  },
  {
    n: "III",
    t: "Payment held securely",
    b: "Funds are held until your lesson or event is confirmed. Withholding tax handled automatically on your behalf.",
  },
  {
    n: "IV",
    t: "Enjoy the music",
    b: "Whether it's a performance or a lesson, your musician or teacher delivers — and gets paid. We take care of everything in between.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="px-6 md:px-[52px] py-16 grid md:grid-cols-2 gap-12 items-center border-b border-rule">
        <div>
          <span className="eyebrow">The Gallery Function</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-lg">
            A functional, considered <em>space.</em>
          </h1>
          <p className="text-sm max-w-lg mb-3">
            A place built with structure, not guesswork. Clients search by
            instrument, region, and occasion to find a complete, considered
            profile. Vetted teachers, rates set upfront, ready to book.
            Musicians get a curated space to be found in, professionally
            presented and free to list, with the admin handled so getting
            noticed doesn&rsquo;t mean doing it all yourself.
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

      <section className="px-6 md:px-[52px] py-20 border-b border-rule">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div>
            <span className="eyebrow">For musicians</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 max-w-md">
              Built to support <em>the whole musician.</em>
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

      <section className="px-6 md:px-[52px] py-20 grid md:grid-cols-[35%_65%] gap-12">
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
            Every booking is handled through the platform, from first enquiry
            to final payment.
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
    </>
  );
}
