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
