import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Musician Gallery" };

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
};

type Application = {
  id: string;
  name: string;
  email: string;
  instrument: string;
  region: string;
  type: string;
  bio: string;
  status: string;
  created_at: string;
};

async function getData() {
  try {
    await ensureTables();
    const sql = getSql();
    const bookings = (await sql`SELECT * FROM bookings ORDER BY created_at DESC`) as unknown as Booking[];
    const applications = (await sql`SELECT * FROM musician_applications ORDER BY created_at DESC`) as unknown as Application[];
    return { bookings, applications, error: null };
  } catch (err) {
    return {
      bookings: [] as Booking[],
      applications: [] as Application[],
      error: err instanceof Error ? err.message : "Could not connect to the database.",
    };
  }
}

const th = "text-left p-3 border-b border-rule text-[10px] tracking-[0.08em] uppercase text-mid font-normal";
const td = "p-3 border-b border-rule text-sm align-top";

export default async function AdminPage() {
  const { bookings, applications, error } = await getData();

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
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td className={td} colSpan={9}>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="font-serif text-2xl mb-4">
        Musician applications ({applications.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-rule">
          <thead>
            <tr className="bg-off/60">
              <th className={th}>Date</th>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Instrument</th>
              <th className={th}>Region</th>
              <th className={th}>Type</th>
              <th className={th}>Status</th>
              <th className={th}>Bio</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td className={td} colSpan={8}>
                  No applications yet.
                </td>
              </tr>
            ) : (
              applications.map((a) => (
                <tr key={a.id}>
                  <td className={td}>{new Date(a.created_at).toLocaleString()}</td>
                  <td className={td}>{a.name}</td>
                  <td className={td}>{a.email}</td>
                  <td className={td}>{a.instrument}</td>
                  <td className={td}>{a.region}</td>
                  <td className={td}>{a.type}</td>
                  <td className={td}>{a.status}</td>
                  <td className={td}>{a.bio || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
