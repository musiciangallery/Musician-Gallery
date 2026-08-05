import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Permanently deletes an application record — only ever offered in the
 * admin UI for "decided" applications (already approved or declined), but
 * guarded here too in case this endpoint is ever called directly, so a
 * still-pending application can't be wiped out by mistake before anyone's
 * reviewed it. Approved applications stay linked to their live musician
 * profile via musicians.application_id, but that column allows nulls, so
 * deleting the original application here doesn't break the live profile. */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Missing application id." }, { status: 400 });
    }

    await ensureTables();
    const sql = getSql();

    const rows = await sql`SELECT status FROM musician_applications WHERE id = ${id}`;
    const application = rows[0] as { status: string } | undefined;
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    if (application.status === "pending_review") {
      return NextResponse.json(
        { error: "This application is still pending review — decide on it first before deleting." },
        { status: 400 }
      );
    }

    await sql`DELETE FROM musician_applications WHERE id = ${id}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete application." },
      { status: 500 }
    );
  }
}
