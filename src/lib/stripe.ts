import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily-created Stripe client, using the account's default pinned API
 * version rather than hardcoding one here. Throws a clear error if the key
 * isn't set yet, matching the pattern used for the Postgres connection
 * string in db.ts. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it in the Vercel dashboard (Settings > Environment Variables)."
    );
  }
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export const SITE_URL = process.env.SITE_URL || "https://musiciangallery.co.nz";

/** Musician payout share — the client pays this platform fee on top of the
 * musician's quoted rate, so the musician always receives their full quote.
 * Kept as a single constant so the checkout + confirm flows stay in sync. */
export const PLATFORM_FEE_RATE = 0.1;

/** Stripe subscriptions (used for recurring lesson bookings) can only take
 * a platform cut as a percentage of each invoice — there's no equivalent to
 * payment_intent_data.application_fee_amount for a fixed dollar amount, since
 * the billed amount is the same every cycle anyway. This is the percentage
 * that works out to the same effective cut as PLATFORM_FEE_RATE: if the
 * client is charged the musician's rate plus 10% on top, the platform's
 * share of that total is 10/110, not 10/100. Rounded to 2dp, which is all
 * Stripe's application_fee_percent accepts. */
export const APPLICATION_FEE_PERCENT =
  Math.round((PLATFORM_FEE_RATE / (1 + PLATFORM_FEE_RATE)) * 10000) / 100;
