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
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada en el servidor." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "El campo 'query' es requerido y debe ser un texto válido." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${SYSTEM_PROMPT}\n\nPregunta del usuario: ${query.trim()}`,
      config: {
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

    return NextResponse.json({
      answer,
      sources,
      searchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[ai-search] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
