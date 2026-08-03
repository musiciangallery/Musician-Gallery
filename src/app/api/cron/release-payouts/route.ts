import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendEventPayoutSentEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type PayableBookingRow = {
  id: string;
  musician_slug: string;
  occasion: string;
  event_date: string;
  amount: number | null;
  stripe_charge_id: string | null;
};

type MusicianRow = {
  name: string;
  email: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
};

/** Runs once a day (see vercel.json) to pay out one-off event bookings the
 * day after their event date. Deliberately separate from the confirm route
 * and Stripe webhook, which no longer transfer the musician's share
 * automatically — see the comments there for why. Recurring lesson
 * bookings (per-lesson or whole-term-upfront) aren't touched here at all;
 * those keep their existing instant payout.
 *
 * Auth: Vercel Cron sends an `Authorization: Bearer $CRON_SECRET` header
 * automatically when CRON_SECRET is set as an environment variable (see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
 * Fails closed if that env var isn't configured, since this route moves
 * real money and shouldn't be reachable by an unauthenticated request. */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not set — refusing to run payout release.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await ensureTables();
    const sql = getSql();
    const stripe = getStripe();

    // sessions IS NULL narrows this to one-off event bookings — recurring
    // lesson bookings (per-lesson or whole-term-upfront) always have
    // sessions set and are excluded here entirely, since their payout
    // stays instant. The date comparison happens in JS below rather than
    // as a SQL cast, since event_date is a free-text column shared with
    // recurring bookings ("Weekly"/"Fortnightly") — filtering in JS avoids
    // any risk of a cast failing the whole query over unrelated rows.
    const rows = (await sql`
      SELECT id, musician_slug, occasion, event_date, amount, stripe_charge_id
      FROM bookings
      WHERE sessions IS NULL AND status = 'paid' AND stripe_transfer_id IS NULL
    `) as unknown as PayableBookingRow[];

    // Compares in UTC, same as the date formatting already used in booking
    // emails — event_date is a plain "YYYY-MM-DD" date with no time
    // component, so this is "the event date has passed", i.e. payout goes
    // out the day after. Running once daily means the exact release time
    // can land a few hours either side of true NZ midnight depending on
    // when Vercel fires the cron, which is an acceptable trade-off for how
    // infrequently this runs.
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const due = rows.filter((r) => {
      const eventDate = new Date(r.event_date);
      return !Number.isNaN(eventDate.getTime()) && eventDate < todayUTC;
    });

    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const booking of due) {
      if (!booking.stripe_charge_id || !booking.amount) {
        console.error(`Skipping payout for booking ${booking.id}: missing stripe_charge_id or amount.`);
        skipped++;
        continue;
      }

      try {
        const musicianRows = (await sql`
          SELECT name, email, stripe_account_id, stripe_onboarded
          FROM musicians WHERE slug = ${booking.musician_slug}
        `) as unknown as MusicianRow[];
        const musician = musicianRows[0];

        if (!musician || !musician.stripe_account_id || !musician.stripe_onboarded) {
          console.error(`Skipping payout for booking ${booking.id}: musician not onboarded.`);
          skipped++;
          continue;
        }

        const transfer = await stripe.transfers.create({
          amount: booking.amount,
          currency: "nzd",
          destination: musician.stripe_account_id,
          source_transaction: booking.stripe_charge_id,
          description: `${booking.occasion} — Musician Gallery booking ${booking.id}`,
        });

        await sql`
          UPDATE bookings
          SET stripe_transfer_id = ${transfer.id}, payout_transferred_at = now()
          WHERE id = ${booking.id}
        `;

        try {
          await sendEventPayoutSentEmail({
            musicianName: musician.name,
            musicianEmail: musician.email ?? undefined,
            occasion: booking.occasion,
            eventDate: booking.event_date,
            amount: booking.amount / 100,
          });
        } catch (emailErr) {
          console.error(`Payout sent email failed for booking ${booking.id}:`, emailErr);
        }

        succeeded++;
      } catch (err) {
        console.error(`Payout transfer failed for booking ${booking.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ checked: rows.length, due: due.length, succeeded, failed, skipped });
  } catch (err) {
    console.error("Payout release run failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payout release failed." },
      { status: 500 }
    );
  }
}
