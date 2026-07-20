"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

const inputClass =
  "w-full border border-rule bg-w px-3 py-2 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-[10px] tracking-[0.08em] uppercase text-mid block mb-1";

export type ApplicationForReview = {
  id: string;
  name: string;
  email: string;
  instrument: string;
  instruments: string[] | null;
  region: string;
  type: string;
  bio: string;
  status: string;
  created_at: string;
  previous_work: string | null;
  previous_work_files: string[] | null;
  years_experience: string | null;
  travel: string | null;
  lesson_format: string | null;
  lesson_length: string[] | null;
  student_level: string[] | null;
  available_as: string[] | null;
  genre: string[] | null;
  sound_system: string | null;
  vetting_certificate_url: string | null;
  vetting_certificate_number: string | null;
};

const ALL_OCCASIONS = ["Weddings", "Corporate Events", "Private Functions", "Lessons"];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ApplicationReviewCard({ a }: { a: ApplicationForReview }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = a.type === "Teacher" || a.type === "Teacher & Events";
  const isEvent = a.type === "Event Musician" || a.type === "Teacher & Events";

  const [slug, setSlug] = useState(slugify(a.name));
  const [bio, setBio] = useState(a.bio || "");
  const [longBio, setLongBio] = useState(a.bio || "");
  const [rateFrom, setRateFrom] = useState("");
  const [rateUnit, setRateUnit] = useState(isTeacher ? "per lesson" : "per event");
  const [vetted, setVetted] = useState(false);
  const [yearsExperience, setYearsExperience] = useState(a.years_experience || "");
  const [occasions, setOccasions] = useState<string[]>(
    isTeacher && isEvent
      ? ALL_OCCASIONS
      : isTeacher
      ? ["Lessons"]
      : ["Weddings", "Corporate Events", "Private Functions"]
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [vettingCertUrl, setVettingCertUrl] = useState(a.vetting_certificate_url || "");
  const [vettingCertNumber, setVettingCertNumber] = useState(a.vetting_certificate_number || "");
  const [savingVetting, setSavingVetting] = useState(false);
  const [vettingSaved, setVettingSaved] = useState(false);

  const toggleOccasion = (o: string) =>
    setOccasions((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  const instruments = a.instruments?.length ? a.instruments : a.instrument ? [a.instrument] : [];

  async function approve() {
    setError(null);
    if (!photo) {
      setError("Please upload a photo before approving.");
      return;
    }
    setSubmitting("approve");
    try {
      // Upload files straight from the browser to Blob storage first.
      // Serverless functions reject request bodies over ~4.5MB, which
      // real camera photos and video easily exceed — going direct to
      // storage avoids that limit entirely, since only the resulting
      // URLs get sent to the approve route below.
      const photoBlob = await upload(`musicians/${slug}-${Date.now()}`, photo, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      const photoUrl = photoBlob.url;

      const galleryUrls: string[] = [];
      for (const file of galleryPhotos) {
        const blob = await upload(`musicians/${slug}-gallery-${Date.now()}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        galleryUrls.push(blob.url);
      }

      let videoUrl: string | null = null;
      if (video) {
        const blob = await upload(`musicians/${slug}-video-${Date.now()}`, video, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        videoUrl = blob.url;
      }

      const form = new FormData();
      form.set("applicationId", a.id);
      form.set("slug", slug);
      form.set("name", a.name);
      form.set("email", a.email);
      form.set("instruments", JSON.stringify(instruments));
      form.set("region", a.region);
      form.set("type", a.type);
      form.set("occasions", JSON.stringify(occasions));
      form.set("vetted", String(vetted));
      form.set("rateFrom", rateFrom);
      form.set("rateUnit", rateUnit);
      form.set("bio", bio);
      form.set("longBio", longBio);
      form.set("yearsExperience", yearsExperience);
      form.set("photoUrl", photoUrl);
      form.set("galleryUrls", JSON.stringify(galleryUrls));
      if (videoUrl) form.set("videoUrl", videoUrl);

      const res = await fetch("/api/admin/approve", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(null);
    }
  }

  async function saveVetting() {
    setSavingVetting(true);
    setVettingSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/update-vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: a.id,
          vettingCertificateUrl: vettingCertUrl,
          vettingCertificateNumber: vettingCertNumber,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setVettingSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingVetting(false);
    }
  }

  async function decline() {
    setError(null);
    setSubmitting("decline");
    try {
      const res = await fetch("/api/admin/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: a.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="border border-rule p-5 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="font-serif text-xl">{a.name}</h3>
        <span className="text-[10px] tracking-[0.08em] uppercase text-mid">
          {new Date(a.created_at).toLocaleString()} · {a.status}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-mid mb-3">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.08em]">Email</span>
          {a.email}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-[0.08em]">Region</span>
          {a.region}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-[0.08em]">Type</span>
          {a.type}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-[0.08em]">Instrument(s)</span>
          {instruments.join(", ") || "—"}
        </div>
      </div>
      {a.bio && <p className="mb-3">{a.bio}</p>}
      {a.previous_work && (
        <p className="text-mid mb-3">
          <span className="block text-[10px] uppercase tracking-[0.08em]">Previous work</span>
          {a.previous_work}
        </p>
      )}
      {a.previous_work_files && a.previous_work_files.length > 0 && (
        <div className="text-mid mb-3">
          <span className="block text-[10px] uppercase tracking-[0.08em] mb-1">Uploaded files</span>
          <div className="flex flex-wrap gap-3">
            {a.previous_work_files.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs">
                File {i + 1} &rarr;
              </a>
            ))}
          </div>
        </div>
      )}

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs tracking-[0.08em] uppercase border border-rule px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          Review &amp; approve
        </button>
      ) : (
        <div className="border-t border-rule pt-4 mt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Profile URL slug</label>
              <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
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
            <textarea
              rows={2}
              className={inputClass}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
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
                className={inputClass}
                value={rateFrom}
                onChange={(e) => setRateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Rate unit</label>
              <select
                className={inputClass}
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
              >
                <option value="per event">per event</option>
                <option value="per lesson">per lesson</option>
              </select>
            </div>
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

          {isTeacher && (
            <div className="bg-off/60 border border-rule p-4 space-y-3">
              <p className="text-[10px] tracking-[0.08em] uppercase text-mid">
                CVCheck Police Vetting
              </p>

              {a.vetting_certificate_url && (
                <a href={a.vetting_certificate_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs block">View currently saved certificate &rarr;</a>
              )}

              <p className="text-[11px] text-mid leading-relaxed">
                Applicants can apply before their CVCheck comes back, since
                it can take weeks. If they email it to you later, paste the
                link and certificate number here and save — no need to wait
                for a full approval to record it.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Certificate link</label>
                  <input
                    className={inputClass}
                    placeholder="Link to the certificate (upload it somewhere and paste the URL)"
                    value={vettingCertUrl}
                    onChange={(e) => setVettingCertUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certificate number</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. the certificate number on the CVCheck report"
                    value={vettingCertNumber}
                    onChange={(e) => setVettingCertNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveVetting}
                  disabled={savingVetting}
                  className="text-xs tracking-[0.08em] uppercase border border-rule px-4 py-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {savingVetting ? "Saving..." : "Save certificate info"}
                </button>
                {vettingSaved && <span className="text-xs text-mid">Saved.</span>}
              </div>

              <a href="https://cvcheck.com/nz/verify-a-cvcheck-certificate/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs block">Verify this certificate on CVCheck &rarr;</a>
              <p className="text-[11px] text-mid leading-relaxed">
                Confirm the certificate is genuine on CVCheck&rsquo;s free
                verification tool before ticking the box below — the
                verification page should be on a cvcheck.com domain with
                their security seal next to the address bar.
              </p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={vetted}
                  onChange={(e) => setVetted(e.target.checked)}
                  className="accent-accent"
                />
                Police vetting confirmed
              </label>
            </div>
          )}

          <div>
            <label className={labelClass}>Profile photo (upload a treated, muted photo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          <div>
            <label className={labelClass}>Gallery photos (optional, select multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGalleryPhotos(Array.from(e.target.files ?? []))}
              className="text-sm"
            />
            {galleryPhotos.length > 0 && (
              <p className="text-xs text-mid mt-1">{galleryPhotos.length} photo(s) selected</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Profile video (optional)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {video && <p className="text-xs text-mid mt-1">{video.name}</p>}
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={approve}
              disabled={submitting !== null}
              className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-2.5 px-6 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {submitting === "approve" ? "Publishing..." : "Approve & publish"}
            </button>
            <button
              onClick={decline}
              disabled={submitting !== null}
              className="border border-rule text-xs tracking-[0.1em] uppercase py-2.5 px-6 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              {submitting === "decline" ? "Declining..." : "Decline"}
            </button>
            <button
              onClick={() => setExpanded(false)}
              disabled={submitting !== null}
              className="text-xs tracking-[0.1em] uppercase text-mid py-2.5 px-2 hover:text-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
