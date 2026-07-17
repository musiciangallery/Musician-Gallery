import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";
import { getStripe, SITE_URL } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type MusicianRow = {
  id: string;
  email: string | null;
  stripe_account_id: string | null;
};

/** Entry point for a musician's "Set up payouts" link (emailed once their
 * profile goes live). Creates their Stripe Express account on first visit,
 * then redirects straight into Stripe's hosted onboarding — no login on our
 * side required. Safe to hit again later: reuses the existing account and
 * just issues a fresh onboarding link, which is also how the refresh_url
 * below recovers from an expired link. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const onboardUrl = `${SITE_URL}/api/stripe/onboard/${slug}`;
  const statusUrl = `${SITE_URL}/payouts/${slug}`;

  try {
    await ensureTables();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, email, stripe_account_id FROM musicians WHERE slug = ${slug}
    `) as unknown as MusicianRow[];
    const musician = rows[0];

    if (!musician) {
      return NextResponse.redirect(`${statusUrl}?error=not-found`);
    }

    const stripe = getStripe();
    let accountId = musician.stripe_account_id;

    if (!accountId) {
      // Only "transfers" is requested — under the destination-charge model
      // used at checkout, the platform account processes the card payment,
      // and the connected account only ever receives transferred funds and
      // payouts, so it doesn't need card_payments capability of its own.
      const account = await stripe.accounts.create({
        type: "express",
        country: "NZ",
        email: musician.email || undefined,
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await sql`UPDATE musicians SET stripe_account_id = ${accountId} WHERE id = ${musician.id}`;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: onboardUrl,
      return_url: statusUrl,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err) {
    console.error("Stripe onboarding link failed:", err);
    return NextResponse.redirect(`${statusUrl}?error=stripe`);
  }
}
