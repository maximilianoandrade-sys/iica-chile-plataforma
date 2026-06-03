import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
const logger = getLogger('AdminLogin');

const ADMIN_LOGIN_RATE_LIMIT = { maxRequests: 5, windowSizeSeconds: 60 };

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`admin-login:${clientIp}`, ADMIN_LOGIN_RATE_LIMIT);
  if (!rateCheck.allowed) {
    return createErrorResponse("Demasiadas solicitudes. Intente nuevamente más tarde.", 429, {
      "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON body", 400);
  }
  const password = (body.password as string) || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  
  if (!expected || !password) {
    return createErrorResponse("no autorizado", 401);
  }

  try {
    const match = password.length === expected.length &&
      timingSafeEqual(Buffer.from(password), Buffer.from(expected));
    if (!match) return createErrorResponse("no autorizado", 401);
  } catch {
    return createErrorResponse("no autorizado", 401);
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    logger.error('ADMIN_SESSION_SECRET not set');
    return createErrorResponse("server config error", 500);
  }

  const timestamp = Date.now().toString();
  const sig = createHmac("sha256", sessionSecret)
    .update(`admin-session:${timestamp}`)
    .digest("hex");
  const token = `${sig}.${timestamp}`;

  const res = createSuccessResponse(null);
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 28800,
    path: "/",
  });
  return res;
}
