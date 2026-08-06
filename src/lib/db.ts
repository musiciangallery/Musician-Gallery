import postgres from "postgres";

// The Vercel storage integration (Prisma Postgres, Neon, Supabase, etc.)
// sets one of these automatically once connected in the Vercel dashboard.
// POSTGRES_URL is the plain, direct Postgres connection string (works with
// any standard Postgres client). DATABASE_URL is included as a fallback for
// providers that only set that name with a standard connection string —
// note this is NOT the same as a Prisma Accelerate URL, which this plain
// client cannot use.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let client: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Add a Postgres storage integration to this project in the Vercel dashboard (Storage tab), which sets POSTGRES_URL automatically."
    );
  }
  if (!client) {
    // max: 1 keeps this friendly to serverless functions, which spin up
    // many short-lived instances rather than one long-running server.
    // prepare: false is required against pooled/proxy Postgres connections
    // (like Prisma Postgres's pooler) — they don't support the named
    // prepared statements postgres.js uses by default, which otherwise
    // causes confusing connection-level errors instead of normal Postgres
    // error messages.
    client = postgres(connectionString, { max: 1, ssl: "require", prepare: false });
  }
  return client;
}

// Every public page (homepage, gallery, musician profiles) calls
// ensureTables() before reading data, which used to re-run the full set of
// CREATE TABLE / ALTER TABLE checks below on every single page load — real
// visitor traffic paying for schema setup that only ever needs to happen
// once. This flag makes it a no-op after the first successful run within a
// given server instance, since the tables/columns don't change between
// requests. A fresh flag (and one real check) only happens again after a
// cold start, which is the correct, cheap behaviour.
let tablesEnsured = false;

export async function ensureTables() {
  if (tablesEnsured) return;
  const sql = getSql();

  // The five tables have no foreign key constraints referencing each
  // other, so they don't need to be created one after another. Firing them
  // together (instead of one `await` at a time) lets postgres.js pipeline
  // them over the single connection instead of paying a full network round
  // trip for each statement — on a cold serverless start, that's the
  // difference between one slow request and every request being slow.
  await Promise.all([
    sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id uuid PRIMARY KEY,
        musician_slug text NOT NULL,
        occasion text NOT NULL,
        event_date text NOT NULL,
        location text,
        details text,
        client_name text NOT NULL,
        client_email text NOT NULL,
        client_phone text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
    // Every message relayed through a booking's masked reply address
    // (booking-<code>@reply.musiciangallery.co.nz) is logged here —
    // quietly, for reactive admin-only visibility (e.g. if a dispute
    // arises), not as an actively monitored inbox. direction is
    // 'to_musician', 'to_client', or 'unmatched' (sender didn't match
    // either known party on the booking). See lib/reply-mask.ts and
    // app/api/email/inbound/route.ts.
    sql`
      CREATE TABLE IF NOT EXISTS booking_messages (
        id uuid PRIMARY KEY,
        booking_id uuid NOT NULL,
        direction text NOT NULL,
        from_email text NOT NULL,
        to_email text NOT NULL,
        subject text,
        body_text text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS musician_applications (
        id uuid PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        instrument text NOT NULL,
        region text NOT NULL,
        type text NOT NULL,
        bio text,
        status text NOT NULL DEFAULT 'pending_review',
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
    // Live, approved musician profiles — separate from applications so
    // that publishing an application (editing the bio, uploading a
    // treated photo) doesn't overwrite what the applicant originally
    // submitted.
    sql`
      CREATE TABLE IF NOT EXISTS musicians (
        id uuid PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        name text NOT NULL,
        instrument text NOT NULL,
        instruments text[],
        region text NOT NULL,
        type text NOT NULL,
        occasions text[] NOT NULL DEFAULT '{}',
        vetted boolean NOT NULL DEFAULT false,
        rate_from integer,
        rate_unit text,
        bio text,
        long_bio text,
        years_experience text,
        photo text,
        application_id uuid,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
    // Reviews are submitted publicly (no login) via each musician's
    // profile, then held as 'pending' until approved in /admin. Approved
    // reviews show on the musician's profile; approved AND featured
    // reviews are the ones eligible to rotate on the homepage.
    sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY,
        musician_slug text NOT NULL,
        reviewer_name text NOT NULL,
        context text,
        body text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        featured boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `,
  ]);

  // Column additions only depend on their own table already existing
  // above, not on each other, so every ALTER across all four tables runs
  // together in one more batch rather than one round trip per column.
  await Promise.all([
    // Payment lifecycle, added when Stripe booking payments were
    // introduced. A booking starts 'pending' (just a notification, as
    // before). The musician confirms via an emailed no-login link (using
    // confirm_token) and enters the agreed amount, which moves it to
    // 'confirmed' and generates a Stripe Checkout link for the client.
    // 'paid' is set by the Stripe webhook once the client actually pays.
    // 'declined' ends the flow with no payment ever created.
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirm_token text`,
    // Musician's quoted rate in cents (client pays this plus a 10%
    // platform fee on top; the musician always receives their full quoted
    // amount).
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount integer`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_at timestamptz`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz`,
    // Recurring lessons ("Weekly"/"Fortnightly" frequency, stored in
    // event_date) — sessions is the agreed number of lessons the client
    // asked for (and the musician confirms), used to compute how many
    // charges the Stripe subscription runs before it auto-cancels itself.
    // NULL for one-off bookings, which keep using the existing single
    // Checkout Session flow untouched. stripe_subscription_id identifies
    // the recurring Checkout/subscription, the same way
    // stripe_checkout_session_id already does for one-time payments.
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sessions integer`,
    sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_subscription_id text`,
    // How many of the agreed sessions have been paid so far — incremented
