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
  availability: string | null;
  audio_link: string | null;
  lesson_format: string | null;
  lesson_length: string[] | null;
  student_level: string[] | null;
  available_as: string[] | null;
  genre: string[] | null;
  sound_system: string | null;
  vetting_certificate_url: string | null;
  vetting_certificate_number: string | null;
  rate_from: number | null;
  rate_unit: string | null;
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
  const [rateFrom, setRateFrom] = useState(a.rate_from != null ? String(a.rate_from) : "");
  const [rateUnit, setRateUnit] = useState(
    a.rate_unit || (isTeacher ? "per lesson" : "per event")
  );
  const [availability, setAvailability] = useState(a.availability || "");
  const [audioLink, setAudioLink] = useState(a.audio_link || "");
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
  // Lets an admin reuse one of the applicant's own uploaded files as the
  // profile photo directly, instead of downloading it and re-uploading it
  // through the file input below. Holds the already-uploaded Blob URL —
  // approve() skips a fresh upload and uses this URL as-is when set.
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [vettingCertUrl, setVettingCertUrl] = useState(a.vetting_certificate_url || "");
  const [vettingCertNumber, setVettingCertNumber] = useState(a.vetting_certificate_number || "");
  const [savingVetting, setSavingVetting] = useState(false);
  const [vettingSaved, setVettingSaved] = useState(false);

  const toggleOccasion = (o: string) =>
    setOccasions((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  const instruments = a.instruments?.length ? a.instruments : a.instrument ? [a.instrument] : [];

  // A Teacher listing can only go live once a real certificate is on file —
  // checked against the saved application record (a.vetting_certificate_*),
  // not the in-progress text fields, so an admin can't publish on the back
  // of a number they've typed but not yet saved.
  const hasCertificate = Boolean(
    a.vetting_certificate_url?.trim() || a.vetting_certificate_number?.trim()
  );

  async function approve() {
    setError(null);
    if (!photo && !existingPhotoUrl) {
      setError("Please upload a photo before approving.");
      return;
    }
    if (isTeacher && !hasCertificate) {
      setError(
        "Save a vetting certificate (link or number) for this applicant before publishing a Teacher profile."
      );
      return;
    }
    if (isTeacher && !vetted) {
      setError(
        "Tick \"Police vetting confirmed\" before publishing a Teacher profile."
      );
      return;
    }
    setSubmitting("approve");
    try {
      // Upload files straight from the browser to Blob storage first.
      // Serverless functions reject request bodies over ~4.5MB, which
      // real camera photos and video easily exceed — going direct to
      // storage avoids that limit entirely, since only the resulting
      // URLs get sent to the approve route below.
      // If an existing uploaded file was chosen as the profile photo, it's
      // already on Blob storage — reuse that URL instead of re-uploading.
      let photoUrl: string;
      if (photo) {
        const photoBlob = await upload(`musicians/${slug}-${Date.now()}`, photo, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        photoUrl = photoBlob.url;
      } else {
        photoUrl = existingPhotoUrl!;
      }

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
      form.set("rateFrom", rateUnit === "By enquiry" ? "" : rateFrom);
      form.set("rateUnit", rateUnit);
      form.set("bio", bio);
      form.set("longBio", longBio);
      form.set("yearsExperience", yearsExperience);
      form.set("availability", availability);
      form.set("audioLink", audioLink);
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
      {a.availability && (
        <p className="text-mid mb-3">
          <span className="block text-[10px] uppercase tracking-[0.08em]">
            Availability (applicant-stated)
          </span>
          {a.availability}
        </p>
      )}
      {a.audio_link && (
        <p className="text-mid mb-3">
          <span className="block text-[10px] uppercase tracking-[0.08em]">Music link</span>
          <a href={a.audio_link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {a.audio_link}
          </a>
        </p>
      )}
      {a.previous_work_files && a.previous_work_files.length > 0 && (
        <div className="text-mid mb-3">
          <span className="block text-[10px] uppercase tracking-[0.08em] mb-1">Uploaded files</span>
          <div className="flex flex-wrap gap-3">
            {a.previous_work_files.map((url, i) => (
              <span key={url} className="flex items-center gap-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs">
                  File {i + 1} &rarr;
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setExistingPhotoUrl(url);
                    setPhoto(null);
                    setExpanded(true);
                  }}
                  className="text-[10px] tracking-[0.05em] uppercase border border-rule px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
                >
                  Use as profile photo
                </button>
              </span>
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
                disabled={rateUnit === "By enquiry"}
                className={`${inputClass} disabled:opacity-40 disabled:bg-off/60`}
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
                <option value="By enquiry">By enquiry (no public number)</option>
              </select>
            </div>
          </div>
          {a.rate_from != null || a.rate_unit === "By enquiry" ? (
            <p className="text-[11px] text-mid -mt-2">
              Applicant requested:{" "}
              {a.rate_unit === "By enquiry"
                ? "by enquiry"
                : `$${a.rate_from} ${a.rate_unit ?? ""}`}
            </p>
          ) : null}

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
              <label
                className={`flex items-center gap-2 text-sm ${
                  hasCertificate ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={vetted}
                  disabled={!hasCertificate}
                  onChange={(e) => setVetted(e.target.checked)}
                  className="accent-accent"
                />
                Police vetting confirmed
              </label>
              {!hasCertificate && (
                <p className="text-[11px] text-accent leading-relaxed">
                  Save a certificate link or number above first — a Teacher
                  profile can&rsquo;t be published without one on file.
                </p>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Profile photo (upload a treated, muted photo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] ?? null);
                setExistingPhotoUrl(null);
              }}
              className="text-sm"
            />
            {photo && (
              <p className="text-xs text-mid mt-1 flex items-center gap-2">
                {photo.name}
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="text-accent hover:underline"
                >
                  Remove
                </button>
              </p>
            )}
            {existingPhotoUrl && !photo && (
              <p className="text-xs text-mid mt-1 flex items-center gap-2">
                Using an uploaded file as the profile photo —{" "}
                <a
                  href={existingPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  preview
                </a>
                <button
                  type="button"
                  onClick={() => setExistingPhotoUrl(null)}
                  className="text-accent hover:underline"
                >
                  Remove
                </button>
              </p>
            )}
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
              <ul className="text-xs text-mid mt-1 space-y-1">
                {galleryPhotos.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                    <span>{f.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryPhotos((cur) => cur.filter((_, idx) => idx !== i))
                      }
                      className="text-accent hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
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
            {video && (
              <p className="text-xs text-mid mt-1 flex items-center gap-2">
                {video.name}
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="text-accent hover:underline"
                >
                  Remove
                </button>
              </p>
            )}
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={approve}
              disabled={submitting !== null || (isTeacher && (!hasCertificate || !vetted))}
              title={
                isTeacher && (!hasCertificate || !vetted)
                  ? "Save a vetting certificate and confirm it before publishing a Teacher profile."
                  : undefined
              }
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
