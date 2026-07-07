import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getMusicianBySlug } from "@/lib/musicians";
import type { BookingRequest } from "@/lib/bookings";

// NOTE: This stores booking requests in a local JSON file for prototyping only.
// Swap this out for a real database (e.g. Postgres via Supabase) before launch -
// a flat file will not work once the app is deployed to a serverless host.
const DATA_FILE = path.join(process.cwd(), "data", "bookings.json");

async function readBookings(): Promise<BookingRequest[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeBookings(bookings: BookingRequest[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2));
}

export async function GET() {
  const bookings = await readBookings();
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { musicianSlug, occasion, eventDate, location, details, clientName, clientEmail, clientPhone } = body;

  if (!musicianSlug || !getMusicianBySlug(musicianSlug)) {
    return NextResponse.json({ error: "Unknown musician." }, { status: 400 });
  }
  if (!occasion || !eventDate || !clientName || !clientEmail) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const booking: BookingRequest = {
    id: randomUUID(),
    musicianSlug,
    occasion,
    eventDate,
    location: location ?? "",
    details: details ?? "",
    clientName,
    clientEmail,
    clientPhone: clientPhone ?? "",
    createdAt: new Date().toISOString(),
  };

  const bookings = await readBookings();
  bookings.push(booking);
  await writeBookings(bookings);

  return NextResponse.json({ ok: true, booking }, { status: 201 });
}
