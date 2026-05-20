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

// Fallback si la imagen falla — genera SVG inline con inicial
export function getLogoFallback(nombre: string | null | undefined, size: number = 40) {
    const initial = nombre ? nombre.charAt(0).toUpperCase() : '?';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="4" fill="#2E7D32"/><text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="${Math.round(size * 0.45)}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getInstitutionalLogo(nombre: string, size: number = 40): string {
    const inst = instituciones[nombre as keyof typeof instituciones];
    if (inst) return inst.logo;
    return getLogoFallback(nombre, size);
}
