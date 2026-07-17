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
