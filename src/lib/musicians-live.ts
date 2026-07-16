// Server-only data access for real, approved musicians. This file imports
// the Postgres client, so it must only ever be imported from Server
// Components or API routes — never from a "use client" component (that
// would try to bundle the Postgres driver, which uses Node built-ins like
// "net" and "tls", for the browser and fail to build).
import { getSql, ensureTables } from "@/lib/db";
import { musicians, type Musician, type Occasion } from "@/lib/musicians";

type DbMusicianRow = {
  slug: string;
  name: string;
  instrument: string;
  region: string;
  type: string;
  occasions: string[] | null;
  vetted: boolean;
  rate_from: number | null;
  rate_unit: string | null;
  bio: string | null;
  long_bio: string | null;
  years_experience: string | null;
  photo: string | null;
  photos: string[] | null;
  video: string | null;
  email: string | null;
  featured: boolean;
};

function fromDbRow(row: DbMusicianRow): Musician {
  return {
    slug: row.slug,
    name: row.name,
    instrument: row.instrument,
    region: row.region,
    type: (row.type as Musician["type"]) ?? "Event Musician",
    occasions: (row.occasions ?? []) as Occasion[],
    vetted: row.vetted,
    rateFrom: row.rate_from ?? 0,
    rateUnit: (row.rate_unit as Musician["rateUnit"]) ?? "per event",
    bio: row.bio ?? "",
    longBio: row.long_bio ?? row.bio ?? "",
    yearsExperience: row.years_experience ?? "",
    photo: row.photo ?? undefined,
    photos: row.photos ?? undefined,
    video: row.video ?? undefined,
    email: row.email ?? undefined,
    featured: row.featured,
    isLive: true,
  };
}

/** Real, approved musicians. Fails gracefully (returns an empty list) if
 * the database isn't reachable — the mock profiles still work regardless. */
async function fetchLiveMusicians(): Promise<Musician[]> {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM musicians ORDER BY created_at DESC`) as unknown as DbMusicianRow[];
    return rows.map(fromDbRow);
  } catch {
    return [];
  }
}

/** The mock placeholder profiles plus any real, approved musicians —
 * placeholders are kept deliberately so the gallery looks populated during
 * soft launch (see /admin to approve real applications). */
export async function getAllMusicians(): Promise<Musician[]> {
  const live = await fetchLiveMusicians();
  return [...live, ...musicians];
}

export async function getMusicianBySlugAsync(slug: string): Promise<Musician | undefined> {
  const mock = musicians.find((m) => m.slug === slug);
  if (mock) return mock;
  const live = await fetchLiveMusicians();
  return live.find((m) => m.slug === slug);
}
