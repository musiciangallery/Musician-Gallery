import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getSql, ensureTables } from "@/lib/db";

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
    const photo = form.get("photo");
    const galleryPhotos = form.getAll("photos").filter(
      (f): f is File => f instanceof File && f.size > 0
    );
    const video = form.get("video");
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

    let photoUrl: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      const blob = await put(`musicians/${slug}-${Date.now()}`, photo, {
        access: "public",
        addRandomSuffix: true,
      });
      photoUrl = blob.url;
    }

    // Additional gallery photos — uploaded the same way as the primary
    // photo, one Blob object each.
    const galleryUrls: string[] = [];
    for (const file of galleryPhotos) {
      const blob = await put(`musicians/${slug}-gallery-${Date.now()}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      galleryUrls.push(blob.url);
    }

    // Optional profile video — same Blob upload pattern. Video files are
    // much larger than photos, so this can take a while on a slow
    // connection; the client-side upload has no special handling for that
    // yet beyond the normal fetch, which is fine for the file sizes a
    // single musician profile realistically needs.
    let videoUrl: string | null = null;
    if (video instanceof File && video.size > 0) {
      const blob = await put(`musicians/${slug}-video-${Date.now()}`, video, {
        access: "public",
        addRandomSuffix: true,
      });
      videoUrl = blob.url;
    }

    await ensureTables();
    const sql = getSql();
    const id = randomUUID();

    await sql`
      INSERT INTO musicians
        (id, slug, name, instrument, instruments, region, type, occasions,
         vetted, rate_from, rate_unit, bio, long_bio, years_experience, photo,
         photos, video, application_id)
      VALUES
        (${id}, ${slug}, ${name}, ${instruments[0]}, ${instruments}, ${region},
         ${type}, ${occasions}, ${vetted}, ${rateFrom}, ${String(rateUnit ?? "")},
         ${String(bio ?? "")}, ${String(longBio ?? "")}, ${String(yearsExperience ?? "")},
         ${photoUrl}, ${galleryUrls}, ${videoUrl}, ${applicationId})
    `;

    await sql`UPDATE musician_applications SET status = 'approved' WHERE id = ${applicationId}`;

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to approve application." },
      { status: 500 }
    );
  }
}
