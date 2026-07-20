import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

// Lets an admin attach a CVCheck vetting certificate to an application
// after the fact — teachers often apply before their certificate has
// arrived (it can take weeks), then email it through later. This route
// updates the existing pending application rather than requiring the
// applicant to resubmit or log back in.
export async function POST(req: NextRequest) {
  try {
    const { applicationId, vettingCertificateUrl, vettingCertificateNumber } = await req.json();

    if (typeof applicationId !== "string" || !applicationId) {
      return NextResponse.json({ error: "Missing application ID." }, { status: 400 });
    }

    await ensureTables();
    const sql = getSql();
    await sql`
      UPDATE musician_applications
      SET
        vetting_certificate_url = ${typeof vettingCertificateUrl === "string" ? vettingCertificateUrl : ""},
        vetting_certificate_number = ${typeof vettingCertificateNumber === "string" ? vettingCertificateNumber : ""}
      WHERE id = ${applicationId}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
