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
        <p className="text-sm text-mid mb-4">
          A cellist by training and a contractor by trade. I&rsquo;m Emily,
          the person behind Musician Gallery.
        </p>
        <p className="text-sm text-mid mb-4">
          I grew up watching two self-employed creatives figure out how to
          make their work sustainable, long before I understood why that
          mattered.
        </p>
        <p className="text-sm text-mid mb-4">
          For years I&rsquo;ve lived in two worlds: performing at weddings
          and events and teaching, alongside working with property sector
          clients to bring structure to the parts of their businesses no
          one sees. Two worlds that don&rsquo;t obviously belong together.
          Until you notice what&rsquo;s missing from one, and abundant in
          the other.
        </p>
        <p className="text-sm text-mid mb-4">
          Knowing musicians and teachers I&rsquo;d want to book, with no
          obvious place to find them, and standing alongside others who
          were pouring everything into their craft but had little time
          left for the business side of it, became the driver behind this
          gallery: a space that gives their talent the structure and
          accessibility it deserves. Musician Gallery is what happens when
          those two worlds finally meet.
        </p>
        <p className="text-sm text-mid mb-4">
          Whether you&rsquo;re a musician ready to be found, or someone
          looking for the right person to teach or entertain, this was
          built with you in mind.
        </p>
        <p className="text-sm text-mid mb-4">
          Six or so years in the too hard basket. Some things are worth the
          wait.
        </p>
        <p className="font-serif italic text-lg mt-6">
          With warmth,
          <br />
          Emily x
        </p>
      </div>
    </section>
  );
}
