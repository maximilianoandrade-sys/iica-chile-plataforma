import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";

interface SearchBody {
  query?: string;
  scope?: string;
  role?: string;
  includeUnverified?: boolean;
}

function calcDaysLeft(deadline: Date | null): number | null {
  if (!deadline) return null;
  const diff = deadline.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86400000));
}

export async function POST(req: NextRequest) {
  const body: SearchBody = await req.json().catch(() => ({}));
  const query = body.query?.trim() || "";
  const scope = body.scope || "all";
  const role = body.role || "all";
  const includeUnverified = body.includeUnverified !== false;

  const filters: any[] = [];
  if (query) {
    filters.push({
      OR: [
        { nombre: { contains: query, mode: "insensitive" } },
        { institucion: { contains: query, mode: "insensitive" } },
        { objetivo: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (scope !== "all") filters.push({ ambito: scope });
  if (role !== "all") filters.push({ rolIICA: role });
  if (!includeUnverified) filters.push({ needsReview: false });

  const where = filters.length > 0 ? { AND: filters } : {};

  const ticket = process.env.MERCADO_PUBLICO_TICKET || "";

  const [dbProjects, mpDocs] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { source: { select: { slug: true, name: true } } },
      orderBy: [{ estadoPostulacion: "asc" }, { fecha_cierre: "asc" }],
      take: 50,
    }),
    fetchMercadoPublicoLive(ticket, query),
  ]);

  const enriched = dbProjects.map((p) => ({
    ...p,
    days_left: calcDaysLeft(p.fecha_cierre),
  }));

  return NextResponse.json({
    results: [...enriched, ...mpDocs],
    meta: {
      total: enriched.length + mpDocs.length,
      db_count: enriched.length,
      mercado_publico_count: mpDocs.length,
      source: "db+mercadopublico",
      searched_at: new Date().toISOString(),
    },
  });
}

export async function GET() {
  const sources = await prisma.source.findMany({
    where: { enabled: true },
    select: { slug: true, name: true, lastRunAt: true, lastRunStatus: true, projectsCount: true },
  });
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile - Búsqueda de Proyectos",
    sources,
  });
}
