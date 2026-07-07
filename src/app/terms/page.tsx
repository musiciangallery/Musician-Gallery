export const metadata = { title: "Terms & Conditions | Musician Gallery" };

const h2 = "font-serif text-2xl mt-12 mb-3";
const h3 = "font-serif text-lg mt-6 mb-2";
const p = "text-sm leading-relaxed mb-3";
const ul = "list-disc pl-5 space-y-1 text-sm leading-relaxed mb-3";
const callout =
  "bg-off/60 border border-rule p-4 text-sm italic leading-relaxed my-6";
const small = "text-xs text-mid";

export default function TermsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 md:px-[52px] py-16">
      <span className="eyebrow">Legal</span>
      <h1 className="font-serif text-4xl mt-3 mb-2">Terms &amp; Conditions</h1>
      <p className={small}>Effective Date: 16 April 2026</p>
      <p className={`${small} mb-8`}>Last Updated: April 2026</p>

      <p className={p}>
        These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of
        the Musician Gallery platform (musiciangallery.co.nz), operated by
        Musician Gallery Limited (&ldquo;Musician Gallery&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a company
        registered in New Zealand.
      </p>
      <p className={p}>
        By creating an account or using the platform in any way, you agree to
        be bound by these Terms. Please read them carefully. If you do not
        agree, you must not use the platform.
      </p>

      <h2 className={h2}>1. Definitions</h2>
      <ul className={ul}>
        <li>
          <strong>Platform</strong> means the Musician Gallery website at
          musiciangallery.co.nz and any associated applications or services.
        </li>
        <li>
          <strong>User</strong> means any person who accesses or uses the
          Platform, including Musicians and Clients.
        </li>
        <li>
          <strong>Musician</strong> means any individual registered on the
          Platform to offer music services, either as a Teacher or a Gig
          Musician.
        </li>
        <li>
          <strong>Teacher</strong> means a Musician who has completed police
          vetting and is listed on the Platform to offer term-based private
          music lessons.
        </li>
        <li>
          <strong>Gig Musician</strong> means a Musician listed on the
          Platform to offer one-off entertainment or event bookings. Gig
          Musicians are not required to be police vetted.
        </li>
        <li>
          <strong>Client</strong> means any individual or organisation that
          uses the Platform to find and book a Musician.
        </li>
        <li>
          <strong>Booking</strong> means a confirmed arrangement between a
          Client and a Musician made through the Platform.
        </li>
        <li>
          <strong>Platform Fee</strong> means the fee charged by Musician
          Gallery on each Booking, deducted from the total amount paid by the
          Client.
        </li>
        <li>
          <strong>Withholding Tax</strong> means the schedular payment tax
          deducted from Musician payouts and remitted to Inland Revenue on
          the Musician&rsquo;s behalf.
        </li>
      </ul>

      <h2 className={h2}>2. Nature of the Platform</h2>
      <p className={p}>
        Musician Gallery operates as an online marketplace and is a connector
        only. We provide the technology to enable Musicians and Clients to
        find each other, communicate, and transact.
      </p>
      <div className={callout}>
        Musician Gallery is a connecting platform only. We are not a party to
        any agreement between musicians and clients, and we are not the
        employer of any musician listed on the platform.
      </div>
      <ul className={ul}>
        <li>
          Musician Gallery is not a party to any contract or arrangement
          between a Musician and a Client.
        </li>
        <li>
          Musician Gallery does not employ, engage, or supervise Musicians in
          any way.
        </li>
        <li>
          Musicians are independent contractors responsible for their own tax
          obligations, insurance, and professional conduct.
        </li>
        <li>
          Musician Gallery does not guarantee the quality, suitability, or
          availability of any Musician listed on the Platform.
        </li>
        <li>
          Musician Gallery does not guarantee that the Platform will be
          continuously available or free from errors.
        </li>
      </ul>

      <h2 className={h2}>3. Accounts and Registration</h2>
      <h3 className={h3}>3.1 Eligibility</h3>
      <p className={p}>
        You must be at least 16 years of age to create an account. By
        registering, you confirm that the information you provide is
        accurate, complete, and up to date.
      </p>
      <h3 className={h3}>3.2 Account Responsibility</h3>
      <ul className={ul}>
        <li>
          You are responsible for maintaining the confidentiality of your
          account credentials.
        </li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>
          You must notify us immediately at contact@musiciangallery.co.nz if
          you suspect unauthorised access to your account.
        </li>
        <li>
          Musician Gallery reserves the right to suspend or terminate any
          account at our sole discretion, including where these Terms have
          been breached.
        </li>
      </ul>
      <h3 className={h3}>3.3 One Account Per Person</h3>
      <p className={p}>
        Each individual or organisation may hold only one account on the
        Platform. Creating duplicate accounts may result in all associated
        accounts being suspended.
      </p>

      <h2 className={h2}>4. Terms Specific to Musicians</h2>
      <div className={callout}>
        This section applies to all Musicians registered on the Platform,
        including both Teachers and Gig Musicians.
      </div>
      <h3 className={h3}>4.1 Profile Accuracy</h3>
      <ul className={ul}>
        <li>
          You must ensure your profile accurately represents your skills,
          experience, instruments, and availability.
        </li>
        <li>
          Profile photos must meet the Musician Gallery photo specification
          provided during onboarding.
        </li>
        <li>
          Musician Gallery reserves the right to reject or remove profiles
          that do not meet our standards, including photo requirements.
        </li>
        <li>Profiles do not go live until reviewed and approved by Musician Gallery.</li>
      </ul>
      <h3 className={h3}>4.2 Police Vetting &mdash; Teachers Only</h3>
      <ul className={ul}>
        <li>
          To be listed as a Teacher, you must complete and pass a NZ Police
          vetting check.
        </li>
        <li>
          Vetting is completed through the official NZ Police process.
          Musician Gallery presents the result of that process but does not
          conduct independent background checks.
        </li>
        <li>
          Your vetting result reflects your status at the time of vetting.
          You are responsible for notifying Musician Gallery of any changes
          in your circumstances that may affect your suitability to work
          with children or vulnerable people.
        </li>
        <li>
          Musician Gallery reserves the right to remove a Teacher from the
          Platform at any time if we have reason to believe they no longer
          meet the vetting standard.
        </li>
      </ul>
      <h3 className={h3}>4.3 Tax Obligations</h3>
      <ul className={ul}>
        <li>
          You must provide a valid NZ IRD number and a completed IR330C form
          before your first payout.
        </li>
        <li>
          Musician Gallery will deduct withholding tax from your payouts at
          the rate specified in your IR330C and remit this to Inland Revenue
          on your behalf.
        </li>
        <li>
          If you do not provide a completed IR330C, the no-notification
          withholding rate of 45% will apply.
        </li>
        <li>
          You remain solely responsible for filing your own income tax
          return and any additional tax obligations not covered by
          withholding tax deductions.
        </li>
        <li>
          If your annual income from the Platform exceeds NZD $60,000, you
          must register for GST and notify Musician Gallery accordingly.
        </li>
      </ul>
      <h3 className={h3}>4.4 Off-Platform Transactions</h3>
      <ul className={ul}>
        <li>
          All payments for Bookings made through Musician Gallery must be
          processed through the Platform.
        </li>
        <li>
          Soliciting or accepting payment from Clients outside the Platform
          for services arranged through Musician Gallery is a breach of
          these Terms and may result in immediate removal from the Platform.
        </li>
      </ul>
      <h3 className={h3}>4.5 Conduct and Professionalism</h3>
      <ul className={ul}>
        <li>
          You must conduct yourself professionally in all interactions with
          Clients arranged through the Platform.
        </li>
        <li>
          You must honour confirmed Bookings. Repeated cancellations may
          result in suspension or removal from the Platform.
        </li>
        <li>
          You must not use the Platform to contact Clients for purposes
          unrelated to their Booking.
        </li>
      </ul>

      <h2 className={h2}>5. Terms Specific to Clients</h2>
      <div className={callout}>
        This section applies to all Clients booking Musicians through the
        Platform.
      </div>
      <h3 className={h3}>5.1 Booking and Payment</h3>
      <ul className={ul}>
        <li>
          All Bookings must be made and paid for through the Platform. You
          must not arrange payment directly with a Musician for services
          found through Musician Gallery.
        </li>
        <li>
          By confirming a Booking, you agree to pay the Musician&rsquo;s
          stated rate plus the applicable Platform Fee.
        </li>
        <li>
          Payment is collected by Musician Gallery via Stripe at the time of
          Booking. Funds are held securely until the Booking is confirmed as
          completed.
        </li>
      </ul>
      <h3 className={h3}>5.2 Cancellations and Refunds</h3>
      <ul className={ul}>
        <li>
          Cancellation policies are stated at the time of Booking and vary
          by Musician. Please review these carefully before confirming.
        </li>
        <li>
          If a Musician cancels a confirmed Booking, you will receive a full
          refund of all amounts paid including the Platform Fee.
        </li>
        <li>
          If you cancel a Booking, the refund amount will depend on the
          notice given and the Musician&rsquo;s stated cancellation policy.
        </li>
        <li>
          Musician Gallery Platform Fees are non-refundable except where the
          Musician has cancelled the Booking.
        </li>
      </ul>
      <h3 className={h3}>5.3 Police Vetting &mdash; Important Notice</h3>
      <div className={callout}>
        Police vetting applies to Teachers only. Gig Musicians are not
        police vetted. It is your responsibility to understand which
        category a Musician is listed under before making a Booking.
        Musician Gallery makes no representation about the character or
        suitability of Gig Musicians beyond their self-provided profile
        information.
      </div>
      <p className={p}>
        For Teachers, the police vetting badge indicates that a vetting
        check was completed at a point in time via NZ Police. Musician
        Gallery is not liable for any conduct by a vetted Teacher that
        occurs after their vetting date.
      </p>
      <h3 className={h3}>5.4 Booking Confirmation</h3>
      <ul className={ul}>
        <li>
          For lesson Bookings: the Teacher confirms the lesson has been
          completed. Funds are automatically released to the Teacher after
          24&ndash;48 hours if no dispute is raised.
        </li>
        <li>
          For event/gig Bookings: the Client confirms the event has been
          completed. Funds are automatically released to the Musician after
          48&ndash;72 hours if no dispute is raised.
        </li>
        <li>
          If you have a concern about a completed Booking, you must raise a
          dispute through the Platform within the relevant timeframe above.
        </li>
      </ul>

      <h2 className={h2}>6. Platform Fees</h2>
      <p className={p}>
        Musician Gallery charges a Platform Fee on each Booking. Fees are
        charged to the Client on top of the Musician&rsquo;s stated rate, as
        follows:
      </p>
      <table className="w-full text-sm border border-rule my-4">
        <thead>
          <tr className="bg-off/60 text-left">
            <th className="p-3 border-b border-rule font-medium">
              Booking Type
            </th>
            <th className="p-3 border-b border-rule font-medium">
              Platform Fee
            </th>
            <th className="p-3 border-b border-rule font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border-b border-rule">Teacher lessons</td>
            <td className="p-3 border-b border-rule">10%</td>
            <td className="p-3 border-b border-rule text-mid">Per lesson</td>
          </tr>
          <tr>
            <td className="p-3 border-b border-rule">
              Gig bookings (under $500)
            </td>
            <td className="p-3 border-b border-rule">10%</td>
            <td className="p-3 border-b border-rule text-mid">Per booking</td>
          </tr>
          <tr>
            <td className="p-3">Gig bookings (over $500)</td>
            <td className="p-3">7%</td>
            <td className="p-3 text-mid">Per booking</td>
          </tr>
        </tbody>
      </table>
      <p className={p}>
        Platform Fees are inclusive of GST where applicable. Musician
        Gallery reserves the right to update the fee structure with
        reasonable notice to Users.
      </p>

      <h2 className={h2}>7. Disputes</h2>
      <h3 className={h3}>7.1 Raising a Dispute</h3>
      <p className={p}>
        If you have a concern about a Booking, you must raise it through the
        Platform within the following timeframes:
      </p>
      <ul className={ul}>
        <li>Lesson Bookings: within 24 hours of the lesson occurring (or failing to occur)</li>
        <li>Gig/Event Bookings: within 48 hours of the event date</li>
      </ul>
      <p className={p}>
        Disputes raised outside these timeframes may not be eligible for
        review. To raise a dispute, contact us at
        contact@musiciangallery.co.nz with your Booking reference and a
        description of the issue.
      </p>
      <h3 className={h3}>7.2 Resolution Process</h3>
      <ul className={ul}>
        <li>Musician Gallery will acknowledge your dispute within 2 business days.</li>
        <li>We will review the evidence provided by both parties.</li>
        <li>Musician Gallery&rsquo;s decision on payment release is final.</li>
        <li>
          We aim to resolve all disputes within 10 business days of
          receiving complete information from both parties.
        </li>
      </ul>
      <h3 className={h3}>7.3 Limitation of Liability</h3>
      <p className={p}>
        Musician Gallery acts as a neutral facilitator in disputes. We are
        not liable for:
      </p>
      <ul className={ul}>
        <li>The quality or outcome of any music lesson or performance</li>
        <li>
          Loss or damage arising from a Musician&rsquo;s conduct before,
          during, or after a Booking
        </li>
        <li>
          Any direct, indirect, or consequential loss arising from your use
          of the Platform
        </li>
      </ul>
      <p className={p}>
        To the maximum extent permitted by law, Musician Gallery&rsquo;s
        total liability to any User shall not exceed the total Platform Fees
        paid by that User in the three months preceding the claim.
      </p>

      <h2 className={h2}>8. Prohibited Conduct</h2>
      <p className={p}>Users must not:</p>
      <ul className={ul}>
        <li>Provide false, misleading, or inaccurate information at any time</li>
        <li>Arrange or accept payment for Bookings outside the Platform</li>
        <li>Use the Platform to solicit or recruit Musicians for a competing service</li>
        <li>Harass, threaten, or abuse other Users</li>
        <li>Post or transmit any content that is unlawful, offensive, or defamatory</li>
        <li>Attempt to circumvent, disable, or interfere with the security features of the Platform</li>
        <li>Create multiple accounts or impersonate another person or organisation</li>
      </ul>
      <p className={p}>
        Breach of any of the above may result in immediate suspension or
        permanent removal from the Platform, at Musician Gallery&rsquo;s
        sole discretion.
      </p>

      <h2 className={h2}>9. Intellectual Property</h2>
      <ul className={ul}>
        <li>
          All content on the Platform created by Musician Gallery, including
          the name, logo, design, and written content, is owned by Musician
          Gallery Limited and may not be reproduced without written
          permission.
        </li>
        <li>
          By uploading content to the Platform (including profile photos,
          biographies, and audio or video samples), you give Musician
          Gallery permission to display and use that content solely for the
          purpose of running and promoting the Platform.
        </li>
        <li>
          You confirm that any content you upload is your own or that you
          have the right to use it, and that it does not infringe the
          intellectual property rights of any third party.
        </li>
      </ul>

      <h2 className={h2}>10. Privacy</h2>
      <p className={p}>
        Your privacy matters to us. The collection and use of your personal
        information is governed by our{" "}
        <a href="/privacy" className="underline hover:text-accent">
          Privacy Policy
        </a>
        . By using the Platform, you agree to the terms of our Privacy
        Policy.
      </p>

      <h2 className={h2}>11. Changes to These Terms</h2>
      <p className={p}>
        Musician Gallery may update these Terms from time to time. When we
        do, we will update the effective date at the top of this document.
        Where changes are material, we will notify registered Users by
        email at least 14 days before the changes take effect.
      </p>
      <p className={p}>
        Continued use of the Platform after updated Terms take effect
        constitutes your acceptance of the new Terms. If you do not agree
        with updated Terms, you must stop using the Platform and may close
        your account.
      </p>

      <h2 className={h2}>12. Governing Law</h2>
      <p className={p}>
        These Terms are governed by the laws of New Zealand. Any disputes
        arising from these Terms or your use of the Platform will be subject
        to the exclusive jurisdiction of the New Zealand courts.
      </p>
      <p className={p}>
        Nothing in these Terms limits any rights you may have under the
        Consumer Guarantees Act 1993 or the Fair Trading Act 1986.
      </p>

      <h2 className={h2}>13. Contact Us</h2>
      <p className={p}>
        If you have any questions about these Terms, please contact us:
      </p>
      <ul className={ul}>
        <li>Email: contact@musiciangallery.co.nz</li>
        <li>Website: musiciangallery.co.nz</li>
        <li>Post: Musician Gallery Limited, New Zealand</li>
      </ul>
      <p className={`${small} mt-10`}>
        Musician Gallery Limited &middot; Registered in New Zealand &middot;
        musiciangallery.co.nz
      </p>
    </section>
  );
}
