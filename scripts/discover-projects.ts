/**
 * AI Discovery — Capa B del pipeline de ingesta IICA Chile
 *
 * Corre semanalmente vía GitHub Actions (.github/workflows/discover-projects.yml).
 * Usa Claude con web_search para descubrir convocatorias agrícolas que no están
 * cubiertas por los scrapers determinísticos de Capa A.
 *
 * Guardrails anti-alucinación:
 *   - source_snippet textual obligatorio (>= 15 palabras)
 *   - URL debe resolver con HEAD (no 404, no redirect a homepage)
 *   - Snippet se guarda en notasInternas para auditoría humana
 *
 * Los proyectos descubiertos entran a BD con discoveredBy='ai' y needsReview=true.
 * Aparecen en la búsqueda con badge "🤖 Sin verificar".
 * El equipo IICA aprueba/descarta en /admin/discoveries.
 */

import Anthropic from "@anthropic-ai/sdk";
import prisma from "../lib/prisma";
import { passesGuardrails, type AiResult } from "./discover-projects-lib";
import { normalizeUrl, parseSpanishDate } from "../lib/ingestion/utils";

const SYSTEM_PROMPT = `Sos el motor de descubrimiento de oportunidades de financiamiento agrícola del IICA Chile.

Buscás proyectos REALES Y VIGENTES donde el IICA Chile pueda participar institucionalmente.

REGLA CRÍTICA: Solo incluí proyectos donde puedas citar el snippet exacto del web_search que viste (campo source_snippet, mínimo 15 palabras textuales tomadas literalmente del search result). Si no tenés un snippet textual del search result que mencione el proyecto, NO lo incluyas. NO inventes URLs, fechas ni montos. Si un dato no está en los snippets que recibiste, dejá el campo vacío en vez de adivinar.

FUENTES preferidas (pero podés explorar otras):
- fontagro.org/convocatorias
- fao.org/chile y fao.org/americas/tcp
- iadb.org (BID asistencia técnica)
- ifad.org (FIDA)
- thegef.org y greenclimate.fund
- euroclima.org
- fia.cl, indap.gob.cl, corfo.cl
- mercadopublico.cl
- developmentaid.org

Respondé SOLO con JSON válido (sin markdown, sin backticks):
{
  "results": [
    {
      "url": "URL real (no homepage genérica)",
      "title": "Título del proyecto",
      "institution": "Institución",
      "description": "1-2 oraciones",
      "deadline": "DD-MM-YYYY o vacío",
      "source_snippet": "TEXTO LITERAL del search result, >= 15 palabras"
    }
  ]
}`;

async function callClaudeWithWebSearch(query: string): Promise<AiResult[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    // @ts-expect-error tools type from SDK no incluye web_search en versión actual
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: query
          ? `Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile sobre: ${query}`
          : "Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile, vigentes a hoy. Prioridad: convocatorias internacionales (FONTAGRO, FAO, BID, FIDA, GEF, GCF, EuroClima) y nacionales que NO estén cubiertas por scrapers de FIA o IICA Hemisférico.",
      },
    ],
  });

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.results) ? parsed.results : [];
  } catch {
    return [];
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[discover] ANTHROPIC_API_KEY no configurada. Saliendo.");
    process.exit(1);
  }

  const query = process.env.DISCOVERY_QUERY || "";
  console.log(`[discover] query: "${query || "(general)"}"`);

  const aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  if (!aiSource) {
    console.error("[discover] Source 'ai-discovery' no existe. Corré scripts/seed-sources.ts.");
    process.exit(1);
  }

  let results: AiResult[];
  try {
    results = await callClaudeWithWebSearch(query);
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[discover] Claude API error: ${msg}`);
    await prisma.source.update({
      where: { slug: "ai-discovery" },
      data: { lastRunAt: new Date(), lastRunStatus: "error", lastRunError: msg.slice(0, 500) },
    });
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`[discover] Claude devolvió ${results.length} resultados crudos`);

  let inserted = 0;
  let updated = 0;
  let discarded = 0;
  const discardReasons: string[] = [];

  for (const r of results) {
    const guard = await passesGuardrails(r);
    if (!guard.ok) {
      discarded++;
      discardReasons.push(`${r.url || "(sin url)"}: ${guard.reason}`);
      continue;
    }

    const canonicalUrl = normalizeUrl(r.url);
    if (!canonicalUrl) {
      discarded++;
      continue;
    }

    const existing = await prisma.project.findUnique({ where: { canonicalUrl } });
    if (existing) {
      await prisma.project.update({
        where: { canonicalUrl },
        data: { lastSeenAt: new Date() },
      });
      updated++;
      continue;
    }

    const deadline = r.deadline ? parseSpanishDate(r.deadline) : null;
    await prisma.project.create({
      data: {
        canonicalUrl,
        url_bases: r.url,
        nombre: r.title,
        institucion: r.institution || "Por confirmar",
        objetivo: r.description || "",
        fecha_cierre: deadline ?? new Date("2099-12-31"),
        monto: 0,
        estado: "Activo",
        categoria: "AI Discovery",
        notasInternas: `AI snippet: "${r.source_snippet.slice(0, 200)}..."`,
        discoveredBy: "ai",
        needsReview: true,
        sourceId: aiSource.id,
        estadoPostulacion: "Abierta",
        ambito: "Internacional",
      },
    });
    inserted++;
  }

  await prisma.source.update({
    where: { slug: "ai-discovery" },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: results.length > 0 && discarded === results.length ? "error" : "success",
      lastRunError: discardReasons.slice(0, 5).join("\n") || null,
      projectsCount: inserted + updated,
    },
  });

  console.log(`[discover] Insertados: ${inserted}, Actualizados: ${updated}, Descartados: ${discarded}`);
  if (discarded > 0) {
    console.log(`[discover] Razones de descarte (primeras 5):`);
    discardReasons.slice(0, 5).forEach((r) => console.log(`  - ${r}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
