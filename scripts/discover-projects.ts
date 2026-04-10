/**
 * Auto-Discovery de Nuevas Convocatorias
 * Coloca en: scripts/discover-projects.ts
 *
 * Uso: npx tsx scripts/discover-projects.ts
 * O como cron job en Vercel/GitHub Actions cada semana.
 *
 * Genera: data/discovered-projects.json
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Fuentes donde buscar nuevas convocatorias
const SOURCES_TO_SCAN = [
  "https://developmentaid.org/grants/list?keywords=agriculture+chile",
  "https://www.fontagro.org/convocatorias",
  "https://fondos.gob.cl/buscador/?categoria=agricultura-y-desarrollo-rural&estado=abierto",
  "https://ec.europa.eu/info/funding-tenders/opportunities",
  "https://grants.gov/search-grants?cfda=10",
  "https://www.ifad.org/en/opportunities",
  "https://www.greenclimate.fund/projects/funding-proposals",
];

const SYSTEM_PROMPT = `Eres un experto en identificar convocatorias de fondos para proyectos agrícolas y de cooperación internacional relevantes para el IICA Chile. 

Usa web_search para buscar activamente en las fuentes indicadas.

Devuelve SOLO JSON válido (sin markdown):
{
  "projects": [
    {
      "title": "Nombre completo y descriptivo de la convocatoria",
      "fuente": "Nombre de la institución convocante",
      "ambito": "Internacional|Nacional|Regional",
      "viabilidad": "Alta|Media|Baja",
      "rol": "Ejecutor|Implementador|Asesor|Indirecto",
      "cierre": "YYYY-MM-DD",
      "monto": "Monto máximo o rango, o 'Consultar'",
      "url": "URL directa a las bases",
      "keywords": "5-10 palabras clave separadas por espacios",
      "_reason": "Por qué es relevante para IICA Chile en máximo 25 palabras",
      "discoveredAt": "${new Date().toISOString()}"
    }
  ],
  "scannedAt": "${new Date().toISOString()}",
  "totalFound": 0
}

Criterios de calidad:
- Solo convocatorias con fecha de cierre futura (después de hoy)
- URL verificable y oficial
- Relevancia directa para agricultura, desarrollo rural, o cooperación técnica
- Alta viabilidad: IICA puede ser ejecutor directo
- Media: IICA puede ser socio técnico
- Baja: rol indirecto o marginal`;

async function discoverProjects(): Promise<void> {
  console.log("🔍 Iniciando descubrimiento de nuevas convocatorias...\n");

  const allProjects: unknown[] = [];
  const errors: string[] = [];

  // Búsquedas temáticas paralelas
  const searchQueries = [
    "convocatorias fondos cooperacion agricola chile 2026 abiertas",
    "agricultural development grants latin america 2026 open call",
    "IICA FAO FIDA BID convocatorias nuevas 2026",
    "climate finance agriculture adaptation latin america 2026",
    "horizonte europa agroalimentario convocatoria 2026 chile",
    "GEF GCF biodiversity food systems chile 2026",
    "USAID JICA KOICA agriculture latin america grants 2026",
    "EUROCLIMA+ convocatoria agua riego sostenible 2026",
  ];

  for (const searchQuery of searchQueries) {
    try {
      console.log(`  Buscando: "${searchQuery}"`);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        // @ts-expect-error — web_search_20250305 es una tool beta de Anthropic
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Busca: "${searchQuery}". 
Identifica 2-4 convocatorias nuevas, concretas y verificables. 
Prioriza: ${SOURCES_TO_SCAN.join(", ")}`,
          },
        ],
      });

      const textBlock = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");

      if (textBlock) {
        const cleaned = textBlock.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.projects?.length > 0) {
          allProjects.push(...parsed.projects);
          console.log(
            `  ✅ Encontradas ${parsed.projects.length} convocatorias`
          );
        }
      }

      // Esperar entre requests para no saturar la API
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Query "${searchQuery}": ${msg}`);
      console.log(`  ⚠️  Error: ${msg}`);
    }
  }

  // Deduplicar por URL
  const seen = new Set<string>();
  const unique = allProjects.filter((p) => {
    const proj = p as { url?: string };
    if (!proj.url || seen.has(proj.url)) return false;
    seen.add(proj.url);
    return true;
  });

  // Filtrar solo convocatorias con cierre futuro
  const today = new Date();
  const active = unique.filter((p) => {
    const proj = p as { cierre?: string };
    if (!proj.cierre) return false;
    return new Date(proj.cierre) > today;
  });

  const output = {
    projects: active,
    totalFound: active.length,
    scannedAt: new Date().toISOString(),
    errors: errors.length > 0 ? errors : undefined,
  };

  // Guardar resultados
  const outputPath = path.join(
    process.cwd(),
    "data",
    "discovered-projects.json"
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Descubrimiento completado:`);
  console.log(`   - Convocatorias activas encontradas: ${active.length}`);
  console.log(`   - Guardado en: ${outputPath}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errores (${errors.length}):`);
    errors.forEach((e) => console.log(`   - ${e}`));
  }
}

discoverProjects().catch(console.error);
