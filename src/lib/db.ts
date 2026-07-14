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

export async function ensureTables() {
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
}
