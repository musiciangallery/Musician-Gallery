import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe, SITE_URL, PLATFORM_FEE_RATE } from "@/lib/stripe";
import { sendBookingConfirmedEmail } from "@/lib/email";

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

type MusicianRow = {
  name: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
};

/** Musician confirms a booking and quotes their rate. Creates a Stripe
 * Checkout Session as a destination charge: the client pays the quoted
 * amount plus a 10% platform fee on top, and the musician's connected
 * account receives the full quoted amount via transfer_data — the fee is
 * carved out on the platform's side, never subtracted from the musician. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    const amountDollars = Number(body.amount);

    if (!token || !amountDollars || amountDollars <= 0) {
      return NextResponse.json({ error: "Missing token or a valid amount." }, { status: 400 });
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

    const musicianRows = (await sql`
      SELECT name, stripe_account_id, stripe_onboarded FROM musicians WHERE slug = ${booking.musician_slug}
    `) as unknown as MusicianRow[];
    const musician = musicianRows[0];
    if (!musician || !musician.stripe_account_id || !musician.stripe_onboarded) {
      return NextResponse.json(
        { error: "Payouts aren't set up yet — finish that first, then come back to confirm." },
        { status: 400 }
      );
    }

    const amountCents = Math.round(amountDollars * 100);
    const totalCents = Math.round(amountCents * (1 + PLATFORM_FEE_RATE));
    const feeCents = totalCents - amountCents;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "nzd",
            unit_amount: totalCents,
            product_data: {
              name: `${musician.name} — ${booking.occasion} (${booking.event_date})`,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: { destination: musician.stripe_account_id },
      },
      customer_email: booking.client_email,
      success_url: `${SITE_URL}/pay/${booking.id}/success`,
      cancel_url: `${SITE_URL}/pay/${booking.id}`,
    });

    await sql`
      UPDATE bookings
      SET status = 'confirmed', amount = ${amountCents}, stripe_checkout_session_id = ${session.id}, confirmed_at = now()
      WHERE id = ${booking.id}
    `;

    try {
      await sendBookingConfirmedEmail({
        musicianName: musician.name,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        occasion: booking.occasion,
        eventDate: booking.event_date,
        amount: amountDollars,
        checkoutUrl: session.url || `${SITE_URL}/pay/${booking.id}`,
      });
    } catch (emailErr) {
      console.error("Booking confirmed email failed:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking confirm failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
