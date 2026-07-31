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
  await sql`
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
  `;
  // Payment lifecycle, added when Stripe booking payments were introduced.
  // A booking starts 'pending' (just a notification, as before). The
  // musician confirms via an emailed no-login link (using confirm_token)
  // and enters the agreed amount, which moves it to 'confirmed' and
  // generates a Stripe Checkout link for the client. 'paid' is set by the
  // Stripe webhook once the client actually pays. 'declined' ends the flow
  // with no payment ever created.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirm_token text`;
  // Musician's quoted rate in cents (client pays this plus a 10% platform
  // fee on top; the musician always receives their full quoted amount).
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount integer`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_at timestamptz`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz`;

  // Recurring lessons ("Weekly"/"Fortnightly" frequency, stored in
  // event_date) — sessions is the agreed number of lessons the client asked
  // for (and the musician confirms), used to compute how many charges the
  // Stripe subscription runs before it auto-cancels itself. NULL for
  // one-off bookings, which keep using the existing single Checkout
  // Session flow untouched. stripe_subscription_id identifies the
  // recurring Checkout/subscription, the same way
  // stripe_checkout_session_id already does for one-time payments.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sessions integer`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_subscription_id text`;
  // How many of the agreed sessions have been paid so far — incremented by
  // the webhook on each successful recurring charge, shown to the musician
  // and client as "3 of 8 lessons paid".
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sessions_paid integer NOT NULL DEFAULT 0`;
  // The most recent Stripe invoice ID counted toward sessions_paid — Stripe
  // can retry webhook delivery for the same invoice.paid event, and without
  // this the retry would double-count that lesson as paid and send a
  // duplicate "you've been paid" email.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_paid_invoice_id text`;

  // Marks when a recurring lesson arrangement (subscription) reaches its
  // natural end — set by the Stripe webhook when it flips status to
  // 'completed'. Needed alongside event_date to work out when a booking's
  // masked reply address should stop working (see lib/reply-mask.ts):
  // event_date for one-off bookings, completed_at for recurring ones,
  // since event_date holds "Weekly"/"Fortnightly" rather than a real date
  // for those.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at timestamptz`;

  // Every message relayed through a booking's masked reply address
  // (booking-<id>@reply.musiciangallery.co.nz) is logged here — quietly,
  // for reactive admin-only visibility (e.g. if a dispute arises), not as
  // an actively monitored inbox. direction is 'to_musician', 'to_client',
  // or 'unmatched' (sender didn't match either known party on the
  // booking). See lib/reply-mask.ts and app/api/email/inbound/route.ts.
  await sql`
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
  `;

  await sql`
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
  `;

  // Additional listing fields, added after the initial launch. Using
  // ADD COLUMN IF NOT EXISTS (rather than altering the existing
  // "instrument" column's type) keeps this safe to run on every request
  // against a table that may already have rows in it.
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS instruments text[]`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS previous_work text`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS years_experience text`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS travel text`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS lesson_format text`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS lesson_length text[]`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS student_level text[]`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS available_as text[]`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS genre text[]`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS sound_system text`;

  // Raw photo/video files an applicant uploads to show previous work,
  // stored in Blob and referenced here by URL. Separate from the "previous
  // work" text field, which is for pasted links (YouTube, Instagram, etc).
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS previous_work_files text[]`;

  // Teacher applicants only. Musician Gallery isn't an authorised NZ Police
  // Vetting Service agency (application declined 19 July 2026) — teachers
  // instead complete a CVCheck "NZ Police Vetting Check" themselves and
  // upload the resulting certificate here for review. The certificate
  // number lets an admin jump straight to CVCheck's free public
  // verification tool (cvcheck.com/nz/verify-a-cvcheck-certificate) before
  // ticking "Police vetting confirmed" in /admin.
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS vetting_certificate_url text`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS vetting_certificate_number text`;

  // Free-text availability signal (e.g. "Weekday evenings, most weekends"),
  // stated by the applicant and editable by an admin before publishing —
  // a lightweight alternative to a real calendar, so clients get a rough
  // sense of fit before submitting a request.
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS availability text`;

  // A link to hear the applicant play — a Spotify share link (embedded as
  // a player on the live profile) or any other music link (shown as a
  // plain "Listen" link instead). Optional, stated by the applicant and
  // editable by an admin before publishing.
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS audio_link text`;

  // The applicant's self-set starting rate — a starting point for an admin
  // to review and adjust during approval, not published as-is. rate_unit
  // is either "per event" / "per lesson", or "By enquiry" when the
  // applicant chose to keep their rate private rather than list a number
  // (rate_from is left null in that case).
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS rate_from integer`;
  await sql`ALTER TABLE musician_applications ADD COLUMN IF NOT EXISTS rate_unit text`;

  // Live, approved musician profiles — separate from applications so that
  // publishing an application (editing the bio, uploading a treated photo)
  // doesn't overwrite what the applicant originally submitted.
  await sql`
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
  `;

  // Additional gallery photos and an optional profile video, added after
  // the initial launch. ADD COLUMN IF NOT EXISTS keeps this safe to run
  // against a table that already has rows.
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS photos text[]`;
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS video text`;

  // Carried over from the application at approval time, so booking
  // notifications can be emailed straight to the musician.
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS email text`;

  // Manually curated in /admin — featured musicians are the ones shown in
  // the homepage "From the gallery" section, instead of a hardcoded slice.
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false`;

  // Carried over from the application (and editable by an admin) at
  // approval time — shown publicly on the profile page.
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS availability text`;
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS audio_link text`;

  // Stripe Connect Express account for automatic payouts. stripe_onboarded
  // only flips true once Stripe confirms (via webhook) that charges and
  // payouts are both enabled on the account — until then, bookings can
  // still come in but can't be paid out to this musician yet.
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS stripe_account_id text`;
  await sql`ALTER TABLE musicians ADD COLUMN IF NOT EXISTS stripe_onboarded boolean NOT NULL DEFAULT false`;

  // Reviews are submitted publicly (no login) via each musician's profile,
  // then held as 'pending' until approved in /admin. Approved reviews show
  // on the musician's profile; approved AND featured reviews are the ones
  // eligible to rotate on the homepage.
  await sql`
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
  `;
  tablesEnsured = true;
}
