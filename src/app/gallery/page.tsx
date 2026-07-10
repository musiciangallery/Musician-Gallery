import type { Metadata } from "next";
import GalleryBrowser from "@/components/GalleryBrowser";
import { getAllMusicians } from "@/lib/musicians-live";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Gallery | Musician Gallery",
};

export default async function GalleryPage() {
  const allMusicians = await getAllMusicians();

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-[52px] py-16">
      <span className="eyebrow">The Gallery</span>
      <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-4">
        Every musician, <em>considered.</em>
      </h1>
      <p className="text-sm text-mid max-w-xl mb-12">
        Browse event musicians and teachers across Aotearoa, New Zealand, with
        vetting shown on each profile. Filter by instrument, region, or
        occasion to find exactly who you need.
      </p>
      <GalleryBrowser allMusicians={allMusicians} />
    </section>
  );
}
