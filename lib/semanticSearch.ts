/**
 * BUSCADOR SEMÁNTICO
 * Sistema de búsqueda inteligente con similitud de conceptos
 * Usa Cosine Similarity para encontrar términos relacionados
 */

// ============================================================================
// DICCIONARIO DE SINÓNIMOS Y CONCEPTOS RELACIONADOS
// ============================================================================

export const AGRICULTURAL_THESAURUS: Record<string, string[]> = {
    // Agua y Riego
    'sequía': ['riego', 'agua', 'irrigación', 'sequía', 'hidráulico', 'embalse', 'pozo', 'tecnificación'],
    'riego': ['agua', 'irrigación', 'sequía', 'tecnificación', 'goteo', 'aspersión', 'hidráulico'],
    'agua': ['riego', 'irrigación', 'sequía', 'hidráulico', 'pozo', 'embalse', 'recursos hídricos'],

    // Producción Agrícola
    'agricultura': ['agrícola', 'cultivo', 'producción', 'siembra', 'cosecha', 'campo', 'predio'],
    'cultivo': ['siembra', 'producción', 'cosecha', 'plantación', 'agrícola', 'campo'],
    'producción': ['cultivo', 'cosecha', 'rendimiento', 'productividad', 'agrícola'],

    // Ganadería
    'ganadería': ['ganado', 'pecuario', 'bovino', 'ovino', 'caprino', 'praderas', 'forraje'],
    'ganado': ['ganadería', 'pecuario', 'bovino', 'ovino', 'caprino', 'animal'],

    // Tecnología e Innovación
    'innovación': ['tecnología', 'modernización', 'digitalización', 'automatización', 'I+D'],
    'tecnología': ['innovación', 'digitalización', 'automatización', 'modernización', 'maquinaria'],
    'digitalización': ['tecnología', 'innovación', 'automatización', 'digital', 'TIC'],

    // Sustentabilidad
    'sustentable': ['sostenible', 'ecológico', 'orgánico', 'ambiental', 'verde', 'limpio'],
    'orgánico': ['ecológico', 'sustentable', 'sostenible', 'natural', 'biológico'],
    'ambiental': ['sustentable', 'ecológico', 'medio ambiente', 'conservación'],

    // Financiamiento
    'crédito': ['préstamo', 'financiamiento', 'capital', 'recursos', 'fondo'],
    'subsidio': ['apoyo', 'ayuda', 'financiamiento', 'fondo', 'bonificación'],
    'financiamiento': ['crédito', 'préstamo', 'capital', 'recursos', 'fondo', 'subsidio'],

    // Tipos de Productores
    'pequeño': ['pequeño agricultor', 'agricultura familiar', 'campesino', 'minifundio'],
    'familiar': ['agricultura familiar', 'pequeño agricultor', 'campesino', 'AFC'],
    'mujer': ['mujeres rurales', 'agricultora', 'campesina', 'género'],
    'joven': ['jóvenes rurales', 'juventud', 'recambio generacional'],
    'indígena': ['pueblos originarios', 'comunidades indígenas', 'mapuche', 'aymara'],

    // Emergencias
    'emergencia': ['catástrofe', 'desastre', 'crisis', 'contingencia', 'urgencia'],
    'incendio': ['fuego', 'siniestro', 'catástrofe', 'emergencia'],

    // Comercialización
    'exportación': ['comercio exterior', 'internacional', 'mercado externo'],
    'mercado': ['comercialización', 'venta', 'comercio', 'distribución'],

    // Infraestructura
    'infraestructura': ['construcción', 'obras', 'instalaciones', 'equipamiento'],
    'maquinaria': ['equipo', 'implemento', 'tecnología', 'mecanización'],

    // Capacitación
    'capacitación': ['formación', 'entrenamiento', 'educación', 'asistencia técnica'],
    'asistencia': ['asesoría', 'apoyo técnico', 'capacitación', 'consultoría'],
};

// ============================================================================
// NORMALIZACIÓN DE TEXTO
// ============================================================================

/**
 * Normaliza texto para búsqueda
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^\w\s]/g, ' ') // Eliminar puntuación
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
}

/**
 * Tokeniza texto en palabras
 */
export function tokenize(text: string): string[] {
    return normalizeText(text)
        .split(' ')
        .filter(word => word.length > 2); // Filtrar palabras muy cortas
}

// ============================================================================
// EXPANSIÓN DE TÉRMINOS
// ============================================================================

/**
 * Expande un término de búsqueda con sinónimos y conceptos relacionados
 */
export function expandSearchTerms(query: string): string[] {
    const normalized = normalizeText(query);
    const tokens = tokenize(normalized);
    const expandedTerms = new Set<string>();

    // Agregar términos originales
    tokens.forEach(token => expandedTerms.add(token));

    // Agregar sinónimos y conceptos relacionados
    tokens.forEach(token => {
        // Buscar en el tesauro
        Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
            const normalizedKey = normalizeText(key);

            // Si el token coincide con la clave o está en los sinónimos
            if (token.includes(normalizedKey) || normalizedKey.includes(token)) {
                synonyms.forEach(syn => {
                    const normalizedSyn = normalizeText(syn);
                    expandedTerms.add(normalizedSyn);
                });
            }
        });
    });

    return Array.from(expandedTerms);
}

// ============================================================================
// COSINE SIMILARITY
// ============================================================================

/**
 * Calcula la frecuencia de términos (TF)
 */
function calculateTermFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();

    tokens.forEach(token => {
        tf.set(token, (tf.get(token) || 0) + 1);
    });

    return tf;
}

/**
 * Calcula el vector TF-IDF simplificado
 */
function createVector(tokens: string[], allTerms: Set<string>): number[] {
    const tf = calculateTermFrequency(tokens);
    const vector: number[] = [];

    allTerms.forEach(term => {
        vector.push(tf.get(term) || 0);
    });

    return vector;
}

/**
 * Calcula el producto punto de dos vectores
 */
function dotProduct(vec1: number[], vec2: number[]): number {
    return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
}

/**
 * Calcula la magnitud de un vector
 */
function magnitude(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Calcula la similitud coseno entre dos conjuntos de tokens
 */
export function cosineSimilarity(tokens1: string[], tokens2: string[]): number {
    // Crear conjunto de todos los términos únicos
    const allTerms = new Set<string>([...tokens1, ...tokens2]);

    if (allTerms.size === 0) return 0;

    // Crear vectores
    const vec1 = createVector(tokens1, allTerms);
    const vec2 = createVector(tokens2, allTerms);

    // Calcular similitud coseno
    const dot = dotProduct(vec1, vec2);
    const mag1 = magnitude(vec1);
    const mag2 = magnitude(vec2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dot / (mag1 * mag2);
}

// ============================================================================
// BÚSQUEDA SEMÁNTICA
// ============================================================================

export interface SemanticSearchResult<T> {
    item: T;
    score: number;
    matchedTerms: string[];
}

/**
 * Realiza búsqueda semántica en un conjunto de items
 */
export function semanticSearch<T>(
    query: string,
    items: T[],
    getSearchableText: (item: T) => string,
    threshold: number = 0.1
): SemanticSearchResult<T>[] {
    if (!query || query.trim() === '') {
        return items.map(item => ({
            item,
            score: 1,
            matchedTerms: []
        }));
    }

    // Expandir términos de búsqueda
    const expandedQuery = expandSearchTerms(query);
    const queryTokens = tokenize(expandedQuery.join(' '));

    // Calcular similitud para cada item
    const results: SemanticSearchResult<T>[] = items.map(item => {
        const searchableText = getSearchableText(item);
        const itemTokens = tokenize(searchableText);

        // Calcular similitud coseno
        const similarity = cosineSimilarity(queryTokens, itemTokens);

        // Encontrar términos que coinciden
        const matchedTerms = queryTokens.filter(qt =>
            itemTokens.some(it => it.includes(qt) || qt.includes(it))
        );

        return {
            item,
            score: similarity,
            matchedTerms
        };
    });

    // Filtrar por threshold y ordenar por score
    return results
        .filter(r => r.score >= threshold)
        .sort((a, b) => b.score - a.score);
}

// ============================================================================
// BÚSQUEDA HÍBRIDA (Exacta + Semántica)
// ============================================================================

/**
 * Combina búsqueda exacta con búsqueda semántica
 */
export function hybridSearch<T>(
    query: string,
    items: T[],
    getSearchableText: (item: T) => string,
    options: {
        exactWeight?: number;
        semanticWeight?: number;
        threshold?: number;
    } = {}
): SemanticSearchResult<T>[] {
    const {
        exactWeight = 0.6,
        semanticWeight = 0.4,
        threshold = 0.1
    } = options;

    const normalizedQuery = normalizeText(query);

    // Búsqueda semántica
    const semanticResults = semanticSearch(query, items, getSearchableText, 0);

    // Calcular score híbrido
    const hybridResults = semanticResults.map(result => {
        const searchableText = normalizeText(getSearchableText(result.item));

        // Score de coincidencia exacta
        const exactScore = searchableText.includes(normalizedQuery) ? 1 : 0;

        // Score combinado
        const combinedScore = (exactScore * exactWeight) + (result.score * semanticWeight);

        return {
            ...result,
            score: combinedScore
        };
    });

    // Filtrar y ordenar
    return hybridResults
        .filter(r => r.score >= threshold)
        .sort((a, b) => b.score - a.score);
}

// ============================================================================
// SUGERENCIAS DE BÚSQUEDA
// ============================================================================

/**
 * Genera sugerencias de búsqueda basadas en términos relacionados
 */
export function generateSearchSuggestions(query: string, maxSuggestions: number = 5): string[] {
    const normalized = normalizeText(query);
    const suggestions = new Set<string>();

    // Buscar en el tesauro
    Object.entries(AGRICULTURAL_THESAURUS).forEach(([key, synonyms]) => {
        const normalizedKey = normalizeText(key);

        if (normalizedKey.includes(normalized) || normalized.includes(normalizedKey)) {
            suggestions.add(key);
            synonyms.slice(0, 3).forEach(syn => suggestions.add(syn));
        }
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
}
