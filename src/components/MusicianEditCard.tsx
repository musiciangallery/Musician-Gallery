"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import FeatureMusicianButton from "@/components/FeatureMusicianButton";
import RemoveMusicianButton from "@/components/RemoveMusicianButton";

const inputClass =
  "w-full border border-rule bg-w px-3 py-2 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-[10px] tracking-[0.08em] uppercase text-mid block mb-1";
const td = "p-3 border-b border-rule text-sm align-top";

export type LiveMusicianForEdit = {
  id: string;
  slug: string;
  name: string;
  instrument: string;
  region: string;
  type: string;
  occasions: string[] | null;
  vetted: boolean;
  rate_from: number | null;
  rate_unit: string | null;
  bio: string | null;
  long_bio: string | null;
  years_experience: string | null;
  photo: string | null;
  photos: string[] | null;
  video: string | null;
  featured: boolean;
  availability: string | null;
  audio_link: string | null;
  stripe_onboarded: boolean;
};

const ALL_OCCASIONS = ["Wedding", "Corporate Events", "Private Functions", "Lessons"];

// Lets Emily fix wording, rates, and other listing details on an already
// live profile directly from /admin — without the musician needing to
// reapply and without a manual database edit. Deliberately doesn't touch
// instrument(s) or contact email here, since those are lower-risk to leave
// as set at approval time; everything else editable at approval is
// editable here too.
export default function MusicianEditCard({ m }: { m: LiveMusicianForEdit }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(m.slug);
  const [name, setName] = useState(m.name);
  const [region, setRegion] = useState(m.region);
  const [bio, setBio] = useState(m.bio || "");
  const [longBio, setLongBio] = useState(m.long_bio || "");
  const [rateFrom, setRateFrom] = useState(m.rate_from != null ? String(m.rate_from) : "");
  const [rateUnit, setRateUnit] = useState(m.rate_unit || "per event");
  const [yearsExperience, setYearsExperience] = useState(m.years_experience || "");
  const [availability, setAvailability] = useState(m.availability || "");
  const [audioLink, setAudioLink] = useState(m.audio_link || "");
  const [vetted, setVetted] = useState(m.vetted);
  const [occasions, setOccasions] = useState<string[]>(m.occasions || []);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newGalleryPhotos, setNewGalleryPhotos] = useState<File[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);

  const toggleOccasion = (o: string) =>
    setOccasions((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  async function save() {
    setError(null);
    setSubmitting(true);
    try {
      // Only uploads if a replacement/addition was actually chosen —
      // otherwise the musician's existing photo/gallery/video is left
      // untouched.
      let photoUrl = m.photo;
      if (newPhoto) {
        const blob = await upload(`musicians/${slug}-${Date.now()}`, newPhoto, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        photoUrl = blob.url;
      }

      let galleryUrls = m.photos || [];
      if (newGalleryPhotos.length > 0) {
        const uploaded: string[] = [];
        for (const file of newGalleryPhotos) {
          const blob = await upload(`musicians/${slug}-gallery-${Date.now()}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          uploaded.push(blob.url);
        }
        galleryUrls = [...galleryUrls, ...uploaded];
      }

      let videoUrl = m.video;
      if (newVideo) {
        const blob = await upload(`musicians/${slug}-video-${Date.now()}`, newVideo, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        videoUrl = blob.url;
      }

      const res = await fetch("/api/admin/update-musician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: m.id,
          slug,
          name,
          region,
          occasions,
          vetted,
          rateFrom: rateUnit === "By enquiry" || !rateFrom ? null : parseInt(rateFrom, 10),
          rateUnit,
          bio,
          longBio,
          yearsExperience,
          availability,
          audioLink,
          photoUrl,
          galleryUrls,
          videoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setExpanded(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <tr>
        <td className={td}>{m.name}</td>
        <td className={td}>{m.instrument}</td>
        <td className={td}>{m.region}</td>
        <td className={td}>{m.type}</td>
        <td className={td}>{m.vetted ? "Yes" : "No"}</td>
        <td className={td}>
          <FeatureMusicianButton id={m.id} featured={m.featured} />
        </td>
        <td className={td}>{m.stripe_onboarded ? "Connected" : "Not connected"}</td>
        <td className={td}>
          <a href={`/musicians/${m.slug}`} target="_blank" className="text-accent hover:underline">
            View &rarr;
          </a>
        </td>
        <td className={td}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded((cur) => !cur)}
              className="text-mid hover:text-accent underline underline-offset-2"
            >
              {expanded ? "Close" : "Edit"}
            </button>
            <RemoveMusicianButton id={m.id} name={m.name} />
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td className={td} colSpan={9}>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Profile URL slug</label>
                  <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Region</label>
                  <input className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Years experience</label>
                  <input
                    className={inputClass}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Bio (short, shown on gallery card)</label>
                <textarea rows={2} className={inputClass} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Long bio (shown on full profile)</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={longBio}
                  onChange={(e) => setLongBio(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Rate from ($)</label>
                  <input
                    type="number"
                    disabled={rateUnit === "By enquiry"}
                    className={`${inputClass} disabled:opacity-40 disabled:bg-off/60`}
                    value={rateFrom}
                    onChange={(e) => setRateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Rate unit</label>
                  <select className={inputClass} value={rateUnit} onChange={(e) => setRateUnit(e.target.value)}>
                    <option value="per event">Per event</option>
                    <option value="per 60min lesson">Per 60min lesson</option>
                    <option value="By enquiry">By enquiry (no public number)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Availability (shown on public profile, optional)</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Weekday evenings, most weekends"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Spotify or other music link (optional)</label>
                <input
                  className={inputClass}
                  placeholder="https://open.spotify.com/..."
                  value={audioLink}
                  onChange={(e) => setAudioLink(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Available for</label>
                <div className="flex flex-wrap gap-4">
                  {ALL_OCCASIONS.map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={occasions.includes(o)}
                        onChange={() => toggleOccasion(o)}
                        className="accent-accent"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={vetted}
                  onChange={(e) => setVetted(e.target.checked)}
                  className="accent-accent"
                />
                Police vetting confirmed
              </label>

              <div>
                <label className={labelClass}>Replace profile photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPhoto(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
                {newPhoto && <p className="text-xs text-mid mt-1">{newPhoto.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Add gallery photos (optional, select multiple)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewGalleryPhotos(Array.from(e.target.files ?? []))}
                  className="text-sm"
                />
                {newGalleryPhotos.length > 0 && (
                  <p className="text-xs text-mid mt-1">{newGalleryPhotos.length} new photo(s) selected</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Replace profile video (optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
                {newVideo && <p className="text-xs text-mid mt-1">{newVideo.name}</p>}
              </div>

              {error && <p className="text-xs text-accent">{error}</p>}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={submitting}
                  className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-2.5 px-6 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  disabled={submitting}
                  className="text-xs tracking-[0.1em] uppercase text-mid py-2.5 px-2 hover:text-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
