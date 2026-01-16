export const LOGO_MAP: Record<string, string> = {
    // Nacionales
    'INDAP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Indap_Chile_%28logo%29.svg/1200px-Indap_Chile_%28logo%29.svg.png',
    'CNR': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Comisi%C3%B3n_Nacional_de_Riego.png',
    'CORFO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Corfo_Chile_2013_%28logo%29.svg/2560px-Corfo_Chile_2013_%28logo%29.svg.png',
    'FIA': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Logo_FIA.jpg', // Fallback, FIA logo is harder to find on commons
    'SAG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Sag_Chile_%28logo%29.svg/1200px-Sag_Chile_%28logo%29.svg.png',

    // Internacionales
    'Fondo Chile (PNUD)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/UNDP_logo.svg/1200px-UNDP_logo.svg.png',
    'Unión Europea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/1200px-Flag_of_Europe.svg.png',
    'FAO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/FAO_logo.svg/1200px-FAO_logo.svg.png'
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
