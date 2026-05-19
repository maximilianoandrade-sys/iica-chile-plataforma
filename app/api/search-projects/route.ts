// ============================================================
// app/api/search-projects/route.ts
//
// Endpoint de búsqueda IICA Chile — versión híbrida.
//
// Búsqueda híbrida (cuando hay query):
//   • Full-text search en español (Postgres tsvector + GIN)
//   • Semantic search (pgvector + Gemini embeddings)
//   • Fusión vía Reciprocal Rank Fusion (RRF) en SQL
//
// Sin query: devuelve los más recientes ordenados por fecha de cierre.
//
// Siempre suma Mercado Público live (API del día).
//
// Migración requerida: prisma/migrations/manual/2026-05-11-hybrid-search.sql
//
// Body:
//   { query?, scope?, role?, ambito?, includeUnverified? }
// Response:
//   { results: Project[], meta: { total, mode, hybrid_count, mp_count, ... } }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { hybridSearch } from "@/lib/searchHybrid";
import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";

interface SearchBody {
  query?: string;
  scope?: string;
  role?: string;
  ambito?: string;
  includeUnverified?: boolean;
}

function calcDaysLeft(deadline: Date | null): number | null {
  if (!deadline) return null;
  const diff = deadline.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86400000));
}

export async function POST(req: NextRequest) {
  let body: SearchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const query = body.query?.trim() || "";
  const ambito = body.ambito || body.scope || "all";
  const includeUnverified = body.includeUnverified !== false;

  const ticket = process.env.MERCADO_PUBLICO_TICKET || "";

  const [hybrid, mpDocs] = await Promise.all([
    hybridSearch({ query, ambito, includeUnverified, limit: 50 }),
    fetchMercadoPublicoLive(ticket, query),
  ]);

  const enriched = hybrid.projects.map((p) => ({
    ...p,
    days_left: calcDaysLeft(p.fecha_cierre),
  }));

  return NextResponse.json({
    results: [...enriched, ...mpDocs],
    meta: {
      total: enriched.length + mpDocs.length,
      hybrid_count: enriched.length,
      mercado_publico_count: mpDocs.length,
      mode: hybrid.mode, // "hybrid" | "lexical_only" | "all"
      query,
      searched_at: new Date().toISOString(),
    },
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile — Búsqueda híbrida",
    capabilities: [
      "Full-text search (Postgres tsvector + GIN)",
      "Semantic search (pgvector + Gemini text-embedding-001)",
      "Hybrid ranking via Reciprocal Rank Fusion",
      "Live Mercado Público overlay",
    ],
  });
}
