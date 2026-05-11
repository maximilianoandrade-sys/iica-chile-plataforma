import { NextRequest, NextResponse } from "next/server";

async function computeExpectedToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode("admin-session"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    console.error("[middleware] ADMIN_SESSION_SECRET not set");
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const expected = await computeExpectedToken(secret);
    if (!timingSafeCompare(cookie, expected)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
