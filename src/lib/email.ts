import { Resend } from "resend";

// Booking-request emails — sent to Emily (the site owner), the musician
// (if we have their email on file), and a confirmation to the client.
// Guarded to no-op if RESEND_API_KEY isn't set yet, so bookings still save
// successfully even before the email service is configured in Vercel.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// FROM must be an address on a domain verified in Resend.
const FROM = process.env.BOOKING_FROM_EMAIL || "Musician Gallery <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@emilygracestudios.com";
const SITE_URL = process.env.SITE_URL || "https://musiciangallery.co.nz";

type BookingEmailInput = {
  musicianName: string;
  musicianEmail?: string;
  occasion: string;
  eventDate: string;
  location?: string;
  details?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  bookingId: string;
  confirmToken: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summaryLines(b: BookingEmailInput) {
  return [
    `Musician: ${b.musicianName}`,
    `Occasion: ${b.occasion}`,
    `Date / frequency: ${b.eventDate}`,
    `Location: ${b.location || "—"}`,
    `Notes: ${b.details || "—"}`,
    `Client: ${b.clientName}`,
    `Client email: ${b.clientEmail}`,
    `Client phone: ${b.clientPhone || "—"}`,
  ].join("\n");
}

/** A bordered key/value table matching the site's ".rule"-bordered detail
 * lists (e.g. the booking review step). Every value is user-submitted, so
 * everything is HTML-escaped before being inlined. */
function detailRowsHtml(b: BookingEmailInput) {
  const rows: [string, string][] = [
    ["Musician", b.musicianName],
    ["Occasion", b.occasion],
    ["Date / frequency", b.eventDate],
    ["Location", b.location || "—"],
    ["Notes", b.details || "—"],
    ["Client", b.clientName],
    ["Client email", b.clientEmail],
    ["Client phone", b.clientPhone || "—"],
  ];
  return rows
    .map(([label, value], i) => {
      const border = i < rows.length - 1 ? "border-bottom:1px solid #DDDAD4;" : "";
      return `
        <tr>
          <td style="padding:12px 16px; ${border} font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; color:#8A8680; width:38%; vertical-align:top;">${escapeHtml(
            label
          )}</td>
          <td style="padding:12px 16px; ${border} font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#181510; vertical-align:top;">${escapeHtml(
            value
          )}</td>
        </tr>`;
    })
    .join("");
}

/** Shared card layout — cream page background, off-white card, thin rule
 * borders, serif heading — matching the site's design system. Table-based
 * markup with inline styles throughout for broad email client support
 * (Gmail, Outlook, Apple Mail all strip or mangle <style> blocks and modern
 * CSS to varying degrees, so this deliberately avoids relying on either). */
function layout({
  eyebrow,
  heading,
  intro,
  rowsHtml,
  ctaHtml,
  footerNote,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  rowsHtml?: string;
  ctaHtml?: string;
  footerNote: string;
}) {
  const rowsSection = rowsHtml
    ? `
            <tr>
              <td style="padding:0 40px 36px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #DDDAD4;">
                  ${rowsHtml}
                </table>
              </td>
            </tr>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#F0EEEA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEA;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#F8F7F5; border:1px solid #DDDAD4;">
            <tr>
              <td style="padding:28px 40px; border-bottom:1px solid #DDDAD4;">
                <span style="font-family:Georgia,'Times New Roman',serif; font-size:17px; letter-spacing:3px; text-transform:uppercase; color:#181510;">Musician Gallery</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 8px 40px;">
                <p style="margin:0 0 10px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#B4472A;">${escapeHtml(
                  eyebrow
                )}</p>
                <h1 style="margin:0 0 16px 0; font-family:Georgia,'Times New Roman',serif; font-weight:400; font-size:26px; line-height:1.3; color:#181510;">${escapeHtml(
                  heading
                )}</h1>
                <p style="margin:0 0 24px 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#45403A;">${intro}</p>
                ${ctaHtml ? `<p style="margin:0 0 8px 0;">${ctaHtml}</p>` : ""}
              </td>
            </tr>${rowsSection}
            <tr>
              <td style="padding:20px 40px 32px 40px; border-top:1px solid #DDDAD4;">
                <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:1.6; color:#8A8680;">${escapeHtml(
                  footerNote
                )}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Sends the three booking-request emails (owner notification, musician
 * notification, client confirmation), each as a plain-text + branded-HTML
 * pair. Never throws — a failed or unconfigured email send should never
 * stop a booking that already saved successfully from returning a success
 * response. Failures are logged, not thrown. */
export async function sendBookingEmails(b: BookingEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking emails.");
    return;
  }

  const rowsHtml = detailRowsHtml(b);
  const sends: Promise<unknown>[] = [];

  sends.push(
    resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      replyTo: b.clientEmail,
      subject: `New booking request: ${b.musicianName}`,
      text: `A new booking request came in.\n\n${summaryLines(b)}`,
      html: layout({
        eyebrow: "New booking request",
        heading: b.musicianName,
        intro: "A new booking request just came in through the site. Reply directly to this email to reach the client.",
        rowsHtml,
        footerNote: "You're receiving this because you're the site owner at Musician Gallery.",
      }),
    })
  );

  if (b.musicianEmail) {
    const respondUrl = `${SITE_URL}/respond/${b.bookingId}?token=${b.confirmToken}`;
    const respondCta = `<a href="${respondUrl}" style="display:inline-block; background-color:#181510; color:#F8F7F5; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:12px 24px;">Confirm or decline</a>`;
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.musicianEmail,
        replyTo: b.clientEmail,
        subject: "New booking request via Musician Gallery",
        text: `You've received a new booking request through Musician Gallery.\n\n${summaryLines(
          b
        )}\n\nConfirm or decline this request: ${respondUrl}\n\nReply directly to this email to get in touch with ${b.clientName}.`,
        html: layout({
          eyebrow: "New booking request",
          heading: "You've got a new request",
          intro: `You've received a new booking request through Musician Gallery. Confirm or decline it below, or reply directly to this email to get in touch with ${escapeHtml(
            b.clientName
          )} first.`,
          rowsHtml,
          ctaHtml: respondCta,
          footerNote: "You're receiving this because you have a live profile on Musician Gallery.",
        }),
      })
    );
  }

  sends.push(
    resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      subject: `We've sent your request to ${b.musicianName}`,
      text: `Hi ${b.clientName},\n\nYour booking request has been sent to ${b.musicianName}. Most musicians respond within 48 hours.\n\nYour request:\n${summaryLines(
        b
      )}\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Request sent",
        heading: `${b.musicianName} will be in touch shortly`,
        intro: `Hi ${escapeHtml(b.clientName)}, your booking request has been sent to ${escapeHtml(
          b.musicianName
        )}. Most musicians respond within 48 hours.`,
        rowsHtml,
        footerNote:
          "This is a confirmation only — no payment has been taken. A booking is only confirmed once the musician responds.",
      }),
    })
  );

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Booking email failed to send:", r.reason);
  });
}

type WelcomeEmailInput = {
  musicianName: string;
  musicianEmail?: string;
  slug: string;
};

/** Sent once, right after a musician's application is approved and their
 * profile goes live, pointing them at the Musician Toolkit page. Silently
 * does nothing if there's no email on file or Resend isn't configured yet,
 * matching the fail-quiet pattern used for the booking emails. */
export async function sendWelcomeEmail(w: WelcomeEmailInput) {
  if (!w.musicianEmail) return;
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email.");
    return;
  }

  const firstName = w.musicianName.split(" ")[0];
  const profileUrl = `${SITE_URL}/musicians/${w.slug}`;
  const toolkitUrl = `${SITE_URL}/toolkit`;
  const payoutsUrl = `${SITE_URL}/api/stripe/onboard/${w.slug}`;
  const ctaHtml = `<a href="${payoutsUrl}" style="display:inline-block; background-color:#181510; color:#F8F7F5; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:12px 24px; margin-right:12px; margin-bottom:12px;">Set up payouts</a><a href="${toolkitUrl}" style="display:inline-block; background-color:#F8F7F5; color:#181510; border:1px solid #181510; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:11px 24px; margin-bottom:12px;">View the toolkit</a>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: w.musicianEmail,
      subject: "Your Musician Gallery profile is live",
      text: `Hi ${firstName},\n\nYour profile is now live on Musician Gallery: ${profileUrl}\n\nBefore your first booking, set up automatic payouts so you get paid the moment a client pays: ${payoutsUrl}\n\nWe've also put together a short toolkit of things worth having ready for your first booking or student: ${toolkitUrl}\n\nWelcome to the Gallery.`,
      html: layout({
        eyebrow: "You're live",
        heading: `Welcome, ${firstName}`,
        intro:
          "Your profile is now live on Musician Gallery. Set up automatic payouts so you're ready to get paid the moment a client confirms a booking, and take a look at a short toolkit of things worth having ready for your first booking or student.",
        ctaHtml,
        footerNote: "You're receiving this because your profile just went live on Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Welcome email failed to send:", err);
  }
}

type BookingConfirmedEmailInput = {
  musicianName: string;
  clientName: string;
  clientEmail: string;
  occasion: string;
  eventDate: string;
  amount: number;
  checkoutUrl: string;
};

/** Sent to the client once the musician confirms a booking and enters their
 * rate — the payment link (a Stripe-hosted Checkout page) is the whole
 * point of this email, so it's the primary CTA. Fail-quiet, matching the
 * other booking emails. */
export async function sendBookingConfirmedEmail(b: BookingConfirmedEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking confirmed email.");
    return;
  }

  const ctaHtml = `<a href="${b.checkoutUrl}" style="display:inline-block; background-color:#181510; color:#F8F7F5; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:12px 24px;">Pay $${b.amount.toFixed(
    2
  )} now</a>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      subject: `${b.musicianName} confirmed your booking — payment requested`,
      text: `Hi ${b.clientName},\n\n${b.musicianName} has confirmed your booking for ${b.occasion} on ${b.eventDate}, for $${b.amount.toFixed(
        2
      )} plus a 10% platform fee.\n\nPay securely here: ${b.checkoutUrl}\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Booking confirmed",
        heading: `${b.musicianName} is confirmed`,
        intro: `Hi ${escapeHtml(b.clientName)}, ${escapeHtml(
          b.musicianName
        )} has confirmed your booking for ${escapeHtml(b.occasion)} on ${escapeHtml(
          b.eventDate
        )}, for $${b.amount.toFixed(2)} plus a 10% platform fee. Pay securely below to lock it in.`,
        ctaHtml,
        footerNote: "Payment is handled securely by Stripe — Musician Gallery never sees your card details.",
      }),
    });
  } catch (err) {
    console.error("Booking confirmed email failed to send:", err);
  }
}

type BookingDeclinedEmailInput = {
  musicianName: string;
  clientName: string;
  clientEmail: string;
  occasion: string;
  eventDate: string;
};

/** Sent to the client if the musician declines. Fail-quiet, matching the
 * other booking emails. */
export async function sendBookingDeclinedEmail(b: BookingDeclinedEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking declined email.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      subject: `${b.musicianName} isn't available for your booking`,
      text: `Hi ${b.clientName},\n\nUnfortunately ${b.musicianName} isn't able to take your booking for ${b.occasion} on ${b.eventDate}. No payment has been taken.\n\nBrowse other musicians: ${SITE_URL}/gallery\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Booking declined",
        heading: `${b.musicianName} isn't available`,
        intro: `Hi ${escapeHtml(b.clientName)}, unfortunately ${escapeHtml(
          b.musicianName
        )} isn't able to take your booking for ${escapeHtml(b.occasion)} on ${escapeHtml(
          b.eventDate
        )}. No payment has been taken.`,
        ctaHtml: `<a href="${SITE_URL}/gallery" style="display:inline-block; background-color:#181510; color:#F8F7F5; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:12px 24px;">Browse other musicians</a>`,
        footerNote: "You're receiving this because you made a booking request through Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Booking declined email failed to send:", err);
  }
}

type BookingPaidEmailInput = {
  musicianName: string;
  musicianEmail?: string;
  clientName: string;
  occasion: string;
  eventDate: string;
  amount: number;
};

/** Sent once the Stripe webhook confirms a client's payment went through —
 * a copy to the site owner for visibility, and one to the musician letting
 * them know the money is already on its way to their bank account
 * automatically. Fail-quiet, matching the other booking emails. */
export async function sendBookingPaidEmail(b: BookingPaidEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking paid email.");
    return;
  }

  const sends: Promise<unknown>[] = [];

  sends.push(
    resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      subject: `Booking paid: ${b.musicianName}`,
      text: `${b.clientName} paid for ${b.occasion} on ${b.eventDate} with ${b.musicianName}. Amount: $${b.amount.toFixed(
        2
      )} (musician's share, paid out automatically).`,
      html: layout({
        eyebrow: "Payment received",
        heading: `${b.musicianName} — booking paid`,
        intro: `${escapeHtml(b.clientName)} paid for ${escapeHtml(b.occasion)} on ${escapeHtml(
          b.eventDate
        )} with ${escapeHtml(b.musicianName)}. A payout of $${b.amount.toFixed(
          2
        )} is on its way to the musician automatically.`,
        footerNote: "You're receiving this because you're the site owner at Musician Gallery.",
      }),
    })
  );

  if (b.musicianEmail) {
    const firstName = b.musicianName.split(" ")[0];
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.musicianEmail,
        subject: `You've been paid for ${b.occasion}`,
        text: `Hi ${firstName},\n\n${b.clientName} just paid for your booking (${b.occasion} on ${b.eventDate}). $${b.amount.toFixed(
          2
        )} is on its way to your bank account automatically — no invoicing needed.\n\n— Musician Gallery`,
        html: layout({
          eyebrow: "Payment received",
          heading: "You've been paid",
          intro: `Hi ${escapeHtml(firstName)}, ${escapeHtml(b.clientName)} just paid for your booking (${escapeHtml(
            b.occasion
          )} on ${escapeHtml(b.eventDate)}). $${b.amount.toFixed(
            2
          )} is on its way to your bank account automatically — no invoicing needed.`,
          footerNote: "You're receiving this because you have a live profile on Musician Gallery.",
        }),
      })
    );
  }

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Booking paid email failed to send:", r.reason);
  });
}
