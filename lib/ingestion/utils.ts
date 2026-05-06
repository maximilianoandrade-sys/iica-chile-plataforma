export function normalizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  try {
    const u = new URL(rawUrl.trim());
    u.hash = "";
    const params = new URLSearchParams();
    u.searchParams.forEach((v, k) => {
      if (!k.toLowerCase().startsWith("utm_")) params.set(k, v);
    });
    u.search = params.toString();
    let result = u.toString().toLowerCase();
    if (result.endsWith("/") && u.pathname !== "/") {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    return null;
  }
}

const MONTHS_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

export function parseSpanishDate(input: string): Date | null {
  if (!input || !input.trim()) return null;
  const s = input.trim().toLowerCase();

  // DD-MM-YYYY o DD/MM/YYYY
  const numeric = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (numeric) {
    const [, d, m, y] = numeric;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  // "DD de MES de YYYY"
  const written = s.match(/^(\d{1,2})\s+de\s+([a-zñ]+)\s+de\s+(\d{4})$/);
  if (written) {
    const [, d, monthName, y] = written;
    const month = MONTHS_ES[monthName];
    if (!month) return null;
    const date = new Date(Number(y), month - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function parseAmount(input: string): number | null {
  if (!input || !input.trim()) return null;
  const cleaned = input.replace(/[^\d,.]/g, "");
  if (!cleaned) return null;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalized: string;

  if (hasComma && hasDot) {
    // Ambos separadores: el rightmost es el decimal
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      // latino: 1.250,50 → 1250.50
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // anglo: 1,250.50 → 1250.50
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Solo comas. Si el último grupo tiene 3 dígitos, es separador de miles (anglo).
    const lastComma = cleaned.lastIndexOf(",");
    const afterLast = cleaned.length - lastComma - 1;
    normalized = afterLast === 3
      ? cleaned.replace(/,/g, "")
      : cleaned.replace(",", ".");
  } else if (hasDot) {
    // Solo puntos. Si el último grupo tiene 3 dígitos, es separador de miles (latino).
    const lastDot = cleaned.lastIndexOf(".");
    const afterLast = cleaned.length - lastDot - 1;
    normalized = afterLast === 3
      ? cleaned.replace(/\./g, "")
      : cleaned;
  } else {
    normalized = cleaned;
  }

  const n = Number(normalized);
  return isNaN(n) ? null : n;
}

export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/\s+/g, " ").trim();
}

export function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
