import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Prototype-only storage, same caveat as /api/bookings: swap for a real
// database before launch.
const DATA_FILE = path.join(process.cwd(), "data", "musician-applications.json");

async function readApplications() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeApplications(apps: unknown[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2));
}

export async function GET() {
  return NextResponse.json(await readApplications());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, instrument, region, type, bio } = body;

  if (!name || !email || !instrument || !region) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const application = {
    id: randomUUID(),
    name,
    email,
    instrument,
    region,
    type: type ?? "Event Musician",
    bio: bio ?? "",
    status: "pending_review",
    createdAt: new Date().toISOString(),
  };

  const apps = await readApplications();
  apps.push(application);
  await writeApplications(apps);

  return NextResponse.json({ ok: true, application }, { status: 201 });
}
