import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Invalid request", { status: 403 });
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
      "Cache-Control": "no-store",
      "Set-Cookie": clearAdminSessionCookie(),
    },
  });
}
