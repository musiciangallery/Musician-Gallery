import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendBookingPaidEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Stripe webhook receiver — checkout.session.completed and account.updated
 * arrive from two separate event destinations in the Stripe dashboard,
 * since Stripe requires different destination scopes for each: checkout
 * sessions belong to "Your account", while account.updated for a musician's
 * connected Express account requires the "Connected accounts" scope. Each
 * destination has its own signing secret, so both STRIPE_WEBHOOK_SECRET
 * (the "Your account" destination) and STRIPE_CONNECT_WEBHOOK_SECRET (the
 * "Connected accounts" destination) are accepted here — whichever one
 * successfully verifies the incoming signature is used. */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
  ].filter((s): s is string => Boolean(s));

  if (!signature || webhookSecrets.length === 0) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event | null = null;
  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      break;
    } catch {
      // Try the next secret — a mismatch here just means this event came
      // from the other destination, not that anything is wrong.
    }
  }
  if (!event) {
    console.error("Stripe webhook signature verification failed against all configured secrets.");
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
