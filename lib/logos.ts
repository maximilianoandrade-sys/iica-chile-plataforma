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
};

// Fallback si la imagen falla
export function getLogoFallback(nombre: string) {
    return `https://placehold.co/40x40/2E7D32/white?text=${nombre.charAt(0)}`;
}

export function getInstitutionalLogo(nombre: string): string {
    const inst = instituciones[nombre as keyof typeof instituciones];
    if (inst) return inst.logo;
    return getLogoFallback(nombre);
}
