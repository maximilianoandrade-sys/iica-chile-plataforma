import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("lib/logos");

// ─── Institution Registry ────────────────────────────────────────────────────

export interface InstitutionEntry {
  slug: string;
  sigla: string;
  path: string | null;
  sourceType: "official" | "wikimedia" | "png-legacy" | null;
  brandColor: string;
}

export interface ResolvedLogo {
  path: string | null;
  sigla: string;
  brandColor: string;
  hasAsset: boolean;
}

const registry: InstitutionEntry[] = [
  { slug: "cnr", sigla: "CNR", path: "/logos/cnr.png", sourceType: "png-legacy", brandColor: "#01579B" },
  { slug: "corfo", sigla: "CORFO", path: "/logos/corfo.png", sourceType: "png-legacy", brandColor: "#E53935" },
  { slug: "fia", sigla: "FIA", path: "/logos/fia.png", sourceType: "png-legacy", brandColor: "#E65100" },
  { slug: "fontagro", sigla: "FNTG", path: "/logos/fontagro.png", sourceType: "png-legacy", brandColor: "#2E7D32" },
  { slug: "indap", sigla: "INDAP", path: "/logos/indap.png", sourceType: "png-legacy", brandColor: "#33691E" },
  { slug: "fao", sigla: "FAO", path: "/logos/official/fao.svg", sourceType: "wikimedia", brandColor: "#009EDB" },
  { slug: "bid", sigla: "BID", path: null, sourceType: null, brandColor: "#003876" },
  { slug: "gcf", sigla: "GCF", path: null, sourceType: null, brandColor: "#00B398" },
  { slug: "fida", sigla: "FIDA", path: null, sourceType: null, brandColor: "#6A1B9A" },
  { slug: "gef", sigla: "GEF", path: null, sourceType: null, brandColor: "#00695C" },
  { slug: "minagri", sigla: "MIN", path: null, sourceType: null, brandColor: "#1A237E" },
  { slug: "iica", sigla: "IICA", path: "/logos/official/iica.png", sourceType: "official", brandColor: "#4CAF50" },
  { slug: "iica-hemisferico", sigla: "IICA", path: "/logos/official/iica.png", sourceType: "official", brandColor: "#4CAF50" },
  { slug: "ue-euroclima", sigla: "UE", path: null, sourceType: null, brandColor: "#003399" },
  { slug: "ue-aecid", sigla: "AECID", path: null, sourceType: null, brandColor: "#C62828" },
  { slug: "anid", sigla: "ANID", path: null, sourceType: null, brandColor: "#1A237E" },
  { slug: "agcid", sigla: "AGCID", path: null, sourceType: null, brandColor: "#C8102E" },
  { slug: "pnud", sigla: "PNUD", path: "/logos/official/pnud.svg", sourceType: "official", brandColor: "#0468B1" },
  { slug: "sag", sigla: "SAG", path: null, sourceType: null, brandColor: "#388E3C" },
];

// Name variants for matching
const nameAliases: Record<string, string> = {
  "ue (euroclima+)": "ue-euroclima",
  "euroclima": "ue-euroclima",
  "ue (aecid)": "ue-aecid",
  "aecid": "ue-aecid",
  "iica hemisférico": "iica-hemisferico",
  "iica hemisferico": "iica-hemisferico",
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function findEntry(nombre: string): InstitutionEntry | undefined {
  const norm = normalize(nombre);

  // Exact alias match
  const aliasSlug = nameAliases[norm];
  if (aliasSlug) {
    return registry.find((e) => e.slug === aliasSlug);
  }

  // Exact slug match
  const bySlug = registry.find((e) => e.slug === norm);
  if (bySlug) return bySlug;

  // Partial: check if input starts with a known slug/sigla
  for (const entry of registry) {
    if (norm.startsWith(entry.slug) || norm.startsWith(entry.sigla.toLowerCase())) {
      return entry;
    }
  }

  return undefined;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getInstitutionalLogo(nombre: string): ResolvedLogo;
export function getInstitutionalLogo(nombre: string, size: number): string;
export function getInstitutionalLogo(nombre: string, size?: number): ResolvedLogo | string {
  const entry = findEntry(nombre);
  const resolved: ResolvedLogo = entry
    ? { path: entry.path, sigla: entry.sigla, brandColor: entry.brandColor, hasAsset: entry.path !== null }
    : { path: null, sigla: nombre.slice(0, 3).toUpperCase(), brandColor: "#546E7A", hasAsset: false };

  if (!entry) {
    logger.warn("No registry entry for institution", { nombre });
  }

  // Legacy mode: when size is provided, return a string (path or fallback SVG)
  if (size !== undefined) {
    if (resolved.hasAsset && resolved.path) return resolved.path;
    return getLogoFallbackSvg(resolved.sigla, resolved.brandColor, size);
  }

  return resolved;
}

export function getLogoFallbackSvg(sigla: string, brandColor: string, size: number = 40): string {
  const fontSize = sigla.length >= 4 ? Math.round(size * 0.28) : Math.round(size * 0.35);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="6" fill="${brandColor}"/><text x="50%" y="50%" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="central">${sigla}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Backward compat: keep old fallback name working
export function getLogoFallback(nombre: string | null | undefined, size: number = 40): string {
  const resolved = nombre ? getInstitutionalLogo(nombre) : { sigla: "?", brandColor: "#546E7A" };
  return getLogoFallbackSvg(resolved.sigla, resolved.brandColor, size);
}

export { registry as institutionRegistry };
