import { env } from "cloudflare:workers";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request.headers.get("cookie"));
  if (!session) return new Response("Not authorized", { status: 401 });

  const result = await (env.DB as D1Database).prepare(
    "SELECT participant_name, participant_type, age, guardian_name, phone, email, participants, amount, transaction_id, payment_status, created_at FROM registrations ORDER BY created_at DESC",
  ).all<Record<string, unknown>>();
  const headers = ["Participant Name", "Type", "Age", "Guardian", "Phone", "Email", "Participants", "Registration Fee", "Registration ID", "Status", "Submitted At"];
  const keys = ["participant_name", "participant_type", "age", "guardian_name", "phone", "email", "participants", "amount", "transaction_id", "payment_status", "created_at"];
  const csv = "\uFEFF" + [headers, ...result.results.map((row) => keys.map((key) => row[key] ?? ""))].map((row) => row.map(cell).join(",")).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=joy-kids-garba-registrations.csv", "Cache-Control": "no-store" } });
}

function cell(value: unknown) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
