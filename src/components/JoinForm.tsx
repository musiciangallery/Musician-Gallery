"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ALL_INSTRUMENTS as INSTRUMENTS, ALL_REGIONS as REGIONS, AVAILABILITY_TAGS } from "@/lib/musicians";

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";
const hintClass = "text-xs text-mid mt-2";

const YEARS_EXPERIENCE = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const LESSON_FORMATS = ["In-person only", "Online Only", "In-person and online"];

const LESSON_LENGTHS = ["30 minutes", "45 minutes", "60 minutes", "75 minutes", "90 minutes"];

const STUDENT_LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

const TRAVEL_OPTIONS = ["Yes - travel costs may apply", "No"];

const AVAILABLE_AS = ["Solo", "Duo", "Trio", "Quartet", "Band"];

const GENRES = [
  "Classical",
  "Country",
  "Folk",
  "Jazz",
  "Latin",
  "Musical Theatre",
  "Pop",
  "R&B / Soul",
  "Rock",
  "Wedding / Ceremony",
  "Other",
];

const SOUND_SYSTEM = ["Yes", "No"];

// Raw filenames from a phone or camera (spaces, brackets, apostrophes,
// "copy" suffixes, etc.) can fail Blob storage's pathname validation.
// Strip anything that isn't a safe character before using it as a path.
function sanitizeFilename(name: string): string {
  const safe = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return safe || "file";
}

type FormState = {
  name: string;
  email: string;
  region: string;
  instruments: string[];
  bio: string;
  previousWork: string;
  yearsExperience: string;
  type: string;
  travel: string;
  availabilityTags: string[];
  availability: string;
  audioLink: string;
  eventRateFrom: string;
  eventRateByEnquiry: boolean;
  lessonRateFrom: string;
  lessonRateByEnquiry: boolean;
  lessonFormat: string;
  lessonLength: string[];
  studentLevel: string[];
  availableAs: string[];
  genre: string[];
  soundSystem: string;
  vettingCertificateNumber: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  region: "",
  instruments: [],
  bio: "",
  previousWork: "",
  yearsExperience: "",
  type: "Event Musician",
  travel: "",
  availabilityTags: [],
  availability: "",
  audioLink: "",
  eventRateFrom: "",
  eventRateByEnquiry: false,
  lessonRateFrom: "",
  lessonRateByEnquiry: false,
  lessonFormat: "",
  lessonLength: [],
  studentLevel: [],
  availableAs: [],
  genre: [],
  soundSystem: "",
  vettingCertificateNumber: "",
};

function CheckboxGroup({
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-x-4 gap-y-2 ${
        columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"
      }`}
    >
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="accent-accent"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function JoinForm({
  onSubmitted,
}: {
  onSubmitted?: () => void;
} = {}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  // Split into separate photo/video selections rather than one input
  // accepting both. iOS Safari's file picker silently drops multi-select
  // when `accept` spans more than one media category (e.g. "image/*,video/*"
  // together) — even with the `multiple` attribute set, it only lets you
  // choose one file. Keeping each input to a single category is the
  // reliable fix and matches how iOS's own Photos picker behaves.
  const [previousWorkPhotos, setPreviousWorkPhotos] = useState<File[]>([]);
  const [previousWorkVideos, setPreviousWorkVideos] = useState<File[]>([]);
  const [vettingCertificateFile, setVettingCertificateFile] = useState<File | null>(null);
  const [contentEditConsent, setContentEditConsent] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleMulti = (field: "instruments" | "lessonLength" | "studentLevel" | "availableAs" | "genre" | "availabilityTags", value: string) => {
    setForm((f) => {
      const current = f[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, [field]: next };
    });
  };

  const isTeacher = form.type === "Teacher" || form.type === "Teacher & Events";
  const isEvent = form.type === "Event Musician" || form.type === "Teacher & Events";

  // The confirmation message is much shorter than the full form. Without
  // this, submitting from partway down the long form leaves the page at
  // its old scroll position, so the confirmation can land looking cut off
  // or oddly placed against the nav instead of settling into view.
  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitted]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (previousWorkPhotos.length === 0) {
      setError("Please upload at least one photo before submitting your application.");
      return;
    }
    if (!contentEditConsent) {
      setError("Please confirm permission for minor edits before submitting your application.");
      return;
    }
    if (!ageConfirmed) {
      setError("Please confirm you are 16 years of age or older before submitting your application.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Upload files straight from the browser to Blob storage first.
      // Serverless functions reject request bodies over ~4.5MB, which a
      // real phone photo or video easily exceeds — going direct to
      // storage avoids that limit entirely, since only the resulting
      // small URL gets sent through the form submission below. All files
      // (portfolio photos/videos, plus the vetting certificate if present)
      // upload in parallel rather than one at a time — a few photos or a
      // video uploaded sequentially could add up to a long wait before the
      // applicant sees the confirmation screen.
      const previousWorkFiles = [...previousWorkPhotos, ...previousWorkVideos];
      const uploadPromises: Promise<string>[] = previousWorkFiles.map(async (file) => {
        const blob = await upload(`${Date.now()}-${sanitizeFilename(file.name)}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        return blob.url;
      });

      // Teacher applicants only, and optional — the CVCheck Police Vetting
      // Check can take weeks to come back, so applicants shouldn't be
      // blocked from applying while they wait. They can upload it now if
      // they already have it, or send it through later.
      const vettingUploadPromise: Promise<string> | null = vettingCertificateFile
        ? upload(
            `vetting-${Date.now()}-${sanitizeFilename(vettingCertificateFile.name)}`,
            vettingCertificateFile,
            { access: "public", handleUploadUrl: "/api/upload" }
          ).then((blob) => blob.url)
        : null;

      const [previousWorkFileUrls, vettingCertificateUrl] = await Promise.all([
        Promise.all(uploadPromises),
        vettingUploadPromise ?? Promise.resolve(""),
      ]);

      const body = new FormData();
      body.set("name", form.name);
      body.set("email", form.email);
      body.set("region", form.region);
      body.set("type", form.type);
      body.set("bio", form.bio);
      body.set("previousWork", form.previousWork);
      body.set("yearsExperience", form.yearsExperience);
      body.set("travel", form.travel);
      body.set("availability", form.availability);
      body.set("availabilityTags", JSON.stringify(form.availabilityTags));
      body.set("audioLink", form.audioLink);
      body.set("eventRateFrom", form.eventRateByEnquiry ? "" : form.eventRateFrom);
      body.set("eventRateUnit", form.eventRateByEnquiry ? "By enquiry" : "per event");
      body.set("lessonRateFrom", form.lessonRateByEnquiry ? "" : form.lessonRateFrom);
      body.set("lessonRateUnit", form.lessonRateByEnquiry ? "By enquiry" : "per 60min lesson");
      body.set("lessonFormat", form.lessonFormat);
      body.set("soundSystem", form.soundSystem);
      body.set("instruments", JSON.stringify(form.instruments));
      body.set("lessonLength", JSON.stringify(form.lessonLength));
      body.set("studentLevel", JSON.stringify(form.studentLevel));
      body.set("availableAs", JSON.stringify(form.availableAs));
      body.set("genre", JSON.stringify(form.genre));
      body.set("previousWorkFileUrls", JSON.stringify(previousWorkFileUrls));
      body.set("photoCount", String(previousWorkPhotos.length));
      body.set("vettingCertificateNumber", form.vettingCertificateNumber);
      if (vettingCertificateUrl) body.set("vettingCertificateUrl", vettingCertificateUrl);
      body.set("contentEditConsent", String(contentEditConsent));
      body.set("ageConfirmed", String(ageConfirmed));

      const res = await fetch("/api/musician-applications", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 border border-rule">
        <p className="eyebrow mb-4">Application received</p>
        <h2 className="font-serif text-3xl mb-4">Welcome to the gallery.</h2>
        <p className="text-sm text-mid max-w-sm mx-auto">
          We&rsquo;ll review your application and be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Name</label>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Region</label>
          <select
            required
            className={inputClass}
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
          >
            <option value="" disabled>
              Select your region
            </option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>I am a</label>
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option>Event Musician</option>
            <option>Teacher</option>
            <option>Teacher &amp; Events</option>
          </select>
        </div>
      </div>

      {isTeacher && (
        <div className="bg-off/60 border border-rule p-4 text-sm leading-relaxed">
          <p className="mb-4">
            Teacher profiles carry a Police Vetted badge and only go live
            once vetting is complete. Getting vetted starts with a Police
            Vetting Check through CVCheck. A one-off cost of $81.40
            including GST and generally claimable as a business expense.
            You can{" "}
            <a href="https://cvcheck.com/nz/police-vetting/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">order one here &rarr;</a>.
          </p>
          <p>
            Don&rsquo;t have it yet? No problem. Submit your application now,
            and your Teacher profile will go live once your certificate is
            sent through to contact@musiciangallery.co.nz. There&rsquo;s
            more on completing this on the Musician Toolkit Page.
          </p>
        </div>
      )}

      {isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Vetting certificate number (optional, if you have it)</label>
            <input
              className={inputClass}
              placeholder="e.g. the certificate number on your CVCheck report"
              value={form.vettingCertificateNumber}
              onChange={(e) => update("vettingCertificateNumber", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Upload vetting certificate (optional)</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setVettingCertificateFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {vettingCertificateFile && (
              <p className={hintClass}>{vettingCertificateFile.name}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Instrument(s)</label>
        <CheckboxGroup
          options={INSTRUMENTS}
          selected={form.instruments}
          onToggle={(v) => toggleMulti("instruments", v)}
          columns={3}
        />
      </div>

      <div>
        <label className={labelClass}>Years of experience</label>
        <select
          required
          className={inputClass}
          value={form.yearsExperience}
          onChange={(e) => update("yearsExperience", e.target.value)}
        >
          <option value="" disabled>
            Select one
          </option>
          {YEARS_EXPERIENCE.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {isTeacher && (
        <div className="border-t border-rule pt-8 space-y-6">
          <p className="eyebrow">Teaching details</p>
          <div>
            <label className={labelClass}>Lesson format</label>
            <select
              className={inputClass}
              value={form.lessonFormat}
              onChange={(e) => update("lessonFormat", e.target.value)}
            >
              <option value="" disabled>
                Select one
              </option>
              {LESSON_FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Lesson length</label>
            <CheckboxGroup
              options={LESSON_LENGTHS}
              selected={form.lessonLength}
              onToggle={(v) => toggleMulti("lessonLength", v)}
            />
          </div>
          <div>
            <label className={labelClass}>Student level</label>
            <CheckboxGroup
              options={STUDENT_LEVELS}
              selected={form.studentLevel}
              onToggle={(v) => toggleMulti("studentLevel", v)}
            />
          </div>
        </div>
      )}

      {isEvent && (
        <div className="border-t border-rule pt-8 space-y-6">
          <p className="eyebrow">Event details</p>
          <div>
            <label className={labelClass}>Available as</label>
            <CheckboxGroup
              options={AVAILABLE_AS}
              selected={form.availableAs}
              onToggle={(v) => toggleMulti("availableAs", v)}
              columns={3}
            />
          </div>
          <div>
            <label className={labelClass}>Genre</label>
            <CheckboxGroup
              options={GENRES}
              selected={form.genre}
              onToggle={(v) => toggleMulti("genre", v)}
              columns={3}
            />
          </div>
          <div>
            <label className={labelClass}>Sound system available</label>
            <select
              className={inputClass}
              value={form.soundSystem}
              onChange={(e) => update("soundSystem", e.target.value)}
            >
              <option value="" disabled>
                Select one
              </option>
              {SOUND_SYSTEM.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="border-t border-rule pt-8">
        <label className={labelClass}>Willing to travel</label>
        <select
          className={inputClass}
          value={form.travel}
          onChange={(e) => update("travel", e.target.value)}
        >
          <option value="" disabled>
            Select one
          </option>
          {TRAVEL_OPTIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {isTeacher && (
        <div className="border-t border-rule pt-8">
          <label className={labelClass}>Your indicative lesson rate ($ per 60min lesson)</label>
          <input
            type="number"
            min="0"
            disabled={form.lessonRateByEnquiry}
            className={`${inputClass} disabled:opacity-40 disabled:bg-off/60`}
            placeholder="e.g. 80"
            value={form.lessonRateFrom}
            onChange={(e) => update("lessonRateFrom", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={form.lessonRateByEnquiry}
              onChange={(e) => update("lessonRateByEnquiry", e.target.checked)}
              className="accent-accent"
            />
            I&rsquo;d rather not list a public number, show &ldquo;By enquiry&rdquo; instead
          </label>
          <p className="text-xs text-mid mt-2">
            This is a starting point. After gathering more information from
            potential students, you will be able to confirm a final quote.
          </p>
        </div>
      )}

      {isEvent && (
        <div className="border-t border-rule pt-8">
          <label className={labelClass}>Your indicative event rate ($ per event)</label>
          <input
            type="number"
            min="0"
            disabled={form.eventRateByEnquiry}
            className={`${inputClass} disabled:opacity-40 disabled:bg-off/60`}
            placeholder="e.g. 350"
            value={form.eventRateFrom}
            onChange={(e) => update("eventRateFrom", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={form.eventRateByEnquiry}
              onChange={(e) => update("eventRateByEnquiry", e.target.checked)}
              className="accent-accent"
            />
            I&rsquo;d rather not list a public number, show &ldquo;By enquiry&rdquo; instead
          </label>
          <p className="text-xs text-mid mt-2">
            This is a starting point. After gathering more information from
            potential clients, you will be able to confirm a final quote.
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>General availability (optional)</label>
        <CheckboxGroup
          options={AVAILABILITY_TAGS}
          selected={form.availabilityTags}
          onToggle={(v) => toggleMulti("availabilityTags", v)}
        />
        <p className="text-xs text-mid mt-2">
          Shown as tags on your public profile, a rough guide only, not a
          real-time calendar. Clients still individually request specific
          dates, and you confirm each one.
        </p>
        <input
          className={`${inputClass} mt-3`}
          placeholder="Anything else about your availability (optional), e.g. not available in December"
          value={form.availability}
          onChange={(e) => update("availability", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>A little about you</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Previous work</label>
        <input
          className={inputClass}
          placeholder="Links to videos, photos, recordings (YouTube, Instagram, SoundCloud...)"
          value={form.previousWork}
          onChange={(e) => update("previousWork", e.target.value)}
        />
        <p className={hintClass}>
          Paste links to anything that shows off your playing, and/or upload
          files directly below.
        </p>
        <label className={`${labelClass} mt-4`}>Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const newFiles = Array.from(e.target.files ?? []);
            // Add to what's already selected rather than replacing it —
            // choosing files again (e.g. to add one more) would otherwise
            // silently wipe out an earlier selection.
            setPreviousWorkPhotos((cur) => [...cur, ...newFiles]);
            e.target.value = "";
          }}
          className="text-sm"
        />
        <p className={hintClass}>At least one photo is required.</p>
        {previousWorkPhotos.length > 0 && (
          <ul className={`${hintClass} space-y-1`}>
            {previousWorkPhotos.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviousWorkPhotos((cur) => cur.filter((_, idx) => idx !== i))
                  }
                  className="text-accent hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className={`${labelClass} mt-4`}>Videos</label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => {
            const newFiles = Array.from(e.target.files ?? []);
            setPreviousWorkVideos((cur) => [...cur, ...newFiles]);
            e.target.value = "";
          }}
          className="text-sm"
        />
        {previousWorkVideos.length > 0 && (
          <ul className={`${hintClass} space-y-1`}>
            {previousWorkVideos.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviousWorkVideos((cur) => cur.filter((_, idx) => idx !== i))
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
        <label className={labelClass}>Spotify or other music link (optional)</label>
        <input
          className={inputClass}
          placeholder="https://open.spotify.com/..."
          value={form.audioLink}
          onChange={(e) => update("audioLink", e.target.value)}
        />
        <p className="text-xs text-mid mt-1">
          A Spotify link shows as a playable embed on your profile. Any other
          link (SoundCloud, Bandcamp, YouTube, etc.) shows as a plain
          &quot;Listen&quot; link instead.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-2 text-xs text-mid leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={contentEditConsent}
            onChange={(e) => setContentEditConsent(e.target.checked)}
            className="accent-accent mt-0.5"
          />
          I give Musician Gallery permission to make minor edits to my
          biography and profile photo for consistency before my profile
          goes live.
        </label>

        <label className="flex items-start gap-2 text-xs text-mid leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="accent-accent mt-0.5"
          />
          I confirm I am 16 years of age or older.
        </label>
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
      <p className="text-xs text-mid leading-relaxed">
        Free to list, zero commission. Submit your details to get started.
      </p>
    </form>
  );
}
