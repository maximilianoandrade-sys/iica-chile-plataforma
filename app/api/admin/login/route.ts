import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { getAuthEnv } from '@/lib/utils/env';
import { checkDistributedRateLimit } from '@/lib/utils/rateLimit';
const logger = getLogger('AdminLogin');

const ADMIN_LOGIN_RATE_LIMIT = { maxRequests: 5, windowSizeSeconds: 60 };

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rateLimit = await checkDistributedRateLimit(`admin-login:${clientIp}`, ADMIN_LOGIN_RATE_LIMIT.maxRequests, ADMIN_LOGIN_RATE_LIMIT.windowSizeSeconds * 1000);
  if (!rateLimit.success) {
    return createErrorResponse('Demasiados intentos; reintenta más tarde', 429);
  }

  let env: ReturnType<typeof getAuthEnv>;
  try {
    env = getAuthEnv();
  } catch (error) {
    logger.error('Invalid environment for admin login', error as Error);
    return createErrorResponse('server config error', 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON body", 400);
  }
  const password = (body.password as string) || "";
  const expected = env.ADMIN_PASSWORD || "";
  
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

  const sessionSecret = env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    logger.error('ADMIN_SESSION_SECRET not set', new Error('Missing admin session secret'));
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
    secure: env.NODE_ENV === "production",
    maxAge: 28800,
    path: "/",
  });
  return res;
}
