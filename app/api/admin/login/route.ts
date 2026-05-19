import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('AdminLogin');

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const password = (body.password as string) || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  
  if (!expected || !password) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const match = password.length === expected.length &&
      timingSafeEqual(Buffer.from(password), Buffer.from(expected));
    if (!match) return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret) {
    logger.error('ADMIN_SESSION_SECRET not set');
    return NextResponse.json({ ok: false, error: "server config error" }, { status: 500 });
  }

  const token = createHmac("sha256", sessionSecret)
    .update("admin-session")
    .digest("hex");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
