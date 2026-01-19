export const LOGO_MAP: Record<string, string> = {
    // Nacionales - Using local generated logos
    'INDAP': '/logos/indap.png',
    'CNR': '/logos/cnr.png',
    'CORFO': '/logos/corfo.png',
    'FIA': '/logos/fia.png',
    'SAG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Sag_Chile_%28logo%29.svg/1200px-Sag_Chile_%28logo%29.svg.png',

    // Internacionales
    'FONTAGRO': '/logos/fontagro.png',
    'Fondo Chile (PNUD)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/UNDP_logo.svg/1200px-UNDP_logo.svg.png',
    'Unión Europea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1200px-Flag_of_Europe.svg.png',
    'European Union': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1200px-Flag_of_Europe.svg.png',
    'FAO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/FAO_logo.svg/1200px-FAO_logo.svg.png',
    'IFAD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/IFAD_logo.svg/1200px-IFAD_logo.svg.png',
    'IDB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Inter-American_Development_Bank_logo.svg/1200px-Inter-American_Development_Bank_logo.svg.png',
    'USAID': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/USAID-Identity.svg/1200px-USAID-Identity.svg.png',
    'GIZ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GIZ_logo.svg/1200px-GIZ_logo.svg.png',
    'GCF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Green_Climate_Fund_logo.svg/1200px-Green_Climate_Fund_logo.svg.png',
    'World Bank': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/World_Bank_logo.svg/1200px-World_Bank_logo.svg.png',
    'CAF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/CAF_logo.svg/1200px-CAF_logo.svg.png'
};

export const getInstitutionalLogo = (institution: string): string => {
    // 1. Try to find an official high-res logo
    if (LOGO_MAP[institution]) {
        return LOGO_MAP[institution];
    }

    // 2. Partial match check (e.g., "INDAP Region de los Lagos" -> matches "INDAP")
    for (const key of Object.keys(LOGO_MAP)) {
        if (institution.includes(key)) {
            return LOGO_MAP[key];
        }
    }

    // 3. Fallback to Google S2 High-Res (128)
    const domainMap: Record<string, string> = {
        'CNR': 'cnr.gob.cl',
        'INDAP': 'indap.gob.cl',
        'CORFO': 'corfo.cl',
        'FIA': 'fia.cl',
        'SAG': 'sag.gob.cl',
    };

    const domain = domainMap[institution] || 'gob.cl';
    // Using simple google crawler as last resort
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};
