import { NextRequest, NextResponse } from "next/server";

async function expectedToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("admin-session"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD no configurada" }, { status: 500 });
  }
  if (!password || typeof password !== "string") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!timingSafeEqualStrings(password, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = await expectedToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: "/",
  });
  return res;
}
