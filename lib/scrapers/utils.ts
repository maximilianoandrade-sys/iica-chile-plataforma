/**
 * Utilidades compartidas para scrapers
 */

const FETCH_TIMEOUT = 8000; // 8s para dejar margen dentro de los 10s

export async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IICA-Chile-Scraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.5',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

/** Decodifica entidades HTML comunes */
export function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&aacute;/gi, 'á')
    .replace(/&eacute;/gi, 'é')
    .replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó')
    .replace(/&uacute;/gi, 'ú')
    .replace(/&ntilde;/gi, 'ñ')
    .replace(/&Aacute;/gi, 'Á')
    .replace(/&Eacute;/gi, 'É')
    .replace(/&Iacute;/gi, 'Í')
    .replace(/&Oacute;/gi, 'Ó')
    .replace(/&Uacute;/gi, 'Ú')
    .replace(/&Ntilde;/gi, 'Ñ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
}

/** Limpia HTML tags y whitespace extra */
export function stripHtml(html: string): string {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

/** Genera un slug desde un texto */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

/** Parsea fecha en formato DD/MM/YYYY, DD-MM-YYYY, o YYYY-MM-DD */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // YYYY-MM-DD
  let m = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));

  // DD/MM/YYYY or DD-MM-YYYY
  m = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));

  // Try native parse as fallback
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

/** Determina estado basado en fecha de cierre */
export function deriveEstado(fechaCierre: Date): string {
  const now = new Date();
  const diff = fechaCierre.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 0) return 'Cerrado';
  if (days > 60) return 'Próximo';
  return 'Abierto';
}

/** Parsea montos chilenos: "$500.000.000", "500 millones", etc. */
export function parseMontoCLP(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/\s/g, '');

  // $500.000.000 or 500.000.000
  const numMatch = clean.match(/\$?([\d.]+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1].replace(/\./g, ''));
    if (!isNaN(num) && num > 0) return num;
  }

  // "500 millones"
  const millMatch = text.match(/([\d.,]+)\s*mill/i);
  if (millMatch) {
    const num = parseFloat(millMatch[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(num)) return num * 1000000;
  }

  return 0;
}
