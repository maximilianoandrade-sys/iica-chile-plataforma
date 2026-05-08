/**
 * AI Discovery — Capa B del pipeline de ingesta IICA Chile
 *
 * Usa Gemini API (Google AI Studio) con grounding via Google Search.
 * Tier gratuito: 1500 requests/día en Gemini 2.5 Flash → más que suficiente
 * para nuestro cron semanal.
 *
 * Estrategia en DOS PASOS para mejor calidad:
 *  1. Primer call CON googleSearch: pedir investigación en lenguaje natural
 *     (este paso encuentra info real y trae groundingMetadata)
 *  2. Segundo call SIN tools: convertir esa investigación a JSON estructurado
 *     (este paso es determinístico, no alucina URLs)
 *
 * Guardrails anti-alucinación (idénticos al original):
 *   - source_snippet textual obligatorio (>= 15 palabras)
 *   - URL debe resolver con HEAD (no 404, no redirect a homepage)
 *   - Snippet se guarda en notasInternas para auditoría humana
 */

import { GoogleGenAI } from "@google/genai";
import prisma from "../lib/prisma";
import { passesGuardrails, type AiResult } from "./discover-projects-lib";
import { normalizeUrl, parseSpanishDate } from "../lib/ingestion/utils";

const RESEARCH_PROMPT = `Investigá usando Google Search qué convocatorias de financiamiento agrícola están ABIERTAS HOY para el IICA Chile.

Buscá específicamente en:
- fontagro.org (convocatorias 2026)
- fao.org/chile y fao.org/americas (TCP)
- iadb.org (BID asistencia técnica Chile)
- ifad.org (FIDA)
- thegef.org y greenclimate.fund
- euroclima.org
- fia.cl, indap.gob.cl, corfo.cl
- developmentaid.org

Para cada convocatoria que encuentres ABIERTA y vigente, dame:
- Título exacto
- Institución
- URL directa a la convocatoria (no homepage)
- Fecha de cierre si está disponible
- Snippet textual (al menos 15 palabras) tomado literalmente del search result
- Breve descripción

IMPORTANTE: Solo incluí convocatorias que efectivamente encontraste en los search results. Si una convocatoria YA CERRÓ, indicalo claramente (no la incluyas como abierta). Si no encontrás nada abierto, decilo.`;

const STRUCTURE_PROMPT = (research: string) => `A continuación tenés el resultado de una investigación sobre convocatorias agrícolas abiertas:

---
${research}
---

Convertí esta información a un JSON con esta forma exacta. Solo incluí las convocatorias que la investigación menciona como ABIERTAS (no las cerradas o vencidas). Si la investigación dice que no hay nada abierto, devolvé {"results": []}.

{
  "results": [
    {
      "url": "URL completa de la convocatoria",
      "title": "Título",
      "institution": "Institución",
      "description": "1-2 oraciones",
      "deadline": "DD-MM-YYYY si se menciona, vacío si no",
      "source_snippet": "El snippet textual original, mínimo 15 palabras"
    }
  ]
}

Respondé SOLO con el JSON, sin markdown, sin backticks, sin texto adicional.`;

function extractJsonObject(text: string): any | null {
  if (!text) return null;
  // Quitar markdown fences si existen
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Buscar el primer objeto JSON balanceado
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function discover(query: string): Promise<AiResult[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Paso 1: investigación con grounding
  const researchPrompt = query
    ? `${RESEARCH_PROMPT}\n\nFiltro adicional: enfocate en "${query}".`
    : RESEARCH_PROMPT;

  console.log("[discover] paso 1: investigación con Google Search...");
  const research = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  const researchText = research.text || "";
  if (!researchText.trim()) {
    console.warn("[discover] investigación sin texto");
    return [];
  }

  const groundingChunks =
    (research.candidates as any)?.[0]?.groundingMetadata?.groundingChunks?.length || 0;
  console.log(`[discover] investigación: ${researchText.length} chars, ${groundingChunks} fuentes citadas`);

  // Paso 2: estructuración a JSON sin tools (más determinístico)
  console.log("[discover] paso 2: estructurando a JSON...");
  const structured = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: STRUCTURE_PROMPT(researchText),
    config: {
      temperature: 0,
    },
  });

  const parsed = extractJsonObject(structured.text || "");
  if (!parsed || !Array.isArray(parsed.results)) {
    console.warn("[discover] no se pudo parsear JSON. Respuesta:", (structured.text || "").slice(0, 500));
    return [];
  }
  return parsed.results;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[discover] GEMINI_API_KEY no configurada. Saliendo.");
    console.error("Conseguila gratis en https://aistudio.google.com/ → Get API Key");
    process.exit(1);
  }

  const query = process.env.DISCOVERY_QUERY || "";
  console.log(`[discover] modelo: gemini-2.5-flash · query: "${query || "(general)"}"`);

  const aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  if (!aiSource) {
    console.error("[discover] Source 'ai-discovery' no existe. Corré scripts/seed-sources.ts.");
    process.exit(1);
  }

  let results: AiResult[];
  try {
    results = await discover(query);
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[discover] Gemini API error: ${msg}`);
    await prisma.source.update({
      where: { slug: "ai-discovery" },
      data: { lastRunAt: new Date(), lastRunStatus: "error", lastRunError: msg.slice(0, 500) },
    });
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`[discover] ${results.length} convocatorias estructuradas`);

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
        notasInternas: `AI snippet (Gemini): "${r.source_snippet.slice(0, 200)}..."`,
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
