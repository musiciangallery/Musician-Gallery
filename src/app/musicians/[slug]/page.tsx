import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { musicians } from "@/lib/musicians";
import { getMusicianBySlugAsync } from "@/lib/musicians-live";
import { getApprovedReviewsForMusician } from "@/lib/reviews-live";
import MusicianGallery from "@/components/MusicianGallery";
import ShareButton from "@/components/ShareButton";
import ProfileTabs from "@/components/ProfileTabs";
import ReviewForm from "@/components/ReviewForm";

// Real, approved musicians are added after the site is built and deployed,
// so their profile pages can't be pre-generated at build time — dynamicParams
// lets Next.js render and cache any slug on first request. revalidate then
// refreshes that cached page at most once a minute, instead of hitting the
// database on every single visit.
export const dynamicParams = true;
export const revalidate = 60;

// Spotify share links (open.spotify.com/{type}/{id}) can be embedded
// directly as a playable iframe. Anything else — SoundCloud, Bandcamp,
// YouTube, a personal site — just gets shown as a plain "Listen" link
// instead, since only Spotify's embed URL format is being handled here.
function getSpotifyEmbed(url: string): { embedUrl: string; height: number } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "open.spotify.com") return null;
    const [type, id] = parsed.pathname.split("/").filter(Boolean);
    const validTypes = ["track", "album", "playlist", "artist", "episode", "show"];
    if (!type || !id || !validTypes.includes(type)) return null;
    return {
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      height: type === "track" ? 152 : type === "episode" || type === "show" ? 232 : 352,
    };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return musicians.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMusicianBySlugAsync(slug);
  return { title: m ? `${m.name} | Musician Gallery` : "Musician Gallery" };
}

export default async function MusicianProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMusicianBySlugAsync(slug);
  if (!m) notFound();
  const reviews = await getApprovedReviewsForMusician(slug);
  const firstName = m.name.split(" ")[0];

  return (
    <section className="max-w-4xl mx-auto px-6 md:px-[52px] py-16">
      <Link href="/gallery" className="text-xs text-mid hover:text-accent">
        &larr; Back to the gallery
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-8">
        <div>
          <span className="eyebrow">
            {m.region} &middot; {m.instrument}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl mt-3">{m.name}</h1>
          <p className="text-sm text-mid mt-2">{m.type}</p>
        </div>
        <div className="flex items-center gap-3">
          {m.vetted && m.type !== "Event Musician" && (
            <span className="text-[10px] tracking-[0.14em] uppercase text-accent border border-accent/40 rounded-full px-3 py-1.5 h-fit">
              Police Vetted
            </span>
          )}
          <ShareButton
            title={`${m.name} | Musician Gallery`}
            path={`/musicians/${m.slug}`}
          />
        </div>
      </div>

      {m.vetted && m.type !== "Event Musician" && (
        <p className="text-xs text-mid mt-3 max-w-md">
          {firstName} has independently completed a New Zealand Police
          Vetting Check through CVCheck &mdash; at their own cost and by
          their own choice, before this profile ever went live.
        </p>
      )}

      <div className="mt-10 max-w-xs">
        <MusicianGallery m={m} />
      </div>

      <div className="grid md:grid-cols-3 gap-10 mt-10">
        <div className="md:col-span-2">
          <ProfileTabs
            reviewCount={reviews.length}
            about={
              <>
                <p className="text-sm leading-relaxed">{m.longBio}</p>

                {m.audioLink && (() => {
                  const spotify = getSpotifyEmbed(m.audioLink!);
                  return (
                    <div className="mt-10">
                      <h2 className="font-serif text-2xl mb-3">Listen</h2>
                      {spotify ? (
                        <iframe
                          src={spotify.embedUrl}
                          width="100%"
                          height={spotify.height}
                          style={{ borderRadius: 0, border: "none" }}
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          title={`${m.name} on Spotify`}
                        />
                      ) : (
                        <a
                          href={m.audioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs tracking-[0.1em] uppercase border border-rule px-4 py-2 hover:border-accent hover:text-accent transition-colors inline-block"
                        >
                          Listen &rarr;
                        </a>
                      )}
                    </div>
                  );
                })()}

                <h2 className="font-serif text-2xl mt-10 mb-3">Available for</h2>
                <ul className="flex flex-wrap gap-2">
                  {m.occasions.map((o) => (
                    <li
                      key={o}
                      className="text-xs border border-rule px-3 py-1.5 text-mid"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </>
            }
            reviews={
              <div className="space-y-8">
                {reviews.length === 0 ? (
                  <p className="text-sm text-mid">
                    No reviews yet &mdash; be the first to leave one for {firstName}.
                  </p>
                ) : (
                  <ul className="space-y-6">
                    {reviews.map((r) => (
                      <li key={r.id} className="border-b border-rule pb-6">
                        <p className="text-sm leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                        <p className="text-xs text-mid mt-3">
                          {r.reviewerName}
                          {r.context && <> &middot; {r.context}</>}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <ReviewForm musicianSlug={m.slug} musicianFirstName={firstName} />
              </div>
            }
          />
        </div>

        <div className="border border-rule bg-off/40 p-6 h-fit">
          {m.rateUnit === "By enquiry" || m.rateFrom == null ? (
            <>
              <p className="text-xs text-mid mb-1">Rate</p>
              <p className="font-serif text-2xl mb-6">By enquiry</p>
            </>
          ) : m.rateUnit === "per event" ? (
            <>
              <p className="text-xs text-mid mb-1">Starting from</p>
              <p className="font-serif text-3xl mb-1">${m.rateFrom.toFixed(2)}</p>
              <p className="text-xs text-mid mb-1">per event</p>
              <p className="text-[11px] text-mid mb-6">
                This is a starting point, informational for you as a
                potential client, not a fixed quote.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-mid mb-1">Rate</p>
              <p className="font-serif text-3xl mb-1">${m.rateFrom.toFixed(2)}</p>
              <p className="text-xs text-mid mb-1">{m.rateUnit}</p>
              <p className="text-[11px] text-mid mb-6">
                This is a starting point, informational for you as a
                potential client, not a fixed quote.
              </p>
            </>
          )}
          <p className="text-xs text-mid mb-6">
            {m.yearsExperience} years experience
          </p>
          {m.availability && (
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.08em] uppercase text-mid mb-1">
                Availability
              </p>
              <p className="text-xs text-mid">{m.availability}</p>
            </div>
          )}
          <Link
            href={`/book/${m.slug}`}
            className="block text-center bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 hover:bg-accent transition-colors"
          >
            Request a booking
          </Link>
          <p className="text-[10px] text-mid mt-4 leading-relaxed">
            A 10% platform fee applies to bookings, added at checkout. No
            hidden costs.
          </p>
        </div>
      </div>
    </section>
  );
}
