import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";
import { sendBookingDeclinedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  musician_slug: string;
  occasion: string;
  event_date: string;
  client_name: string;
  client_email: string;
  status: string;
  confirm_token: string | null;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }

    await ensureTables();
    const sql = getSql();

    const bookingRows = (await sql`SELECT * FROM bookings WHERE id = ${id}`) as unknown as BookingRow[];
    const booking = bookingRows[0];
    if (!booking || booking.confirm_token !== token) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
    }
    if (booking.status !== "pending") {
      return NextResponse.json({ error: "This booking has already been responded to." }, { status: 409 });
    }

    const musicianRows = await sql`SELECT name FROM musicians WHERE slug = ${booking.musician_slug}`;
    const musicianName = (musicianRows[0]?.name as string | undefined) ?? booking.musician_slug;

    await sql`UPDATE bookings SET status = 'declined', declined_at = now() WHERE id = ${booking.id}`;

    try {
      await sendBookingDeclinedEmail({
        musicianName,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        occasion: booking.occasion,
        eventDate: booking.event_date,
      });
    } catch (emailErr) {
      console.error("Booking declined email failed:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking decline failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
