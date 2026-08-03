import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Lets an admin edit an already-live musician profile (wording, rate,
 * availability, vetting status, photos, etc.) directly, without the
 * musician needing to reapply. Mirrors /api/admin/approve's field set,
 * minus instrument(s) and contact email, which aren't editable here. */
export async function POST(req: NextRequest) {
  let slug: string | null = null;
  try {
    const body = await req.json();
    const {
      id,
      slug: rawSlug,
      name,
      region,
      occasions,
      vetted,
      rateFrom,
      rateUnit,
      bio,
      longBio,
      yearsExperience,
      availability,
      audioLink,
      photoUrl,
      galleryUrls,
      videoUrl,
    } = body;

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof region !== "string" ||
      !region.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    slug = typeof rawSlug === "string" && rawSlug.trim() ? slugify(rawSlug) : slugify(name);

    await ensureTables();
    const sql = getSql();

    await sql`
      UPDATE musicians SET
        slug = ${slug},
        name = ${name},
        region = ${region},
        occasions = ${Array.isArray(occasions) ? occasions : []},
        vetted = ${Boolean(vetted)},
        rate_from = ${typeof rateFrom === "number" ? rateFrom : null},
        rate_unit = ${typeof rateUnit === "string" ? rateUnit : ""},
        bio = ${typeof bio === "string" ? bio : ""},
        long_bio = ${typeof longBio === "string" ? longBio : ""},
        years_experience = ${typeof yearsExperience === "string" ? yearsExperience : ""},
        availability = ${typeof availability === "string" ? availability : ""},
        audio_link = ${typeof audioLink === "string" ? audioLink : ""},
        photo = ${typeof photoUrl === "string" ? photoUrl : null},
        photos = ${Array.isArray(galleryUrls) ? galleryUrls : []},
        video = ${typeof videoUrl === "string" ? videoUrl : null}
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    // Postgres error code 23505 = unique_violation, fires if the edited
    // slug already belongs to another live profile.
    const isDuplicateSlug =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "23505";

    if (isDuplicateSlug) {
      return NextResponse.json(
        {
          error: `The profile URL slug "${slug}" is already in use by another musician. Choose something unique and save again.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update musician." },
      { status: 500 }
    );
  }
}
