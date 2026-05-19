import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

/** Verify admin-token cookie matches the expected HMAC. */
function isAuthenticated(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) return false;

  try {
    const expected = createHmac("sha256", secret)
      .update("admin-session")
      .digest("hex");
    if (cookie.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON body inválido" }, { status: 400 });
  }
  const action = body.action as string;
  if (!action || !["approve", "discard"].includes(action)) {
    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false, bases_estado: "published" },
    });
  } else {
    const today = new Date().toISOString().slice(0, 10);
    await prisma.project.update({
      where: { id },
      data: {
        needsReview: false,
        bases_estado: "rejected",
        estadoPostulacion: "Cerrada",
        notasInternas: `descartado por revisión IA ${today}`,
      },
    });
  }

  revalidatePath("/admin/discoveries");
  revalidatePath("/admin/projects/needsReview");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
