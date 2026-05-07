import { validateUrl } from "../lib/ingestion/validateUrl";

export interface AiResult {
  url: string;
  title: string;
  source_snippet: string;
  institution?: string;
  description?: string;
  deadline?: string;
}

export async function passesGuardrails(
  r: AiResult
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const wordCount = (r.source_snippet || "").trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 15) {
    return { ok: false, reason: `snippet < 15 palabras (${wordCount})` };
  }
  const v = await validateUrl(r.url);
  if (!v.ok) return { ok: false, reason: v.reason ?? "URL inválida" };
  return { ok: true };
}
