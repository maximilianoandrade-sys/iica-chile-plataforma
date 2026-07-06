import type { ValidationResult } from "./types";

export async function validateUrl(url: string): Promise<ValidationResult> {
  if (!url || !url.trim()) return { ok: false, reason: "URL vacía" };

  let parsedUrl: URL;
  let allowDevex403 = false;

  // Rechazar URLs que son solo el dominio raíz (sin deep link a una convocatoria).
  // Util para AI Discovery: a veces el modelo devuelve "https://www.fia.cl/" en
  // lugar del path específico — eso lleva al usuario a homepage genérica y no
  // sirve como referencia a una convocatoria.
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
      return { ok: false, reason: "URL es homepage (sin deep link)" };
    }

    const isDevexHost = parsedUrl.hostname === "www.devex.com" || parsedUrl.hostname === "devex.com";
    const isDevexFundingPath = parsedUrl.pathname.startsWith("/funding/") || parsedUrl.pathname.startsWith("/api/funding_projects");
    allowDevex403 = isDevexHost && isDevexFundingPath;
  } catch {
    return { ok: false, reason: "URL no parseable" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 410) return { ok: false, reason: `HTTP ${res.status}` };
    if (res.status >= 500) return { ok: false, reason: `HTTP ${res.status}` };
    if (res.status === 403 && allowDevex403) return { ok: true };
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    try {
      const original = new URL(url);
      const final = new URL(res.url);
      const originalHasPath = original.pathname.length > 1;
      const finalIsRoot = final.pathname === "/" || final.pathname === "";
      if (originalHasPath && finalIsRoot && original.hostname === final.hostname) {
        return { ok: false, reason: "redirige a homepage" };
      }
    } catch {
      // si no parsea no penalizamos
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}
