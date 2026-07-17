import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendBookingPaidEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Stripe webhook receiver — set up in the Stripe dashboard to send
 * checkout.session.completed and account.updated events here (see
 * STRIPE_WEBHOOK_SECRET in Vercel env vars). Verifies the signature against
 * the raw request body before trusting anything in the payload. */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await ensureTables();
    const sql = getSql();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingRows = await sql`
        SELECT id, musician_slug, client_name, occasion, event_date, amount, status
        FROM bookings WHERE stripe_checkout_session_id = ${session.id}
      `;
      const booking = bookingRows[0];

      // Only act once — Stripe can retry webhook delivery, and this keeps a
      // retry from sending duplicate "you've been paid" emails.
      if (booking && booking.status !== "paid") {
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

        await sql`
          UPDATE bookings
          SET status = 'paid', paid_at = now(), stripe_payment_intent_id = ${paymentIntentId}
          WHERE id = ${booking.id}
        `;

        const musicianRows = await sql`SELECT name, email FROM musicians WHERE slug = ${booking.musician_slug}`;
        const musician = musicianRows[0];

        try {
          await sendBookingPaidEmail({
            musicianName: (musician?.name as string | undefined) ?? booking.musician_slug,
            musicianEmail: musician?.email as string | undefined,
            clientName: booking.client_name,
            occasion: booking.occasion,
            eventDate: booking.event_date,
            amount: booking.amount ? booking.amount / 100 : 0,
          });
        } catch (emailErr) {
          console.error("Booking paid email failed:", emailErr);
        }
      }
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await sql`
        UPDATE musicians SET stripe_onboarded = ${!!account.payouts_enabled} WHERE stripe_account_id = ${account.id}
      `;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handling failed:", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
