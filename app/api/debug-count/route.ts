import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const count = await prisma.project.count();
        const sample = await prisma.project.findMany({
            take: 3,
            orderBy: { id: "desc" },
            select: { id: true, nombre: true },
        });
        return NextResponse.json({ ok: true, count, sample });
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}
