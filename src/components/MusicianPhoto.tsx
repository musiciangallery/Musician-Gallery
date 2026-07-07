import Image from "next/image";
import type { Musician } from "@/lib/musicians";

export default function MusicianPhoto({
  m,
  aspect = "aspect-[4/5]",
}: {
  m: Musician;
  aspect?: string;
}) {
  if (m.photo) {
    return (
      <div className={`relative ${aspect} overflow-hidden bg-off`}>
        <Image
          src={m.photo}
          alt={m.name}
          fill
          className="object-cover photo-mono"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
    );
  }

  // Muted placeholder in the same editorial style, until a real photo is set.
  return (
    <div
      className={`relative ${aspect} bg-off flex items-center justify-center border border-rule`}
    >
      <span className="font-serif text-4xl text-rule">
        {m.name
          .split(" ")
          .map((w) => w[0])
          .join("")}
      </span>
    </div>
  );
}
