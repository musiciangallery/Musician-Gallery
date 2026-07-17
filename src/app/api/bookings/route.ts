import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";
import { getMusicianBySlugAsync } from "@/lib/musicians-live";
import { sendBookingEmails } from "@/lib/email";

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

  const musician = musicianSlug ? await getMusicianBySlugAsync(musicianSlug) : undefined;
  if (!musicianSlug || !musician) {
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
    const confirmToken = randomUUID();
    await sql`
      INSERT INTO bookings
        (id, musician_slug, occasion, event_date, location, details, client_name, client_email, client_phone, confirm_token)
      VALUES
        (${id}, ${musicianSlug}, ${occasion}, ${eventDate}, ${location ?? ""}, ${details ?? ""}, ${clientName}, ${clientEmail}, ${clientPhone ?? ""}, ${confirmToken})
    `;

    // Best-effort — a failed or unconfigured email send should never stop
    // a booking that already saved successfully from returning 201.
    try {
      await sendBookingEmails({
        musicianName: musician.name,
        musicianEmail: musician.email,
        occasion,
        eventDate,
        location,
        details,
        clientName,
        clientEmail,
        clientPhone,
        bookingId: id,
        confirmToken,
      });
    } catch (emailErr) {
      console.error("Booking email failed:", emailErr);
    }

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
