// Masked reply addresses — one per booking, derived directly from the
// booking's own UUID (no separate lookup table needed). Used as the
// replyTo on outbound booking emails so clients and musicians can keep
// talking before a booking is confirmed/paid, without ever seeing each
// other's real email address. See app/api/email/inbound/route.ts for the
// webhook that receives replies sent to these addresses and relays them
// on, and lib/email.ts for where they're used — starting with the "new
// booking request" email to the musician, the highest-risk one, since
// it's the first point a musician's real inbox would otherwise be exposed
// to a stranger.
const REPLY_DOMAIN = process.env.REPLY_DOMAIN || "reply.musiciangallery.co.nz";

export function maskedAddressForBooking(bookingId: string): string {
  return `booking-${bookingId}@${REPLY_DOMAIN}`;
}

const MASKED_ADDRESS_RE = /^booking-([0-9a-f-]{36})@/i;

/** Pulls the booking id back out of a masked address the inbound webhook
 * received a reply at (e.g. the "to" address of an email sent to
 * booking-<uuid>@reply.musiciangallery.co.nz). Returns null if the address
 * doesn't match the expected shape. */
export function bookingIdFromMaskedAddress(address: string): string | null {
  const match = address.match(MASKED_ADDRESS_RE);
  return match ? match[1] : null;
}

type BookingWindowInput = {
  status: string;
  /** One-off bookings: an actual date string. Recurring bookings: "Weekly"
   * or "Fortnightly" instead — see completedAt for how those are handled. */
  eventDate: string;
  /** Agreed number of lessons — non-null/non-zero only for recurring
   * bookings, matching the `sessions` column. */
  sessions: number | null;
  /** Set once a recurring booking's subscription reaches its natural end
   * (see the Stripe webhook's customer.subscription.deleted handler). */
  completedAt: string | Date | null;
};

const GRACE_PERIOD_DAYS = 7;

/** Whether a booking's masked reply address should still relay messages.
 * Open for the whole life of the booking, plus a 1-week grace period after
 * its natural end point — event_date for one-off bookings, the recurring
 * subscription's completion date for lesson bookings — so there's room for
 * a last thank-you or question. Declined bookings close immediately
 * instead, since there's nothing left to discuss. Fails open (keeps the
 * address live) if a date can't be parsed, matching the rest of this
 * feature's best-effort, fail-quiet design — better to relay one message
 * too many than silently drop a real conversation. */
export function isBookingReplyWindowOpen(b: BookingWindowInput): boolean {
  if (b.status === "declined") return false;

  const isRecurring = !!b.sessions && b.sessions > 0;

  if (isRecurring) {
    if (b.status !== "completed" || !b.completedAt) return true;
    const completed = new Date(b.completedAt);
    if (Number.isNaN(completed.getTime())) return true;
    return Date.now() < completed.getTime() + GRACE_PERIOD_DAYS * 86_400_000;
  }

  const eventDate = new Date(b.eventDate);
  if (Number.isNaN(eventDate.getTime())) return true;
  return Date.now() < eventDate.getTime() + GRACE_PERIOD_DAYS * 86_400_000;
}
