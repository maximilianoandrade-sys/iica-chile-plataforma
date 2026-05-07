import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = body.password || "";
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

  const token = createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "dev-secret")
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
