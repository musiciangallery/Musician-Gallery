import { getSql, ensureTables } from "@/lib/db";
import ApplicationReviewCard from "@/components/ApplicationReviewCard";
import RemoveMusicianButton from "@/components/RemoveMusicianButton";
import FeatureMusicianButton from "@/components/FeatureMusicianButton";
import { PendingReviewActions, ApprovedReviewActions } from "@/components/ReviewActionButtons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Musician Gallery" };

type LiveMusician = {
  id: string;
  slug: string;
  name: string;
  instrument: string;
  region: string;
  type: string;
  vetted: boolean;
  photo: string | null;
  featured: boolean;
  stripe_onboarded: boolean;
  created_at: string;
};

type Booking = {
  id: string;
  musician_slug: string;
  occasion: string;
  event_date: string;
  location: string;
  details: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  created_at: string;
  status: string;
  amount: number | null;
};

type Review = {
  id: string;
  musician_slug: string;
  reviewer_name: string;
  context: string | null;
  body: string;
  status: string;
  featured: boolean;
  created_at: string;
};

type Application = {
  id: string;
  name: string;
  email: string;
  instrument: string;
  instruments: string[] | null;
  region: string;
  type: string;
  bio: string;
  status: string;
  created_at: string;
  previous_work: string | null;
  previous_work_files: string[] | null;
  years_experience: string | null;
  travel: string | null;
  lesson_format: string | null;
  lesson_length: string[] | null;
  student_level: string[] | null;
  available_as: string[] | null;
  genre: string[] | null;
  sound_system: string | null;
  vetting_certificate_url: string | null;
  vetting_certificate_number: string | null;
};

async function getData() {
  try {
    await ensureTables();
    const sql = getSql();
    const bookings = (await sql`SELECT * FROM bookings ORDER BY created_at DESC`) as unknown as Booking[];
    const applications = (await sql`SELECT * FROM musician_applications ORDER BY created_at DESC`) as unknown as Application[];
    const liveMusicians = (await sql`SELECT id, slug, name, instrument, region, type, vetted, photo, featured, stripe_onboarded, created_at FROM musicians ORDER BY created_at DESC`) as unknown as LiveMusician[];
    const reviews = (await sql`SELECT * FROM reviews ORDER BY created_at DESC`) as unknown as Review[];
    return { bookings, applications, liveMusicians, reviews, error: null };
  } catch (err) {
    return {
      bookings: [] as Booking[],
      applications: [] as Application[],
      liveMusicians: [] as LiveMusician[],
      reviews: [] as Review[],
      error: err instanceof Error ? err.message : "Could not connect to the database.",
    };
  }
}

const th = "text-left p-3 border-b border-rule text-[10px] tracking-[0.08em] uppercase text-mid font-normal";
const td = "p-3 border-b border-rule text-sm align-top";

function statusLabel(status: string, amountCents: number | null) {
  const amount = amountCents ? ` — $${(amountCents / 100).toFixed(2)}` : "";
  switch (status) {
    case "paid":
      return `Paid${amount}`;
    case "confirmed":
      return `Confirmed, awaiting payment${amount}`;
    case "declined":
      return "Declined";
    default:
      return "Pending";
  }
}

export default async function AdminPage() {
  const { bookings, applications, liveMusicians, reviews, error } = await getData();
  const pending = applications.filter((a) => a.status === "pending_review");
  const decided = applications.filter((a) => a.status !== "pending_review");
  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const approvedReviews = reviews.filter((r) => r.status === "approved");

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-[52px] py-16">
      <span className="eyebrow">Internal</span>
      <h1 className="font-serif text-4xl mt-3 mb-10">Admin</h1>

      {error && (
        <div className="bg-off/60 border border-rule p-4 text-sm mb-10">
          <p className="font-medium mb-1">Database not connected yet</p>
          <p className="text-mid">{error}</p>
          <p className="text-mid mt-2">
            Add the Postgres storage integration to this project in the
            Vercel dashboard (Storage tab), then reload this page.
          </p>
        </div>
      )}

      <h2 className="font-serif text-2xl mb-4">
        Booking requests ({bookings.length})
      </h2>
      <div className="overflow-x-auto mb-16">
        <table className="w-full border border-rule">
          <thead>
            <tr className="bg-off/60">
              <th className={th}>Date</th>
              <th className={th}>Musician</th>
              <th className={th}>Occasion</th>
              <th className={th}>Event Date</th>
              <th className={th}>Location</th>
              <th className={th}>Client</th>
              <th className={th}>Email</th>
              <th className={th}>Phone</th>
              <th className={th}>Notes</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td className={td} colSpan={10}>
                  No booking requests yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td className={td}>{new Date(b.created_at).toLocaleString()}</td>
                  <td className={td}>{b.musician_slug}</td>
                  <td className={td}>{b.occasion}</td>
                  <td className={td}>{b.event_date}</td>
                  <td className={td}>{b.location || "—"}</td>
                  <td className={td}>{b.client_name}</td>
                  <td className={td}>{b.client_email}</td>
                  <td className={td}>{b.client_phone || "—"}</td>
                  <td className={td}>{b.details || "—"}</td>
                  <td className={td}>{statusLabel(b.status, b.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="font-serif text-2xl mb-4">
        Pending applications ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="text-sm text-mid border border-rule p-4 mb-16">
          No applications waiting for review.
        </p>
      ) : (
        <div className="space-y-4 mb-16">
          {pending.map((a) => (
            <ApplicationReviewCard key={a.id} a={a} />
          ))}
        </div>
      )}

      <h2 className="font-serif text-2xl mb-4">
        Live musicians ({liveMusicians.length})
      </h2>
      {liveMusicians.length === 0 ? (
        <p className="text-sm text-mid border border-rule p-4 mb-16">
          No approved musicians published yet.
        </p>
      ) : (
        <div className="overflow-x-auto mb-16">
          <table className="w-full border border-rule">
            <thead>
              <tr className="bg-off/60">
                <th className={th}>Name</th>
                <th className={th}>Instrument</th>
                <th className={th}>Region</th>
                <th className={th}>Type</th>
                <th className={th}>Vetted</th>
                <th className={th}>Featured</th>
                <th className={th}>Payouts</th>
                <th className={th}>Profile</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {liveMusicians.map((m) => (
                <tr key={m.slug}>
                  <td className={td}>{m.name}</td>
                  <td className={td}>{m.instrument}</td>
                  <td className={td}>{m.region}</td>
                  <td className={td}>{m.type}</td>
                  <td className={td}>{m.vetted ? "Yes" : "No"}</td>
                  <td className={td}>
                    <FeatureMusicianButton id={m.id} featured={m.featured} />
                  </td>
                  <td className={td}>{m.stripe_onboarded ? "Connected" : "Not connected"}</td>
                  <td className={td}>
                    <a href={`/musicians/${m.slug}`} target="_blank" className="text-accent hover:underline">
                      View &rarr;
                    </a>
                  </td>
                  <td className={td}>
                    <RemoveMusicianButton id={m.id} name={m.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="font-serif text-2xl mb-4">
        Pending reviews ({pendingReviews.length})
      </h2>
      {pendingReviews.length === 0 ? (
        <p className="text-sm text-mid border border-rule p-4 mb-16">
          No reviews waiting for approval.
        </p>
      ) : (
        <div className="overflow-x-auto mb-16">
          <table className="w-full border border-rule">
            <thead>
              <tr className="bg-off/60">
                <th className={th}>Date</th>
                <th className={th}>Musician</th>
                <th className={th}>Reviewer</th>
                <th className={th}>Context</th>
                <th className={th}>Review</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {pendingReviews.map((r) => (
                <tr key={r.id}>
                  <td className={td}>{new Date(r.created_at).toLocaleString()}</td>
                  <td className={td}>{r.musician_slug}</td>
                  <td className={td}>{r.reviewer_name}</td>
                  <td className={td}>{r.context || "—"}</td>
                  <td className={td}>{r.body}</td>
                  <td className={td}>
                    <PendingReviewActions id={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="font-serif text-2xl mb-4">
        Approved reviews ({approvedReviews.length})
      </h2>
      {approvedReviews.length === 0 ? (
        <p className="text-sm text-mid border border-rule p-4 mb-16">
          No approved reviews yet.
        </p>
      ) : (
        <div className="overflow-x-auto mb-16">
          <table className="w-full border border-rule">
            <thead>
              <tr className="bg-off/60">
                <th className={th}>Date</th>
                <th className={th}>Musician</th>
                <th className={th}>Reviewer</th>
                <th className={th}>Context</th>
                <th className={th}>Review</th>
                <th className={th}>Featured</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {approvedReviews.map((r) => (
                <tr key={r.id}>
                  <td className={td}>{new Date(r.created_at).toLocaleString()}</td>
                  <td className={td}>{r.musician_slug}</td>
                  <td className={td}>{r.reviewer_name}</td>
                  <td className={td}>{r.context || "—"}</td>
                  <td className={td}>{r.body}</td>
                  <td className={td}>{r.featured ? "Yes" : "No"}</td>
                  <td className={td}>
                    <ApprovedReviewActions id={r.id} featured={r.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="font-serif text-2xl mb-4">
        Decided applications ({decided.length})
      </h2>
      {decided.length === 0 ? (
        <p className="text-sm text-mid border border-rule p-4">No decided applications yet.</p>
      ) : (
        <div className="space-y-4">
          {decided.map((a) => {
            const instruments = a.instruments?.length ? a.instruments.join(", ") : a.instrument;
            return (
              <div key={a.id} className="border border-rule p-5 text-sm">
                <div
