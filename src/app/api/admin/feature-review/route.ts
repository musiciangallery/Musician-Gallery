import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, featured } = await req.json();
    if (!id || typeof featured !== "boolean") {
      return NextResponse.json({ error: "Missing id or featured." }, { status: 400 });
    }
    await ensureTables();
    const sql = getSql();
    await sql`UPDATE reviews SET featured = ${featured} WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update review." },
      { status: 500 }
    );
  }
}
