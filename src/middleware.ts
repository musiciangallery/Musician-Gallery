import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protects /admin with HTTP Basic Auth. Set ADMIN_PASSWORD (and optionally
// ADMIN_USER, defaults to "admin") in the Vercel project's Environment
// Variables. Without ADMIN_PASSWORD set, /admin is blocked entirely rather
// than left open.
export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;

  const unauthorized = () =>
    new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Musician Gallery Admin"' },
    });

  if (!expectedPass) {
    return new NextResponse(
      "Admin area not yet configured. Set ADMIN_PASSWORD in Vercel project environment variables.",
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorized();
  }

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
  const separatorIndex = decoded.indexOf(":");
  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  if (user !== expectedUser || pass !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
