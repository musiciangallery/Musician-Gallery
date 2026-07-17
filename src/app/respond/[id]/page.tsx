import Link from "next/link";
import { notFound } from "next/navigation";
import { getSql, ensureTables } from "@/lib/db";
import BookingResponseForm from "@/components/BookingResponseForm";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  musician_slug: string;
  occasion: string;
  event_date: string;
  location: string | null;
  details: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  status: string;
  confirm_token: string | null;
  amount: number | null;
};

type MusicianRow = {
  name: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
};

/** No-login landing page a musician reaches via the "Confirm or decline"
 * link in their booking-request email. The confirm_token in the query
 * string stands in for authentication — anyone with the link (i.e. the
 * musician who received the email) can respond, matching the no-login
 * design used for /api/stripe/onboard too. */
export default async function RespondToBooking({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  await ensureTables();
  const sql = getSql();
  const bookingRows = (await sql`SELECT * FROM bookings WHERE id = ${id}`) as unknown as BookingRow[];
  const booking = bookingRows[0];
  if (!booking) notFound();

  const rowsData: [string, string][] = [
    ["Occasion", booking.occasion],
    ["Date / frequency", booking.event_date],
    ["Location", booking.location || "—"],
    ["Notes", booking.details || "—"],
    ["Client", booking.client_name],
    ["Client email", booking.client_email],
    ["Client phone", booking.client_phone || "—"],
  ];

  const invalidToken = !token || token !== booking.confirm_token;

  const musicianRows = (await sql`
    SELECT name, stripe_account_id, stripe_onboarded FROM musicians WHERE slug = ${booking.musician_slug}
  `) as unknown as MusicianRow[];
  const musician = musicianRows[0];
  const canConfirm = !!musician?.stripe_account_id && !!musician?.stripe_onboarded;

  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <span className="eyebrow">Booking request</span>
      <h1 className="font-serif text-3xl mt-3 mb-6">{booking.occasion}</h1>

      <div className="border border-rule">
        {rowsData.map(([label, value], i) => (
          <div
            key={label}
            className={`grid grid-cols-3 gap-4 px-4 py-3 ${i < rowsData.length - 1 ? "border-b border-rule" : ""}`}
          >
            <span className="text-[10px] tracking-[0.08em] uppercase text-mid col-span-1">{label}</span>
            <span className="text-sm col-span-2">{value}</span>
          </div>
        ))}
      </div>

      {invalidToken ? (
        <p className="text-sm text-accent mt-6">This link is invalid or has expired.</p>
      ) : booking.status === "confirmed" ? (
        <p className="text-sm text-mid mt-6">
          You&rsquo;ve already confirmed this booking{booking.amount ? ` for $${(booking.amount / 100).toFixed(2)}` : ""} — a payment link has been sent to the client.
        </p>
      ) : booking.status === "paid" ? (
        <p className="text-sm text-mid mt-6">
          This booking has been paid{booking.amount ? ` — $${(booking.amount / 100).toFixed(2)}` : ""}. Nothing more to do here.
        </p>
      ) : booking.status === "declined" ? (
        <p className="text-sm text-mid mt-6">You declined this booking.</p>
      ) : !musician ? (
        <p className="text-sm text-accent mt-6">We couldn&rsquo;t find your profile — get in touch and we&rsquo;ll sort it.</p>
      ) : (
        <>
          {!canConfirm && (
            <div className="mt-6 border-t border-rule pt-6">
              <p className="text-sm text-mid mb-4">
                Finish setting up automatic payouts before confirming bookings — it only takes a couple of minutes. You can still decline this one below without setting that up.
              </p>
              
                href={`/api/stripe/onboard/${booking.musician_slug}`}
                className="inline-block bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors"
              >
                Set up payouts
              </a>
            </div>
          )}
          <BookingResponseForm bookingId={booking.id} token={token as string} canConfirm={canConfirm} />
        </>
      )}

      <div className="mt-10">
        <Link href="/toolkit" className="text-xs text-mid hover:text-accent">&larr; Musician Toolkit</Link>
      </div>
    </section>
  );
}
