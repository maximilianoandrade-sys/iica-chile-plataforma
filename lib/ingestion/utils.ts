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
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized: string;
  if (lastComma > lastDot && lastDot > -1) {
    // formato latino: 1.000.000,50 (dots as thousands, comma as decimal)
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastComma > -1 && lastDot === -1) {
    // solo comas: 250,000 (anglo thousands) o 1,50 (latino decimal)
    // si hay más de una coma o dígitos después de coma > 2, son miles
    const afterLastComma = cleaned.slice(lastComma + 1);
    if (cleaned.split(",").length > 2 || afterLastComma.length === 3) {
      normalized = cleaned.replace(/,/g, "");
    } else {
      normalized = cleaned.replace(",", ".");
    }
  } else {
    // formato anglo: 1,000,000.50 ó 10.000.000 (chileno sin decimales)
    if (lastDot > -1 && cleaned.split(".").length > 2) {
      normalized = cleaned.replace(/\./g, "");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
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
