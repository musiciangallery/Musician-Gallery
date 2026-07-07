import { neon } from "@neondatabase/serverless";

// Vercel's Postgres/Neon storage integration automatically sets DATABASE_URL
// (or one of these related vars) once connected to the project in the
// Vercel dashboard. No manual configuration needed beyond that.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

export function getSql() {
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Add the Postgres/Neon storage integration to this project in the Vercel dashboard (Storage tab), which sets DATABASE_URL automatically."
    );
  }
  return neon(connectionString);
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
