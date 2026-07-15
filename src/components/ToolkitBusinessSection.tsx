"use client";

import { useState } from "react";

/** The "running it like a business" section of the Musician Toolkit page,
 * kept visually quiet on purpose: a short subtext is always visible, and
 * the sole trader / expenses detail only appears once someone chooses to
 * expand it, so it doesn't compete with the portfolio content above it. */
export default function ToolkitBusinessSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 md:px-[52px] py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Setting yourself up</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-4">
          Running it like <em>a business.</em>
        </h2>
        <p className="text-sm text-mid mb-6">
          A short, plain summary of the basics. None of this needs sorting before you go live, and it is general information only, not financial or legal advice.
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs tracking-[0.1em] uppercase border border-rule px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          {open ? "Hide details" : "Show details"}
        </button>
      </div>

      {open && (
        <div className="max-w-2xl mt-10 space-y-10">
          <div>
            <h3 className="font-serif text-xl mb-3">Registering as a sole trader</h3>
            <p className="text-sm text-mid leading-relaxed mb-4">
              If you are taking paid bookings or lessons on your own account, you are already a sole trader. There is no form to fill out to become one. A few things worth doing early:
            </p>
            <ul className="space-y-2 text-sm text-mid leading-relaxed list-disc pl-5">
              <li>Get an IRD number if you do not already have one from previous work or study.</li>
              <li>Tell IRD you are self employed, through myIR. This is quick and free.</li>
              <li>GST registration only becomes compulsory once you earn over $60,000 in a twelve month period. Below that it is optional.</li>
              <li>ACC cover happens automatically once IRD knows you are self employed. You will be enrolled on their default cover and levied based on your income the following year.</li>
              <li>An NZBN is optional for a sole trader but free to get, and some clients or venues ask for one on an invoice.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-3">Expenses worth tracking from day one</h3>
            <p className="text-sm text-mid leading-relaxed mb-4">
              Keeping a simple record from your very first paid gig or lesson makes tax time far less painful. Common things musicians and teachers can generally claim a deduction for, for the business portion only:
            </p>
            <ul className="space-y-2 text-sm text-mid leading-relaxed list-disc pl-5">
              <li>Instruments, gear, and repairs or maintenance</li>
              <li>Travel to gigs, lessons, or rehearsals</li>
              <li>Studio or venue hire</li>
              <li>Website, promotional materials, printed materials</li>
              <li>Teaching materials: workbooks, sheet music, practice charts</li>
              <li>Professional fees: accountant fees, relevant courses or training</li>
              <li>A portion of home costs if you teach or rehearse from home</li>
            </ul>
            <p className="text-sm text-mid leading-relaxed mt-4">
              A separate bank account for your music income makes this dramatically easier, and IRD asks that receipts be kept for seven years. A simple habit from the start, a folder, an app, or a spreadsheet, saves a scramble later.
            </p>
          </div>

          <p className="text-xs text-mid leading-relaxed">
            For anything specific to your situation, <a href="https://www.ird.govt.nz/roles/self-employed" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">IRD</a> and <a href="https://www.business.govt.nz/business-stage-or-type/sole-traders" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">business.govt.nz</a> are the official sources, and a chat with an accountant is worth it once you are earning consistently.
          </p>
        </div>
      )}
    </section>
  );
}
