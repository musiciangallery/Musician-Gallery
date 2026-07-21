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
      <p className="text-sm text-mid mb-2 md:mb-0">
        Free to list, no commission. Fill in your details below to create
        your profile.
      </p>
      <p className="text-sm text-mid mb-12">
        Not sure what to have ready?{" "}
        <span className="block md:inline mt-1 md:mt-0">
          See the{" "}
          <Link
            href="/toolkit"
            className="underline underline-offset-4 hover:text-accent"
          >
            Musician Toolkit &rarr;
          </Link>
        </span>
      </p>
      <JoinForm />
    </section>
  );
}
