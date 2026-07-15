import type { Metadata } from "next";
import Link from "next/link";
import JoinForm from "@/components/JoinForm";

export const metadata: Metadata = {
  title: "Join as a Musician | Musician Gallery",
};

export default function JoinPage() {
  return (
    <section className="max-w-2xl mx-auto px-6 md:px-[52px] py-16">
      <span className="eyebrow">For Musicians</span>
      <h1 className="font-serif text-4xl mt-3 mb-4">
        List your profile. <em>Set your terms.</em>
      </h1>
      <p className="text-sm text-mid mb-4">
        Free to list, no commission. We handle marketing, admin, and
        withholding tax so you can focus on the music. Submit your details
        below to start the police vetting process.
      </p>
      <Link
        href="/toolkit"
        className="text-xs tracking-[0.1em] uppercase hover:text-accent mb-12 inline-block"
      >
        Not sure what to have ready? See the Musician Toolkit &rarr;
      </Link>
      <JoinForm />
    </section>
  );
}
