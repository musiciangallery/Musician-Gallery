import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { getMusicianBySlugAsync } from "@/lib/musicians-live";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    musicianSlug,
    occasion,
    eventDate,
    location,
    details,
    clientName,
    clientEmail,
    clientPhone,
  } = body;

  if (!musicianSlug || !(await getMusicianBySlugAsync(musicianSlug))) {
    return NextResponse.json({ error: "Unknown musician." }, { status: 400 });
  }
  if (!occasion || !eventDate || !clientName || !clientEmail) {
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
      INSERT INTO bookings
        (id, musician_slug, occasion, event_date, location, details, client_name, client_email, client_phone)
      VALUES
        (${id}, ${musicianSlug}, ${occasion}, ${eventDate}, ${location ?? ""}, ${details ?? ""}, ${clientName}, ${clientEmail}, ${clientPhone ?? ""})
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
