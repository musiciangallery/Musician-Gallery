"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ALL_INSTRUMENTS as INSTRUMENTS, ALL_REGIONS as REGIONS } from "@/lib/musicians";

const inputClass =
  "w-full border border-rule bg-w px-4 py-3 text-sm focus:outline-none focus:border-accent";
const labelClass = "text-xs tracking-[0.08em] uppercase text-mid block mb-2";
const hintClass = "text-[11px] text-mid mt-2";

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

export default function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [previousWorkFiles, setPreviousWorkFiles] = useState<File[]>([]);
  const [vettingCertificateFile, setVettingCertificateFile] = useState<File | null>(null);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleMulti = (field: "instruments" | "lessonLength" | "studentLevel" | "availableAs" | "genre", value: string) => {
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
    setSubmitting(true);
    setError(null);
    try {
      // Upload files straight from the browser to Blob storage first.
      // Serverless functions reject request bodies over ~4.5MB, which a
      // real phone photo or video easily exceeds — going direct to
      // storage avoids that limit entirely, since only the resulting
      // small URL gets sent through the form submission below.
      const previousWorkFileUrls: string[] = [];
      for (const file of previousWorkFiles) {
        const blob = await upload(`${Date.now()}-${sanitizeFilename(file.name)}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        previousWorkFileUrls.push(blob.url);
      }

      // Teacher applicants only, and optional — the CVCheck Police Vetting
      // Check can take weeks to come back, so applicants shouldn't be
      // blocked from applying while they wait. They can upload it now if
      // they already have it, or send it through later.
      let vettingCertificateUrl = "";
      if (vettingCertificateFile) {
        const blob = await upload(
          `vetting-${Date.now()}-${sanitizeFilename(vettingCertificateFile.name)}`,
          vettingCertificateFile,
          { access: "public", handleUploadUrl: "/api/upload" }
        );
        vettingCertificateUrl = blob.url;
      }

      const body = new FormData();
      body.set("name", form.name);
      body.set("email", form.email);
      body.set("region", form.region);
      body.set("type", form.type);
      body.set("bio", form.bio);
      body.set("previousWork", form.previousWork);
      body.set("yearsExperience", form.yearsExperience);
      body.set("travel", form.travel);
      body.set("lessonFormat", form.lessonFormat);
      body.set("soundSystem", form.soundSystem);
      body.set("instruments", JSON.stringify(form.instruments));
      body.set("lessonLength", JSON.stringify(form.lessonLength));
      body.set("studentLevel", JSON.stringify(form.studentLevel));
      body.set("availableAs", JSON.stringify(form.availableAs));
      body.set("genre", JSON.stringify(form.genre));
      body.set("previousWorkFileUrls", JSON.stringify(previousWorkFileUrls));
      body.set("vettingCertificateNumber", form.vettingCertificateNumber);
      if (vettingCertificateUrl) body.set("vettingCertificateUrl", vettingCertificateUrl);

      const res = await fetch("/api/musician-applications", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const needsVetting = form.type !== "Event Musician";
    return (
      <div className="text-center py-16 border border-rule">
        <p className="eyebrow mb-4">Application received</p>
        <h2 className="font-serif text-3xl mb-4">Welcome to the gallery.</h2>
        <p className="text-sm text-mid max-w-sm mx-auto">
          {needsVetting
            ? "We'll be in touch once your application review is complete, then your profile goes live."
            : "We'll review your application and be in touch shortly to get your profile live."}
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

          <div className="bg-off/60 border border-rule p-4 text-sm leading-relaxed">
            <p className="mb-2">
              Teachers need a CVCheck Police Vetting Check before their
              profile goes live. You can{" "}
              
                href="https://cvcheck.com/nz/police-vetting/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-accent"
              >
                order one here &rarr;
              </a>{" "}
              ($70.16 incl GST, typically around 20 working days — we&rsquo;ll
              reimburse the cost once you complete your first booking).
            </p>
            <p className={hintClass}>
              Don&rsquo;t have it yet? No problem, submit your application
              now and send it through once it arrives.
            </p>
          </div>

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

      {isEvent && (
        <div className="border-t border-rule pt-8 space-y-6">
          <p className="eyebrow">Event details</p>
          <div>
            <label className={labelClass}>Available as</label>
            <CheckboxGroup
              options={AVAILABLE_AS}
              selected={form.availableAs}
              onToggle={(v) => toggleMulti("availableAs", v)}
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
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setPreviousWorkFiles(Array.from(e.target.files ?? []))}
          className="text-sm mt-3"
        />
        {previousWorkFiles.length > 0 && (
          <p className={hintClass}>{previousWorkFiles.length} file(s) selected</p>
        )}
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
      <p className="text-[10px] text-mid leading-relaxed">
        Free to list, zero commission. Submit your details to get started.
      </p>
    </form>
  );
}
