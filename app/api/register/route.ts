import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

type Submission = {
  participantName: string;
  participantType: "kid" | "adult";
  age: string;
  guardianName: string;
  phone: string;
};

export async function POST(request: Request) {
  try {
    const data = await request.json() as Submission;
    const participantName = data.participantName?.trim();
    const participantType = data.participantType === "adult" ? "adult" : "kid";
    const age = data.age ? Number(data.age) : null;
    const guardianName = data.guardianName?.trim() || null;

    if (!participantName || !/^\d{10}$/.test(data.phone || "")) {
      return NextResponse.json({ error: "Please check the registration details and try again." }, { status: 400 });
    }
    if (participantType === "kid" && (!age || age < 3 || age > 90 || !guardianName)) {
      return NextResponse.json({ error: "Please enter the child's age and parent or guardian name." }, { status: 400 });
    }

    const registrationId = `JKC${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    await (env.DB as D1Database).prepare(
      "INSERT INTO registrations (participant_name, participant_type, age, guardian_name, phone, email, participants, amount, transaction_id, payment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'registered', ?)",
    ).bind(participantName, participantType, age, guardianName, data.phone, "", 1, 199, registrationId, new Date().toISOString()).run();

    return NextResponse.json({ ok: true, registrationId });
  } catch {
    return NextResponse.json({ error: "Registration could not be saved. Please try again." }, { status: 500 });
  }
}
