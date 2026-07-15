import { Resend } from "resend";

// Booking-request emails — sent to Emily (the site owner), the musician
// (if we have their email on file), and a confirmation to the client.
// Guarded to no-op if RESEND_API_KEY isn't set yet, so bookings still save
// successfully even before the email service is configured in Vercel.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// FROM must be an address on a domain verified in Resend. Once
// musiciangallery.co.nz is verified there, set BOOKING_FROM_EMAIL in Vercel
// to something like "Musician Gallery <bookings@musiciangallery.co.nz>".
const FROM = process.env.BOOKING_FROM_EMAIL || "Musician Gallery <onboarding@resend.dev>";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "contact@emilygracestudios.com";

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
};

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

/** Sends the three booking-request emails (owner notification, musician
 * notification, client confirmation). Never throws — a failed or
 * unconfigured email send should never stop a booking that already saved
 * successfully from returning a success response. Failures are logged. */
export async function sendBookingEmails(b: BookingEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping booking emails.");
    return;
  }

  const sends: Promise<unknown>[] = [];

  sends.push(
    resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      replyTo: b.clientEmail,
      subject: `New booking request: ${b.musicianName}`,
      text: `A new booking request came in.\n\n${summaryLines(b)}`,
    })
  );

  if (b.musicianEmail) {
    sends.push(
      resend.emails.send({
        from: FROM,
        to: b.musicianEmail,
        replyTo: b.clientEmail,
        subject: "New booking request via Musician Gallery",
        text: `You've received a new booking request through Musician Gallery.\n\n${summaryLines(
          b
        )}\n\nReply directly to this email to get in touch with ${b.clientName}.`,
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
    })
  );

  const results = await Promise.allSettled(sends);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Booking email failed to send:", r.reason);
  });
}
