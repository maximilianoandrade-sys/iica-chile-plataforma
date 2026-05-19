/**
 * Embeddings via Gemini text-embedding-004 (768 dimensiones).
 *
 * Usado para búsqueda semántica (pgvector cosine similarity) + Capa B
 * AI Discovery. Tier gratuito Gemini cubre largo nuestro uso.
 *
 * Optimizaciones:
 *  - Cache in-memory por contenido (dedupe entre runs)
 *  - Batch de hasta 100 textos por call (Gemini lo permite)
 *  - Truncado a 2048 chars input (Gemini acepta hasta 30k pero 2k basta
 *    para títulos+descripciones agrícolas y reduce costo de cálculo)
 */
import { GoogleGenAI } from "@google/genai";

// Modelo actual (May 2026). `text-embedding-004` está deprecated en v1beta.
// gemini-embedding-001 soporta Matryoshka — podemos pedir 768/1536/3072 dims.
// 768 es el sweet spot: cabe en pgvector con índice IVFFlat, suficiente calidad.
const MODEL = "gemini-embedding-001";
const DIMS = 768;
const MAX_INPUT_CHARS = 2048;
const BATCH_SIZE = 100;

// Cache simple en memoria del proceso (no persiste entre runs)
const memoCache = new Map<string, number[]>();

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY no configurada. Conseguila gratis en https://aistudio.google.com/"
      );
    }
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _client;
}

function normalizeText(text: string): string {
  return text.trim().slice(0, MAX_INPUT_CHARS);
}

/**
 * Genera embedding de un solo texto. Cachea por contenido normalizado.
 * Devuelve null si el texto es vacío después de normalizar.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const t = normalizeText(text || "");
  if (!t) return null;

  const cached = memoCache.get(t);
  if (cached) return cached;

  const result = await client().models.embedContent({
    model: MODEL,
    contents: t,
    config: { outputDimensionality: DIMS },
  });

  // El SDK puede devolver `.embeddings[0].values` o `.embedding.values`.
  const anyResult = result as any;
  const values: number[] | undefined =
    anyResult.embeddings?.[0]?.values ?? anyResult.embedding?.values;

  if (!values || values.length !== DIMS) {
    throw new Error(`Embedding inválido — esperado ${DIMS} dims, recibido ${values?.length}`);
  }
  memoCache.set(t, values);
  return values;
}

/**
 * Genera embeddings en batch para mejor throughput.
 * Procesa de a BATCH_SIZE elementos por call.
 */
export async function embedBatch(texts: string[]): Promise<(number[] | null)[]> {
  const results: (number[] | null)[] = new Array(texts.length).fill(null);
  const todo: { idx: number; text: string }[] = [];

  for (let i = 0; i < texts.length; i++) {
    const t = normalizeText(texts[i] || "");
    if (!t) continue;
    const cached = memoCache.get(t);
    if (cached) {
      results[i] = cached;
    } else {
      todo.push({ idx: i, text: t });
    }
  }

  for (let start = 0; start < todo.length; start += BATCH_SIZE) {
    const chunk = todo.slice(start, start + BATCH_SIZE);
    const contents = chunk.map((c) => c.text);

    const result = await client().models.embedContent({
      model: MODEL,
      contents,
      config: { outputDimensionality: DIMS },
    });

    const anyResult = result as Record<string, unknown>;
    const embeddings: Array<{ values?: number[] }> = (anyResult.embeddings as Array<{ values?: number[] }>) ?? [anyResult.embedding as { values?: number[] }];

    for (let i = 0; i < chunk.length; i++) {
      const values = embeddings[i]?.values;
      if (values && values.length === DIMS) {
        results[chunk[i].idx] = values;
        memoCache.set(chunk[i].text, values);
      }
    }
  }

  return results;
}

/**
 * Convierte un embedding (array de floats) al formato SQL de pgvector.
 *   [0.1, 0.2, ...] → '[0.1,0.2,...]'
 */
export function toPgVector(embedding: number[]): string {
  return "[" + embedding.join(",") + "]";
}

/**
 * Concatena los campos relevantes de un proyecto para embedding.
 * El orden de campos influye en qué pesa más en la representación semántica.
 */
export function projectToEmbeddingText(project: {
  nombre: string;
  institucion: string;
  objetivo?: string | null;
  descripcionIICA?: string | null;
  categoria?: string | null;
}): string {
  return [
    project.nombre,
    project.institucion,
    project.objetivo ?? "",
    project.descripcionIICA ?? "",
    project.categoria ?? "",
  ]
    .filter((s) => s && s.length > 0)
    .join(" \n ");
}
