import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const action = body.action;
  if (!["approve", "discard"].includes(action)) {
    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false },
    });
  } else {
    const today = new Date().toISOString().slice(0, 10);
    await prisma.project.update({
      where: { id },
      data: {
        estadoPostulacion: "Cerrada",
        notasInternas: `descartado por revisión IA ${today}`,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
