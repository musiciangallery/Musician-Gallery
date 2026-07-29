import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";
import { sendApplicationDeclinedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId." }, { status: 400 });
    }
    await ensureTables();
    const sql = getSql();
    const rows = await sql`
      UPDATE musician_applications SET status = 'declined' WHERE id = ${applicationId}
      RETURNING name, email
    `;
    const applicant = rows[0] as { name?: string; email?: string } | undefined;

    // Best-effort — a failed or unconfigured email send should never stop
    // the decline itself from succeeding.
    if (applicant?.name && applicant?.email) {
      try {
        await sendApplicationDeclinedEmail({ name: applicant.name, email: applicant.email });
      } catch (emailErr) {
        console.error("Application declined email failed:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update application." },
      { status: 500 }
    );
  }
}
