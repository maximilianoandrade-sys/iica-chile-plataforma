/**
 * API Route: búsqueda semántica sobre proyectos existentes
 * Coloca en: app/api/ai-search/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `Eres un motor de búsqueda semántica para convocatorias de proyectos del IICA Chile.
Dado un query de búsqueda y una lista de proyectos, devuelve SOLO un objeto JSON con:
{"results":[{"id":N,"score":0-100,"reason":"razón de relevancia en máximo 15 palabras"}]}
- Ordena por score descendente
- Solo incluye proyectos con score >= 40
- El score refleja cuán relevante es para el IICA Chile según el query
- Sin markdown, sin texto extra, solo JSON válido`;

export async function POST(req: NextRequest) {
  try {
    const { query, projectList } = await req.json();

    if (!query || !projectList) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Query: "${query}"\n\nProyectos:\n${projectList}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "{}";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
