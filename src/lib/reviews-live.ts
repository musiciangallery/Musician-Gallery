// Server-only data access for reviews. Must only be imported from Server
// Components or API routes — see the note in musicians-live.ts for why.
import { getSql, ensureTables } from "@/lib/db";

export type Review = {
  id: string;
  musicianSlug: string;
  reviewerName: string;
  context: string | null;
  body: string;
  status: string;
  featured: boolean;
  createdAt: string;
};

type ReviewRow = {
  id: string;
  musician_slug: string;
  reviewer_name: string;
  context: string | null;
  body: string;
  status: string;
  featured: boolean;
  created_at: string;
};

function fromRow(row: ReviewRow): Review {
  return {
    id: row.id,
    musicianSlug: row.musician_slug,
    reviewerName: row.reviewer_name,
    context: row.context,
    body: row.body,
    status: row.status,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

/** Approved reviews for one musician's profile page. Fails gracefully
 * (returns an empty list) if the database isn't reachable. */
export async function getApprovedReviewsForMusician(slug: string): Promise<Review[]> {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM reviews
      WHERE musician_slug = ${slug} AND status = 'approved'
      ORDER BY created_at DESC
    `) as unknown as ReviewRow[];
    return rows.map(fromRow);
  } catch {
    return [];
  }
}

/** Approved + featured reviews, site-wide — the pool the homepage rotates
 * through. Only reviews explicitly flagged "featured" in /admin appear
 * here, so the homepage stays fully in your control. */
export async function getFeaturedReviews(): Promise<Review[]> {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM reviews
      WHERE status = 'approved' AND featured = true
      ORDER BY created_at DESC
    `) as unknown as ReviewRow[];
    return rows.map(fromRow);
  } catch {
    return [];
  }
}
