import { validateUrl } from "../lib/ingestion/validateUrl";

export interface AiResult {
  url: string;
  title: string;
  source_snippet: string;
  institution?: string;
  description?: string;
  deadline?: string;
}

const MIN_SNIPPET_WORDS = 15;

/**
 * Aplica los guardrails anti-alucinación a un resultado de Claude:
 * 1. Snippet textual obligatorio (>= 15 palabras) — fuerza a Claude a citar
 *    la fuente en lugar de inventar.
 * 2. URL debe resolver (HEAD ok, no 404, no redirect a homepage genérica).
 *
 * Devuelve {ok: true} si pasa, {ok: false, reason} si descarta.
 */
export async function passesGuardrails(
  r: AiResult
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const wordCount = (r.source_snippet || "").trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_SNIPPET_WORDS) {
    return { ok: false, reason: `snippet < ${MIN_SNIPPET_WORDS} palabras (${wordCount})` };
  }
  const v = await validateUrl(r.url);
  if (!v.ok) return { ok: false, reason: v.reason ?? "URL inválida" };
  return { ok: true };
}
