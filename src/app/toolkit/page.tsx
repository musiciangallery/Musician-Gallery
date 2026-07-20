import type { Metadata } from "next";
import ToolkitBusinessSection from "@/components/ToolkitBusinessSection";

export const metadata: Metadata = {
  title: "Musician Toolkit | Musician Gallery",
};

const eventMusicianItems = [
  {
    t: "Photos and video",
    b: "Clients are booking someone they have never heard play, for an event that matters to them. A few good photos and a short clip of you performing do a lot of the reassuring for you.",
  },
  {
    t: "Repertoire, ready to talk through",
    b: "Know what you would play for a ceremony compared to a reception, or a corporate event compared to a private party. You do not need this written up anywhere. Just have it clear enough in your head that you can answer confidently the moment a client asks.",
  },
  {
    t: "A set or two already thought through",
    b: "If you can describe a full set built for a relaxed outdoor wedding, or a quieter corporate cocktail hour, a client can picture their day before you have even spoken properly.",
  },
  {
    t: "Your technical needs, clear in your mind",
    b: "A short mental note of what you bring compared to what a venue needs to provide, power, a chair, table space, sound if you are amplified, heads off a lot of confusion on the day, especially with venues that have not hosted live music before.",
  },
  {
    t: "Reviews",
    b: "Once you have played a few gigs booked through the Gallery, a genuine testimonial from a happy client makes a real difference to future bookings. It is fine to ask directly. Most people are glad to help once they have enjoyed themselves.",
  },
];

const teacherItems = [
  {
    t: "What you teach, stated clearly",
    b: "Make sure your profile is clear about which line of teaching you offer, whether that is beginner lessons, exam preparation, adult learners, or something else. Parents and students decide quickly, so clarity here matters more than almost anything.",
  },
  {
    t: "A rough sense of progression",
    b: "You do not need a written syllabus to get started. Just have a loose idea in mind of how a beginner moves toward more advanced work, so you can explain it plainly when someone asks.",
  },
  {
    t: "A lesson structure you can reuse",
    b: "Even a simple shape you adapt each week, warm up, technique, repertoire, theory, practice goals, saves you planning time once a full studio comes together, and keeps lessons feeling consistent for returning students.",
  },
  {
    t: "Something for younger students to hold onto",
    b: "Practice charts and small rewards matter more than they sound like they should for keeping younger students motivated between lessons.",
  },
  {
    t: "Your studio policies, decided ahead of time",
    b: "Cancellation notice, catch up lessons, payment terms, term breaks. Having an answer ready avoids awkward conversations later, and reads as professional from day one.",
  },
  {
    t: "A small recital or showcase, even once a year",
    b: "It gives students something to work toward, and gives parents a reason to talk about you to other parents.",
  },
];

export default function ToolkitPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="px-6 md:px-[52px] py-16 border-b border-rule">
        <span className="eyebrow">Getting started</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-6 max-w-2xl">
          Musician <em>toolkit.</em>
        </h1>
        <p className="text-sm max-w-2xl">
          A short list of things worth having ready before your first booking or your first student, gathered from musicians already using the Gallery. None of it is required to join.
        </p>
      </section>

      <section className="px-6 md:px-[52px] py-16 border-b border-rule">
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

      <section className="px-6 md:px-[52px] py-16 border-b border-rule">
        <span className="eyebrow">For teachers</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-10 max-w-md">
          Ready for the <em>studio.</em>
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

      <ToolkitBusinessSection />
    </div>
  );
}
