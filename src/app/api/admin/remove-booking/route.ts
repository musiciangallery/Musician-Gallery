import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Permanently deletes a booking request — refuses to delete anything
 * marked 'paid' or 'completed', since those are real financial records
 * worth keeping around even once they're old. Also clears out any
 * relayed messages logged against this booking (see booking_messages /
 * lib/reply-mask.ts), so deleting a booking doesn't leave orphaned rows
 * behind in the admin's Relayed messages table. */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Missing booking id." }, { status: 400 });
    }

    await ensureTables();
    const sql = getSql();

    const rows = await sql`SELECT status FROM bookings WHERE id = ${id}`;
    const booking = rows[0] as { status: string } | undefined;
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.status === "paid" || booking.status === "completed") {
      return NextResponse.json(
        {
          error:
            "Paid or completed bookings can't be deleted — they're kept as a financial record.",
        },
        { status: 400 }
      );
    }

    await sql`DELETE FROM booking_messages WHERE booking_id = ${id}`;
    await sql`DELETE FROM bookings WHERE id = ${id}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete booking." },
      { status: 500 }
    );
  }
}
