/**
 * liveFeed.ts — Datos en tiempo real de fondos.gob.cl
 * Fetch del HTML del portal oficial del Estado de Chile, filtrado por
 * categorías relevantes para el sector agropecuario/rural/ambiental.
 * ISR: revalida cada hora.
 */

import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('LiveFeed');

export interface LiveFund {
    nombre: string;
    institucion: string;
    fechaInicio: string;
    fechaCierre: string;
    monto: string;
    beneficiarios: string;
    url: string;
    ambito: 'Nacional' | 'Regional';
    diasRestantes: number;
    relevanciaIICA: 'Alta' | 'Media' | 'Baja';
}

// Palabras clave para filtrar fondos relevantes al IICA y sector agro
const IICA_KEYWORDS = [
    'agro', 'agrícol', 'agropecuar', 'agr', 'rural', 'riego', 'fomento',
    'silvo', 'ganad', 'pecuar', 'forestal', 'biodiversidad', 'ambiental',
    'ambiente', 'clima', 'climát', 'agua', 'aliment', 'alimentar',
    'campo', 'campesin', 'indígena', 'indigen', 'pesca', 'acuicul',
    'innovación agraria', 'innovacion agraria', 'desarrollo rural',
    'medio ambiente', 'recursos hídricos', 'energía renovable',
    'sustentab', 'sostenib', 'carbon', 'suelos', 'cooperativa',
    'inia', 'indap', 'corfo', 'fia', 'cnr', 'sag',
];

const HIGH_RELEVANCE_KEYWORDS = [
    'agríco', 'agropecuar', 'riego', 'rural', 'silvo', 'ganad',
    'indap', 'fia', 'cnr', 'sag', 'campesin',
];

function calcularDiasRestantes(fechaCierre: string): number {
    const parts = fechaCierre.split('-'); // DD-MM-YYYY
    if (parts.length !== 3) return 0;
    const fecha = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diff = fecha.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function detectarRelevancia(nombre: string, institucion: string): 'Alta' | 'Media' | 'Baja' {
    const texto = (nombre + ' ' + institucion).toLowerCase();

    for (const kw of HIGH_RELEVANCE_KEYWORDS) {
        if (texto.includes(kw.toLowerCase())) return 'Alta';
    }

    for (const kw of IICA_KEYWORDS) {
        if (texto.includes(kw.toLowerCase())) return 'Media';
    }

    return 'Baja';
}

function parseFondosHTML(html: string): LiveFund[] {
    const funds: LiveFund[] = [];

    // Extraer cada bloque de fondo del HTML de fondos.gob.cl
    // El patrón: cada fondo tiene institución, nombre, beneficiarios, fechas, montos y URL
    const blockRegex = /\[ABIERTO[\s\S]*?(?=\[ABIERTO|$)/g;
    const blocks = html.match(blockRegex) || [];

    for (const block of blocks) {
        try {
            // Extraer ámbito (Nacional/Regional)
            const ambitoMatch = block.match(/\[ABIERTO\s*\n\s*(Nacional|Regional)/);
            const ambito = (ambitoMatch?.[1] as 'Nacional' | 'Regional') || 'Nacional';

            // Extraer institución
            const instMatch = block.match(/(?:Nacional|Regional)\s*\n\s*\n\s*\n\s*([^\n]+)\n/);
            const institucion = instMatch?.[1]?.trim() || '';

            // Extraer nombre del fondo (después de la institución)
            const nombreMatch = block.match(/(?:Nacional|Regional)\s*\n\s*\n\s*\n\s*[^\n]+\n\s*([^\n]+)\n/);
            const nombre = nombreMatch?.[1]?.trim() || '';

            // Extraer beneficiarios
            const benefMatch = block.match(/Beneficiarios\/as:\s*\n\s*([^\n]+)/);
            const beneficiarios = benefMatch?.[1]?.trim() || '';

            // Extraer fechas (Inicio: DD-MM-YYYY |Fin: DD-MM-YYYY)
            const fechasMatch = block.match(/Inicio:\s*(\d{2}-\d{2}-\d{4})\s*\|Fin:\s*(\d{2}-\d{2}-\d{4})/);
            const fechaInicio = fechasMatch?.[1] || '';
            const fechaCierre = fechasMatch?.[2] || '';

            // Extraer monto
            const montoMatch = block.match(/Montos:\s*\n\s*([^\n]+)/);
            const monto = montoMatch?.[1]?.trim() || 'Consultar bases';

            // Extraer URL de detalle
            const urlMatch = block.match(/\(https:\/\/fondos\.gob\.cl\/ficha\/[^)]+\)/);
            const url = urlMatch?.[0]?.slice(1, -1) || 'https://fondos.gob.cl';

            if (!nombre || !fechaCierre) continue;

            const diasRestantes = calcularDiasRestantes(fechaCierre);
            if (diasRestantes < 0) continue; // Ya cerrado

            // Filtrar solo fondos relevantes al IICA
            const relevancia = detectarRelevancia(nombre, institucion);
            if (relevancia === 'Baja') continue; // Descartar irrelevantes

            funds.push({
                nombre,
                institucion,
                fechaInicio,
                fechaCierre,
                monto,
                beneficiarios,
                url,
                ambito,
                diasRestantes,
                relevanciaIICA: relevancia,
            });
        } catch {
            // Ignorar bloques malformados
        }
    }

    return funds.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

/**
 * Fuentes adicionales verificadas manualmente (siempre actualizadas).
 * Se combinan con el feed de fondos.gob.cl.
 */
// NOTA: Los feeds estáticos deben actualizarse periódicamente cuando expiran.
// Agregar nuevas convocatorias verificadas y eliminar las vencidas.
export function getVerifiedStaticFeeds(): LiveFund[] {
    const today = new Date();

    const feeds: LiveFund[] = [];

    // (Convocatorias FONTAGRO, FIA y CNR de abril 2026 eliminadas por vencimiento)

    return feeds;
}

/**
 * Función principal: fetch de fondos.gob.cl + feeds verificados.
 * Usa Next.js ISR con revalidación cada hora.
 */
export async function getLiveFeeds(): Promise<{
    feeds: LiveFund[];
    lastUpdated: string;
    source: 'live' | 'static';
}> {
    const staticFeeds = getVerifiedStaticFeeds();

    try {
        const res = await fetch('https://fondos.gob.cl', {
            next: { revalidate: 3600 }, // ISR Next.js: revalidar cada hora
            headers: {
                'Accept': 'text/html',
                'Accept-Language': 'es-CL,es;q=0.9',
                'User-Agent': 'Mozilla/5.0 (compatible; IICA-Chile-Platform/1.0)',
            },
        } as RequestInit);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();
        const liveFeeds = parseFondosHTML(html);

        // Combinar: verificados estáticos primero, luego live (sin duplicados por URL)
        const staticUrls = new Set(staticFeeds.map(f => f.url));
        const combined = [
            ...staticFeeds,
            ...liveFeeds.filter(f => !staticUrls.has(f.url)),
        ].sort((a, b) => a.diasRestantes - b.diasRestantes);

        return {
            feeds: combined,
            lastUpdated: new Date().toISOString(),
            source: 'live',
        };
    } catch (err) {
        logger.warn('fondos.gob.cl no disponible, usando datos estáticos', { error: err });
        return {
            feeds: staticFeeds,
            lastUpdated: new Date().toISOString(),
            source: 'static',
        };
    }
}
