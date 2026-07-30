import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  sendBookingPaidEmail,
  sendLessonPaymentFailedEmail,
  sendLessonsCompleteEmail,
} from "@/lib/email";

/** Stripe invoices carry their subscription reference differently across
 * API versions — older shapes expose it as invoice.subscription (string or
 * expanded object), newer ones nest it under
 * invoice.parent.subscription_details.subscription. Since this project
 * doesn't pin an explicit apiVersion in lib/stripe.ts, checking both shapes
 * defensively is safer than assuming one. */
function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const direct = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object" && "id" in direct) return direct.id;
  const nested = (
    invoice as unknown as {
      parent?: { subscription_details?: { subscription?: string | { id: string } | null } };
    }
  ).parent?.subscription_details?.subscription;
  if (typeof nested === "string") return nested;
  if (nested && typeof nested === "object" && "id" in nested) return nested.id;
  return null;
}

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
        SELECT id, musician_slug, client_name, client_email, occasion, event_date, amount, status, sessions
        FROM bookings WHERE stripe_checkout_session_id = ${session.id}
      `;
      const booking = bookingRows[0];

      if (booking && session.mode === "subscription" && session.subscription) {
        // Recurring lesson booking — the client's card is now saved and the
        // first charge has succeeded (that's what "completed" means for a
        // subscription-mode session). The "paid" status update and email
        // for this and every future charge is handled uniformly by
        // invoice.paid below, so this block only needs to record the
        // subscription and set it to stop itself automatically once the
        // agreed number of lessons have been billed — Stripe doesn't offer
        // a "cancel after N cycles" option at creation, so this is set via
        // a follow-up update call instead.
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;

        await sql`UPDATE bookings SET stripe_subscription_id = ${subscriptionId} WHERE id = ${booking.id}`;

        if (booking.sessions && Number(booking.sessions) > 0) {
          const cadenceDays = booking.event_date === "Fortnightly" ? 14 : 7;
          // A 3-day buffer after the expected final charge date, so the
          // last invoice has time to be generated and paid before the
          // subscription cancels itself.
          const lastChargeOffsetDays = cadenceDays * (Number(booking.sessions) - 1) + 3;
          const cancelAtSeconds = Math.floor(Date.now() / 1000) + lastChargeOffsetDays * 86400;
          try {
            await stripe.subscriptions.update(subscriptionId, { cancel_at: cancelAtSeconds });
          } catch (err) {
            console.error("Failed to set subscription cancel_at:", err);
          }
        }
      } else if (booking && booking.status !== "paid") {
        // One-off booking — the existing single-payment flow, unchanged.
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
            clientEmail: booking.client_email as string | undefined,
            occasion: booking.occasion,
            eventDate: booking.event_date,
            amount: booking.amount ? booking.amount / 100 : 0,
          });
        } catch (emailErr) {
          console.error("Booking paid email failed:", emailErr);
        }
      }
    }

    // Fires once per billing cycle for recurring lesson bookings (weekly or
    // fortnightly) — including the very first charge, which is why the
    // checkout.session.completed handler above doesn't send its own "paid"
    // email for subscriptions. last_paid_invoice_id guards against Stripe
    // retrying delivery of the same event and double-counting a lesson.
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);

      if (subscriptionId) {
        let bookingRows = await sql`
          SELECT id, musician_slug, client_name, client_email, occasion, event_date, amount, sessions, sessions_paid, last_paid_invoice_id
          FROM bookings WHERE stripe_subscription_id = ${subscriptionId}
        `;
        let booking = bookingRows[0];

        // The very first invoice.paid for a Checkout-created subscription
        // can arrive before checkout.session.completed has backfilled
        // stripe_subscription_id (webhook delivery order isn't guaranteed).
        // Fall back to finding the originating Checkout Session directly.
        if (!booking) {
          const sessionsList = await stripe.checkout.sessions.list({ subscription: subscriptionId, limit: 1 });
          const originatingSessionId = sessionsList.data[0]?.id;
          if (originatingSessionId) {
            bookingRows = await sql`
              SELECT id, musician_slug, client_name, client_email, occasion, event_date, amount, sessions, sessions_paid, last_paid_invoice_id
              FROM bookings WHERE stripe_checkout_session_id = ${originatingSessionId}
            `;
            booking = bookingRows[0];
            if (booking) {
              await sql`UPDATE bookings SET stripe_subscription_id = ${subscriptionId} WHERE id = ${booking.id}`;
            }
          }
        }

        if (booking && booking.last_paid_invoice_id !== invoice.id) {
          const newSessionsPaid = Number(booking.sessions_paid ?? 0) + 1;

          await sql`
            UPDATE bookings
            SET status = 'paid', paid_at = now(), sessions_paid = ${newSessionsPaid}, last_paid_invoice_id = ${invoice.id}
            WHERE id = ${booking.id}
          `;

          const musicianRows = await sql`SELECT name, email FROM musicians WHERE slug = ${booking.musician_slug}`;
          const musician = musicianRows[0];

          try {
            await sendBookingPaidEmail({
              musicianName: (musician?.name as string | undefined) ?? booking.musician_slug,
              musicianEmail: musician?.email as string | undefined,
              clientName: booking.client_name,
              clientEmail: booking.client_email as string | undefined,
              occasion: booking.occasion,
              eventDate: booking.event_date,
              amount: booking.amount ? booking.amount / 100 : 0,
              sessionsPaid: newSessionsPaid,
              sessions: booking.sessions ? Number(booking.sessions) : undefined,
            });
          } catch (emailErr) {
            console.error("Lesson paid email failed:", emailErr);
          }
        }
      }
    }

    // A recurring charge failed (expired card, insufficient funds, etc.).
    // Stripe's own Smart Retries will try again automatically — this just
    // lets the client know so they aren't blindsided later.
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);

      if (subscriptionId) {
        const bookingRows = await sql`
          SELECT musician_slug, client_name, client_email, occasion
          FROM bookings WHERE stripe_subscription_id = ${subscriptionId}
        `;
        const booking = bookingRows[0];

        if (booking && booking.client_email) {
          const musicianRows = await sql`SELECT name FROM musicians WHERE slug = ${booking.musician_slug}`;
          const musician = musicianRows[0];

          try {
            await sendLessonPaymentFailedEmail({
              musicianName: (musician?.name as string | undefined) ?? booking.musician_slug,
              clientName: booking.client_name,
              clientEmail: booking.client_email as string,
              occasion: booking.occasion,
            });
          } catch (emailErr) {
            console.error("Lesson payment failed email failed:", emailErr);
          }
        }
      }
    }

    // The subscription reached its cancel_at date (all agreed sessions
    // billed) or was cancelled some other way — either way, let both sides
    // know the arrangement has wrapped up rather than them wondering why
    // billing quietly stopped.
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const bookingRows = await sql`
        SELECT id, musician_slug, client_name, client_email, occasion, sessions, status
        FROM bookings WHERE stripe_subscription_id = ${subscription.id}
      `;
      const booking = bookingRows[0];

      if (booking && booking.status !== "completed") {
        await sql`UPDATE bookings SET status = 'completed' WHERE id = ${booking.id}`;

        const musicianRows = await sql`SELECT name, email FROM musicians WHERE slug = ${booking.musician_slug}`;
        const musician = musicianRows[0];

        try {
          await sendLessonsCompleteEmail({
            musicianName: (musician?.name as string | undefined) ?? booking.musician_slug,
            musicianEmail: musician?.email as string | undefined,
            clientName: booking.client_name,
            clientEmail: booking.client_email as string | undefined,
            occasion: booking.occasion,
            sessions: booking.sessions ? Number(booking.sessions) : 0,
          });
        } catch (emailErr) {
          console.error("Lessons complete email failed:", emailErr);
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
