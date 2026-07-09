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
}
