import { NextRequest, NextResponse } from "next/server";

const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Computa HMAC-SHA256 para validación de tokens de sesión
 */
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

/**
 * Comparación en tiempo constante para mitigar ataques de temporización
 */
function timingSafeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    result |= charA ^ charB;
  }
  return result === 0;
}

function unauthorized(req: NextRequest, isApi: boolean): NextResponse {
  if (isApi) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminApi = path.startsWith("/api/admin");

  // Rutas de login administrativo exentas de verificación de sesión
  if (path === "/admin/login" || path === "/api/admin/login") {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    return unauthorized(req, isAdminApi);
  }

  try {
    const dotIndex = cookie.lastIndexOf(".");
    if (dotIndex === -1) {
      return unauthorized(req, isAdminApi);
    }

    const sig = cookie.substring(0, dotIndex);
    const timestamp = cookie.substring(dotIndex + 1);
    const ts = Number(timestamp);

    if (!ts || isNaN(ts)) {
      return unauthorized(req, isAdminApi);
    }

    // Verificar expiración (8 horas máx)
    if (Date.now() - ts > MAX_AGE_MS) {
      return unauthorized(req, isAdminApi);
    }

    const expected = await computeHmac(secret, `admin-session:${timestamp}`);
    if (!timingSafeCompare(sig, expected)) {
      return unauthorized(req, isAdminApi);
    }
  } catch {
    return unauthorized(req, isAdminApi);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
