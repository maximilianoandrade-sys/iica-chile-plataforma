export const instituciones: Record<string, { logo: string; color: string }> = {
    FONTAGRO: { logo: "/logos/fontagro.png", color: "#2E7D32" },
    FAO: { logo: "/logos/fao.png", color: "#1565C0" },
    BID: { logo: "/logos/bid.png", color: "#0D47A1" },
    FIDA: { logo: "/logos/fida.png", color: "#6A1B9A" },
    GEF: { logo: "/logos/gef.png", color: "#00695C" },
    GCF: { logo: "/logos/gcf.png", color: "#1B5E20" },
    INDAP: { logo: "/logos/indap.png", color: "#33691E" },
    FIA: { logo: "/logos/fia.png", color: "#E65100" },
    CORFO: { logo: "/logos/corfo.png", color: "#B71C1C" },
    CNR: { logo: "/logos/cnr.png", color: "#01579B" },
    MINAGRI: { logo: "/logos/minagri.png", color: "#1A237E" },
    "UE (EUROCLIMA+)": { logo: "/logos/euroclima.png", color: "#1565C0" },
    "UE (AECID)": { logo: "/logos/aecid.png", color: "#C62828" },
    "IICA Hemisférico": { logo: "/logos/iica.png", color: "#2E7D32" },
    "IICA Central": { logo: "/logos/iica.png", color: "#2E7D32" },
    JICA: { logo: "/logos/fontagro.png", color: "#E53935" },
    KOICA: { logo: "/logos/fontagro.png", color: "#1E88E5" },
    "Banco Mundial": { logo: "/logos/bid.png", color: "#0D47A1" },
    COSUDE: { logo: "/logos/euroclima.png", color: "#D32F2F" },
    NORAD: { logo: "/logos/euroclima.png", color: "#C62828" },
    SIDA: { logo: "/logos/euroclima.png", color: "#1565C0" },
    "Unión Europea": { logo: "/logos/euroclima.png", color: "#1565C0" },
    USDA: { logo: "/logos/fontagro.png", color: "#2E7D32" },
    Sercotec: { logo: "/logos/corfo.png", color: "#B71C1C" },
    "GORE Biobío": { logo: "/logos/minagri.png", color: "#1A237E" },
    "GORE La Araucanía": { logo: "/logos/minagri.png", color: "#1A237E" },
    "GORE Coquimbo": { logo: "/logos/minagri.png", color: "#1A237E" },
    "Adaptation Fund": { logo: "/logos/gcf.png", color: "#1B5E20" },
    GIZ: { logo: "/logos/euroclima.png", color: "#FF8F00" },
    CAF: { logo: "/logos/bid.png", color: "#0D47A1" },
    "BID Lab": { logo: "/logos/bid.png", color: "#FF6F00" },
    "ANID / UKRI": { logo: "/logos/fia.png", color: "#7B1FA2" },
    PNUD: { logo: "/logos/fao.png", color: "#1565C0" },
    "CEPAL/FAO": { logo: "/logos/fao.png", color: "#1565C0" },
    "CONADI/INDAP": { logo: "/logos/indap.png", color: "#33691E" },
    "Gobierno de Canadá": { logo: "/logos/euroclima.png", color: "#D32F2F" },
    AGCID: { logo: "/logos/minagri.png", color: "#1A237E" },
    PNUMA: { logo: "/logos/fao.png", color: "#00695C" },
    AECID: { logo: "/logos/aecid.png", color: "#C62828" },
};

// Fallback si la imagen falla
export function getLogoFallback(nombre: string | undefined | null) {
    const safe = nombre || "?";
    return `https://placehold.co/40x40/2E7D32/white?text=${encodeURIComponent(safe.charAt(0))}`;
}

export function getInstitutionalLogo(nombre: string | undefined | null): string {
    if (!nombre) return getLogoFallback(nombre);
    const inst = instituciones[nombre as keyof typeof instituciones];
    if (inst) return inst.logo;
    return getLogoFallback(nombre);
}
