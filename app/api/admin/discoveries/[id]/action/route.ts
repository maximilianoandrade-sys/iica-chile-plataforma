import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api-response";
import { verifyAdminToken } from "@/lib/utils/admin-auth";

const logger = getLogger("AdminDiscoveryAction");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("admin-token")?.value;
  if (!verifyAdminToken(token)) {
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

  try {
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
  } catch (error) {
    logger.error("Discovery action failed", error as Error, { id, action });
    return createErrorResponse("Error ejecutando acción", 500);
  }
}
