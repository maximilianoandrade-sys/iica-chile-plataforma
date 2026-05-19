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
  const path = req.nextUrl.pathname;
  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");

  // Only protect admin pages and admin API routes
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  // Allow the login page through
  if (path === "/admin/login") return NextResponse.next();
  // Allow the login API through (it validates credentials itself)
  if (path === "/api/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    console.error("[middleware] ADMIN_SESSION_SECRET not set");
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const expected = await computeExpectedToken(secret);
    if (!timingSafeCompare(cookie, expected)) {
      if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  } catch {
    if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
