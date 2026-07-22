// ============================================================
// app/api/ai-search/route.ts
//
// Endpoint de búsqueda conversacional con IA — Gemini + Google Search.
//
// Usa Gemini 2.5 Flash Lite con grounding de Google Search para
// responder preguntas sobre oportunidades de financiamiento
// agrícola en Chile.
//
// Body:
//   { query: string }
// Response:
//   { answer: string, sources: string[], searchedAt: string }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getLogger } from "@/lib/utils/logger";
import { AiSearchSchema, formatZodError } from "@/lib/utils/validation";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api-response";
import { getAiEnv } from '@/lib/utils/env';
import { checkRateLimit } from "@/lib/utils/rateLimit";

const logger = getLogger("AiSearch");
const AI_SEARCH_RATE_LIMIT = { maxRequests: 10, windowSizeMs: 60000 };

const SYSTEM_PROMPT = `Eres un asistente experto en oportunidades de financiamiento, fondos concursables, subsidios y programas de apoyo para el sector agrícola y agroalimentario en Chile.

Tu rol es:
- Responder preguntas sobre fondos, subsidios, programas y concursos disponibles para agricultores, empresas agrícolas y emprendedores del sector agroalimentario chileno.
- Incluir información sobre INDAP, CORFO, FIA, SAG, CNR, Mercado Público, y otros organismos relevantes.
- Proveer información actualizada usando búsqueda en Google.
- Responder siempre en español.

Reglas:
- Solo responde sobre temas relacionados con oportunidades de financiamiento, fondos, subsidios y programas para el sector agrícola/agroalimentario en Chile.
- Si te preguntan sobre otros temas, declina amablemente y redirige al usuario hacia consultas sobre financiamiento agrícola.
- Sé conciso pero informativo. Incluye fechas de postulación, montos y requisitos cuando estén disponibles.
- Cita las fuentes de información cuando sea posible.`;

export async function GET() {
  return NextResponse.json({
    route: "/api/ai-search",
    description:
      "Búsqueda conversacional con IA sobre oportunidades de financiamiento agrícola en Chile",
    method: "POST",
    body: { query: "string" },
    response: { answer: "string", sources: "string[]", searchedAt: "string" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rl = checkRateLimit(`ai-search:${clientIp}`, AI_SEARCH_RATE_LIMIT.maxRequests, AI_SEARCH_RATE_LIMIT.windowSizeMs);
    if (!rl.success) {
      return createErrorResponse(`Demasiadas solicitudes de búsqueda IA. Por favor reintente en ${rl.resetSeconds} segundos.`, 429);
    }

    let env: ReturnType<typeof getAiEnv>;
    try {
      env = getAiEnv();
    } catch (error) {
      logger.error('Invalid environment for ai-search', error as Error);
      return createErrorResponse('Error de configuración del servidor', 500);
    }


    if (!env.GEMINI_API_KEY) {
      return createErrorResponse("GEMINI_API_KEY no está configurada en el servidor.", 503);
    }

    const body = await request.json();
    const parsed = AiSearchSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(formatZodError(parsed.error), 400);
    }
    const { query } = parsed.data;

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const answer = response.text ?? "";

    // Extract grounding sources if available
    const sources: string[] = [];
    const candidate = response.candidates?.[0];
    if (candidate?.groundingMetadata?.groundingChunks) {
      for (const chunk of candidate.groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      }
    }

    return createSuccessResponse({
      answer,
      sources,
      searchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    logger.error("AI search failed", err);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
