import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('Script');
import { GoogleGenAI } from "@google/genai";
import prisma from "../lib/prisma";
import { passesGuardrails, type AiResult } from "./discover-projects-lib";
import { normalizeUrl, parseSpanishDate, resolveShortUrl } from "../lib/ingestion/utils";

const RESEARCH_PROMPT = `Investigá usando Google Search qué convocatorias de financiamiento agrícola están ABIERTAS HOY para el IICA Chile.

FUENTES PRIORITARIAS:
- fontagro.org/iniciativas/convocatorias
- ifad.org / fida (operations/country/chile + en fondos como FO4IMPACT)
- undp.org / pnud.cl (calls, funding opportunities Chile)
- fao.org/chile, fao.org/in-action/tcp
- indap.gob.cl/convocatorias

FUENTES SECUNDARIAS:
- fia.cl/convocatorias
- corfo.gob.cl/sites/cpp/convocatoria/
- cnr.gob.cl/agricultores/calendario-de-concurso/
- iica.int/es/licitaciones

FUENTES COMPLEMENTARIAS:
- iadb.org / BID
- thegef.org / greenclimate.fund
- euroclima.org
- agci.cl

Para cada convocatoria que encuentres ABIERTA y vigente, dame:
- Título exacto
- Institución
- URL directa a la convocatoria (no homepage)
- Fecha de cierre si está disponible
- Snippet textual (al menos 15 palabras) tomado literalmente del search result
- Breve descripción

IMPORTANTE: Solo incluí convocatorias que efectivamente encontraste en los search results.`;

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
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
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

  const researchPrompt = query
    ? `${RESEARCH_PROMPT}\n\nFiltro adicional: enfocate en "${query}".`
    : RESEARCH_PROMPT;

  logger.info("[discover] paso 1: investigación con Google Search...");
  const research = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  const researchText = research.text || "";
  if (!researchText.trim()) {
    logger.warn("[discover] investigación sin texto");
    return [];
  }

  const groundingChunks =
    (research.candidates as any)?.[0]?.groundingMetadata?.groundingChunks?.length || 0;
  logger.info(`[discover] investigación: ${researchText.length} chars, ${groundingChunks} fuentes citadas`);

  logger.info("[discover] paso 2: estructurando a JSON...");
  const structured = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: STRUCTURE_PROMPT(researchText),
    config: { temperature: 0 },
  });

  const parsed = extractJsonObject(structured.text || "");
  if (!parsed || !Array.isArray(parsed.results)) {
    logger.warn("[discover] no se pudo parsear JSON. Respuesta:", { text: (structured.text || "").slice(0, 500) });
    return [];
  }
  return parsed.results;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    logger.error("[discover] GEMINI_API_KEY no configurada. Saliendo.");
    logger.error("Conseguila gratis en https://aistudio.google.com/ → Get API Key");
    process.exit(1);
  }

  const query = process.env.DISCOVERY_QUERY || "";
  logger.info(`[discover] modelo: gemini-2.5-flash · query: "${query || "(general)"}"`);

  let aiSource: { id: number } | null = null;
  try {
    aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  } catch (err) {
    logger.error(`[discover] Error de conexión con la base de datos: ${(err as Error).message}`);
    logger.info(`[discover] Por favor verifica que DATABASE_URL en .env sea accesible.`);
    process.exit(1);
  }

  if (!aiSource) {
    logger.error("[discover] Source 'ai-discovery' no existe. Corré scripts/seed-sources.ts.");
    process.exit(1);
  }

  let results: AiResult[] = [];
  try {
    results = await discover(query);
  } catch (err) {
    const msg = (err as Error).message;
    logger.error(`[discover] Gemini API error: ${msg}`);
    try {
      await prisma.source.update({
        where: { slug: "ai-discovery" },
        data: { lastRunAt: new Date(), lastRunStatus: "error", lastRunError: msg.slice(0, 500) },
      });
    } catch {}
    await prisma.$disconnect();
    process.exit(1);
  }

  logger.info(`[discover] ${results.length} convocatorias estructuradas`);

  let inserted = 0;
  let updated = 0;
  let discarded = 0;
  const discardReasons: string[] = [];

  for (const r of results) {
    if (r.url && !/^https?:\/\//i.test(r.url) && /^[\w-]+\./.test(r.url)) {
      r.url = "https://" + r.url;
    }

    if (r.url) {
      r.url = await resolveShortUrl(r.url);
    }

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

    try {
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
          estado: "Abierto",
          categoria: "AI Discovery",
          notasInternas: `AI snippet (Gemini): "${r.source_snippet.slice(0, 200)}..."`,
          discoveredBy: "ai",
          needsReview: true,
          sourceRefId: aiSource.id,
          estadoPostulacion: "Abierta",
          ambito: "Internacional",
        },
      });
      inserted++;
    } catch (err) {
      logger.warn(`[discover] Error al guardar proyecto ${canonicalUrl}: ${(err as Error).message}`);
    }
  }

  try {
    await prisma.source.update({
      where: { slug: "ai-discovery" },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: results.length > 0 && discarded === results.length ? "error" : "success",
        lastRunError: discardReasons.slice(0, 5).join("\n") || null,
        projectsCount: inserted + updated,
      },
    });
  } catch {}

  logger.info(`[discover] Insertados: ${inserted}, Actualizados: ${updated}, Descartados: ${discarded}`);
  if (discarded > 0) {
    logger.info(`[discover] Razones de descarte (primeras 5):`);
    discardReasons.slice(0, 5).forEach((r) => logger.info(`  - ${r}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  logger.error(`[discover] Error inesperado: ${e?.message || e}`);
  process.exit(1);
});
