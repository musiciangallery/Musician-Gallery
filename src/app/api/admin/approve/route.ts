import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

// Teacher-category applicants must have a real CVCheck Police Vetting
// certificate on file before they can go live — matches the "Teacher" type
// used in the Join form and admin review UI.
const TEACHER_TYPES = new Set(["Teacher", "Teacher & Events"]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const applicationId = form.get("applicationId");
    const name = form.get("name");
    const email = form.get("email");
    const region = form.get("region");
    const type = form.get("type");
    const bio = form.get("bio");
    const longBio = form.get("longBio");
    const yearsExperience = form.get("yearsExperience");
    const rateFromRaw = form.get("rateFrom");
    const rateUnit = form.get("rateUnit");
    const vetted = form.get("vetted") === "true";
    const instruments = parseJsonArray(form.get("instruments"));
    const occasions = parseJsonArray(form.get("occasions"));
    // Photos/video are uploaded directly from the browser to Blob storage
    // before this form is submitted (see /api/upload), so this route only
    // ever receives the resulting URLs — never the file bytes — keeping
    // large files clear of the ~4.5MB request body limit serverless
    // functions enforce.
    const photoUrl = form.get("photoUrl");
    const galleryUrls = parseJsonArray(form.get("galleryUrls"));
    const videoUrl = form.get("videoUrl");
    let slug = form.get("slug");

    if (
      typeof applicationId !== "string" ||
      typeof name !== "string" ||
      typeof region !== "string" ||
      typeof type !== "string" ||
      instruments.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      slug = slugify(name);
    } else {
      slug = slugify(slug);
    }

    const rateFrom = rateFromRaw ? parseInt(String(rateFromRaw), 10) : null;

    await ensureTables();
    const sql = getSql();

    // Server-side vetting gate — the client already disables this, but the
    // client can be bypassed by anyone calling this endpoint directly, so
    // the real check has to live here. Reads the certificate straight off
    // the saved application record rather than trusting anything the
    // client submits, since the client never sends certificate data to
    // this route at all (it's saved separately via /api/admin/update-vetting).
    if (TEACHER_TYPES.has(type)) {
      const certRows = await sql`
        SELECT vetting_certificate_url, vetting_certificate_number
        FROM musician_applications
        WHERE id = ${applicationId}
      `;
      const cert = certRows[0] as
        | { vetting_certificate_url: string | null; vetting_certificate_number: string | null }
        | undefined;
      const hasCertificate = Boolean(
        cert?.vetting_certificate_url?.trim() || cert?.vetting_certificate_number?.trim()
      );
      if (!hasCertificate) {
        return NextResponse.json(
          {
            error:
              "This applicant is a Teacher and can't be published until a vetting certificate (link or number) has been saved for them.",
          },
          { status: 400 }
        );
      }
      if (!vetted) {
        return NextResponse.json(
          { error: "Confirm \"Police vetting confirmed\" before publishing a Teacher profile." },
          { status: 400 }
        );
      }
    }

    const id = randomUUID();

    await sql`
      INSERT INTO musicians
        (id, slug, name, instrument, instruments, region, type, occasions,
         vetted, rate_from, rate_unit, bio, long_bio, years_experience, photo,
         photos, video, email, application_id)
      VALUES
        (${id}, ${slug}, ${name}, ${instruments[0]}, ${instruments}, ${region},
         ${type}, ${occasions}, ${vetted}, ${rateFrom}, ${String(rateUnit ?? "")},
         ${String(bio ?? "")}, ${String(longBio ?? "")}, ${String(yearsExperience ?? "")},
         ${typeof photoUrl === "string" ? photoUrl : null}, ${galleryUrls},
         ${typeof videoUrl === "string" ? videoUrl : null}, ${typeof email === "string" ? email : null}, ${applicationId})
    `;

    await sql`UPDATE musician_applications SET status = 'approved' WHERE id = ${applicationId}`;

    // Best-effort — a failed or unconfigured email send should never stop
    // the approval, which already succeeded, from returning 201.
    try {
      await sendWelcomeEmail({
        musicianName: name,
        musicianEmail: typeof email === "string" ? email : undefined,
        slug,
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to approve application." },
      { status: 500 }
    );
  }
}
