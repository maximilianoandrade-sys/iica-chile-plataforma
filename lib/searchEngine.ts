/**
 * ============================================================================
 * MOTOR DE BÚSQUEDA IICA CHILE — v3.0
 * ============================================================================
 * Motor híbrido de alta precisión que combina:
 *   1. Búsqueda exacta ponderada por campo (título > institución > eje > descripción...)
 *   2. Bigramas para capturar frases de dos palabras ("cambio climático")
 *   3. Expansión de sinónimos agrícolas + lenguaje natural rural
 *   4. Tolerancia a errores de tipeo (Levenshtein calibrado)
 *   5. Cosine Similarity TF-IDF simplificada
 *   6. Índice invertido pre-computado para O(1) lookup
 *   7. Scoring contextual: viabilidad IICA + urgencia de cierre + complejidad
 *   8. Operadores booleanos: AND (default), OR (|), NOT (-)
 *   9. Filtro por campo específico: inst:FAO, rol:Ejecutor, region:Maule
 *  10. Protección contra falsos positivos: umbral mínimo de similitud
 * ============================================================================
 */

import { Project, daysUntilClose } from './data';

// ============================================================================
// TESAURO AGRÍCOLA UNIFICADO (sinónimos + conceptos relacionados)
// ============================================================================

export const AGRICULTURAL_THESAURUS: Record<string, string[]> = {
    // Agua y Riego
    'agua': ['riego', 'pozo', 'hidrico', 'hidraulico', 'tecnificacion', 'aspersion', 'goteo', 'drenaje', 'irrigacion', 'embalse', 'recursos hidricos', 'hidrica', 'hidricidad'],
    'riego': ['agua', 'pozo', 'tecnificacion', 'aspersion', 'goteo', 'hidrico', 'cnr', 'irrigacion', 'regantes'],
    'sequia': ['seco', 'agua', 'riego', 'emergencia', 'hidrico', 'pozo', 'contingencia', 'escasez'],
    'pozo': ['agua', 'riego', 'hidrico', 'perforacion', 'profundizacion'],
    'hidrico': ['agua', 'riego', 'hidricidad', 'recursos hidricos', 'gestion hidrica', 'gobernanza del agua'],

    // Suelos
    'suelo': ['tierra', 'recuperacion', 'fertilizacion', 'enmienda', 'sirsd', 'degradado', 'erosion', 'sustrato'],
    'degradado': ['suelo', 'recuperacion', 'sirsd', 'erosion', 'tierra'],

    // Maquinaria
    'maquinaria': ['mecanizacion', 'tractor', 'equipo', 'implemento', 'tecnologia', 'inversion', 'modernizacion', 'mecanizacion agricola'],
    'mecanizacion': ['maquinaria', 'tractor', 'equipo', 'implemento', 'modernizacion'],

    // Instituciones nacionales
    'indap': ['instituto desarrollo agropecuario', 'usuario indap', 'pequeno agricultor', 'agricultura familiar', 'prodesal', 'pdti', 'saf'],
    'cnr': ['comision nacional riego', 'riego', 'agua', 'ley 18450', 'concurso de riego'],
    'corfo': ['corporacion fomento', 'innovacion', 'emprendimiento', 'pyme', 'startups'],
    'fia': ['fundacion innovacion agraria', 'innovacion', 'investigacion', 'i+d', 'convocatoria fia'],
    'sercotec': ['servicio cooperacion tecnica', 'pyme', 'emprendimiento', 'micro', 'capital semilla'],
    'gore': ['gobierno regional', 'region', 'regional', 'fndr', 'fondo nacional desarrollo regional'],
    'minagri': ['ministerio agricultura', 'agricultura', 'sag', 'indap', 'odepa'],
    'conaf': ['corporacion nacional forestal', 'forestal', 'bosque', 'arboles', 'reforestacion'],
    'sag': ['servicio agricola ganadero', 'ganaderia', 'sanidad animal', 'fitosanitario', 'trazabilidad'],
    'inia': ['instituto investigaciones agropecuarias', 'investigacion', 'semillas', 'variedades', 'carillanca'],

    // Instituciones internacionales
    'fontagro': ['fondo regional tecnologia agropecuaria', 'innovacion', 'regional', 'alc', 'consorcio fontagro', 'iica bid'],
    'fao': ['naciones unidas', 'alimentacion', 'agricultura', 'seguridad alimentaria', 'tcp', 'programa cooperacion tecnica'],
    'fida': ['ifad', 'desarrollo agricola', 'rural', 'pobreza', 'campesino', 'prestamo fida', 'cosop'],
    'bid': ['banco interamericano', 'financiamiento', 'desarrollo', 'prestamo', 'atn', 'banco interamericano de desarrollo'],
    'gcf': ['green climate fund', 'fondo verde clima', 'cambio climatico', 'climatico', 'fondo verde para el clima'],
    'gef': ['global environment facility', 'fondo mundial ambiente', 'biodiversidad', 'climatico', 'implementacion gef'],
    'iica': ['instituto interamericano', 'cooperacion', 'hemisferico', 'alc', 'agricola', 'san jose'],
    'aecid': ['espana', 'cooperacion espanola', 'desarrollo rural', 'ods', 'espanol'],
    'euroclima': ['union europea', 'biodiversidad', 'cambio climatico', 'resiliencia', 'alianza', 'euroclima+', 'ue'],
    'ue': ['union europea', 'euroclima', 'europa', 'horizonte europa', 'life'],

    // Beneficiarios
    'mujer': ['mujeres', 'femenino', 'genero', 'rural', 'agricultora', 'campesina', 'empoderamiento', 'enfoque de genero'],
    'joven': ['jovenes', 'juventud', 'recambio generacional', 'joven rural', 'jovenes agricultores'],
    'indigena': ['pueblos originarios', 'mapuche', 'aymara', 'quechua', 'comunidad', 'interculturalidad'],
    'pequeno': ['pequena', 'pyme', 'micro', 'indap', 'minifundio', 'afc', 'agricultura familiar'],
    'cooperativa': ['asociatividad', 'organizacion', 'comunidad', 'colectivo', 'organizacion de productores'],
    'asociatividad': ['cooperativa', 'organizacion', 'comunidad', 'colectivo'],

    // Temáticas
    'innovacion': ['tecnologia', 'i+d', 'investigacion', 'fia', 'corfo', 'digitalizacion', 'transferencia tecnologica'],
    'digitalizacion': ['tecnologia', 'innovacion', 'automatizacion', 'datos', 'software', 'plataforma digital', 'trazabilidad'],
    'exportacion': ['export', 'prochile', 'mercado internacional', 'comercio exterior', 'agroexportacion'],
    'sustentable': ['sostenible', 'ambiental', 'ecologico', 'verde', 'organico', 'limpio', 'sostenibilidad'],
    'organico': ['agroecologico', 'sustentable', 'certificacion', 'ecologico', 'agroecologia'],
    'bioeconomia': ['sustentable', 'circular', 'verde', 'biodiversidad', 'ambiental', 'economia circular'],
    'ganaderia': ['ganado', 'bovino', 'ovino', 'sag', 'pecuario', 'praderas', 'forraje', 'leche', 'carne'],
    'forestal': ['bosque', 'arbol', 'conaf', 'reforestacion', 'plantacion', 'silvicola'],
    'silvoagropecuario': ['forestal', 'innovacion', 'fia', 'agroforesteria', 'agroforestal'],
    'agroforestal': ['silvoagropecuario', 'forestal', 'innovacion', 'bosque', 'resiliencia'],
    'emergencia': ['catastrofe', 'desastre', 'helada', 'sequia', 'incendio', 'contingencia'],
    'credito': ['prestamo', 'financiamiento', 'inversion', 'indap', 'capital', 'acceso a financiamiento'],
    'subsidio': ['apoyo', 'ayuda', 'financiamiento', 'fondo', 'bonificacion'],
    'capacitacion': ['formacion', 'asistencia tecnica', 'educacion', 'consultoria', 'extension rural'],
    'sanidad': ['fitosanitario', 'inocuidad', 'veterinario', 'sag', 'plagas', 'sanidad vegetal'],
    'inocuidad': ['seguridad alimentaria', 'sanidad', 'calidad', 'certificacion', 'inocuidad alimentaria'],
    'cambio climatico': ['adaptacion', 'mitigacion', 'emisiones', 'gcf', 'clima', 'ndc', 'paris', 'carbono'],
    'adaptacion': ['resiliencia', 'clima', 'vulnerabilidad', 'cambio climatico', 'medidas adaptacion'],
    'resiliencia': ['adaptacion', 'recuperacion', 'clima', 'cambio climatico', 'fortalecimiento'],
    'sur sur': ['cooperacion', 'transferencia', 'alc', 'hemisferico', 'iica', 'triangular'],
    'patagonia': ['aysen', 'magallanes', 'sur', 'regenerativo', 'ganaderia'],
    'extension': ['asistencia tecnica', 'capacitacion', 'transferencia', 'servicio extension'],
    'trazabilidad': ['sanidad', 'sag', 'inocuidad', 'certificacion', 'sistema trazabilidad'],
    'inclusio': ['genero', 'mujer', 'indigena', 'social', 'joven', 'equidad'],
    'seguridad alimentaria': ['fao', 'hambre', 'produccion', 'inocuidad', 'acceso alimentos'],
    'cop': ['cambio climatico', 'clima', 'emisiiones', 'ods'],
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
    'sin cofinancia': ['sin cofinanciamiento', 'sin aporte', 'no requiere cofinanciamiento'],
    'iica ejecutor': ['ejecutor', 'rol ejecutor', 'iica postula directamente'],
    'zona arida': ['sequia', 'agua', 'coquimbo', 'atacama', 'arica', 'norte'],
    'agricultura familiar': ['afc', 'indap', 'pequeno agricultor', 'campesino'],
    'clima inteligente': ['cambio climatico', 'adaptacion', 'clima', 'resiliencia'],
    'recursos hidricos': ['agua', 'riego', 'hidrico', 'gestion hidrica'],
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

/**
 * Genera bigramas a partir de una lista de tokens.
 * Ejemplo: ['cambio', 'climatico', 'zona'] → ['cambio climatico', 'climatico zona']
 */
function bigrams(tokens: string[]): string[] {
    const result: string[] = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        result.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
    return result;
}

// ============================================================================
// EXPANSIÓN DE TÉRMINOS (con bigramas)
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

const searchTermsCache = new Map<string, string[]>();

export function expandSearchTerms(query: string): string[] {
    if (searchTermsCache.has(query)) return searchTermsCache.get(query)!;

    const normalized = normalizeText(query);
    const tokens = tokenize(normalized);
    const expanded = new Set<string>();

    // Tokens originales
    tokens.forEach(t => expanded.add(t));

    // Bigramas del query
    bigrams(tokens).forEach(b => expanded.add(b));

    // Frases naturales primero (mayor prioridad)
    expandNaturalLanguage(query).forEach(t => expanded.add(normalizeText(t)));

    // Sinónimos del tesauro (1 nivel de expansión)
    tokens.forEach(token => {
        Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
            const nkey = normalizeText(key);
            if (token === nkey || token.startsWith(nkey) || nkey.startsWith(token)) {
                synonyms.forEach(s => expanded.add(normalizeText(s)));
                expanded.add(nkey);
            }
        });
    });

    // También buscar bigramas en el tesauro
    bigrams(tokens).forEach(bigram => {
        const nbigram = normalizeText(bigram);
        if (AGRICULTURAL_THESAURUS[nbigram]) {
            AGRICULTURAL_THESAURUS[nbigram].forEach(s => expanded.add(normalizeText(s)));
        }
    });

    const result = Array.from(expanded);
    if (searchTermsCache.size > 500) searchTermsCache.clear();
    searchTermsCache.set(query, result);
    return result;
}

// ============================================================================
// DISTANCIA DE LEVENSHTEIN (tolerancia a typos — calibrada para precisión)
// ============================================================================

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 3) return Math.max(m, n); 
    
    // Algoritmo optimizado usando sólo dos arrays unidimensionales (menor GC y memoria O(N))
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    let curr = new Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            curr[j] = a[i - 1] === b[j - 1]
                ? prev[j - 1]
                : 1 + Math.min(prev[j - 1], curr[j - 1], prev[j]);
        }
        [prev, curr] = [curr, prev];
    }
    return prev[n];
}

/**
 * Tolerancia a typos calibrada:
 * - Palabras < 4 chars: solo exacto
 * - Palabras 4-6 chars: max 1 error
 * - Palabras > 6 chars: max 2 errores o 18% de la longitud
 */
function isSimilar(w1: string, w2: string): boolean {
    if (w1 === w2) return true;
    const l1 = w1.length, l2 = w2.length;
    const minLen = Math.min(l1, l2);
    const maxLen = Math.max(l1, l2);
    
    if (minLen < 4) return false; 
    if (maxLen - minLen > 2) return false; // Early exit: si las longitudes difieren mucho, Levenshtein fallará

    const dist = levenshtein(w1, w2);
    if (minLen <= 6) return dist <= 1;
    return dist <= 2 && dist / maxLen <= 0.18;
}

// ============================================================================
// PARSER DE OPERADORES BOOLEANOS Y FILTROS POR CAMPO
// ============================================================================

interface ParsedQuery {
    required: string[];   // términos AND (todos deben estar presentes)
    optional: string[];   // términos OR (al menos uno)
    forbidden: string[];  // términos NOT (ninguno debe estar)
    fieldFilters: Record<string, string>; // inst:FAO, rol:Ejecutor, etc.
    rawRequired: string[]; // raw sin expandir (para scoring exacto)
}

const FIELD_ALIASES: Record<string, string> = {
    'inst': 'institucion',
    'institución': 'institucion',
    'institucion': 'institucion',
    'rol': 'rolIICA',
    'region': 'region',
    'región': 'region',
    'eje': 'ejeIICA',
    'resp': 'responsableIICA',
    'ambito': 'ambito',
    'ámbito': 'ambito',
    'estado': 'estadoPostulacion',
    'via': 'viabilidadIICA',
    'viabilidad': 'viabilidadIICA',
};

const parsedQueryCache = new Map<string, ParsedQuery>();

export function parseQuery(rawQuery: string): ParsedQuery {
    if (parsedQueryCache.has(rawQuery)) return parsedQueryCache.get(rawQuery)!;

    const result: ParsedQuery = {
        required: [],
        optional: [],
        forbidden: [],
        fieldFilters: {},
        rawRequired: [],
    };

    // Extraer filtros por campo: inst:FAO, rol:Ejecutor
    const fieldRegex = /(\w+):(\S+)/g;
    let cleanQuery = rawQuery;
    let match;
    while ((match = fieldRegex.exec(rawQuery)) !== null) {
        const alias = match[1].toLowerCase();
        const field = FIELD_ALIASES[alias];
        if (field) {
            result.fieldFilters[field] = match[2];
            cleanQuery = cleanQuery.replace(match[0], '').trim();
        }
    }

    // Extraer frases exactas entre comillas
    const phrases: string[] = [];
    const phraseRegex = /"([^"]+)"/g;
    cleanQuery = cleanQuery.replace(phraseRegex, (_, phrase) => {
        phrases.push(normalizeText(phrase));
        return '';
    }).trim();

    // Tokenizar por espacios y detectar OR (|) y NOT (-)
    const parts = cleanQuery.split(/\s+/).filter(Boolean);
    let nextIsOr = false;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === '|' || part.toLowerCase() === 'or') {
            nextIsOr = true;
            continue;
        }
        if (part.startsWith('-') && part.length > 1) {
            result.forbidden.push(...expandSearchTerms(part.slice(1)));
            continue;
        }
        const expanded = expandSearchTerms(part);
        if (nextIsOr) {
            result.optional.push(...expanded);
            nextIsOr = false;
        } else {
            result.required.push(...expanded);
            result.rawRequired.push(normalizeText(part));
        }
    }

    // Las frases exactas siempre son required
    phrases.forEach(p => {
        result.required.push(p);
        result.rawRequired.push(p);
    });

    if (parsedQueryCache.size > 500) parsedQueryCache.clear();
    parsedQueryCache.set(rawQuery, result);
    return result;
}

// ============================================================================
// CORPUS COMPLETO DE PROYECTO → texto indexable
// ============================================================================

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
        // Añadimos bigramas del título para mejorar coincidencias de frases
        bigrams(tokenize(titulo)).join(' '),
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

/**
 * Comprueba si un término coincide con el target (exacto, expansión o Levenshtein)
 */
function termMatchesTarget(term: string, normalizedTarget: string, targetWords: string[]): boolean {
    // Coincidencia exacta de subcadena (más fiable que por palabras)
    if (normalizedTarget.includes(term)) return true;
    // Coincidencia parcial por palabra
    if (term.length > 3 && targetWords.some(tw => tw.startsWith(term) || term.startsWith(tw))) return true;
    // Tolerancia a typos (solo para términos de longitud razonable)
    if (term.length >= 4) {
        return targetWords.some(tw => isSimilar(term, tw));
    }
    return false;
}

export function smartSearch(searchTerm: string, project: Project): boolean;
export function smartSearch(searchTerm: string, targetText: string): boolean;
export function smartSearch(searchTerm: string, input: Project | string): boolean {
    if (!searchTerm.trim()) return true;

    const targetText = typeof input === 'string'
        ? input
        : buildProjectCorpus(input).full;

    const normalizedTarget = normalizeText(targetText);
    const targetWords = normalizedTarget.split(/\s+/).filter(w => w.length > 1);

    const parsed = parseQuery(searchTerm);

    // ── Verificar filtros por campo específico ────────────────────────────
    if (Object.keys(parsed.fieldFilters).length > 0 && typeof input !== 'string') {
        const project = input as Project;
        for (const [field, value] of Object.entries(parsed.fieldFilters)) {
            const projValue = normalizeText(String((project as unknown as Record<string, unknown>)[field] || ''));
            if (!projValue.includes(normalizeText(value))) return false;
        }
    }

    // ── Verificar términos NOT (ninguno debe estar) ───────────────────────
    for (const forbiddenTerm of parsed.forbidden) {
        if (normalizedTarget.includes(forbiddenTerm)) return false;
    }

    // ── Verificar términos OR (al menos uno debe estar) ───────────────────
    if (parsed.optional.length > 0) {
        const hasOptional = parsed.optional.some(t => termMatchesTarget(t, normalizedTarget, targetWords));
        if (!hasOptional) return false;
    }

    // ── Verificar términos AND (todos deben estar) ────────────────────────
    // Agrupar por token original del usuario para evaluarlos en conjunto
    if (parsed.rawRequired.length === 0 && parsed.required.length === 0) return true;

    // Estrategia: cada "palabra original" del query debe encontrarse,
    // usando sus expansiones como alternativas.
    const queryWords = searchTerm
        .replace(/"[^"]+"/g, '')
        .replace(/\w+:\S+/g, '')
        .trim()
        .split(/\s+/)
        .filter(w => w && !w.startsWith('-') && w !== '|' && w.toLowerCase() !== 'or');

    for (const word of queryWords) {
        if (word.startsWith('-')) continue;
        const wordExpanded = expandSearchTerms(word);
        const found = wordExpanded.some(term => termMatchesTarget(term, normalizedTarget, targetWords));
        if (!found) return false;
    }

    return true;
}

// ============================================================================
// SCORING DE RELEVANCIA MULTI-CAMPO
// ============================================================================

const FIELD_WEIGHTS: Record<string, number> = {
    titulo: 60,       // boost mayor para título
    institucion: 40,
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

export function scoreProject(searchTerm: string, project: Project, prebuiltCorpus?: ReturnType<typeof buildProjectCorpus>): number {
    if (!searchTerm.trim()) return 0;

    const corpus = prebuiltCorpus || buildProjectCorpus(project);
    const expandedTerms = expandSearchTerms(searchTerm);
    let score = 0;

    for (const term of expandedTerms) {
        for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
            const fieldText = normalizeText((corpus as Record<string, string>)[field] || '');
            if (!fieldText) continue;

            if (fieldText.includes(term)) {
                // Bonus si está al inicio del título
                const positionBonus = (field === 'titulo' && fieldText.indexOf(term) < 20) ? 20 : 0;
                // Bonus por exactitud del token (query original vs expansión)
                const queryTokens = tokenize(normalizeText(searchTerm));
                const exactBonus = queryTokens.includes(term) ? 5 : 0;
                score += weight + positionBonus + exactBonus;
            }
        }
    }

    // ── Bonus contextual IICA ──────────────────────────────────────────────

    // Viabilidad IICA (máx +25)
    const viabilidad = project.porcentajeViabilidad || 0;
    score += Math.round(viabilidad / 4); // 100% → +25, 50% → +12.5

    // Urgencia de cierre (máx +20)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const closing = new Date(project.fecha_cierre);
    const diffDays = Math.ceil((closing.getTime() - today.getTime()) / 86_400_000);
    if (diffDays > 0 && diffDays <= 3)  score += 20; // ¡urgente!
    else if (diffDays > 0 && diffDays <= 7)  score += 15; // cierra esta semana
    else if (diffDays > 0 && diffDays <= 30) score += 8;  // cierra este mes
    else if (diffDays > 0) score += 3;                    // abierto
    else score -= 20;                                     // penalizar cerrados

    // Estado de postulación
    if (project.estadoPostulacion === 'Abierta') score += 8;
    else if (project.estadoPostulacion === 'Próxima') score += 3;
    else if (project.estadoPostulacion === 'Cerrada') score -= 15;

    // ── Rol IICA (boost/penalización según apropiación directa) ───────────
    if (project.rolIICA === 'Ejecutor')     score += 20;
    else if (project.rolIICA === 'Implementador') score += 12;
    else if (project.rolIICA === 'Asesor')  score += 4;
    else if (project.rolIICA === 'Indirecto') score -= 12;

    // Complejidad (fácil = más accesible)
    if (project.complejidad === 'Fácil') score += 4;

    return score;
}

// ============================================================================
// COSINE SIMILARITY (para ranking semántico profundo)
// ============================================================================

function tfVectorSparse(tokens: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    for (const t of tokens) {
        freq.set(t, (freq.get(t) || 0) + 1);
    }
    return freq;
}

function cosineSparse(a: Map<string, number>, b: Map<string, number>): number {
    let dot = 0;
    let magA = 0;
    
    Array.from(a.entries()).forEach(([key, valA]) => {
        const valB = b.get(key);
        if (valB) dot += valA * valB;
        magA += valA * valA;
    });
    
    let magB = 0;
    Array.from(b.values()).forEach(valB => {
        magB += valB * valB;
    });
    
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

// ============================================================================
// ÍNDICE INVERTIDO PRE-COMPUTADO
// ============================================================================

export interface InvertedIndex {
    index: Map<string, Set<number>>;   // term → set of project IDs
    projectMap: Map<number, Project>;  // id → project
    bigramIndex: Map<string, Set<number>>; // bigram → set of project IDs
}

export function buildInvertedIndex(projects: Project[]): InvertedIndex {
    const index = new Map<string, Set<number>>();
    const bigramIndex = new Map<string, Set<number>>();
    const projectMap = new Map<number, Project>();

    projects.forEach(project => {
        projectMap.set(project.id, project);
        const corpus = buildProjectCorpus(project);
        const tokens = tokenize(corpus.full);
        const expanded = expandSearchTerms(corpus.full);
        const bgrams = bigrams(tokens);

        [...tokens, ...expanded].forEach(term => {
            if (!index.has(term)) index.set(term, new Set());
            index.get(term)!.add(project.id);
        });

        bgrams.forEach(bigram => {
            if (!bigramIndex.has(bigram)) bigramIndex.set(bigram, new Set());
            bigramIndex.get(bigram)!.add(project.id);
        });
    });

    return { index, projectMap, bigramIndex };
}

export function lookupIndex(query: string, invertedIndex: InvertedIndex): Set<number> {
    const expanded = expandSearchTerms(query);
    const candidates = new Set<number>();

    expanded.forEach(term => {
        // Lookup exacto
        const hits = invertedIndex.index.get(term);
        if (hits) hits.forEach(id => candidates.add(id));

        // Lookup en bigramas
        const bigramHits = invertedIndex.bigramIndex.get(term);
        if (bigramHits) bigramHits.forEach(id => candidates.add(id));

        // Búsqueda difusa (solo si el exacto no tuvo hits)
        if (!hits && term.length >= 4) {
            invertedIndex.index.forEach((ids, indexedTerm) => {
                if (isSimilar(term, indexedTerm)) {
                    ids.forEach(id => candidates.add(id));
                }
            });
        }
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

    let verified: Project[];

    if (invertedIndex) {
        const candidateIds = lookupIndex(searchTerm, invertedIndex);
        const candidates = Array.from(candidateIds)
            .map(id => invertedIndex.projectMap.get(id)!)
            .filter(Boolean);
        // Verificación final boolean (descarta falsos positivos del índice)
        verified = candidates.filter(p => smartSearch(searchTerm, p));
    } else {
        verified = projects.filter(p => smartSearch(searchTerm, p));
    }

    if (verified.length === 0) return [];

    // Pre-calcular el corpus para evitar repetidas construcciones de strings largos y maps de array
    const corpusMap = new Map<number, ReturnType<typeof buildProjectCorpus>>();
    verified.forEach(p => corpusMap.set(p.id, buildProjectCorpus(p)));

    // Cosine similarity semántico (ahora usa vectores dispersos de alta eficiencia en memoria O(Tokens))
    const queryTokens = tokenize(expandSearchTerms(searchTerm).join(' '));
    const queryVec = tfVectorSparse(queryTokens);

    // Score combinado: campo-ponderado (70%) + cosine (30%)
    const scored = verified.map(p => {
        const corpus = corpusMap.get(p.id)!;
        const fieldScore = scoreProject(searchTerm, p, corpus);
        const docTokens = tokenize(corpus.full);
        const docVec = tfVectorSparse(docTokens);
        const semScore = cosineSparse(queryVec, docVec) * 100;
        return { project: p, total: fieldScore * 0.7 + semScore * 0.3 };
    });

    return scored
        .sort((a, b) => b.total - a.total)
        .map(s => s.project);
}

// ============================================================================
// SUGERENCIAS DINÁMICAS desde datos reales de proyectos
// ============================================================================

export function buildDynamicSuggestions(projects: Project[]): string[] {
    const suggestions = new Set<string>();

    // Instituciones (muy útiles para búsqueda directa)
    const institutions = new Set<string>();
    projects.forEach(p => {
        if (p.institucion) institutions.add(p.institucion);
    });
    institutions.forEach(inst => suggestions.add(inst));

    // Ejes IICA (frases cortas muy descriptivas)
    const ejes = new Set<string>();
    projects.forEach(p => { if (p.ejeIICA) ejes.add(p.ejeIICA); });
    ejes.forEach(eje => suggestions.add(eje));

    // Responsables IICA
    const responsables = new Set<string>();
    projects.forEach(p => { if (p.responsableIICA) responsables.add(p.responsableIICA); });
    responsables.forEach(r => suggestions.add(r));

    // Regiones únicas (no "Todas")
    const regiones = new Set<string>();
    projects.forEach(p => {
        p.regiones?.forEach(r => { if (r !== 'Todas') regiones.add(r); });
    });
    regiones.forEach(r => suggestions.add(r));

    // Títulos cortos (≤ 60 chars)
    projects.forEach(p => {
        if (p.nombre && p.nombre.length <= 60) suggestions.add(p.nombre);
        else if (p.nombre) suggestions.add(p.nombre.split('–')[0].trim());
    });

    // Frases IICA-específicas (curadas, útiles)
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
        'Gestión hídrica zonas áridas',
        'Agroforestería Chile Central',
        'Financiamiento climático GCF',
        'Inclusión financiera andina',
        'rol:Ejecutor',
        'rol:Implementador',
        'inst:FONTAGRO',
        'inst:FAO',
        'inst:BID',
        'inst:GEF',
    ];
    iicaPhrases.forEach(p => suggestions.add(p));

    return Array.from(suggestions).filter(s => s.length > 2 && s.length < 80);
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
    const queryTokens = tokenize(normalizedQuery);
    const suggestions: Array<{ text: string; score: number }> = [];

    // Buscar términos del tesauro similares
    Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
        const nkey = normalizeText(key);
        const dist = queryTokens.length === 1
            ? levenshtein(normalizedQuery, nkey)
            : Math.min(...queryTokens.map(t => levenshtein(t, nkey)));
        if (dist <= 3 || nkey.includes(normalizedQuery.slice(0, 5))) {
            suggestions.push({ text: key, score: dist });
            synonyms.slice(0, 2).forEach(s => {
                suggestions.push({ text: s, score: dist + 1 });
            });
        }
    });

    // Buscar instituciones que se parezcan
    const uniqueInsts = Array.from(new Set(projects.map(p => p.institucion)));
    uniqueInsts.forEach(inst => {
        const nInst = normalizeText(inst);
        const dist = levenshtein(normalizedQuery, nInst);
        if (dist <= 2) suggestions.push({ text: inst, score: dist });
    });

    // Palabras clave de proyectos reales
    projects.forEach(p => {
        const words = normalizeText(p.nombre).split(' ').filter(w => w.length > 4);
        words.forEach(word => {
            const dist = levenshtein(normalizedQuery.split(' ')[0] || normalizedQuery, word);
            if (dist <= 2) {
                suggestions.push({ text: p.nombre.split('–')[0].trim(), score: dist });
            }
        });
    });

    return suggestions
        .sort((a, b) => a.score - b.score)
        .map(s => s.text)
        .filter((s, i, arr) => arr.indexOf(s) === i)
        .slice(0, maxSuggestions);
}

/**
 * Orden inteligente por defecto cuando no hay búsqueda activa.
 * Usa un urgencyScore compuesto:
 *   40% urgencia temporal + 35% viabilidad IICA + 25% rol IICA
 * Proyectos cerrados siempre al final.
 */
export function defaultSortProjects(projects: Project[]): Project[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ROL_MULT: Record<string, number> = {
        'Ejecutor': 1.0, 'Implementador': 0.85, 'Asesor': 0.65, 'Indirecto': 0.4,
    };
    const VIA_MULT: Record<string, number> = {
        'Alta': 1.0, 'Media': 0.7, 'Baja': 0.4,
    };

    const getScore = (p: Project): number => {
        const days = daysUntilClose(p);
        if (days <= 0) return 0;
        const urgency = Math.max(0, 100 - (days / 120) * 100);
        const viab = p.porcentajeViabilidad ?? 50;
        const rolMult = ROL_MULT[p.rolIICA ?? ''] ?? 0.5;
        const viaMult = VIA_MULT[p.viabilidadIICA ?? ''] ?? 0.5;
        return Math.round((urgency * 0.40) + (viab * 0.35) + (rolMult * viaMult * 100 * 0.25));
    };

    return [...projects].sort((a, b) => {
        const aOpen = new Date(a.fecha_cierre).getTime() >= today.getTime();
        const bOpen = new Date(b.fecha_cierre).getTime() >= today.getTime();
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
        const diff = getScore(b) - getScore(a);
        if (diff !== 0) return diff;
        return new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime();
    });
}

// ============================================================================
// SUGERENCIAS DE BÚSQUEDA (compatibilidad legacy)
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

export { expandNaturalLanguage, tokenize, levenshtein, bigrams };
