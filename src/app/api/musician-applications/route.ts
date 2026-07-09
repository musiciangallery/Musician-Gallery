import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSql, ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTables();
    const sql = getSql();
    const rows = await sql`SELECT * FROM musician_applications ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    email,
    region,
    instruments,
    bio,
    previousWork,
    yearsExperience,
    type,
    travel,
    lessonFormat,
    lessonLength,
    studentLevel,
    availableAs,
    genre,
    soundSystem,
  } = body;

  const instrumentList: string[] = Array.isArray(instruments) ? instruments : [];

  if (!name || !email || !region || instrumentList.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    await ensureTables();
    const sql = getSql();
    const id = randomUUID();
    await sql`
      INSERT INTO musician_applications
        (id, name, email, instrument, instruments, region, type, bio, status,
         previous_work, years_experience, travel, lesson_format, lesson_length,
         student_level, available_as, genre, sound_system)
      VALUES
        (${id}, ${name}, ${email}, ${instrumentList.join(", ")}, ${instrumentList},
         ${region}, ${type ?? "Event Musician"}, ${bio ?? ""}, 'pending_review',
         ${previousWork ?? ""}, ${yearsExperience ?? ""}, ${travel ?? ""},
         ${lessonFormat ?? ""}, ${Array.isArray(lessonLength) ? lessonLength : []},
         ${Array.isArray(studentLevel) ? studentLevel : []},
         ${Array.isArray(availableAs) ? availableAs : []},
         ${Array.isArray(genre) ? genre : []}, ${soundSystem ?? ""})
    `;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database error." },
      { status: 500 }
    );
  }
}
