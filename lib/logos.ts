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
  { slug: "ocde", sigla: "OCDE", path: null, sourceType: null, brandColor: "#0077B6" },
  { slug: "global-south-opportunities", sigla: "GSO", path: null, sourceType: null, brandColor: "#1B5E20" },
  { slug: "geda", sigla: "GEDA", path: null, sourceType: null, brandColor: "#D81B60" },
  { slug: "afcia", sigla: "AFCIA", path: null, sourceType: null, brandColor: "#00897B" },
  { slug: "future-for-nature", sigla: "FFN", path: null, sourceType: null, brandColor: "#2E7D32" },
  { slug: "generaccion-climatica", sigla: "GENCLIM", path: null, sourceType: null, brandColor: "#F57C00" },
  { slug: "resilient-futures", sigla: "RFF", path: null, sourceType: null, brandColor: "#3F51B5" },
  { slug: "horizon-europe", sigla: "HORIZON", path: null, sourceType: null, brandColor: "#0D47A1" },
  { slug: "eu-life", sigla: "LIFE", path: null, sourceType: null, brandColor: "#0288D1" },
  { slug: "cfc", sigla: "CFC", path: null, sourceType: null, brandColor: "#795548" },
  { slug: "rainforest-trust", sigla: "RFT", path: null, sourceType: null, brandColor: "#1B5E20" },
  { slug: "microsoft-ai-earth", sigla: "MSFT-AI", path: null, sourceType: null, brandColor: "#0078D4" },
  { slug: "ifc-agritech", sigla: "IFC-AGRI", path: null, sourceType: null, brandColor: "#00A3E0" },
  { slug: "fao-digital-agri", sigla: "FAO-DIGI", path: "/logos/official/fao.svg", sourceType: null, brandColor: "#006699" },
  { slug: "idrc-ai4d", sigla: "AI4D", path: null, sourceType: null, brandColor: "#C62828" },
  { slug: "horizon-ai-agro", sigla: "AI-AGRO", path: null, sourceType: null, brandColor: "#0D47A1" },
  { slug: "iica-agtech", sigla: "AGTECH", path: "/logos/official/iica.png", sourceType: null, brandColor: "#002060" },
  { slug: "nwo-kic-ai", sigla: "NWO-AI", path: null, sourceType: null, brandColor: "#2E7D32" },
  { slug: "global-eba-fund", sigla: "EBA-FUND", path: null, sourceType: null, brandColor: "#2E7D32" },
  { slug: "coalar-australia", sigla: "COALAR", path: null, sourceType: null, brandColor: "#E65100" },
  { slug: "cnr-oua", sigla: "CNR-OUA", path: "/logos/official/cnr.svg", sourceType: null, brandColor: "#006699" },
  { slug: "fiie-chile", sigla: "FIIE", path: null, sourceType: null, brandColor: "#0277BD" },
  { slug: "unep-mountains-adapt", sigla: "UNEP-MNT", path: null, sourceType: null, brandColor: "#00B0FF" },
  { slug: "iki-small-grants", sigla: "IKI", path: null, sourceType: null, brandColor: "#004D40" },
  { slug: "power-of-diversity", sigla: "POD", path: null, sourceType: null, brandColor: "#6A1B9A" },
  { slug: "caf-banco-desarrollo", sigla: "CAF", path: null, sourceType: null, brandColor: "#003366" },
];

// Name variants for matching
const nameAliases: Record<string, string> = {
  "ue (euroclima+)": "ue-euroclima",
  "euroclima": "ue-euroclima",
  "ue (aecid)": "ue-aecid",
  "aecid": "ue-aecid",
  "iica hemisférico": "iica-hemisferico",
  "iica hemisferico": "iica-hemisferico",
  "oecd": "ocde",
  "global south opportunities": "global-south-opportunities",
  "gso": "global-south-opportunities",
  "geda": "geda",
  "gender and environment data alliance": "geda",
  "afcia": "afcia",
  "adaptation fund / un ctcn": "afcia",
  "adaptation fund": "afcia",
  "future for nature": "future-for-nature",
  "future for nature foundation": "future-for-nature",
  "ffn": "future-for-nature",
  "global eba fund": "global-eba-fund",
  "eba fund": "global-eba-fund",
  "coalar": "coalar-australia",
  "coalar australia": "coalar-australia",
  "cnr oua": "cnr-oua",
  "fiie": "fiie-chile",
  "unep mountains adapt": "unep-mountains-adapt",
  "unep": "unep-mountains-adapt",
  "pnuma": "unep-mountains-adapt",
  "iki": "iki-small-grants",
  "iki small grants": "iki-small-grants",
  "power of diversity": "power-of-diversity",
  "caf": "caf-banco-desarrollo",
  "caf banco de desarrollo": "caf-banco-desarrollo",
  "fiie chile": "fiie-chile",
  "generacción climática": "generaccion-climatica",
  "generaccion climatica": "generaccion-climatica",
  "microsoft ai for earth": "microsoft-ai-earth",
  "microsoft ai for earth & climate grants": "microsoft-ai-earth",
  "ifc agritech modernization grant": "ifc-agritech",
  "ifc world bank": "ifc-agritech",
  "fao digital agriculture": "fao-digital-agri",
  "fao digital agriculture & innovation hub": "fao-digital-agri",
  "idrc ai4d": "idrc-ai4d",
  "idrc canada": "idrc-ai4d",
  "horizon europe ai & robotics": "horizon-ai-agro",
  "iica agtech accelerator": "iica-agtech",
  "iica agtech": "iica-agtech",
  "nwo kic ai for agriculture": "nwo-kic-ai",
  "nwo kic": "nwo-kic-ai",
  "generacción climática / cartagena": "generaccion-climatica",
  "resilient futures fund": "resilient-futures",
  "resilient futures": "resilient-futures",
  "horizon europe": "horizon-europe",
  "horizonte europa": "horizon-europe",
  "comisión europea / horizonte europa": "horizon-europe",
  "eu life": "eu-life",
  "eu life programme": "eu-life",
  "eu life programme (cinea)": "eu-life",
  "common fund for commodities": "cfc",
  "common fund for commodities (cfc)": "cfc",
  "cfc": "cfc",
  "rainforest trust": "rainforest-trust",
  "rft": "rainforest-trust",
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

export { registry as institutionRegistry };
