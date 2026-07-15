import { getAiEnv } from '@/lib/utils/env';
import { GoogleGenAI } from "@google/genai";
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import { fetchWithRetry } from "./retry";
import { cleanText } from "./utils";
import type { RawProject } from "./types";

const logger = getLogger("UniversalAIScraper");

const SYSTEM_PROMPT = `
Eres un analista experto en fondos concursables y proyectos agrícolas.
Recibirás el texto de una página web (posiblemente con ruido de navegación) que describe una oportunidad de financiamiento, licitación o programa.
Debes extraer la información y devolverla EXCLUSIVAMENTE en formato JSON.

El formato JSON debe cumplir EXACTAMENTE con esta estructura, sin propiedades adicionales:
{
  "title": "El título de la oportunidad",
  "institution": "La institución que ofrece el fondo (ej. FIA, INDAP, CORFO)",
  "url": "La URL oficial de postulación o bases (si no hay una específica en el texto, devuelve la URL original que se te pasó)",
  "description": "Una breve descripción (1 o 2 párrafos) de los objetivos del fondo",
  "deadline": "La fecha de cierre en formato DD-MM-YYYY (ej. 31-12-2026). Si no se menciona fecha de cierre clara o dice 'Ventanilla Abierta', devuelve null",
  "opportunityType": "Convocatoria" | "Licitacion" | "Programa",
  "region": "Si está restringido a una región específica de Chile (ej. 'Los Lagos'). Si es todo Chile o no especifica, devuelve 'Nacional'",
  "ambito": "Nacional" | "Internacional" | "Regional"
}

REGLAS ESTRICTAS:
1. No incluyas markdown (ej. \`\`\`json). SOLO el texto JSON crudo.
2. Si el texto no menciona ninguna oportunidad agrícola o de financiamiento, devuelve un array vacío [] (pero como este pipeline asume 1 URL = 1 oportunidad principal, puedes devolver el JSON con title="No Encontrado" y lo descartaremos).
3. Asegúrate de extraer la fecha correctamente.
`;

export async function scrapeUrlWithAI(url: string): Promise<RawProject | null> {
  logger.info("Scraping URL with AI", { url });

  try {
    // 1. Fetch HTML content
    const res = await fetchWithRetry(
      url,
      { headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" } },
      3,
      2000
    );
    const html = await res.text();

    // 2. Extract visible text using Cheerio
    const $ = load(html);

    // Remove unwanted elements
    $("script, style, nav, footer, iframe, noscript").remove();

    // Get text and clean it up (limit to ~15,000 chars to avoid token explosion)
    let pageText = cleanText($("body").text());
    if (pageText.length > 15000) {
      pageText = pageText.substring(0, 15000);
    }

    if (!pageText.trim()) {
      logger.warn("No text extracted from URL", { url });
      return null;
    }

    // 3. Prompt Gemini
    const apiKey = getAiEnv().GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY is not defined");
      throw new Error("Missing GEMINI_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `URL de Origen: ${url}\n\nTEXTO DE LA PÁGINA:\n${pageText}\n\nExtrae la oportunidad en JSON usando el esquema indicado.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }, { text: prompt }] }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";

    try {
      // Intentar parsear el JSON de la respuesta
      const parsed = JSON.parse(responseText);

      if (parsed.title === "No Encontrado" || !parsed.title) {
        logger.info("AI determined no valid opportunity on page", { url });
        return null;
      }

      // Convert date format "DD-MM-YYYY" to actual Date object if it exists
      let deadlineDate: Date | null = null;
      if (parsed.deadline && typeof parsed.deadline === "string") {
        const parts = parsed.deadline.split("-");
        if (parts.length === 3) {
          deadlineDate = new Date(Date.UTC(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 12, 0, 0));
        }
      }

      const project: RawProject = {
        title: parsed.title,
        institution: parsed.institution || "Por confirmar",
        url: parsed.url && parsed.url !== "null" ? parsed.url : url,
        canonicalKey: url, // La URL original funciona como canonical
        description: parsed.description,
        opportunityType: parsed.opportunityType || "Convocatoria",
        region: parsed.region || "Nacional",
        ambito: parsed.ambito || "Nacional",
        idioma: "es", // Asumimos español por defecto en Chile
        deadline: deadlineDate,
      };

      logger.info("Successfully extracted project via AI", { title: project.title, url });
      return project;
    } catch (e) {
      logger.error("Failed to parse AI JSON response", { url, error: (e as Error).message, responseText: responseText.slice(0, 200) });
      return null;
    }

  } catch (err) {
    logger.error("Error in AI scrape execution, applying fallback", { url, error: String(err) });
    return {
      title: "Oportunidad pendiente de revisión",
      institution: "Desconocida (Extraído por Fallback)",
      url: url,
      canonicalKey: url,
      description: "URL scrapeada correctamente pero hubo un fallo en la API de Inteligencia Artificial (cuota excedida). Requiere procesar manualmente.",
      opportunityType: "Convocatoria",
      region: "Nacional",
      ambito: "Nacional",
      idioma: "es",
      deadline: null,
    };
  }
}
