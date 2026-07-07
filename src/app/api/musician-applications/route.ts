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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, instrument, region, type, bio } = body;

  if (!name || !email || !instrument || !region) {
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
      INSERT INTO musician_applications
        (id, name, email, instrument, region, type, bio, status)
      VALUES
        (${id}, ${name}, ${email}, ${instrument}, ${region}, ${type ?? "Event Musician"}, ${bio ?? ""}, 'pending_review')
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
