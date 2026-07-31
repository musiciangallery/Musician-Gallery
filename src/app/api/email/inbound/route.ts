import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { getSql, ensureTables } from "@/lib/db";
import { bookingIdFromMaskedAddress, isBookingReplyWindowOpen } from "@/lib/reply-mask";
import { sendRelayedMessageEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type BookingRow = {
  id: string;
  musician_slug: string;
  client_name: string;
  client_email: string;
  status: string;
  event_date: string;
  sessions: number | null;
  completed_at: string | null;
};

type InboundEvent = {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
  };
};

/** Receives replies sent to a booking's masked address
 * (booking-<id>@reply.musiciangallery.co.nz) and relays them on to the
 * other side of the conversation, so clients and musicians can keep
 * talking without ever seeing each other's real email address. Verifies
 * the request actually came from Resend (Svix signature), fetches the
 * full message body (the webhook payload itself only carries metadata —
 * see resend.com/docs/dashboard/receiving/get-email-content), works out
 * direction by comparing the sender to the booking's known client/musician
 * addresses, and quietly logs every message to booking_messages for
 * reactive admin-only visibility later (see /admin) — this inbox isn't
 * actively monitored.
 *
 * Best-effort throughout, matching the rest of the site's fail-quiet email
 * pattern: once the signature itself checks out, this always returns 200
 * rather than surfacing errors that would just cause Resend to retry
 * something that isn't actually fixable by retrying. */
export async function POST(req: NextRequest) {
  // Captured into a local const (rather than referencing process.env.* again
  // further down) so TypeScript can actually narrow it to `string` after the
  // guard below — passing process.env.X directly to a param typed as
  // `string` fails the build otherwise, since TS doesn't narrow repeated
  // property lookups the same way it narrows local variables.
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!resend || !webhookSecret) {
    console.warn("RESEND_API_KEY or RESEND_WEBHOOK_SECRET not set — inbound email relay is disabled.");
    return NextResponse.json({ received: true });
  }

  // Must be the raw request body — verify() is sensitive to any
  // reformatting, so this is read as text, never parsed as JSON first.
  const payload = await req.text();

  let event: InboundEvent;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    }) as unknown as InboundEvent;
  } catch (err) {
    console.error("Inbound email webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true });
  }

  try {
    await ensureTables();
    const sql = getSql();

    const toAddress = event.data.to?.[0] ?? "";
    const bookingId = bookingIdFromMaskedAddress(toAddress);
    if (!bookingId) {
      // Not addressed to a masked booking address — nothing to relay.
      return NextResponse.json({ received: true });
    }

    const bookingRows = (await sql`
      SELECT id, musician_slug, client_name, client_email, status, event_date, sessions, completed_at
      FROM bookings WHERE id = ${bookingId}
    `) as unknown as BookingRow[];
    const booking = bookingRows[0];
    if (!booking) {
      return NextResponse.json({ received: true });
    }

    if (
      !isBookingReplyWindowOpen({
        status: booking.status,
        eventDate: booking.event_date,
        sessions: booking.sessions,
        completedAt: booking.completed_at,
      })
    ) {
      console.warn(`Inbound reply for booking ${booking.id} arrived outside its reply window — dropped.`);
      return NextResponse.json({ received: true });
    }

    const musicianRows = await sql`SELECT name, email FROM musicians WHERE slug = ${booking.musician_slug}`;
    const musician = musicianRows[0];
    const musicianEmail = (musician?.email as string | undefined)?.toLowerCase() || undefined;
    const musicianName = (musician?.name as string | undefined) ?? booking.musician_slug;

    const fromAddress = event.data.from.toLowerCase();
    const isFromClient = fromAddress === booking.client_email.toLowerCase();
    const isFromMusician = !!musicianEmail && fromAddress === musicianEmail;

    if (!isFromClient && !isFromMusician) {
      // Sender doesn't match either known party on this booking — log it
      // for admin visibility, but don't guess where to relay it. Fail
      // closed on routing (never send someone's message to the wrong
      // stranger), even though the rest of this feature fails open.
      await sql`
        INSERT INTO booking_messages (id, booking_id, direction, from_email, to_email, subject, body_text)
        VALUES (${randomUUID()}, ${booking.id}, 'unmatched', ${fromAddress}, ${toAddress}, ${
        event.data.subject ?? ""
      }, ${"(sender did not match either party on this booking — not relayed)"})
      `;
      return NextResponse.json({ received: true });
    }

    const { data: fullEmail } = await resend.emails.receiving.get(event.data.email_id);
    const bodyText =
      fullEmail?.text?.trim() ||
      fullEmail?.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
      "(no message body)";

    const direction = isFromClient ? "to_musician" : "to_client";
    const recipientEmail = isFromClient ? musicianEmail : booking.client_email;
    const recipientFirstName = isFromClient
      ? musicianName.split(" ")[0]
      : booking.client_name.split(" ")[0];
    const fromLabel = isFromClient ? booking.client_name : musicianName;

    await sql`
      INSERT INTO booking_messages (id, booking_id, direction, from_email, to_email, subject, body_text)
      VALUES (${randomUUID()}, ${booking.id}, ${direction}, ${fromAddress}, ${recipientEmail ?? ""}, ${
      event.data.subject ?? ""
    }, ${bodyText})
    `;

    if (recipientEmail) {
      await sendRelayedMessageEmail({
        bookingId: booking.id,
        toEmail: recipientEmail,
        toFirstName: recipientFirstName,
        fromLabel,
        subject: event.data.subject || "New message about your booking",
        bodyText,
      });
    } else {
      console.warn(`No email on file to relay a reply to for booking ${booking.id} (direction: ${direction}).`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Inbound email relay failed:", err);
    return NextResponse.json({ received: true });
  }
}
