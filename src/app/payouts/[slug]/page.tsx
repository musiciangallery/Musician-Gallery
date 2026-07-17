import Link from "next/link";
import { notFound } from "next/navigation";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type MusicianRow = {
  id: string;
  name: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
};

/** Return page a musician lands on after Stripe's hosted onboarding (linked
 * from /api/stripe/onboard/[slug]). Checks the account status directly with
 * Stripe on load — rather than relying solely on the account.updated
 * webhook, which may not have arrived yet — so the status shown here is
 * accurate immediately, and best-effort syncs stripe_onboarded either way. */
export default async function PayoutsStatus({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  await ensureTables();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, stripe_account_id, stripe_onboarded
    FROM musicians WHERE slug = ${slug}
  `) as unknown as MusicianRow[];
  const musician = rows[0];
  if (!musician) notFound();

  let payoutsEnabled = musician.stripe_onboarded;
  let detailsSubmitted = false;

  if (musician.stripe_account_id && !error) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(musician.stripe_account_id);
      payoutsEnabled = !!account.payouts_enabled;
      detailsSubmitted = !!account.details_submitted;
      if (payoutsEnabled && !musician.stripe_onboarded) {
        await sql`UPDATE musicians SET stripe_onboarded = true WHERE id = ${musician.id}`;
      }
    } catch (err) {
      console.error("Failed to check Stripe account status:", err);
    }
  }

  const firstName = musician.name.split(" ")[0];
  const onboardHref = `/api/stripe/onboard/${slug}`;
  const btnClass = "inline-block bg-blk text-w text-xs tracking-[0.1em] uppercase py-3 px-8 hover:bg-accent transition-colors";

  return (
    <section className="max-w-lg mx-auto px-6 py-20 text-center">
      <span className="eyebrow">Payouts</span>
      {error ? (
        <>
          <h1 className="font-serif text-3xl mt-3 mb-4">Something went wrong</h1>
          <p className="text-sm text-mid mb-8">We couldn&rsquo;t start your payout setup. Try the link below again, or get in touch if it keeps happening.</p>
          <a href={onboardHref} className={btnClass}>Try again</a>
        </>
      ) : payoutsEnabled ? (
        <>
          <h1 className="font-serif text-3xl mt-3 mb-4">You&rsquo;re all set, {firstName}</h1>
          <p className="text-sm text-mid mb-8">Your bank account is connected. Once a client pays for a confirmed booking, your share is paid out to you automatically — no invoicing required.</p>
        </>
      ) : detailsSubmitted ? (
        <>
          <h1 className="font-serif text-3xl mt-3 mb-4">Almost there</h1>
          <p className="text-sm text-mid mb-8">Stripe is finishing a few checks on your details. This usually only takes a few minutes — check back shortly.</p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-3xl mt-3 mb-4">Let&rsquo;s finish setting up your payouts</h1>
          <p className="text-sm text-mid mb-8">A few more details are needed with Stripe, our payments partner, before you can be paid automatically for bookings.</p>
          <a href={onboardHref} className={btnClass}>Continue setup</a>
        </>
      )}
      <div className="mt-10">
        <Link href={`/musicians/${slug}`} className="text-xs text-mid hover:text-accent">&larr; Back to your profile</Link>
      </div>
    </section>
  );
}
