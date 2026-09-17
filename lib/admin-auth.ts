import { env } from "cloudflare:workers";

const SESSION_COOKIE = "joy_kids_admin";
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const encoder = new TextEncoder();

type GoogleTokenHeader = { alg?: string; kid?: string };
type GoogleTokenPayload = {
  aud?: string | string[];
  azp?: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
};

type AdminSession = { email: string; sub: string; exp: number };

function vars() {
  return env as unknown as Record<string, string | undefined>;
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64Url(value: ArrayBuffer | Uint8Array): string {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

async function signingKey(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

export function allowedAdminEmails(): Set<string> {
  const configured = vars().ADMIN_GOOGLE_EMAILS || vars().ADMIN_GOOGLE_EMAIL || "";
  return new Set(configured.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function googleClientId(): string | null {
  return vars().GOOGLE_CLIENT_ID?.trim() || null;
}

export async function verifyGoogleIdToken(token: string): Promise<{ email: string; sub: string }> {
  const clientId = googleClientId();
  if (!clientId) throw new Error("Google sign-in is not configured");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Google credential");

  const header = decodeJson<GoogleTokenHeader>(parts[0]);
  const payload = decodeJson<GoogleTokenPayload>(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Invalid Google credential");

  const response = await fetch(GOOGLE_JWKS_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Google sign-in verification is temporarily unavailable");
  const jwks = await response.json() as { keys?: JsonWebKey[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) throw new Error("Invalid Google credential");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    decodeBase64Url(parts[2]),
    encoder.encode(`${parts[0]}.${parts[1]}`),
  );
  if (!validSignature) throw new Error("Invalid Google credential");

  const now = Math.floor(Date.now() / 1000);
  const audienceMatches = Array.isArray(payload.aud)
    ? payload.aud.includes(clientId) && payload.azp === clientId
    : payload.aud === clientId;
  const email = payload.email?.trim().toLowerCase();
  if (
    !audienceMatches ||
    !payload.iss ||
    !GOOGLE_ISSUERS.has(payload.iss) ||
    !payload.exp ||
    payload.exp <= now ||
    (payload.nbf && payload.nbf > now + 60) ||
    payload.email_verified !== true ||
    !payload.sub ||
    !email ||
    !allowedAdminEmails().has(email)
  ) {
    throw new Error("This Google account is not allowed to view registrations");
  }

  return { email, sub: payload.sub };
}

export async function createAdminSession(email: string, sub: string): Promise<string> {
  const secret = vars().ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session is not configured");
  const payload: AdminSession = {
    email: email.toLowerCase(),
    sub,
    exp: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  };
  const encoded = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret, ["sign"]), encoder.encode(encoded));
  return `${encoded}.${encodeBase64Url(signature)}`;
}

export async function verifyAdminSession(cookieHeader: string | null): Promise<AdminSession | null> {
  const value = readCookie(cookieHeader, SESSION_COOKIE);
  const secret = vars().ADMIN_SESSION_SECRET;
  if (!value || !secret || secret.length < 32) return null;

  const parts = value.split(".");
  if (parts.length !== 2) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret, ["verify"]),
      decodeBase64Url(parts[1]),
      encoder.encode(parts[0]),
    );
    if (!valid) return null;
    const session = decodeJson<AdminSession>(parts[0]);
    const now = Math.floor(Date.now() / 1000);
    if (!session.sub || session.exp <= now || !allowedAdminEmails().has(session.email.toLowerCase())) return null;
    return session;
  } catch {
    return null;
  }
}

export function adminSessionCookie(value: string): string {
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${SESSION_LIFETIME_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  for (const part of (cookieHeader || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}
