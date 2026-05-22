import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api-response";

const logger = getLogger("AdminDiscoveryAction");

const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/** Verify admin-token cookie matches the expected HMAC (sig.timestamp format). */
function isAuthenticated(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    logger.error("ADMIN_SESSION_SECRET not configured");
    return false;
  }

  const cookie = req.cookies.get("admin-token")?.value;
  if (!cookie) return false;

  try {
    const dotIndex = cookie.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const sig = cookie.substring(0, dotIndex);
    const timestamp = cookie.substring(dotIndex + 1);
    const ts = Number(timestamp);
    if (isNaN(ts)) return false;

    if (Date.now() - ts > MAX_AGE_MS) {
      logger.warn("Admin token expired");
      return false;
    }

    const expected = createHmac("sha256", secret)
      .update(`admin-session:${timestamp}`)
      .digest("hex");

    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return createErrorResponse("no autorizado", 401);
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) return createErrorResponse("id inválido", 400);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("JSON body inválido", 400);
  }
  const action = body.action as string;
  if (!action || !["approve", "discard"].includes(action)) {
    return createErrorResponse("action inválida", 400);
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
  return createSuccessResponse(null);
}
