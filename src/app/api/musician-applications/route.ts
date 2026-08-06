import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { sendApplicationReceivedEmail, sendNewApplicationOwnerEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = await sql`SELECT * FROM musician_applications ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const name = form.get("name");
    const email = form.get("email");
    const region = form.get("region");
    const type = form.get("type");
    const bio = form.get("bio");
    const previousWork = form.get("previousWork");
    const yearsExperience = form.get("yearsExperience");
    const travel = form.get("travel");
    const availability = form.get("availability");
    const availabilityTags = parseJsonArray(form.get("availabilityTags"));
    const audioLink = form.get("audioLink");
    // Event rate and lesson rate are independent fields (not one shared
    // rate), since a Teacher & Events applicant needs to state both rather
    // than being forced to pick just one. See lib/db.ts for the schema
    // reasoning.
    const eventRateFromRaw = form.get("eventRateFrom");
    const eventRateUnit = form.get("eventRateUnit");
    const lessonRateFromRaw = form.get("lessonRateFrom");
    const lessonRateUnit = form.get("lessonRateUnit");
    const lessonFormat = form.get("lessonFormat");
    const soundSystem = form.get("soundSystem");
    const instrumentList = parseJsonArray(form.get("instruments"));
    const lessonLength = parseJsonArray(form.get("lessonLength"));
    const studentLevel = parseJsonArray(form.get("studentLevel"));
    const availableAs = parseJsonArray(form.get("availableAs"));
    const genre = parseJsonArray(form.get("genre"));
    // Applicant-uploaded photos/videos showing previous work — reference
    // material for review, separate from the curated profile photo/gallery
    // that gets uploaded during approval. The browser uploads these
    // directly to Blob storage (see /api/upload) before this form is
    // submitted, so this route only ever receives the resulting URLs,
    // never the file bytes — that keeps large files well clear of the
    // ~4.5MB request body limit serverless functions enforce.
    const fileUrls = parseJsonArray(form.get("previousWorkFileUrls"));
    // Sent separately from previousWorkFileUrls (which also includes any
    // uploaded videos) so this route can confirm at least one photo came
    // through, without needing to guess which URLs are photos vs videos.
    // Enforced here too, not just in JoinForm.tsx, in case that check is
    // ever bypassed.
    const photoCountRaw = form.get("photoCount");
    const photoCount = typeof photoCountRaw === "string" ? parseInt(photoCountRaw, 10) : 0;
    // Teacher applicants only, both optional — the CVCheck Police Vetting
    // Check can take weeks, so applicants aren't blocked from applying
    // while they wait on it.
    const vettingCertificateUrl = form.get("vettingCertificateUrl");
    const vettingCertificateNumber = form.get("vettingCertificateNumber");
    // Required consent for Musician Gallery to make minor edits to the
    // applicant's biography and profile photo before their profile goes
    // live. Enforced here too, not just in JoinForm.tsx, in case that
    // check is ever bypassed.
    const contentEditConsent = form.get("contentEditConsent") === "true";
    // Required confirmation that the applicant is at least 16 (see Terms
    // 3.1 and Privacy Section 9). Enforced here too, not just in
    // JoinForm.tsx, in case that check is ever bypassed.
    const ageConfirmed = form.get("ageConfirmed") === "true";

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof region !== "string" ||
      instrumentList.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!photoCount || photoCount < 1) {
      return NextResponse.json(
        { error: "Please upload at least one photo before submitting your application." },
        { status: 400 }
      );
    }

    if (!contentEditConsent) {
      return NextResponse.json(
        { error: "Please confirm permission for minor edits before submitting your application." },
        { status: 400 }
      );
    }

    if (!ageConfirmed) {
      return NextResponse.json(
        { error: "Please confirm you are 16 years of age or older before submitting your application." },
        { status: 400 }
      );
    }

    const eventRateFrom =
      typeof eventRateFromRaw === "string" && eventRateFromRaw.trim()
        ? parseInt(eventRateFromRaw, 10)
        : null;
    const lessonRateFrom =
      typeof lessonRateFromRaw === "string" && lessonRateFromRaw.trim()
        ? parseInt(lessonRateFromRaw, 10)
        : null;

    await ensureTables();
    const sql = getSql();
    const id = randomUUID();
    await sql`
      INSERT INTO musician_applications
        (id, name, email, instrument, instruments, region, type, bio, status,
         previous_work, previous_work_files, years_experience, travel, availability, availability_tags, audio_link, lesson_format, lesson_length,
         student_level, available_as, genre, sound_system, vetting_certificate_url, vetting_certificate_number,
         rate_from, rate_unit, teaching_rate_from, teaching_rate_unit,
         content_edit_consent, content_edit_consent_at, age_confirmed, age_confirmed_at)
      VALUES
        (${id}, ${name}, ${email}, ${instrumentList.join(", ")}, ${instrumentList},
         ${region}, ${typeof type === "string" ? type : "Event Musician"}, ${typeof bio === "string" ? bio : ""}, 'pending_review',
         ${typeof previousWork === "string" ? previousWork : ""}, ${fileUrls},
         ${typeof yearsExperience === "string" ? yearsExperience : ""},
         ${typeof travel === "string" ? travel : ""},
         ${typeof availability === "string" ? availability : ""},
         ${availabilityTags},
         ${typeof audioLink === "string" ? audioLink : ""},
         ${typeof lessonFormat === "string" ? lessonFormat : ""}, ${lessonLength},
         ${studentLevel}, ${availableAs}, ${genre},
         ${typeof soundSystem === "string" ? soundSystem : ""},
         ${typeof vettingCertificateUrl === "string" ? vettingCertificateUrl : ""},
         ${typeof vettingCertificateNumber === "string" ? vettingCertificateNumber : ""},
         ${eventRateFrom}, ${typeof eventRateUnit === "string" ? eventRateUnit : ""},
         ${lessonRateFrom}, ${typeof lessonRateUnit === "string" ? lessonRateUnit : ""},
         ${contentEditConsent}, now(), ${ageConfirmed}, now())
    `;

    // Sent after the response is returned (via after()) rather than
    // awaited here — the applicant is watching for the confirmation
    // screen right after clicking submit, so there's no reason to make
    // them wait on an email round-trip that isn't part of what they're
    // waiting to see. Best-effort either way: a failed or unconfigured
    // send should never affect an application that already saved.
    after(async () => {
      try {
        await sendApplicationReceivedEmail({ name, email });
      } catch (emailErr) {
        console.error("Application received email failed:", emailErr);
      }
      try {
        await sendNewApplicationOwnerEmail({
          name,
          email,
          type: typeof type === "string" ? type : "Event Musician",
          instrument: instrumentList.join(", "),
        });
      } catch (emailErr) {
        console.error("New application owner email failed:", emailErr);
      }
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
