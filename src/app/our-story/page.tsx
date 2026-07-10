import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Story | Musician Gallery",
};

export default function OurStoryPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 md:px-[52px] py-16 grid md:grid-cols-[45%_55%] gap-12 items-center">
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
        <h1 className="font-serif text-3xl md:text-4xl mt-3 mb-6">
          Six years in the too hard <em>basket.</em>
        </h1>
        <p className="text-sm mb-4">
          I&rsquo;m Emily, a cellist, a contractor, and someone who grew up
          watching two self-employed creatives make their work happen.
        </p>
        <p className="text-sm mb-4">
          I&rsquo;ve spent years performing at weddings and events, teaching,
          and most prominently, working alongside property sector clients to
          bring structure to the behind the scenes of their businesses. Two
          worlds that don&rsquo;t obviously go together, until now.
        </p>
        <p className="text-sm mb-4">
          On too many occasions have I been amongst a cohort of musicians who
          are phenomenally talented and committed, riding the wave of word of
          mouth and undercut gigs. Contrastingly, my world has brought me
          individuals searching for exactly that. Musician Gallery gives them
          a foot in the door. A place built with structure, to ease the load
          on others.
        </p>
        <p className="text-sm mb-4">
          Whether you&rsquo;re a musician ready to grow, or someone looking
          for the perfect fit &mdash; this was made with you in mind.
        </p>
        <p className="text-sm mb-4">
          Six or so years of this in the &ldquo;too hard basket&rdquo;. Some
          things are worth the wait.
        </p>
        <p className="font-serif italic text-lg mt-6">With warmth, Emily</p>
      </div>
    </section>
  );
}
