import type { Metadata } from "next";
import type { ReactNode } from "react";
import ToolkitBusinessSection from "@/components/ToolkitBusinessSection";

export const metadata: Metadata = {
  title: "Musician Toolkit | Musician Gallery",
};

type ToolkitItem = {
  n: string;
  t: string;
  b: ReactNode;
};

const teacherItems: ToolkitItem[] = [
  {
    n: "I",
    t: "Your Police Vetted badge",
    b: (
      <>
        A Police Vetted badge is a clear signal of trust, and something all
        Musician Gallery teachers must obtain before their profile goes
        live. It sets your profile apart from other platforms. To get
        vetted, sign up for a personal account with{" "}
        <a
          href="https://cvcheck.com/nz/police-vetting/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-accent"
        >
          CVCheck
        </a>
        , select Children&apos;s Worker Safety Checks, then add New Zealand:
        Police Vetting to your order. It costs $81.40 incl GST, takes up to
        20 days, and is generally claimable as a business expense. You can
        still apply to Musician Gallery while awaiting your certificate
        from CVCheck.
      </>
    ),
  },
  {
    n: "II",
    t: "Who you teach, stated clearly",
    b: "Make sure your profile is clear about who you teach best. Whether that is young beginners, adult learners, exam candidates, or advanced students working toward performance. Parents and students decide quickly, so clarity here matters more than almost anything.",
  },
  {
    n: "III",
    t: "A sense of progression for your students",
    b: "A written syllabus is not necessary to begin teaching. What matters is having a clear sense of how a beginner progresses toward more advanced work, one you can explain confidently when asked. If you teach within a recognised method or exam board, such as Suzuki, ABRSM, or Trinity College for classical, or Rockschool and Trinity Rock & Pop for contemporary players, mention it on your profile. It gives parents and students an instant sense of structure and credibility.",
  },
  {
    n: "IV",
    t: "A lesson structure you adapt",
    b: "Even a simple shape you adapt each week, warm up, technique, repertoire, theory, practice goals, saves you planning time once a full studio comes together, and keeps lessons feeling consistent for your students.",
  },
  {
    n: "V",
    t: "Something for younger students to hold onto",
    b: "Stickers, a music scrapbook, or a special pencil matter more than they sound for keeping younger students motivated between lessons. This alongside a simple practice chart to track their progress goes a long way.",
  },
  {
    n: "VI",
    t: "Your studio policies, decided ahead of time",
    b: "Cancellation notice, catch up lessons, how you handle no-shows, and term breaks. Having an answer ready avoids awkward conversations later, and reads as professional from day one.",
  },
  {
    n: "VII",
    t: "A small recital or showcase, even once a year",
    b: "It gives students something to work toward, and does not need a concert hall to matter. A local retirement home is often a beautiful space to share it in, a community that welcomes live music with open arms.",
  },
];

const eventMusicianItems: ToolkitItem[] = [
  {
    n: "I",
    t: "Photos and videos",
    b: "Clients are booking someone they have never heard play, for an event that matters to them. A few good photos and a short clip of you performing do a lot to position your profile as the right fit for a potential client.",
  },
  {
    n: "II",
    t: "Repertoire, ready to talk through",
    b: "Know what you would play for a ceremony compared to a reception, or a corporate event compared to a private party. If you can describe a full set built for a relaxed outdoor wedding, or a quieter corporate cocktail hour, a client can picture their day before you have even spoken properly.",
  },
  {
    n: "III",
    t: "Your technical needs, ready to establish",
    b: "Establish clearly what you bring compared to what a venue needs to provide: power, a chair, table space, and sound if you are amplified. Having this sorted ahead of time heads off a lot of confusion on the day, especially with venues that have not hosted live music before.",
  },
  {
    n: "IV",
    t: "Additional expenses for a gig",
    b: "If a booking sits outside your usual area, calls for specific repertoire, or requires extra gear, it is worth factoring this into your rate before you finalise a quote. A simple per kilometre travel rate, the cost of sourcing sheet music and hiring equipment all add up quickly if left as an afterthought. Raising this upfront when a client enquires reads as professional, not as a surprise cost later.",
  },
  {
    n: "V",
    t: "Reviews",
    b: "Once you have played a few gigs booked through the Gallery, a genuine testimonial from a happy client makes a real difference to future bookings. It is fine to ask directly. Most people are glad to help once they have enjoyed themselves.",
  },
];

export default function ToolkitPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="px-6 md:px-[52px] pt-16 pb-8">
        <span className="eyebrow">Getting started</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-2xl">
          Musician <em>toolkit.</em>
        </h1>
        <p className="text-sm max-w-2xl text-mid">
          A short list of things worth having ready before your first
          booking or student, gathered by musicians for musicians. None of
          it is required to join.
        </p>
      </section>

      <section className="px-6 md:px-[52px] py-8">
        <span className="eyebrow">For teachers</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-10 max-w-md">
          Ready for <em>lessons.</em>
        </h2>
        <div className="space-y-8 max-w-2xl">
          {teacherItems.map((item) => (
            <div key={item.t} className="border-t border-rule pt-6">
              <h3 className="font-serif text-xl mb-2">{item.t}</h3>
              <p className="text-sm text-mid leading-relaxed">{item.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-[52px] pt-8 pb-16 border-b border-rule">
        <span className="eyebrow">For event musicians</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-10 max-w-md">
          Ready for the <em>enquiry.</em>
        </h2>
        <div className="space-y-8 max-w-2xl">
          {eventMusicianItems.map((item) => (
            <div key={item.t} className="border-t border-rule pt-6">
              <h3 className="font-serif text-xl mb-2">{item.t}</h3>
              <p className="text-sm text-mid leading-relaxed">{item.b}</p>
            </div>
          ))}
        </div>
      </section>

      <ToolkitBusinessSection />
    </div>
  );
}
