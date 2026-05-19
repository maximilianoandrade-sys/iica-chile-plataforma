import { NextRequest, NextResponse } from "next/server";

const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

async function computeHmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
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

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (path === "/admin/login") return NextResponse.next();
  if (path === "/api/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const dotIndex = cookie.lastIndexOf(".");
    if (dotIndex === -1) {
      if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const sig = cookie.substring(0, dotIndex);
    const timestamp = cookie.substring(dotIndex + 1);
    const ts = Number(timestamp);

    if (!ts || isNaN(ts)) {
      if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Check expiry
    if (Date.now() - ts > MAX_AGE_MS) {
      if (isAdminApi) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const expected = await computeHmac(secret, `admin-session:${timestamp}`);
    if (!timingSafeCompare(sig, expected)) {
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
