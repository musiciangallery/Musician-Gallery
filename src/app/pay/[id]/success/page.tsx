import Link from "next/link";

// A static thank-you page Stripe Checkout redirects to after a successful
// payment. Deliberately doesn't check the booking's paid status here — that
// gets marked by the Stripe webhook shortly after, possibly a few seconds
// after this page loads, so this just confirms the payment was submitted.
export default function PaymentSuccess() {
  return (
    <section className="max-w-lg mx-auto px-6 py-20 text-center">
      <span className="eyebrow">Payment received</span>
      <h1 className="font-serif text-3xl mt-3 mb-4">Thank you</h1>
      <p className="text-sm text-mid mb-8">
        Your payment has gone through. You&rsquo;ll receive a confirmation
        by email shortly, and the musician has been notified.
      </p>
      <Link href="/gallery" className="text-xs tracking-[0.1em] uppercase border-b border-blk pb-1 hover:text-accent hover:border-accent">
        Browse more musicians
      </Link>
    </section>
  );
}
