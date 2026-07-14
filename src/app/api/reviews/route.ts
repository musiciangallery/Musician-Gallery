import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { getMusicianBySlugAsync } from "@/lib/musicians-live";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { musicianSlug, reviewerName, context, reviewBody, website } = body;

  // Honeypot: a hidden field real visitors never fill in. If it's set, this
  // is a bot — pretend success without writing anything to the database.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (!musicianSlug || !(await getMusicianBySlugAsync(musicianSlug))) {
    return NextResponse.json({ error: "Unknown musician." }, { status: 400 });
  }
  if (!reviewerName || !reviewBody) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    await ensureTables();
    const sql = getSql();
    const id = randomUUID();
    await sql`
      INSERT INTO reviews
        (id, musician_slug, reviewer_name, context, body)
      VALUES
        (${id}, ${musicianSlug}, ${reviewerName}, ${context ?? null}, ${reviewBody})
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { getMusicianBySlugAsync } from "@/lib/musicians-live";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { musicianSlug, reviewerName, context, reviewBody, website } = body;

  // Honeypot: a hidden field real visitors never fill in. If it's set, this
  // is a bot — pretend success without writing anything to the database.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (!musicianSlug || !(await getMusicianBySlugAsync(musicianSlug))) {
    return NextResponse.json({ error: "Unknown musician." }, { status: 400 });
  }
  if (!reviewerName || !reviewBody) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    await ensureTables();
    const sql = getSql();
    const id = randomUUID();
    await sql`
      INSERT INTO reviews
        (id, musician_slug, reviewer_name, context, body)
      VALUES
        (${id}, ${musicianSlug}, ${reviewerName}, ${context ?? null}, ${reviewBody})
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
