import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId." }, { status: 400 });
    }
    await ensureTables();
    const sql = getSql();
    await sql`UPDATE musician_applications SET status = 'declined' WHERE id = ${applicationId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update application." },
      { status: 500 }
    );
  }
}
