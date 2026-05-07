import Anthropic from "@anthropic-ai/sdk";
import prisma from "../lib/prisma";
import { passesGuardrails, type AiResult } from "./discover-projects-lib";
import { normalizeUrl, parseSpanishDate } from "../lib/ingestion/utils";

const SYSTEM_PROMPT = `Sos el motor de descubrimiento de oportunidades de financiamiento agrícola del IICA Chile.

Buscás proyectos REALES Y VIGENTES donde el IICA Chile pueda participar institucionalmente.

REGLA CRÍTICA: Solo incluí proyectos donde puedas citar el snippet exacto del web_search que viste (campo source_snippet, mínimo 15 palabras). Si no tenés un snippet textual del search result que mencione el proyecto, NO lo incluyas. NO inventes URLs, fechas ni montos. Si un dato no está en los snippets que recibiste, dejá el campo vacío en vez de adivinar.

FUENTES preferidas (pero podés explorar otras):
- fontagro.org/convocatorias
- fao.org/chile y fao.org/americas/tcp
- iadb.org (BID asistencia técnica)
- ifad.org (FIDA)
- thegef.org y greenclimate.fund
- euroclima.org
- fia.cl, indap.gob.cl, corfo.cl
- mercadopublico.cl

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
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search" } as any],
    messages: [{
      role: "user",
      content: query
        ? `Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile sobre: ${query}`
        : "Buscá oportunidades nuevas de financiamiento agrícola para IICA Chile, vigentes a hoy.",
    }],
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
  const query = process.env.DISCOVERY_QUERY || "";
  console.log(`[discover] query: "${query || '(general)'}"`);

  const results = await callClaudeWithWebSearch(query);
  console.log(`[discover] Claude devolvió ${results.length} resultados crudos`);

  const aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  if (!aiSource) {
    console.error("[discover] Source 'ai-discovery' no existe. Corré seed-sources.ts.");
    process.exit(1);
  }

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
    if (!canonicalUrl) { discarded++; continue; }

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
      lastRunStatus: discarded === results.length && results.length > 0 ? "error" : "success",
      lastRunError: discardReasons.slice(0, 5).join("\n") || null,
      projectsCount: inserted + updated,
    },
  });

  console.log(`[discover] Insertados: ${inserted}, Actualizados: ${updated}, Descartados: ${discarded}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
