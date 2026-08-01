import { Resend } from "resend";
import { maskedReplyAddress } from "@/lib/reply-mask";

// Booking-request emails — sent to Emily (the site owner), the musician
// (if we have their email on file), and a confirmation to the client.
// Guarded to no-op if RESEND_API_KEY isn't set yet, so bookings still save
// successfully even before the email service is configured in Vercel.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// FROM must be an address on a domain verified in Resend.
const FROM = process.env.BOOKING_FROM_EMAIL || "Musician Gallery <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@musiciangallery.co.nz";
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
  /** The booking's short reply code (see lib/reply-mask.ts), used to build
   * its masked reply address. Separate from bookingId, which is the real
   * booking id used for the confirm/decline link. */
  replyCode: string;
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

/** Formats a booking's event date for display in emails. One-off bookings
 * store an actual date string ("2026-08-20"); recurring lesson bookings
 * store the literal "Weekly" or "Fortnightly" instead, which pass through
 * unchanged. Falls back to the raw value if it can't be parsed, matching
 * the fail-open pattern used elsewhere in the booking emails — better to
 * show something than crash on an unexpected format. Formats in UTC so the
 * date-only input can't shift a day depending on the server's timezone. */
function formatEventDate(eventDate: string): string {
  if (eventDate === "Weekly" || eventDate === "Fortnightly") return eventDate;
  const parsed = new Date(eventDate);
  if (Number.isNaN(parsed.getTime())) return eventDate;
  return parsed.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function summaryLines(b: BookingEmailInput) {
  return [
    `Musician: ${b.musicianName}`,
    `Occasion: ${b.occasion}`,
    `Date / frequency: ${formatEventDate(b.eventDate)}`,
    `Location: ${b.location || "—"}`,
    `Notes: ${b.details || "—"}`,
    `Client: ${b.clientName}`,
    `Client email: ${b.clientEmail}`,
    `Client phone: ${b.clientPhone || "—"}`,
  ].join("\n");
}

/** A bordered key/value table matching the site's ".rule"-bordered detail
 * lists (e.g. the booking review step). Every value is user-submitted, so
 * everything is HTML-escaped before being inlined. Set
 * includeClientContact: false to drop the Client/Client email/Client phone
 * rows — used for the musician's copy, since printing the client's real
 * contact details there would defeat the point of the masked reply
 * address. The owner's copy keeps them, since Emily still needs a way to
 * reach the client directly if something comes up. */
function detailRowsHtml(b: BookingEmailInput, includeClientContact = true) {
  const rows: [string, string][] = [
    ["Musician", b.musicianName],
    ["Occasion", b.occasion],
    ["Date / frequency", formatEventDate(b.eventDate)],
    ["Location", b.location || "—"],
    ["Notes", b.details || "—"],
    ...(includeClientContact
      ? ([
          ["Client", b.clientName],
          ["Client email", b.clientEmail],
          ["Client phone", b.clientPhone || "—"],
        ] as [string, string][])
      : []),
  ];
  return rows
    .map(([label, value], i) => {
      const border = i < rows.length - 1 ? "border-bottom:1px solid #DDDAD4;" : "";
      return `
        <tr>
          <td style="padding:12px 16px; ${border} font-family:${SANS_STACK}; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; color:#8A8680; width:38%; vertical-align:top;">${escapeHtml(
            label
          )}</td>
          <td style="padding:12px 16px; ${border} font-family:${SANS_STACK}; font-size:13px; color:#181510; vertical-align:top;">${escapeHtml(
            value
          )}</td>
        </tr>`;
    })
    .join("");
}

// Web font stacks — the real Google Fonts the site uses (Cormorant Garamond
// for headings, DM Sans for body/UI text), each with the previous
// Georgia/Arial pairing kept as the fallback. Clients that load the
// <link> in the <head> (Apple Mail, most webmail) get the real, classier
// typeface; clients that strip <head> content or don't support web fonts
// (Outlook desktop, mainly) just fall through to the safe system fonts
// exactly as before — nothing breaks either way.
const SERIF_STACK = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS_STACK = "'DM Sans', Arial, Helvetica, sans-serif";

/** Primary (solid) and secondary (outline) button styles, matching the
 * site's own bg-blk/hover:bg-accent and border/hover:border-accent button
 * classes (see globals.css + the .1em tracking + uppercase treatment used
 * throughout the app's own CTAs). Padding is 1px tighter on the vertical
 * axis for the outline button to compensate for its border, so both sit at
 * the same visual height side by side. */
function primaryButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block; background-color:#181510; color:#F8F7F5; font-family:${SANS_STACK}; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:12px 32px;">${escapeHtml(
    label
  )}</a>`;
}

function secondaryButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block; background-color:#F8F7F5; color:#181510; border:1px solid #181510; font-family:${SANS_STACK}; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; padding:11px 31px;">${escapeHtml(
    label
  )}</a>`;
}

/** Shared card layout — cream page background, off-white card, thin rule
 * border, centered serif heading — matching the site's own "confirmation"
 * pattern (see the .text-center.border.border-rule block JoinForm.tsx
 * renders after a successful submission: gray .eyebrow label, centered
 * font-serif heading, centered muted-gray body copy, generous padding).
 * Colors pulled directly from globals.css: --off, --w, --rule, --mid,
 * --blk. The eyebrow deliberately uses --mid (gray), not --accent —
 * the site's real .eyebrow class is never accent-colored, only ever gray.
 * Table-based markup with inline styles throughout for broad email client
 * support (Gmail, Outlook, Apple Mail all strip or mangle <style> blocks
 * and modern CSS to varying degrees, so this deliberately avoids relying on
 * either). The <link> in the <head> below requests the site's actual
 * Cormorant Garamond/DM Sans — clients that honour it (Apple Mail, most
 * webmail) render the real typeface; clients that strip <head> content or
 * don't support web fonts (Outlook desktop, mainly) silently fall through
 * to the Georgia/Arial pairing already set as the rest of each font-family
 * stack, so nothing breaks for them either way. */
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
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet" />
    <!--<![endif]-->
    <style>
      :root { color-scheme: light; supported-color-schemes: light; }
      @media (prefers-color-scheme: dark) {
        body, table, td { background-color: #F0EEEA !important; }
        .mg-card { background-color: #F8F7F5 !important; }
        h1, .mg-wordmark { color: #181510 !important; }
        p, .mg-muted { color: #8A8680 !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#F0EEEA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0EEEA;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#F8F7F5; border:1px solid #DDDAD4;">
            <tr>
              <td align="center" style="padding:24px 40px; border-bottom:1px solid #DDDAD4;">
                <span style="font-family:${SERIF_STACK}; font-size:18px; letter-spacing:4px; text-transform:uppercase; color:#181510;">Musician Gallery</span>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:48px 40px 8px 40px; text-align:center;">
                <p style="margin:0 0 12px 0; font-family:${SANS_STACK}; font-size:9px; letter-spacing:2.5px; text-transform:uppercase; color:#8A8680;">${escapeHtml(
                  eyebrow
                )}</p>
                <h1 style="margin:0 0 16px 0; font-family:${SERIF_STACK}; font-weight:400; font-size:28px; line-height:1.3; color:#181510;">${escapeHtml(
                  heading
                )}</h1>
                <p style="margin:0 auto 28px auto; max-width:360px; font-family:${SANS_STACK}; font-size:14px; line-height:1.6; color:#8A8680;">${intro}</p>
                ${ctaHtml ? `<p style="margin:0 0 8px 0;">${ctaHtml}</p>` : ""}
              </td>
            </tr>${rowsSection}
            <tr>
              <td align="center" style="padding:20px 40px 36px 40px; border-top:1px solid #DDDAD4; text-align:center;">
                <p style="margin:0; font-family:${SANS_STACK}; font-size:11px; line-height:1.6; color:#8A8680;">${escapeHtml(
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
  const musicianRowsHtml = detailRowsHtml(b, false);
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
    // Reply-to is the booking's masked address, not the client's real
    // email — replies still reach the client (relayed through the inbound
    // webhook, see app/api/email/inbound/route.ts), but neither side ever
    // sees the other's actual address. See lib/reply-mask.ts.
    //
    // Copy is deliberately conversation-first rather than decision-first —
    // the heading and intro lead with "no rush, have a chat first" and only
    // mention the confirm/decline button once that's been said, instead of
    // opening with "would like to book you" and treating the reply option
    // as a footnote to a decision that's already expected.
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.musicianEmail,
        replyTo: maskedReplyAddress(b.replyCode),
        subject: `${b.clientName} is looking for a musician for ${b.occasion}`,
        text: `${b.clientName} is looking to book you for ${b.occasion} on ${formatEventDate(
          b.eventDate
        )}.\n\n${summaryLines(
          b
        )}\n\nHave a read of the details above, and reply to this email directly to reach ${
          b.clientName
        } with any questions or details requiring clarification.\n\nWhen you're ready to confirm the booking, use the button below and let us handle the rest: ${respondUrl}\n\nMusician Gallery`,
        html: layout({
          eyebrow: "New booking request",
          heading: `${b.clientName} has a request for you`,
          intro: `${escapeHtml(b.clientName)} is looking to book you for ${escapeHtml(
            b.occasion
          )} on ${escapeHtml(
            formatEventDate(b.eventDate)
          )}. Have a read of the details below, and reply to this email directly to reach ${escapeHtml(
            b.clientName
          )} with any questions or details requiring clarification. When you're ready to confirm the booking, simply use the button below and let us handle the rest.`,
          rowsHtml: musicianRowsHtml,
          ctaHtml: primaryButton("Confirm or decline", respondUrl),
          footerNote:
            "You're receiving this because you have a live profile on Musician Gallery. Replies are relayed privately. Your email address is never shared with the client. Replies only reach the other person when sent from the email address you gave us. A different inbox won't connect.",
        }),
      })
    );
  }

  sends.push(
    resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      // Reply-to is the booking's masked address, matching the musician's
      // copy — the intro below tells the client they can reach the
      // musician by replying directly, so this has to route through the
      // relay for that to actually be true. See lib/reply-mask.ts.
      replyTo: maskedReplyAddress(b.replyCode),
      subject: `We've sent your request to ${b.musicianName}`,
      text: `Hi ${b.clientName},\n\nYour request has been sent to ${
        b.musicianName
      }. You'll hear back from them through here, perhaps with a question or two, or to confirm your booking. Either way, you can contact them directly by replying to this email. The conversation window will remain open until a week after the lesson or event date. If the booking is respectfully declined, this conversation closes right away.\n\nYour request:\n${summaryLines(
        b
      )}\n\nMusician Gallery`,
      html: layout({
        eyebrow: "Request sent",
        heading: `${b.musicianName} will be in touch`,
        intro: `Hi ${escapeHtml(b.clientName)}, your request has been sent to ${escapeHtml(
          b.musicianName
        )}. You'll hear back from them through here, perhaps with a question or two, or to confirm your booking. Either way, you can contact them directly by replying to this email. The conversation window will remain open until a week after the lesson or event date. If the booking is respectfully declined, this conversation closes right away.`,
        rowsHtml: musicianRowsHtml,
        footerNote:
          "This message only confirms your request was sent. The booking isn't official until you receive a confirmation. Please ensure the email address given is the one used to send replies. A different inbox won't connect.",
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
  const ctaHtml = `<span style="display:inline-block; margin-right:12px; margin-bottom:12px;">${primaryButton(
    "Set up payouts",
    payoutsUrl
  )}</span><span style="display:inline-block; margin-bottom:12px;">${secondaryButton("View the toolkit", toolkitUrl)}</span>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: w.musicianEmail,
      subject: "Your Musician Gallery profile is live",
      text: `Hi ${firstName},\n\nWelcome to the Gallery — your profile is now live: ${profileUrl}\n\nBefore your first booking, set up automatic payouts so you get paid the moment a client pays: ${payoutsUrl}\n\nWe've also put together a short toolkit of things worth having ready for your first booking or student: ${toolkitUrl}\n\nWhen a client reaches out, you'll have a chance to talk directly before confirming anything — no pressure to decide on the spot.\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "You're live",
        heading: `Welcome, ${firstName}`,
        intro:
          "Your profile is now live on Musician Gallery. Set up automatic payouts so you're ready to get paid the moment a client confirms a booking, and take a look at a short toolkit of things worth having ready for your first booking or student. When a client reaches out, you'll have a chance to talk directly before confirming anything — no pressure to decide on the spot.",
        ctaHtml,
        footerNote: "You're receiving this because your profile just went live on Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Welcome email failed to send:", err);
  }
}

type ApplicationReceivedEmailInput = {
  name: string;
  email: string;
};

/** Sent the moment a musician submits the Join form, so the application
 * doesn't feel like it's vanished into a void while it waits for manual
 * review. Fail-quiet, matching the other emails — a failed send should
 * never stop the application itself from saving. */
export async function sendApplicationReceivedEmail(a: ApplicationReceivedEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping application received email.");
    return;
  }

  const firstName = a.name.split(" ")[0];

  try {
    await resend.emails.send({
      from: FROM,
      to: a.email,
      subject: "We've received your application",
      text: `Hi ${firstName},\n\nYour application to join Musician Gallery has been received. Thank you for your patience, as we personally review your application.\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Application received",
        heading: `Thanks for applying, ${firstName}`,
        intro:
          "Your application to join Musician Gallery has been received. Thank you for your patience, as we personally review your application.",
        footerNote: "You're receiving this because you applied to join Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Application received email failed to send:", err);
  }
}

type ApplicationDeclinedReminderInput = {
  name: string;
  email: string;
};

/** No email goes to the applicant when their application is declined —
 * that's deliberately left as a personal, manual decision for Emily to
 * make case by case, rather than the platform delivering a "no" on her
 * behalf. This instead notifies her (with reply-to set to the applicant)
 * so declining in /admin doubles as a reminder to personally follow up if
 * she chooses to, rather than the applicant just hearing silence. Fail-
 * quiet, matching the other emails. */
export async function sendApplicationDeclinedReminderEmail(a: ApplicationDeclinedReminderInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping application declined reminder email.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      replyTo: a.email,
      subject: `Reminder: you declined ${a.name}'s application`,
      text: `You declined ${a.name}'s application (${a.email}). No email was sent to them — reply directly to this email to follow up personally if you'd like to.\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Application declined",
        heading: `You declined ${a.name}`,
        intro: `You declined ${escapeHtml(a.name)}'s application (${escapeHtml(
          a.email
        )}). No email was sent to them — reply directly to this email to follow up personally if you'd like to.`,
        footerNote: "You're receiving this because you're the site owner at Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Application declined reminder email failed to send:", err);
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
  /** Set only for recurring lesson bookings — switches the copy from "pay
   * this once" to "this sets up automatic weekly/fortnightly billing". */
  sessions?: number;
  /** Used to generate this booking's masked reply address — the booking is
   * still very much "live" at this stage (not yet paid), so conversation
   * should stay open. See lib/reply-mask.ts. */
  replyCode: string;
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

  const isRecurring = !!b.sessions && b.sessions > 0;
  const frequency = b.eventDate === "Fortnightly" ? "fortnightly" : "weekly";
  const subject = isRecurring
    ? `${b.musicianName} confirmed your lessons — set up payment`
    : `${b.musicianName} confirmed your booking — payment requested`;
  // Copy deliberately leads with the good news, not the invoice, and
  // explains the platform fee as the thing that made finding and booking
  // this musician possible in the first place — reframing it from "cost
  // tacked on" to "what connected you" — rather than leaving it as an
  // unexplained line-item.
  const bodyText = isRecurring
    ? `Good news. After chatting, ${b.musicianName} has confirmed your ${frequency} lessons together. It's $${b.amount.toFixed(
        2
      )} per lesson plus a 10% platform fee, for ${
        b.sessions
      } lessons in total. That fee's what makes it possible to find and book musicians like ${
        b.musicianName
      } in the first place, and it goes toward supporting them and the wider community of musicians on the gallery. Set up payment once below and you're all set. It bills automatically each ${
        frequency === "fortnightly" ? "fortnight" : "week"
      } until all ${b.sessions} are complete, so there's no need to pay each time separately.`
    : `Good news. After chatting, ${b.musicianName} has confirmed your booking for ${b.occasion} on ${b.eventDate}. The total comes to $${b.amount.toFixed(
        2
      )}, plus a 10% platform fee. That fee's what makes it possible to find and book musicians like ${
        b.musicianName
      } in the first place, and it goes toward supporting them and the wider community of musicians on the gallery.`;

  // The booking's masked address, not the musician's real email — the
  // conversation stays open through payment and beyond (see
  // lib/reply-mask.ts for exactly how long), so replies here keep routing
  // through the same relay as the original request email.
  const replyTo = maskedReplyAddress(b.replyCode);
  const addressNote =
    " Replies only reach the other person when sent from the email address you gave us. A different inbox won't connect.";

  try {
    await resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      replyTo,
      subject,
      text: `Hi ${b.clientName},\n\n${bodyText}\n\nSet up payment securely here: ${b.checkoutUrl}\n\n— Musician Gallery`,
      html: layout({
        eyebrow: isRecurring ? "Lessons confirmed" : "Booking confirmed",
        heading: `${b.musicianName} is confirmed`,
        intro: `Hi ${escapeHtml(b.clientName)}, ${escapeHtml(bodyText)}`,
        ctaHtml: primaryButton(
          isRecurring ? "Set up payment" : `Pay $${b.amount.toFixed(2)} now`,
          b.checkoutUrl
        ),
        footerNote:
          (isRecurring
            ? "Payment is handled securely by Stripe — Musician Gallery never sees your card details. You can stop anytime by getting in touch."
            : "Payment is handled securely by Stripe — Musician Gallery never sees your card details.") +
          addressNote,
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
      // No masked reply-to here, deliberately — the reply window for this
      // booking closes the moment it's declined (see
      // lib/reply-mask.ts), so there's no live conversation left to route
      // a reply into.
      subject: `${b.musicianName} isn't available for your booking`,
      text: `Hi ${b.clientName},\n\nUnfortunately ${b.musicianName} isn't able to take your booking for ${b.occasion} on ${b.eventDate}. This means this request through Musician Gallery will now be closed, but there are plenty of other musicians in the gallery who'd love to help with ${b.occasion}.\n\nBrowse other musicians: ${SITE_URL}/gallery\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Booking declined",
        heading: `${b.musicianName} isn't available`,
        intro: `Hi ${escapeHtml(b.clientName)}, unfortunately ${escapeHtml(
          b.musicianName
        )} isn't able to take your booking for ${escapeHtml(b.occasion)} on ${escapeHtml(
          b.eventDate
        )}. This means this request through Musician Gallery will now be closed, but there are plenty of other musicians in the gallery who'd love to help with ${escapeHtml(
          b.occasion
        )}.`,
        ctaHtml: primaryButton("Browse other musicians", `${SITE_URL}/gallery`),
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
  clientEmail?: string;
  occasion: string;
  eventDate: string;
  amount: number;
  /** Set only for recurring lesson bookings — when both are present, the
   * copy switches from "this booking is paid" to "lesson 3 of 8 paid",
   * since a subscription generates one of these events per cycle rather
   * than once. */
  sessionsPaid?: number;
  sessions?: number;
  /** Used to generate this booking's masked reply address — see
   * lib/reply-mask.ts. The booking's still "live" at this point (event
   * hasn't happened yet / lessons aren't done), so conversation stays
   * open. */
  replyCode: string;
};

/** Sent once the Stripe webhook confirms a client's payment went through —
 * a copy to the site owner for visibility, one to the musician letting them
 * know the money is already on its way to their bank account automatically,
 * and one to the client confirming the payment itself (the /pay/[id]/success
 * page tells them to expect this). For recurring lesson bookings this fires
 * once per billing cycle (each week/fortnight), not just once — the copy
 * adjusts to show progress so it doesn't read like the whole thing was paid
 * off in one go. Fail-quiet, matching the other booking emails. */
export async function sendBookingPaidEmail(b: BookingPaidEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking paid email.");
    return;
  }

  const isRecurring = !!b.sessions && b.sessions > 0;
  const progress = isRecurring ? ` (lesson ${b.sessionsPaid} of ${b.sessions})` : "";
  const replyTo = maskedReplyAddress(b.replyCode);
  const addressNote =
    " Replies only reach the other person when sent from the email address you gave us. A different inbox won't connect.";

  const sends: Promise<unknown>[] = [];

  sends.push(
    resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      subject: `Booking paid: ${b.musicianName}${progress}`,
      text: `${b.clientName} paid for ${b.occasion} on ${b.eventDate} with ${b.musicianName}${progress}. Amount: $${b.amount.toFixed(
        2
      )} (musician's share, paid out automatically).`,
      html: layout({
        eyebrow: "Payment received",
        heading: `${b.musicianName} — booking paid${progress}`,
        intro: `${escapeHtml(b.clientName)} paid for ${escapeHtml(b.occasion)} on ${escapeHtml(
          b.eventDate
        )} with ${escapeHtml(b.musicianName)}${escapeHtml(progress)}. A payout of $${b.amount.toFixed(
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
        replyTo,
        subject: `You've been paid for ${b.occasion}${progress}`,
        text: `Hi ${firstName},\n\nGreat news. ${b.clientName} just paid for your booking (${b.occasion} on ${b.eventDate})${progress}. $${b.amount.toFixed(
          2
        )} is already on its way to your account, no invoicing or chasing needed on your end.\n\n— Musician Gallery`,
        html: layout({
          eyebrow: "Payment received",
          heading: "You've been paid",
          intro: `Hi ${escapeHtml(firstName)}, great news. ${escapeHtml(b.clientName)} just paid for your booking (${escapeHtml(
            b.occasion
          )} on ${escapeHtml(b.eventDate)})${escapeHtml(progress)}. $${b.amount.toFixed(
            2
          )} is already on its way to your account, no invoicing or chasing needed on your end.`,
          footerNote: "You're receiving this because you have a live profile on Musician Gallery." + addressNote,
        }),
      })
    );
  }

  if (b.clientEmail) {
    const totalCents = Math.round(b.amount * 100 * 1.1);
    const total = totalCents / 100;
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.clientEmail,
        replyTo,
        subject: `Payment received — thank you${progress}`,
        text: `Hi ${b.clientName},\n\nYour payment of $${total.toFixed(2)} for ${b.occasion} on ${b.eventDate} with ${
          b.musicianName
        }${progress} is all sorted. Thank you for supporting ${
          b.musicianName
        }, and for being part of what we're building for musicians at Musician Gallery.${
          isRecurring ? ` Your next lesson will bill automatically, so there's nothing else to do.` : ""
        }\n\n— Musician Gallery`,
        html: layout({
          eyebrow: "Payment received",
          heading: "Thank you — you're all set",
          intro: `Hi ${escapeHtml(b.clientName)}, your payment of $${total.toFixed(2)} for ${escapeHtml(
            b.occasion
          )} on ${escapeHtml(b.eventDate)} with ${escapeHtml(
            b.musicianName
          )}${escapeHtml(progress)} is all sorted. Thank you for supporting ${escapeHtml(
            b.musicianName
          )}, and for being part of what we're building for musicians at Musician Gallery.${
            isRecurring ? " Your next lesson will bill automatically, so there's nothing else to do." : ""
          }`,
          footerNote:
            "Payment was handled securely by Stripe — Musician Gallery never sees your card details." + addressNote,
        }),
      })
    );
  }

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Booking paid email failed to send:", r.reason);
  });
}

type LessonPaymentFailedEmailInput = {
  musicianName: string;
  clientName: string;
  clientEmail: string;
  occasion: string;
};

/** Sent to the client if a recurring lesson charge fails (expired card,
 * insufficient funds, etc.) — Stripe's own Smart Retries will attempt the
 * charge again automatically, but the client should know to check their card
 * rather than be surprised later. No self-service "update card" link exists
 * yet, so this points them to get in touch directly. Fail-quiet, matching
 * the other booking emails. */
export async function sendLessonPaymentFailedEmail(b: LessonPaymentFailedEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping lesson payment failed email.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: b.clientEmail,
      // This one deliberately goes to Emily directly, not through the
      // masked relay — the copy below asks the client to reply if the
      // charge keeps failing, which is a "we'll sort it out" offer of
      // human help with a payment problem, not a message meant for the
      // musician. Previously this had no reply-to at all, so a reply would
      // have silently gone nowhere.
      replyTo: OWNER_EMAIL,
      subject: `A payment for your lessons with ${b.musicianName} didn't go through`,
      text: `Hi ${b.clientName},\n\nYour latest payment for ${b.occasion} with ${b.musicianName} didn't go through — usually an expired card or insufficient funds. Stripe will automatically retry, but if it keeps failing, reply to this email and we'll sort it out.\n\n— Musician Gallery`,
      html: layout({
        eyebrow: "Payment issue",
        heading: "A payment didn't go through",
        intro: `Hi ${escapeHtml(b.clientName)}, your latest payment for ${escapeHtml(
          b.occasion
        )} with ${escapeHtml(
          b.musicianName
        )} didn't go through — usually an expired card or insufficient funds. Stripe will automatically retry, but if it keeps failing, reply to this email and we'll sort it out.`,
        footerNote: "You're receiving this because you have an active lesson arrangement through Musician Gallery.",
      }),
    });
  } catch (err) {
    console.error("Lesson payment failed email failed to send:", err);
  }
}

type LessonsCompleteEmailInput = {
  musicianName: string;
  musicianEmail?: string;
  /** Used to link the client straight back to this musician's profile to
   * book another block of lessons. */
  musicianSlug: string;
  clientName: string;
  clientEmail?: string;
  occasion: string;
  sessions: number;
  /** Used to generate this booking's masked reply address — the reply
   * window stays open for a 1-week grace period from this point (see
   * lib/reply-mask.ts), for a last thank-you or question. */
  replyCode: string;
};

/** Sent once a recurring lesson subscription reaches its agreed end (all N
 * sessions paid) and Stripe auto-cancels it — lets both sides know the
 * arrangement has wrapped up rather than them wondering why billing quietly
 * stopped. Fail-quiet, matching the other booking emails. */
export async function sendLessonsCompleteEmail(b: LessonsCompleteEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping lessons complete email.");
    return;
  }

  const sends: Promise<unknown>[] = [];
  const replyTo = maskedReplyAddress(b.replyCode);
  const addressNote =
    " Replies only reach the other person when sent from the email address you gave us. A different inbox won't connect.";

  if (b.clientEmail) {
    const musicianUrl = `${SITE_URL}/musicians/${b.musicianSlug}`;
    const ctaHtml = `<span style="display:inline-block; margin-right:12px; margin-bottom:12px;">${primaryButton(
      `Book ${b.musicianName} again`,
      musicianUrl
    )}</span><span style="display:inline-block; margin-bottom:12px;">${secondaryButton(
      "Browse the gallery",
      `${SITE_URL}/gallery`
    )}</span>`;
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.clientEmail,
        replyTo,
        subject: `Your lessons with ${b.musicianName} are complete`,
        text: `Hi ${b.clientName},\n\nThat's a wrap. All ${b.sessions} lessons for ${b.occasion} with ${b.musicianName} are complete, and billing has stopped automatically. If you'd like to keep the momentum going, book ${b.musicianName} again here: ${musicianUrl}\n\nOr take a look at other musicians in the gallery: ${SITE_URL}/gallery\n\n— Musician Gallery`,
        html: layout({
          eyebrow: "Lessons complete",
          heading: "That's a wrap",
          intro: `Hi ${escapeHtml(b.clientName)}, that's a wrap. All ${b.sessions} lessons for ${escapeHtml(
            b.occasion
          )} with ${escapeHtml(
            b.musicianName
          )} are complete, and billing has stopped automatically. If you'd like to keep the momentum going, book ${escapeHtml(
            b.musicianName
          )} again below, or take a look at other musicians in the gallery.`,
          ctaHtml,
          footerNote:
            "You're receiving this because you had an active lesson arrangement through Musician Gallery." +
            addressNote,
        }),
      })
    );
  }

  if (b.musicianEmail) {
    const firstName = b.musicianName.split(" ")[0];
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.musicianEmail,
        replyTo,
        subject: `Lessons with ${b.clientName} are complete`,
        text: `Hi ${firstName},\n\nThat's a wrap. All ${b.sessions} lessons for ${b.occasion} with ${b.clientName} are complete, and billing has stopped automatically. We've also emailed ${b.clientName} on your behalf to thank them for their support and open the door for booking again in future. Nothing more to do on your end unless you two agree to another block together.\n\n— Musician Gallery`,
        html: layout({
          eyebrow: "Lessons complete",
          heading: "That's a wrap",
          intro: `Hi ${escapeHtml(firstName)}, that's a wrap. All ${b.sessions} lessons for ${escapeHtml(
            b.occasion
          )} with ${escapeHtml(
            b.clientName
          )} are complete, and billing has stopped automatically. We've also emailed ${escapeHtml(
            b.clientName
          )} on your behalf to thank them for their support and open the door for booking again in future. Nothing more to do on your end unless you two agree to another block together.`,
          footerNote: "You're receiving this because you have a live profile on Musician Gallery." + addressNote,
        }),
      })
    );
  }

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Lessons complete email failed to send:", r.reason);
  });
}

type RelayedMessageEmailInput = {
  /** Used to generate the masked address this relayed message appears to
   * come from, so a reply to it loops back through the relay. See
   * lib/reply-mask.ts. */
  replyCode: string;
  toEmail: string;
  toFirstName?: string;
  /** Who the message is from, for display only (e.g. "Sarah Thompson") —
   * never an email address, so the recipient never sees the other side's
   * real contact details. */
  fromLabel: string;
  subject: string;
  bodyText: string;
};

/** Relays a reply sent to a booking's masked address on to the other side
 * of the conversation, through the same branded template as every other
 * booking email (not a raw forward) — so it reads as a normal Musician
 * Gallery email rather than exposing anything about the underlying inbound
 * message. Sent from the normal FROM address, but with replyTo set back to
 * the masked address, so a reply to this email loops through the relay
 * again rather than going anywhere directly. Fail-quiet, matching the rest
 * of this feature's best-effort design — see
 * app/api/email/inbound/route.ts, the only caller. */
export async function sendRelayedMessageEmail(m: RelayedMessageEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping relayed message email.");
    return;
  }

  const maskedFrom = maskedReplyAddress(m.replyCode);
  const greeting = m.toFirstName ? `Hi ${m.toFirstName},` : "Hi,";
  const messageRowHtml = `
    <tr>
      <td style="padding:20px 24px; font-family:${SANS_STACK}; font-size:14px; line-height:1.7; color:#181510; white-space:pre-wrap;">${escapeHtml(
        m.bodyText
      )}</td>
    </tr>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: m.toEmail,
      replyTo: maskedFrom,
      subject: m.subject,
      text: `${greeting}\n\nNew message from ${m.fromLabel}:\n\n${m.bodyText}\n\nReply directly to this email to keep the conversation going through Musician Gallery.`,
      html: layout({
        eyebrow: "New message",
        heading: `A note from ${m.fromLabel}`,
        intro: `${escapeHtml(
          greeting
        )} you have a new message about your booking. Reply directly to this email to keep the conversation going.`,
        rowsHtml: messageRowHtml,
        footerNote:
          "Messages sent through Musician Gallery keep your email address private from the other side.",
      }),
    });
  } catch (err) {
    console.error("Relayed message email failed to send:", err);
  }
}
