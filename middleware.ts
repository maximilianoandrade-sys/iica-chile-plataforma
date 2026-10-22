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

/**
 * Aplica cabeceras de seguridad HTTP básicas en la respuesta (Defensa en profundidad)
 */
function applySecurityHeaders(res: NextResponse, path: string): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Permitir embebido de /widget en iframes institucionales; bloquear clickjacking en el resto
  if (path.startsWith("/widget")) {
    res.headers.delete("X-Frame-Options");
  } else {
    res.headers.set("X-Frame-Options", "DENY");
  }

  return res;
}

/**
 * Hook de sincronización para sesiones Supabase Auth SSR
 * Sincroniza cookies/headers de sesión para Edge/Server Components si existen
 */
function syncSupabaseSession(req: NextRequest, res: NextResponse): void {
  const sbToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("supabase-auth-token")?.value;

  if (sbToken) {
    res.headers.set("x-supabase-auth-status", "authenticated");
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");

  // Rutas públicas que no requieren autenticación
  if (!isAdminPage && !isAdminApi) {
    const res = NextResponse.next();
    syncSupabaseSession(req, res);
    return applySecurityHeaders(res, path);
  }

  // Rutas de login administrativo exentas de verificación de sesión
  if (path === "/admin/login" || path === "/api/admin/login") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, path);
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) {
    if (isAdminApi) {
      return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    }
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

    // Verificar expiración (8 horas máx)
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

  const res = NextResponse.next();
  syncSupabaseSession(req, res);
  return applySecurityHeaders(res, path);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, robots.txt, sitemap.xml, manifest.json, sw.js
     * - Static asset file extensions: png, jpg, jpeg, gif, webp, avif, svg, ico, woff2?, css, js, map
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|css|js|map)$).*)',
  ],
};
