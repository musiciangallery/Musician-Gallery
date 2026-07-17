export const metadata = { title: "Privacy Policy | Musician Gallery" };

const h2 = "font-serif text-2xl mt-12 mb-3";
const h3 = "font-serif text-lg mt-6 mb-2";
const p = "text-sm leading-relaxed mb-3";
const ul = "list-disc pl-5 space-y-1 text-sm leading-relaxed mb-3";
const callout =
  "bg-off/60 border border-rule p-4 text-sm italic leading-relaxed my-6";
const small = "text-xs text-mid";

export default function PrivacyPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 md:px-[52px] py-16">
      <span className="eyebrow">Legal</span>
      <h1 className="font-serif text-4xl mt-3 mb-2">Privacy Policy</h1>
      <p className={small}>Effective Date: 16 April 2026</p>
      <p className={`${small} mb-8`}>Last Updated: April 2026</p>

      <p className={p}>
        Musician Gallery Limited (&ldquo;Musician Gallery&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is
        committed to protecting your personal information. This Privacy
        Policy explains what information we collect, why we collect it, how
        we use and store it, and your rights under the New Zealand Privacy
        Act 2020.
      </p>
      <p className={p}>
        By using the Musician Gallery platform (musiciangallery.co.nz), you
        agree to the collection and use of your information as described in
        this policy.
      </p>

      <h2 className={h2}>1. Who We Are</h2>
      <ul className={ul}>
        <li>Company: Musician Gallery Limited</li>
        <li>Registration: New Zealand Companies Register</li>
        <li>Contact: contact@musiciangallery.co.nz</li>
        <li>Website: musiciangallery.co.nz</li>
      </ul>
      <p className={p}>
        Musician Gallery operates as an online marketplace connecting
        clients with musicians in New Zealand. We facilitate two service
        types: term-based music lessons (via police-vetted teachers) and
        one-off event bookings (via gig musicians).
      </p>

      <h2 className={h2}>2. Information We Collect</h2>
      <p className={p}>
        We collect personal information in the following categories
        depending on whether you are a client or a musician on our platform.
      </p>
      <h3 className={h3}>2.1 Information Collected from All Users</h3>
      <ul className={ul}>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Location (city or region)</li>
        <li>
          Our platform provider (Sharetribe) and payment processor (Stripe)
          may collect technical usage data as part of their services. Please
          refer to their respective privacy policies.
        </li>
      </ul>
      <h3 className={h3}>2.2 Additional Information Collected from Musicians</h3>
      <ul className={ul}>
        <li>Profile photo (subject to our photo specifications)</li>
        <li>Instrument(s) and genre(s)</li>
        <li>Biography and portfolio information</li>
        <li>
          Stripe account connection details, used to pay out your share of
          Bookings automatically. Musician Gallery does not see or store
          your bank account details &mdash; these are collected and held
          directly by Stripe.
        </li>
        <li>Police vetting result (teachers only), provided via NZ Police</li>
      </ul>
      <h3 className={h3}>2.3 Additional Information Collected from Clients</h3>
      <ul className={ul}>
        <li>
          Payment card information, processed and held securely by Stripe.
          We do not store card details ourselves.
        </li>
        <li>Booking history and lesson or event preferences</li>
      </ul>

      <h2 className={h2}>3. How We Use Your Information</h2>
      <p className={p}>
        We use your personal information only for the purposes for which it
        was collected. These include:
      </p>
      <ul className={ul}>
        <li>
          <strong>To operate the platform.</strong> Creating and managing
          accounts, processing bookings, facilitating payments, and
          enabling communication between musicians and clients.
        </li>
        <li>
          <strong>To process payments.</strong> Paying out musicians via
          Stripe Connect and collecting the platform fee added to each
          Booking.
        </li>
        <li>
          <strong>To verify musicians.</strong> Conducting or presenting
          police vetting results for teachers, and confirming the accuracy
          of musician profiles before they go live.
        </li>
        <li>
          <strong>To comply with legal obligations</strong>, including
          record-keeping required by law and responding to lawful requests
          from authorities.
        </li>
        <li>
          <strong>To communicate with you.</strong> Sending booking
          confirmations, platform updates, payment notifications, and
          support responses.
        </li>
        <li>
          <strong>To improve our platform.</strong> Using de-identified
          usage data to understand how people use Musician Gallery and make
          improvements.
        </li>
        <li>
          <strong>To enforce our Terms and Conditions</strong>, including
          investigating disputes or breaches of platform rules.
        </li>
      </ul>

      <h2 className={h2}>4. Sensitive Information</h2>
      <p className={p}>
        Some of the information we collect is classified as sensitive under
        the Privacy Act 2020 and is handled with extra care:
      </p>
      <h3 className={h3}>4.1 Police Vetting Results</h3>
      <p className={p}>
        Police vetting results are collected only from musicians applying
        to be listed as teachers on the platform. This information is:
      </p>
      <ul className={ul}>
        <li>Collected directly from NZ Police via the official vetting process</li>
        <li>Used solely to determine eligibility for the teacher listing category</li>
        <li>
          Not shared with clients beyond the display of a verified badge on
          the teacher&rsquo;s profile
        </li>
        <li>Stored securely and not disclosed to third parties except as required by law</li>
      </ul>
      <div className={callout}>
        Important: Police vetting reflects a point in time. Musician
        Gallery presents vetting results as provided by NZ Police but does
        not independently verify ongoing character or conduct.
      </div>
      <h2 className={h2}>5. How We Store and Protect Your Information</h2>
      <ul className={ul}>
        <li>
          All data is stored on secure servers. Where third-party services
          are used (such as Stripe for payments and Sharetribe for platform
          infrastructure), those providers maintain their own security
          standards.
        </li>
        <li>We use industry-standard encryption for data in transit (SSL/TLS).</li>
        <li>Access to personal information is restricted to authorised personnel only.</li>
        <li>
          Financial information (card numbers, bank accounts) is held by
          Stripe and is not stored on Musician Gallery servers.
        </li>
        <li>
          We retain your personal information for as long as your account
          is active, and for a reasonable period after account closure to
          meet our legal and financial record-keeping obligations.
        </li>
      </ul>

      <h2 className={h2}>6. Who We Share Your Information With</h2>
      <p className={p}>
        We do not sell your personal information. We share it only in the
        following circumstances:
      </p>
      <h3 className={h3}>6.1 Between Platform Users</h3>
      <p className={p}>
        When a booking is made, limited profile information (name,
        instrument, location, profile photo) is visible to the other party.
        Contact details are not publicly displayed. All communication
        occurs through the platform.
      </p>
      <h3 className={h3}>6.2 Third-Party Service Providers</h3>
      <ul className={ul}>
        <li>Stripe: payment processing and disbursement</li>
        <li>Sharetribe: platform infrastructure</li>
        <li>Google Workspace: internal communications and email</li>
        <li>Xero: accounting and financial records</li>
      </ul>
      <p className={p}>
        These providers are contractually required to handle your data
        securely and only for the purposes we specify.
      </p>
      <h3 className={h3}>6.3 Law Enforcement or Legal Requirements</h3>
      <p className={p}>
        We may disclose your information if required by law, court order,
        or to protect the rights, safety, or property of Musician Gallery,
        its users, or the public.
      </p>

      <h2 className={h2}>7. Cookies and Tracking</h2>
      <p className={p}>Musician Gallery uses cookies to:</p>
      <ul className={ul}>
        <li>Keep you logged in to your account</li>
        <li>Remember your preferences</li>
        <li>Understand how users navigate the platform (via de-identified analytics)</li>
      </ul>
      <p className={p}>
        You can manage cookie preferences through your browser settings.
        Disabling cookies may affect the functionality of some parts of the
        platform.
      </p>

      <h2 className={h2}>8. Your Rights</h2>
      <p className={p}>Under the Privacy Act 2020, you have the right to:</p>
      <ul className={ul}>
        <li>
          <strong>Access your personal information.</strong> You can request
          a copy of the information we hold about you at any time.
        </li>
        <li>
          <strong>Correct your information.</strong> If any information we
          hold is inaccurate or outdated, you can ask us to correct it.
        </li>
        <li>
          <strong>Delete your information.</strong> You may request
          deletion of your account and associated data, subject to our
          legal retention obligations (e.g. financial records may need to
          be kept for a period required by law).
        </li>
        <li>
          <strong>Complain.</strong> If you believe we have breached the
          Privacy Act, you may make a complaint to us in the first
          instance, or directly to the Office of the Privacy Commissioner
          at privacy.org.nz.
        </li>
      </ul>
      <p className={p}>
        To exercise any of these rights, contact us at
        contact@musiciangallery.co.nz. We will respond to all requests
        within 20 working days in accordance with the Privacy Act 2020.
      </p>

      <h2 className={h2}>9. Children&rsquo;s Privacy</h2>
      <p className={p}>
        Musician Gallery is not directed at children under the age of 16.
        Users must be 16 or older to create an account. If a parent or
        guardian is booking lessons on behalf of a child, the account must
        be held in the adult&rsquo;s name. We do not knowingly collect
        personal information from children under 16.
      </p>

      <h2 className={h2}>10. Changes to This Policy</h2>
      <p className={p}>
        We may update this Privacy Policy from time to time. When we do, we
        will update the &ldquo;Last Updated&rdquo; date at the top of this
        document and, where changes are material, notify registered users
        by email. Continued use of the platform after changes are posted
        constitutes acceptance of the updated policy.
      </p>

      <h2 className={h2}>11. Contact Us</h2>
      <p className={p}>
        If you have any questions about this Privacy Policy or how we
        handle your personal information, please contact us:
      </p>
      <ul className={ul}>
        <li>Email: contact@musiciangallery.co.nz</li>
        <li>Website: musiciangallery.co.nz/privacy</li>
      </ul>
      <p className={p}>
        For independent guidance on privacy rights in New Zealand, visit
        the Office of the Privacy Commissioner at privacy.org.nz.
      </p>
      <p className={`${small} mt-10`}>
        Musician Gallery Limited &middot; Registered in New Zealand &middot;
        musiciangallery.co.nz
      </p>
    </section>
  );
}
