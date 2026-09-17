import { adminSessionCookie, createAdminSession, verifyGoogleIdToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request" }, { status: 403 });
  }

  let credential: string | undefined;
  try {
    const body = await request.json() as { credential?: unknown };
    credential = typeof body.credential === "string" ? body.credential : undefined;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!credential || credential.length > 10000) {
    return Response.json({ error: "Google sign-in did not return a valid credential" }, { status: 400 });
  }

  try {
    const user = await verifyGoogleIdToken(credential);
    const session = await createAdminSession(user.email, user.sub);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store", "Set-Cookie": adminSessionCookie(session) } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed";
    const status = message.includes("not allowed") ? 403 : 401;
    return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
