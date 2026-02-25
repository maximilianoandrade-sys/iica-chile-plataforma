/**
 * ============================================================================
 * MOTOR DE BÚSQUEDA IICA CHILE — v2.0
 * ============================================================================
 * Motor híbrido unificado que combina:
 *   1. Búsqueda exacta ponderada por campo (título > institución > eje > descripción...)
 *   2. Expansión de sinónimos agrícolas + lenguaje natural rural
 *   3. Tolerancia a errores de tipeo (Levenshtein)
 *   4. Cosine Similarity TF-IDF simplificada
 *   5. Índice invertido pre-computado para O(1) lookup
 *   6. Scoring contextual: viabilidad IICA + urgencia de cierre + complejidad
 * ============================================================================
 */

import { Project } from './data';

// ============================================================================
// TESAURO AGRÍCOLA UNIFICADO (sinónimos + conceptos relacionados)
// ============================================================================

export const AGRICULTURAL_THESAURUS: Record<string, string[]> = {
    // Agua y Riego
    'agua': ['riego', 'pozo', 'hidrico', 'hidraulico', 'tecnificacion', 'aspersion', 'goteo', 'drenaje', 'irrigacion', 'embalse', 'recursos hidricos'],
    'riego': ['agua', 'pozo', 'tecnificacion', 'aspersion', 'goteo', 'hidrico', 'cnr', 'irrigacion'],
    'sequia': ['seco', 'agua', 'riego', 'emergencia', 'hidrico', 'pozo', 'contingencia'],
    'pozo': ['agua', 'riego', 'hidrico', 'perforacion', 'profundizacion'],

    // Suelos
    'suelo': ['tierra', 'recuperacion', 'fertilizacion', 'enmienda', 'sirsd', 'degradado', 'erosion'],
    'degradado': ['suelo', 'recuperacion', 'sirsd', 'erosion', 'tierra'],

    // Maquinaria
    'maquinaria': ['mecanizacion', 'tractor', 'equipo', 'implemento', 'tecnologia', 'inversion', 'modernizacion'],
    'mecanizacion': ['maquinaria', 'tractor', 'equipo', 'implemento', 'modernizacion'],

    // Instituciones nacionales
    'indap': ['instituto desarrollo agropecuario', 'usuario indap', 'pequeno agricultor', 'agricultura familiar'],
    'cnr': ['comision nacional riego', 'riego', 'agua', 'ley 18450'],
    'corfo': ['corporacion fomento', 'innovacion', 'emprendimiento', 'pyme'],
    'fia': ['fundacion innovacion agraria', 'innovacion', 'investigacion', 'i+d'],
    'sercotec': ['servicio cooperacion tecnica', 'pyme', 'emprendimiento', 'micro'],
    'gore': ['gobierno regional', 'region', 'regional', 'fndr'],
    'minagri': ['ministerio agricultura', 'agricultura', 'sag', 'indap'],
    'conaf': ['corporacion nacional forestal', 'forestal', 'bosque', 'arboles'],
    'sag': ['servicio agricola ganadero', 'ganaderia', 'sanidad animal', 'fitosanitario'],
    'inia': ['instituto investigaciones agropecuarias', 'investigacion', 'semillas', 'variedades'],

    // Instituciones internacionales
    'fontagro': ['fondo regional tecnologia agropecuaria', 'innovacion', 'regional', 'alc'],
    'fao': ['naciones unidas', 'alimentacion', 'agricultura', 'seguridad alimentaria'],
    'fida': ['desarrollo agricola', 'rural', 'pobreza', 'campesino'],
    'bid': ['banco interamericano', 'financiamiento', 'desarrollo', 'prestamo'],
    'gcf': ['green climate fund', 'fondo verde clima', 'cambio climatico', 'climatico'],
    'iica': ['instituto interamericano', 'cooperacion', 'hemisferico', 'alc', 'agricola'],
    'aecid': ['espana', 'cooperacion espanola', 'desarrollo rural', 'ods'],
    'euroclima': ['union europea', 'biodiversidad', 'cambio climatico', 'resiliencia', 'alianza'],

    // Beneficiarios
    'mujer': ['mujeres', 'femenino', 'genero', 'rural', 'agricultora', 'campesina'],
    'joven': ['jovenes', 'juventud', 'recambio generacional', 'joven rural'],
    'indigena': ['pueblos originarios', 'mapuche', 'aymara', 'comunidad'],
    'pequeno': ['pequena', 'pyme', 'micro', 'indap', 'minifundio', 'afc'],
    'cooperativa': ['asociatividad', 'organizacion', 'comunidad', 'colectivo'],
    'asociatividad': ['cooperativa', 'organizacion', 'comunidad', 'colectivo'],

    // Temáticas
    'innovacion': ['tecnologia', 'i+d', 'investigacion', 'fia', 'corfo', 'digitalizacion'],
    'digitalizacion': ['tecnologia', 'innovacion', 'automatizacion', 'datos', 'software'],
    'exportacion': ['export', 'prochile', 'mercado internacional', 'comercio exterior'],
    'sustentable': ['sostenible', 'ambiental', 'ecologico', 'verde', 'organico', 'limpio'],
    'organico': ['agroecologico', 'sustentable', 'certificacion', 'ecologico'],
    'bioeconomia': ['sustentable', 'circular', 'verde', 'biodiversidad', 'ambiental'],
    'ganaderia': ['ganado', 'bovino', 'ovino', 'sag', 'pecuario', 'praderas', 'forraje'],
    'forestal': ['bosque', 'arbol', 'conaf', 'reforestacion', 'plantacion'],
    'emergencia': ['catastrofe', 'desastre', 'helada', 'sequia', 'incendio', 'contingencia'],
    'credito': ['prestamo', 'financiamiento', 'inversion', 'indap', 'capital'],
    'subsidio': ['apoyo', 'ayuda', 'financiamiento', 'fondo', 'bonificacion'],
    'capacitacion': ['formacion', 'asistencia tecnica', 'educacion', 'consultoria'],
    'sanidad': ['fitosanitario', 'inocuidad', 'veterinario', 'sag', 'plagas'],
    'inocuidad': ['seguridad alimentaria', 'sanidad', 'calidad', 'certificacion'],
    'cambio climatico': ['adaptacion', 'mitigacion', 'emisiones', 'gcf', 'clima', 'ndc'],
    'sur sur': ['cooperacion', 'transferencia', 'alc', 'hemisferico', 'iica'],
    'patagonia': ['aysen', 'magallanes', 'sur', 'regenerativo', 'ganaderia'],
};

// ============================================================================
// FRASES EN LENGUAJE NATURAL RURAL
// ============================================================================

export const NATURAL_LANGUAGE_PHRASES: Record<string, string[]> = {
    'seco el pozo': ['riego', 'pozo', 'hidrico', 'agua'],
    'se seco el pozo': ['riego', 'pozo', 'hidrico', 'agua'],
    'sin agua': ['riego', 'pozo', 'hidrico', 'agua', 'tecnificacion'],
    'falta agua': ['riego', 'pozo', 'hidrico', 'agua'],
    'no tengo agua': ['riego', 'pozo', 'hidrico', 'agua'],
    'tierra mala': ['suelo', 'recuperacion', 'sirsd', 'enmienda'],
    'suelo degradado': ['suelo', 'recuperacion', 'sirsd', 'enmienda'],
    'no tengo tractor': ['maquinaria', 'mecanizacion', 'equipo', 'implemento'],
    'necesito maquinaria': ['maquinaria', 'mecanizacion', 'equipo'],
    'quiero tecnificar': ['maquinaria', 'tecnificacion', 'innovacion'],
    'necesito plata': ['credito', 'financiamiento', 'capital', 'fondo'],
    'necesito dinero': ['credito', 'financiamiento', 'capital', 'fondo'],
    'quiero postular': ['fondo', 'subsidio', 'concursable', 'financiamiento'],
    'me quemo': ['emergencia', 'incendio', 'catastrofe'],
    'quiero exportar': ['exportacion', 'comercio exterior', 'internacional'],
    'vender afuera': ['exportacion', 'comercio exterior'],
    'soy mujer': ['mujer', 'genero', 'mujeres rurales'],
    'soy joven': ['joven', 'juventud', 'jovenes rurales'],
    'empezar a producir': ['joven', 'capital semilla', 'emprendimiento'],
    'proyecto internacional': ['internacional', 'fontagro', 'fida', 'bid', 'iica', 'fao'],
    'fondo europeo': ['euroclima', 'aecid', 'union europea', 'internacional'],
    'cooperacion iica': ['iica', 'hemisferico', 'sur sur', 'cooperacion'],
    'alta viabilidad': ['viabilidad alta', 'porcentaje alto', 'prioritario'],
    'facil de postular': ['complejidad facil', 'requisitos simples'],
};

// ============================================================================
// NORMALIZACIÓN
// ============================================================================

export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // quitar acentos
        .replace(/[^\w\s]/g, ' ')          // quitar puntuación
        .replace(/\s+/g, ' ')              // normalizar espacios
        .trim();
}

function tokenize(text: string): string[] {
    return normalizeText(text)
        .split(' ')
        .filter(w => w.length > 2);
}

// ============================================================================
// EXPANSIÓN DE TÉRMINOS
// ============================================================================

function expandNaturalLanguage(query: string): string[] {
    const normalized = normalizeText(query);
    const extra: string[] = [];
    Object.entries(NATURAL_LANGUAGE_PHRASES).forEach(([phrase, terms]) => {
        if (normalized.includes(normalizeText(phrase))) {
            extra.push(...terms);
        }
    });
    return extra;
}

export function expandSearchTerms(query: string): string[] {
    const normalized = normalizeText(query);
    const tokens = tokenize(normalized);
    const expanded = new Set<string>();

    tokens.forEach(t => expanded.add(t));

    // Frases naturales primero (mayor prioridad)
    expandNaturalLanguage(query).forEach(t => expanded.add(normalizeText(t)));

    // Sinónimos del tesauro
    tokens.forEach(token => {
        Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
            const nkey = normalizeText(key);
            if (token.includes(nkey) || nkey.includes(token) || token === nkey) {
                synonyms.forEach(s => expanded.add(normalizeText(s)));
                expanded.add(nkey);
            }
        });
    });

    return Array.from(expanded);
}

// ============================================================================
// DISTANCIA DE LEVENSHTEIN (tolerancia a typos)
// ============================================================================

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, (_, i) => [i]);
    for (let j = 0; j <= m; j++) dp[0][j] = j;
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            dp[i][j] = b[i - 1] === a[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
        }
    }
    return dp[n][m];
}

function isSimilar(w1: string, w2: string, threshold = 2): boolean {
    if (w1.length < 4 || w2.length < 4) return w1 === w2;
    const dist = levenshtein(w1, w2);
    return dist <= threshold || dist / Math.max(w1.length, w2.length) <= 0.22;
}

// ============================================================================
// CORPUS COMPLETO DE PROYECTO → texto indexable
// ============================================================================

/**
 * Genera el corpus de texto de un proyecto, ponderado por importancia de campo.
 * Devuelve un objeto con cada zona para control fino del scoring.
 */
export function buildProjectCorpus(p: Project): {
    titulo: string;
    institucion: string;
    ejeIICA: string;
    responsable: string;
    region: string;
    categoria: string;
    objetivo: string;
    descripcion: string;
    regiones: string;
    beneficiarios: string;
    requisitos: string;
    fortalezas: string;
    resumen: string;
    notasInternas: string;
    full: string;
} {
    const titulo = p.nombre || '';
    const institucion = p.institucion || '';
    const ejeIICA = p.ejeIICA || '';
    const responsable = p.responsableIICA || '';
    const region = p.region || '';
    const categoria = p.categoria || '';
    const objetivo = p.objetivo || '';
    const descripcion = p.descripcionIICA || '';
    const regiones = (p.regiones || []).join(' ');
    const beneficiarios = (p.beneficiarios || []).join(' ');
    const requisitos = [
        ...(p.requisitos || []),
        ...(p.resumen?.requisitos_clave || []),
    ].join(' ');
    const fortalezas = [
        ...(p.fortalezas || []),
        ...(p.debilidades || []),
    ].join(' ');
    const resumen = [
        p.resumen?.cofinanciamiento || '',
        p.resumen?.observaciones || '',
        p.resumen?.plazo_ejecucion || '',
    ].join(' ');
    const notasInternas = p.notasInternas || '';
    const rolIICA = p.rolIICA || '';

    const full = [
        titulo, institucion, ejeIICA, responsable, region, categoria,
        objetivo, descripcion, regiones, beneficiarios,
        requisitos, fortalezas, resumen, notasInternas,
        rolIICA,
        p.viabilidadIICA || '',
        p.complejidad || '',
        p.estadoPostulacion || '',
        p.ambito || '',
    ].join(' ');

    return {
        titulo, institucion, ejeIICA, responsable, region, categoria,
        objetivo, descripcion, regiones, beneficiarios,
        requisitos, fortalezas, resumen, notasInternas, full
    };
}

// ============================================================================
// BÚSQUEDA BÁSICA (boolean) — para filtrado inicial
// ============================================================================

export function smartSearch(searchTerm: string, project: Project): boolean;
export function smartSearch(searchTerm: string, targetText: string): boolean;
export function smartSearch(searchTerm: string, input: Project | string): boolean {
    if (!searchTerm.trim()) return true;

    const targetText = typeof input === 'string'
        ? input
        : buildProjectCorpus(input).full;

    const normalizedTarget = normalizeText(targetText);

    // ── Búsqueda por frase exacta con comillas: "FAO TCP" ──
    const phraseMatches = searchTerm.match(/"([^"]+)"/g);
    if (phraseMatches) {
        // Todas las frases entre comillas deben estar presentes
        for (const match of phraseMatches) {
            const phrase = normalizeText(match.replace(/"/g, ''));
            if (!normalizedTarget.includes(phrase)) return false;
        }
        // El resto del query (sin comillas) también debe coincidir
        const remainingQuery = searchTerm.replace(/"[^"]+"/g, '').trim();
        if (!remainingQuery) return true;
        return smartSearch(remainingQuery, targetText);
    }

    const expandedTerms = expandSearchTerms(searchTerm);
    const targetWords = normalizedTarget.split(/\s+/);

    // Cada palabra del query debe encontrarse en alguna forma
    const queryWords = searchTerm.trim().split(/\s+/);
    for (const word of queryWords) {
        const wordExpanded = expandSearchTerms(word);
        let found = false;

        for (const term of wordExpanded) {
            if (normalizedTarget.includes(term)) { found = true; break; }
        }

        if (!found) {
            // Tolerancia a typos
            for (const targetWord of targetWords) {
                for (const term of wordExpanded) {
                    if (isSimilar(term, targetWord)) { found = true; break; }
                }
                if (found) break;
            }
        }

        if (!found) return false;
    }
    // Suprimir warning de variable no usada
    void expandedTerms;
    return true;
}

// ============================================================================
// SCORING DE RELEVANCIA MULTI-CAMPO
// Pondera: título > institución > ejeIICA > objetivo > descripción > resto
// + bonus: viabilidad IICA + urgencia cierre + complejidad + estado abierto
// ============================================================================

const FIELD_WEIGHTS: Record<string, number> = {
    titulo: 50,
    institucion: 30,
    ejeIICA: 25,
    responsable: 20,
    objetivo: 18,
    descripcion: 15,
    region: 12,
    categoria: 12,
    regiones: 10,
    beneficiarios: 10,
    requisitos: 8,
    fortalezas: 6,
    resumen: 5,
    notasInternas: 4,
};

export function scoreProject(searchTerm: string, project: Project): number {
    if (!searchTerm.trim()) return 0;

    const corpus = buildProjectCorpus(project);
    const expandedTerms = expandSearchTerms(searchTerm);
    let score = 0;

    for (const term of expandedTerms) {
        for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
            const fieldText = normalizeText((corpus as Record<string, string>)[field] || '');
            if (!fieldText) continue;

            if (fieldText.includes(term)) {
                // Bonus adicional si está al inicio del título
                const bonus = (field === 'titulo' && fieldText.startsWith(term)) ? 15 : 0;
                score += weight + bonus;
            }
        }
    }

    // ── Bonus contextual IICA ──────────────────────────────────────────────

    // Viabilidad IICA (máx +20)
    const viabilidad = project.porcentajeViabilidad || 0;
    score += Math.round(viabilidad / 5); // 100% → +20, 50% → +10

    // Urgencia de cierre (máx +15)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closing = new Date(project.fecha_cierre);
    const diffDays = Math.ceil((closing.getTime() - today.getTime()) / 86_400_000);
    if (diffDays > 0 && diffDays <= 7) score += 15;  // cierra esta semana
    else if (diffDays > 0 && diffDays <= 30) score += 8;   // cierra este mes
    else if (diffDays > 0) score += 3;                      // abierto

    // Estado de postulación
    if (project.estadoPostulacion === 'Abierta') score += 5;

    // ── Rol IICA (boost/penalización según apropiación directa) ───────────
    if (project.rolIICA === 'Ejecutor') score += 15;
    else if (project.rolIICA === 'Implementador') score += 10;
    else if (project.rolIICA === 'Asesor') score += 3;
    else if (project.rolIICA === 'Indirecto') score -= 10; // penalizar rol indirecto

    // Complejidad (proyectos fáciles más accesibles para el equipo)
    if (project.complejidad === 'Fácil') score += 3;

    return score;
}

// ============================================================================
// COSINE SIMILARITY (para ranking semántico profundo)
// ============================================================================

function tfVector(tokens: string[], vocab: string[]): number[] {
    const freq = new Map<string, number>();
    tokens.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
    return vocab.map(v => freq.get(v) || 0);
}

function cosine(a: number[], b: number[]): number {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return magA && magB ? dot / (magA * magB) : 0;
}

// ============================================================================
// ÍNDICE INVERTIDO PRE-COMPUTADO
// Permite lookup O(1) por término en lugar de escanear todo el array
// ============================================================================

export interface InvertedIndex {
    index: Map<string, Set<number>>;   // term → set of project IDs
    projectMap: Map<number, Project>;  // id → project
}

export function buildInvertedIndex(projects: Project[]): InvertedIndex {
    const index = new Map<string, Set<number>>();
    const projectMap = new Map<number, Project>();

    projects.forEach(project => {
        projectMap.set(project.id, project);
        const corpus = buildProjectCorpus(project);
        const tokens = tokenize(corpus.full);
        const expanded = expandSearchTerms(corpus.full);

        [...tokens, ...expanded].forEach(term => {
            if (!index.has(term)) index.set(term, new Set());
            index.get(term)!.add(project.id);
        });
    });

    return { index, projectMap };
}

/**
 * Lookup rápido en índice invertido para un query
 * Returns IDs de proyectos candidatos
 */
export function lookupIndex(query: string, invertedIndex: InvertedIndex): Set<number> {
    const expanded = expandSearchTerms(query);
    const candidates = new Set<number>();

    expanded.forEach(term => {
        const hits = invertedIndex.index.get(term);
        if (hits) hits.forEach(id => candidates.add(id));

        // Búsqueda difusa en el índice
        invertedIndex.index.forEach((ids, indexedTerm) => {
            if (isSimilar(term, indexedTerm)) {
                ids.forEach(id => candidates.add(id));
            }
        });
    });

    return candidates;
}

// ============================================================================
// FUNCIÓN PRINCIPAL: Filtrar + Ordenar por relevancia
// ============================================================================

export function searchAndRankProjects(
    searchTerm: string,
    projects: Project[],
    invertedIndex?: InvertedIndex
): Project[] {
    if (!searchTerm.trim()) return projects;

    let candidates: Project[];

    if (invertedIndex) {
        // Ruta rápida: usar índice invertido
        const candidateIds = lookupIndex(searchTerm, invertedIndex);
        candidates = Array.from(candidateIds)
            .map(id => invertedIndex.projectMap.get(id)!)
            .filter(Boolean);
    } else {
        // Ruta de fallback: scan lineal
        candidates = projects.filter(p => smartSearch(searchTerm, p));
    }

    // Verificación final de relevancia boolean (descarta falsos positivos del índice)
    const verified = candidates.filter(p => smartSearch(searchTerm, p));

    // Cosine similarity para score semántico
    const queryTokens = tokenize(expandSearchTerms(searchTerm).join(' '));
    const vocab = Array.from(new Set([
        ...queryTokens,
        ...verified.flatMap(p => tokenize(buildProjectCorpus(p).full)),
    ]));
    const queryVec = tfVector(queryTokens, vocab);

    // Score combinado: campo-ponderado (70%) + cosine (30%)
    const scored = verified.map(p => {
        const fieldScore = scoreProject(searchTerm, p);
        const docTokens = tokenize(buildProjectCorpus(p).full);
        const docVec = tfVector(docTokens, vocab);
        const semScore = cosine(queryVec, docVec) * 100;
        return { project: p, total: fieldScore * 0.7 + semScore * 0.3 };
    });

    return scored
        .sort((a, b) => b.total - a.total)
        .map(s => s.project);
}

// ============================================================================
// SUGERENCIAS DINÁMICAS desde datos reales de proyectos
// ============================================================================

/**
 * Extrae sugerencias de autocompletado directamente del contenido real de proyectos.
 * Mucho más relevante que una lista hardcodeada.
 */
export function buildDynamicSuggestions(projects: Project[]): string[] {
    const suggestions = new Set<string>();

    projects.forEach(p => {
        // Títulos completos (muy útiles)
        if (p.nombre) suggestions.add(p.nombre);

        // Instituciones
        if (p.institucion) suggestions.add(p.institucion);

        // Ejes IICA (frases cortas muy descriptivas)
        if (p.ejeIICA) suggestions.add(p.ejeIICA);

        // Responsables IICA
        if (p.responsableIICA) suggestions.add(p.responsableIICA);

        // Objetivos (primeras 60 chars)
        if (p.objetivo) suggestions.add(p.objetivo.slice(0, 60) + (p.objetivo.length > 60 ? '...' : ''));

        // Requisitos clave (frases cortas)
        p.resumen?.requisitos_clave?.forEach(r => {
            if (r.length < 50) suggestions.add(r);
        });

        // Regiones
        p.regiones?.forEach(r => {
            if (r !== 'Todas') suggestions.add(r);
        });
    });

    // También agregar frases de lenguaje natural (IICA-específicas)
    const iicaPhrases = [
        'IICA Ejecutor directo',
        'Alta viabilidad IICA',
        'Sin cofinanciamiento requerido',
        'Fondo GEF acreditado',
        'Cooperación Sur-Sur ALC',
        'Extensión agrícola digital',
        'Resiliencia climática',
        'Agricultura familiar campesina',
        'Sistemas alimentarios sostenibles',
        'Trazabilidad sanidad vegetal',
        'Innovación agropecuaria regional',
        'Inclusión financiera andina',
        'Agroforestaría Patagonia',
        'Gestión hídrica zonas áridas',
    ];
    iicaPhrases.forEach(p => suggestions.add(p));

    return Array.from(suggestions).filter(s => s.length > 3);
}

/**
 * Cuando una búsqueda retorna 0 resultados, sugiere términos relacionados.
 * Implementa "¿Quisiste decir?"
 */
export function getZeroResultsSuggestions(
    query: string,
    projects: Project[],
    maxSuggestions = 5
): string[] {
    const normalizedQuery = normalizeText(query);
    const suggestions: Array<{ text: string; score: number }> = [];

    // Buscar términos del tesauro que sean similares a la query
    Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
        const nkey = normalizeText(key);
        const dist = levenshtein(normalizedQuery, nkey);
        if (dist <= 3 || nkey.includes(normalizedQuery.slice(0, 4))) {
            suggestions.push({ text: key, score: dist });
            synonyms.slice(0, 2).forEach(s => {
                suggestions.push({ text: s, score: dist + 1 });
            });
        }
    });

    // Buscar en los nombres reales de proyectos
    projects.forEach(p => {
        const words = normalizeText(p.nombre).split(' ').filter(w => w.length > 4);
        words.forEach(word => {
            const dist = levenshtein(normalizedQuery, word);
            if (dist <= 2) {
                suggestions.push({ text: p.nombre.split(' ').slice(0, 4).join(' '), score: dist });
            }
        });
        if (p.institucion) {
            const dist = levenshtein(normalizedQuery, normalizeText(p.institucion));
            if (dist <= 2) suggestions.push({ text: p.institucion, score: dist });
        }
    });

    return suggestions
        .sort((a, b) => a.score - b.score)
        .map(s => s.text)
        .filter((s, i, arr) => arr.indexOf(s) === i) // unique
        .slice(0, maxSuggestions);
}

/**
 * Orden inteligente por defecto cuando no hay búsqueda activa.
 * Prioridad: Abierta > Ejecutor/Implementador > Alta viabilidad > cierre próximo
 */
export function defaultSortProjects(projects: Project[]): Project[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ROL_PRIORITY: Record<string, number> = {
        'Ejecutor': 4,
        'Implementador': 3,
        'Asesor': 2,
        'Indirecto': 1,
    };

    return [...projects].sort((a, b) => {
        const aOpen = new Date(a.fecha_cierre).getTime() >= today.getTime();
        const bOpen = new Date(b.fecha_cierre).getTime() >= today.getTime();

        // 1. Abiertas primero
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;

        // 2. Rol IICA (Ejecutor > Implementador > Asesor > Indirecto)
        const aRol = ROL_PRIORITY[a.rolIICA || ''] || 0;
        const bRol = ROL_PRIORITY[b.rolIICA || ''] || 0;
        if (aRol !== bRol) return bRol - aRol;

        // 3. Viabilidad IICA (porcentaje)
        const aViab = a.porcentajeViabilidad || 0;
        const bViab = b.porcentajeViabilidad || 0;
        if (aViab !== bViab) return bViab - aViab;

        // 4. Cierre más próximo (urgencia)
        return new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime();
    });
}

// ============================================================================
// SUGERENCIAS DE BÚSQL (compatibilidad legacy)
// ============================================================================

export function generateSearchSuggestions(query: string, maxSuggestions = 6): string[] {
    const normalized = normalizeText(query);
    if (!normalized || normalized.length < 2) return [];

    const suggestions = new Set<string>();

    Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
        const nkey = normalizeText(key);
        if (nkey.startsWith(normalized) || nkey.includes(normalized)) {
            suggestions.add(key);
            synonyms.slice(0, 2).forEach(s => suggestions.add(s));
        }
    });

    Object.keys(NATURAL_LANGUAGE_PHRASES).forEach(phrase => {
        if (normalizeText(phrase).includes(normalized)) {
            suggestions.add(phrase);
        }
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
}

// ============================================================================
// RE-EXPORTS para compatibilidad con código existente
// ============================================================================

export { expandNaturalLanguage, tokenize, levenshtein };
