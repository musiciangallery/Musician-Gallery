import { getSql, ensureTables } from "@/lib/db";
import ApplicationReviewCard from "@/components/ApplicationReviewCard";
import RemoveMusicianButton from "@/components/RemoveMusicianButton";

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
  years_experience: string | null;
  travel: string | null;
  lesson_format: string | null;
  lesson_length: string[] | null;
  student_level: string[] | null;
  available_as: string[] | null;
  genre: string[] | null;
  sound_system: string | null;
};

async function getData() {
  try {
    await ensureTables();
    const sql = getSql();
    const bookings = (await sql`SELECT * FROM bookings ORDER BY created_at DESC`) as unknown as Booking[];
    const applications = (await sql`SELECT * FROM musician_applications ORDER BY created_at DESC`) as unknown as Application[];
    const liveMusicians = (await sql`SELECT id, slug, name, instrument, region, type, vetted, photo, created_at FROM musicians ORDER BY created_at DESC`) as unknown as LiveMusician[];
    return { bookings, applications, liveMusicians, error: null };
  } catch (err) {
    return {
      bookings: [] as Booking[],
      applications: [] as Application[],
      liveMusicians: [] as LiveMusician[],
      error: err instanceof Error ? err.message : "Could not connect to the database.",
    };
  }
}

const th = "text-left p-3 border-b border-rule text-[10px] tracking-[0.08em] uppercase text-mid font-normal";
const td = "p-3 border-b border-rule text-sm align-top";

export default async function AdminPage() {
  const { bookings, applications, liveMusicians, error } = await getData();
  const pending = applications.filter((a) => a.status === "pending_review");
  const decided = applications.filter((a) => a.status !== "pending_review");

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
                    <a
                      href={`/musicians/${m.slug}`}
                      target="_blank"
                      className="text-accent hover:underline"
                    >
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
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-serif text-xl">{a.name}</h3>
                  <span className="text-[10px] tracking-[0.08em] uppercase text-mid">
                    {new Date(a.created_at).toLocaleString()} · {a.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-mid mb-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Email</span>
                    {a.email}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Region</span>
                    {a.region}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Type</span>
                    {a.type}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Experience</span>
                    {a.years_experience || "—"}
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Instrument(s)</span>
                    {instruments || "—"}
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em]">Travel</span>
                    {a.travel || "—"}
                  </div>
                  {(a.lesson_format || a.lesson_length?.length || a.student_level?.length) && (
                    <>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Lesson format</span>
                        {a.lesson_format || "—"}
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Lesson length</span>
                        {a.lesson_length?.join(", ") || "—"}
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Student level</span>
                        {a.student_level?.join(", ") || "—"}
                      </div>
                    </>
                  )}
                  {(a.available_as?.length || a.genre?.length || a.sound_system) && (
                    <>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Available as</span>
                        {a.available_as?.join(", ") || "—"}
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Genre</span>
                        {a.genre?.join(", ") || "—"}
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.08em]">Sound system</span>
                        {a.sound_system || "—"}
                      </div>
                    </>
                  )}
                </div>
                {a.bio && (
                  <div className="mb-2">
                    <span className="block text-[10px] uppercase tracking-[0.08em] text-mid">Bio</span>
                    {a.bio}
                  </div>
                )}
                {a.previous_work && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.08em] text-mid">Previous work</span>
                    {a.previous_work}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
