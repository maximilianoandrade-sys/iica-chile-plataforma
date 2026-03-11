/**
 * app/api/search-projects/route.ts
 * 
 * API Route para el motor de búsqueda de proyectos reales IICA Chile.
 * 
 * Usa el SDK de Anthropic con web_search para consultar fuentes reales:
 *  - INDAP, CORFO, FIA, CNR, Mercado Público, FONTAGRO, IICA Global, ANID
 * 
 * Instalar: npm install @anthropic-ai/sdk
 * Variable de entorno requerida: ANTHROPIC_API_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ProjectResult {
  id: string;
  title: string;
  source: string;
  category: string;
  status: "abierto" | "próximo" | "cerrado" | "permanente";
  deadline: string | null;
  region: string;
  budget: string | null;
  iica_role: string;
  description: string;
  requirements: string[];
  url: string;
  relevance_score: number;
  tags: string[];
}

interface SearchResponse {
  results: ProjectResult[];
  summary: string;
  search_date: string;
  total_opportunities: number;
}

// ─── Prompt del sistema ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un especialista en identificar oportunidades de financiamiento y cooperación técnica agrícola en Chile y América Latina para el IICA (Instituto Interamericano de Cooperación para la Agricultura).

Cuando el usuario realice una búsqueda, debes encontrar proyectos REALES y VIGENTES donde el IICA Chile puede participar como:
- Ejecutor técnico principal
- Co-ejecutor o socio estratégico
- Proveedor de asistencia técnica especializada
- Consultor o evaluador externo
- Articulador interinstitucional

FUENTES PRIORITARIAS a buscar (usa web_search para cada una):
1. INDAP (indap.gob.cl/concursos) - concursos y programas de fomento productivo
2. CORFO (corfo.cl) - innovación, transferencia tecnológica, emprendimiento
3. FIA - Fundación para la Innovación Agraria (fia.cl) - convocatorias de investigación
4. CNR - Comisión Nacional de Riego (cnr.gob.cl) - proyectos Ley 18.450 y Ley 18.753
5. FONTAGRO / BID (fontagro.org) - proyectos regionales Latinoamérica
6. IICA Global (iica.int/es/licitaciones) - licitaciones y convocatorias institucionales
7. Mercado Público (mercadopublico.cl) - licitaciones con palabras clave "agrícola", "asistencia técnica", "cooperación"
8. ANID (anid.cl) - Fondecyt Aplicado, FONDEF, programas de I+D agrícola

IMPORTANTE: 
- Busca convocatorias VIGENTES (2025-2026) o permanentes
- Incluye monto disponible cuando aparezca
- Identifica específicamente cómo IICA puede participar (no solo quién puede postular)
- Prioriza proyectos con alto puntaje de relevancia para el mandato de IICA

RESPONDE SIEMPRE en JSON puro (sin markdown, sin backticks), con este esquema exacto:
{
  "results": [
    {
      "id": "string único auto-generado",
      "title": "título completo del proyecto/convocatoria",
      "source": "INDAP|CORFO|FIA|CNR|BID_FONTAGRO|IICA_GLOBAL|MERCADO_PUBLICO|ANID",
      "category": "riego|innovacion|cooperacion|exportacion|sustentabilidad|capacitacion|financiamiento",
      "status": "abierto|próximo|cerrado|permanente",
      "deadline": "fecha en formato DD/MM/YYYY o null",
      "region": "nombre de región o 'Nacional' o 'Latinoamérica'",
      "budget": "monto como string legible (ej: '$35.000.000 CLP') o null",
      "iica_role": "descripción específica del rol que puede tomar IICA en esta oportunidad",
      "description": "descripción de 2-3 oraciones del proyecto o convocatoria",
      "requirements": ["requisito clave 1", "requisito clave 2", "requisito clave 3"],
      "url": "URL directa y real donde encontrar más información",
      "relevance_score": 8,
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "summary": "1 oración resumiendo el contexto de los resultados",
  "search_date": "fecha actual",
  "total_opportunities": 5
}`;

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { query, category, region } = await req.json();

    if (!query && category === "all") {
      return NextResponse.json(
        { error: "Se requiere al menos una búsqueda o categoría" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const catLabels: Record<string, string> = {
      riego: "Riego y Agua",
      innovacion: "Innovación Agrícola",
      cooperacion: "Cooperación Técnica Internacional",
      exportacion: "Exportación y Mercados",
      sustentabilidad: "Sustentabilidad y Cambio Climático",
      capacitacion: "Capacitación y Asistencia Técnica",
      financiamiento: "Financiamiento y Fondos",
    };

    const userMessage = `
Busca proyectos REALES y convocatorias VIGENTES para IICA Chile.

Término de búsqueda: "${query || "convocatorias agrícolas Chile 2025 2026"}"
Categoría de interés: ${category !== "all" ? catLabels[category] || category : "todas las categorías"}
Región de interés: ${region || "Nacional"}

Instrucciones:
1. Usa web_search para buscar en INDAP, CORFO, FIA, CNR, FONTAGRO y Mercado Público
2. Busca convocatorias abiertas o próximas a abrir en 2025-2026
3. Incluye URLs reales y verificadas
4. Mínimo 4 resultados, máximo 8
5. Responde SOLO con JSON sin ningún texto adicional
`;

    // Llamada a la API con web_search habilitado
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305" as any,
          name: "web_search",
        } as any,
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    // Extraer texto de la respuesta
    const fullText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as any).text)
      .join("\n");

    // Limpiar y parsear JSON
    const cleaned = fullText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("La respuesta de IA no contiene JSON válido");
    }

    const parsed: SearchResponse = JSON.parse(jsonMatch[0]);

    // Validar y enriquecer resultados
    const enriched: SearchResponse = {
      ...parsed,
      results: parsed.results.map((r, i) => ({
        ...r,
        id: r.id || `project-${Date.now()}-${i}`,
        relevance_score: Math.min(10, Math.max(1, r.relevance_score || 5)),
        requirements: r.requirements || [],
        tags: r.tags || [],
      })).sort((a, b) => b.relevance_score - a.relevance_score),
      search_date: new Date().toLocaleDateString("es-CL", {
        day: "2-digit", month: "2-digit", year: "numeric"
      }),
    };

    return NextResponse.json(enriched);

  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Error interno del servidor",
        results: [],
        total_opportunities: 0,
      },
      { status: 500 }
    );
  }
}

// ─── GET: Health check ────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile - Motor de Búsqueda de Proyectos",
    version: "2.0",
    sources: ["INDAP", "CORFO", "FIA", "CNR", "FONTAGRO/BID", "IICA Global", "Mercado Público", "ANID"],
    ai_model: "claude-sonnet-4-20250514",
    web_search: true,
  });
}
