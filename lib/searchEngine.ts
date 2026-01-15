/**
 * Motor de Búsqueda Inteligente con Sinónimos y Tolerancia a Errores
 * Soluciona el problema de "búsqueda literal" mencionado en la crítica
 */

// Diccionario de sinónimos para el contexto agrícola chileno
const SYNONYMS_MAP: Record<string, string[]> = {
    // Agua y Riego
    'agua': ['riego', 'pozo', 'hídrico', 'hidráulico', 'tecnificación', 'aspersión', 'goteo'],
    'riego': ['agua', 'pozo', 'tecnificación', 'aspersión', 'goteo', 'hídrico'],
    'pozo': ['agua', 'riego', 'hídrico', 'perforación'],

    // Maquinaria y Mecanización
    'maquinaria': ['mecanización', 'tractor', 'equipo', 'implemento', 'tecnología'],
    'mecanización': ['maquinaria', 'tractor', 'equipo', 'implemento'],
    'tractor': ['maquinaria', 'mecanización', 'equipo'],

    // Suelos
    'suelo': ['tierra', 'recuperación', 'fertilización', 'enmienda'],
    'tierra': ['suelo', 'predio', 'terreno'],

    // Instituciones (con variaciones comunes)
    'indap': ['instituto desarrollo agropecuario', 'instituto de desarrollo'],
    'cnr': ['comisión nacional riego', 'comision nacional de riego'],
    'corfo': ['corporación fomento', 'corporacion de fomento'],
    'fia': ['fundación innovación agraria', 'fundacion para la innovacion'],

    // Beneficiarios
    'mujer': ['mujeres', 'femenino', 'género', 'genero'],
    'joven': ['jóvenes', 'juventud', 'jóven'],
    'indígena': ['indigena', 'pueblos originarios', 'mapuche'],
    'pequeño': ['pequeña', 'pyme', 'micro'],

    // Categorías
    'innovación': ['innovacion', 'tecnología', 'tecnologia', 'i+d'],
    'inversión': ['inversion', 'capital', 'financiamiento'],
    'crédito': ['credito', 'préstamo', 'prestamo', 'financiamiento'],
    'internacional': ['global', 'exterior', 'extranjero', 'cooperación', 'cooperacion'],
};

/**
 * Normaliza un texto para búsqueda (sin acentos, minúsculas)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
        .trim();
}

/**
 * Expande un término de búsqueda con sus sinónimos
 */
function expandWithSynonyms(term: string): string[] {
    const normalized = normalizeText(term);
    const synonyms = SYNONYMS_MAP[normalized] || [];
    return [normalized, ...synonyms.map(s => normalizeText(s))];
}

/**
 * Calcula la distancia de Levenshtein (para tolerancia a errores de tipeo)
 * Permite detectar palabras similares con 1-2 caracteres de diferencia
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Verifica si dos palabras son similares (tolerancia a errores de tipeo)
 */
function isSimilar(word1: string, word2: string, threshold: number = 2): boolean {
    if (word1.length < 4 || word2.length < 4) {
        return word1 === word2; // Palabras cortas deben coincidir exactamente
    }

    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);

    // Permite hasta 2 caracteres de diferencia o 20% de diferencia
    return distance <= threshold || (distance / maxLength) <= 0.2;
}

/**
 * Función principal de búsqueda inteligente
 * Retorna true si el texto contiene el término de búsqueda (con sinónimos y tolerancia)
 */
export function smartSearch(searchTerm: string, targetText: string): boolean {
    if (!searchTerm.trim()) return true;

    const normalizedTarget = normalizeText(targetText);
    const searchWords = searchTerm.trim().split(/\s+/);

    // Para cada palabra de búsqueda
    for (const word of searchWords) {
        const expandedTerms = expandWithSynonyms(word);
        let foundMatch = false;

        // Buscar coincidencia exacta o con sinónimos
        for (const term of expandedTerms) {
            if (normalizedTarget.includes(term)) {
                foundMatch = true;
                break;
            }
        }

        // Si no hay coincidencia exacta, buscar con tolerancia a errores
        if (!foundMatch) {
            const targetWords = normalizedTarget.split(/\s+/);
            for (const targetWord of targetWords) {
                for (const term of expandedTerms) {
                    if (isSimilar(term, targetWord)) {
                        foundMatch = true;
                        break;
                    }
                }
                if (foundMatch) break;
            }
        }

        // Si alguna palabra no coincide, el resultado es negativo
        if (!foundMatch) return false;
    }

    return true;
}

/**
 * Obtiene sugerencias de búsqueda basadas en términos comunes
 */
export function getSearchSuggestions(partialTerm: string): string[] {
    if (!partialTerm || partialTerm.length < 2) return [];

    const normalized = normalizeText(partialTerm);
    const suggestions: string[] = [];

    // Buscar en el diccionario de sinónimos
    for (const [key, synonyms] of Object.entries(SYNONYMS_MAP)) {
        if (key.startsWith(normalized)) {
            suggestions.push(key);
        }
        for (const syn of synonyms) {
            const normalizedSyn = normalizeText(syn);
            if (normalizedSyn.startsWith(normalized) && !suggestions.includes(normalizedSyn)) {
                suggestions.push(normalizedSyn);
            }
        }
    }

    return suggestions.slice(0, 5); // Máximo 5 sugerencias
}
