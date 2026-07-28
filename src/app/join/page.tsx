import type { Metadata } from "next";
import JoinFormSection from "@/components/JoinFormSection";

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
      <JoinFormSection />
    </section>
  );
}
