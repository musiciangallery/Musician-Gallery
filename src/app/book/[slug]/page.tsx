import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMusicianBySlug, musicians } from "@/lib/musicians";
import BookingForm from "@/components/BookingForm";

export function generateStaticParams() {
  return musicians.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMusicianBySlug(slug);
  return { title: m ? `Book ${m.name} | Musician Gallery` : "Musician Gallery" };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getMusicianBySlug(slug);
  if (!m) notFound();

  return (
    <section className="max-w-2xl mx-auto px-6 md:px-[52px] py-16">
      <Link
        href={`/musicians/${m.slug}`}
        className="text-xs text-mid hover:text-accent"
      >
        &larr; Back to {m.name}&rsquo;s profile
      </Link>
      <span className="eyebrow block mt-8">Request a booking</span>
      <h1 className="font-serif text-4xl mt-3 mb-10">
        Booking <em>{m.name}</em>
      </h1>
      <BookingForm musician={m} />
    </section>
  );
}
