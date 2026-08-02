"use client";

import { useState } from "react";
import Link from "next/link";
import JoinForm from "@/components/JoinForm";

// The intro copy ("Fill in your details below...") only makes sense before
// the form is submitted — once an applicant sees the confirmation screen,
// telling them to fill in details they've already filled in is redundant.
// JoinForm's own submitted state is internal, so it's lifted up here via
// onSubmitted to control the intro text that lives on the parent page.
export default function JoinFormSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {!submitted && (
        <>
          <p className="text-sm text-mid mb-2 md:mb-0">
            Free to list, no commission. Fill in your details below to create
            your profile.
          </p>
          <p className="text-sm text-mid mb-12">
            Applying only takes a few minutes. If you&rsquo;re a teacher, our{" "}
            <Link
              href="/toolkit"
              className="underline underline-offset-4 hover:text-accent"
            >
              Musician Toolkit &rarr;
            </Link>
            <br className="hidden md:block" />{" "}
            has more detail on the Police Vetting process.
          </p>
        </>
      )}
      <JoinForm onSubmitted={() => setSubmitted(true)} />
    </>
  );
}
