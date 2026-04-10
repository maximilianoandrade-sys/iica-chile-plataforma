/**
 * API Route: descubrimiento de NUEVAS convocatorias en la web con IA + web_search
 * Coloca en: app/api/ai-web-search/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `Eres un especialista en identificar convocatorias de fondos para proyectos agrícolas 
y de cooperación internacional en Chile y América Latina, especialmente para el IICA.

Usa la herramienta web_search para buscar convocatorias REALES y ACTUALES abiertas en 2026.

Devuelve SOLO JSON válido (sin markdown):
{
  "projects": [
    {
      "title": "Nombre completo de la convocatoria",
      "fuente": "Institución que financia",
      "ambito": "Internacional|Nacional|Regional",
      "viabilidad": "Alta|Media|Baja",
      "rol": "Ejecutor|Implementador|Asesor|Indirecto",
      "cierre": "YYYY-MM-DD",
      "monto": "Monto estimado o 'Consultar'",
      "url": "URL oficial de la convocatoria",
      "_reason": "Por qué es relevante para IICA Chile en máximo 20 palabras"
    }
  ]
}

Incluye 4-8 proyectos nuevos y no obvios. Prioriza fuentes poco conocidas.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const userQuery = `Busca nuevas convocatorias de fondos para proyectos agrícolas, desarrollo rural 
o cooperación técnica relevantes para el IICA Chile en 2026.

Query adicional: "${query || "convocatorias financiamiento agricola cooperacion internacional"}"

Enfócate en fuentes diversas: JICA (Japón), FAO nuevas ventanas TCP, Horizonte Europa Clúster 6,
GEF nuevas rondas 2026, USDA Foreign Agricultural Service, KOICA (Corea), 
Banco Interamericano nuevas asistencias técnicas, EUROCLIMA+ rondas abiertas,
fondos bilaterales Suecia-ASDI, Países Bajos, Noruega para ALC.

Busca en: developmentaid.org, grants.gov, euroclima.org, ec.europa.eu/europeaid,
fondos.gob.cl, ifad.org/en/opportunities, greenclimate.fund.`;

    // Llamada con web_search habilitado
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      // @ts-expect-error — web_search_20250305 es una tool beta de Anthropic
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userQuery }],
    });

    // Extraer el bloque de texto final (después de los tool_use)
    const textBlock = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    if (!textBlock) {
      return NextResponse.json({ projects: [] });
    }

    const cleaned = textBlock.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI Web Search error:", error);
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}
