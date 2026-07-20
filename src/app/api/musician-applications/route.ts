import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";

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
    // Teacher applicants only, both optional — the CVCheck Police Vetting
    // Check can take weeks, so applicants aren't blocked from applying
    // while they wait on it.
    const vettingCertificateUrl = form.get("vettingCertificateUrl");
    const vettingCertificateNumber = form.get("vettingCertificateNumber");

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof region !== "string" ||
      instrumentList.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await ensureTables();
    const sql = getSql();
    const id = randomUUID();
    await sql`
      INSERT INTO musician_applications
        (id, name, email, instrument, instruments, region, type, bio, status,
         previous_work, previous_work_files, years_experience, travel, lesson_format, lesson_length,
         student_level, available_as, genre, sound_system, vetting_certificate_url, vetting_certificate_number)
      VALUES
        (${id}, ${name}, ${email}, ${instrumentList.join(", ")}, ${instrumentList},
         ${region}, ${typeof type === "string" ? type : "Event Musician"}, ${typeof bio === "string" ? bio : ""}, 'pending_review',
         ${typeof previousWork === "string" ? previousWork : ""}, ${fileUrls},
         ${typeof yearsExperience === "string" ? yearsExperience : ""},
         ${typeof travel === "string" ? travel : ""},
         ${typeof lessonFormat === "string" ? lessonFormat : ""}, ${lessonLength},
         ${studentLevel}, ${availableAs}, ${genre},
         ${typeof soundSystem === "string" ? soundSystem : ""},
         ${typeof vettingCertificateUrl === "string" ? vettingCertificateUrl : ""},
         ${typeof vettingCertificateNumber === "string" ? vettingCertificateNumber : ""})
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
