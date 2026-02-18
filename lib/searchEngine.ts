/**
 * Motor de Búsqueda con Scoring de Relevancia
 * Ordena resultados por calidad de coincidencia, no solo filtra
 */

import { Project } from './data';

// Diccionario de sinónimos para el contexto agrícola chileno
const SYNONYMS_MAP: Record<string, string[]> = {
    // Agua y Riego
    'agua': ['riego', 'pozo', 'hidrico', 'hidraulico', 'tecnificacion', 'aspersion', 'goteo', 'drenaje'],
    'riego': ['agua', 'pozo', 'tecnificacion', 'aspersion', 'goteo', 'hidrico', 'cnr'],
    'pozo': ['agua', 'riego', 'hidrico', 'perforacion', 'seco'],
    'seco': ['sequia', 'agua', 'riego', 'pozo', 'hidrico'],
    'sequia': ['seco', 'agua', 'riego', 'emergencia'],

    // Maquinaria y Mecanización
    'maquinaria': ['mecanizacion', 'tractor', 'equipo', 'implemento', 'tecnologia', 'inversion'],
    'mecanizacion': ['maquinaria', 'tractor', 'equipo', 'implemento'],
    'tractor': ['maquinaria', 'mecanizacion', 'equipo'],

    // Suelos
    'suelo': ['tierra', 'recuperacion', 'fertilizacion', 'enmienda', 'sirsd', 'degradado'],
    'tierra': ['suelo', 'predio', 'terreno'],
    'degradado': ['suelo', 'recuperacion', 'sirsd'],

    // Instituciones
    'indap': ['instituto desarrollo agropecuario', 'usuario indap', 'pequeno agricultor'],
    'cnr': ['comision nacional riego', 'riego', 'agua'],
    'corfo': ['corporacion fomento', 'innovacion', 'emprendimiento'],
    'fia': ['fundacion innovacion agraria', 'innovacion', 'investigacion'],
    'sercotec': ['servicio cooperacion tecnica', 'pyme', 'emprendimiento'],
    'gore': ['gobierno regional', 'region', 'regional'],
    'minagri': ['ministerio agricultura', 'agricultura'],
    'conaf': ['corporacion nacional forestal', 'forestal', 'bosque'],
    'sag': ['servicio agricola ganadero', 'ganaderia', 'sanidad'],

    // Beneficiarios
    'mujer': ['mujeres', 'femenino', 'genero', 'rural'],
    'joven': ['jovenes', 'juventud', 'joven'],
    'indigena': ['pueblos originarios', 'mapuche', 'aymara'],
    'pequeno': ['pequena', 'pyme', 'micro', 'indap'],
    'cooperativa': ['asociatividad', 'organizacion', 'comunidad'],
    'asociatividad': ['cooperativa', 'organizacion', 'comunidad', 'colectivo'],

    // Categorías y temas
    'innovacion': ['tecnologia', 'i+d', 'investigacion', 'fia', 'corfo'],
    'inversion': ['capital', 'financiamiento', 'credito', 'maquinaria'],
    'credito': ['prestamo', 'financiamiento', 'inversion', 'indap'],
    'internacional': ['global', 'exterior', 'extranjero', 'cooperacion', 'iica'],
    'emergencia': ['catastrofe', 'desastre', 'helada', 'sequia', 'incendio'],
    'forestal': ['bosque', 'arbol', 'conaf', 'reforestacion'],
    'ganaderia': ['ganado', 'bovino', 'ovino', 'sag', 'pecuario'],
    'exportacion': ['export', 'prochile', 'mercado', 'internacional'],
    'sustentable': ['sostenible', 'ambiental', 'ecologico', 'verde'],
    'organico': ['agroecologico', 'sustentable', 'certificacion'],
    'capital': ['semilla', 'inversion', 'financiamiento', 'credito'],
};

/**
 * Normaliza texto para búsqueda (sin acentos, minúsculas)
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Expande un término con sus sinónimos
 */
function expandWithSynonyms(term: string): string[] {
    const normalized = normalizeText(term);
    const synonyms = SYNONYMS_MAP[normalized] || [];
    return [normalized, ...synonyms.map(s => normalizeText(s))];
}

/**
 * Distancia de Levenshtein para tolerancia a errores de tipeo
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
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

function isSimilar(word1: string, word2: string, threshold: number = 2): boolean {
    if (word1.length < 4 || word2.length < 4) return word1 === word2;
    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    return distance <= threshold || (distance / maxLength) <= 0.2;
}

/**
 * Verifica si un texto contiene el término (con sinónimos y tolerancia)
 */
export function smartSearch(searchTerm: string, targetText: string): boolean {
    if (!searchTerm.trim()) return true;
    const normalizedTarget = normalizeText(targetText);
    const searchWords = searchTerm.trim().split(/\s+/);

    for (const word of searchWords) {
        const expandedTerms = expandWithSynonyms(word);
        let foundMatch = false;

        for (const term of expandedTerms) {
            if (normalizedTarget.includes(term)) { foundMatch = true; break; }
        }

        if (!foundMatch) {
            const targetWords = normalizedTarget.split(/\s+/);
            for (const targetWord of targetWords) {
                for (const term of expandedTerms) {
                    if (isSimilar(term, targetWord)) { foundMatch = true; break; }
                }
                if (foundMatch) break;
            }
        }

        if (!foundMatch) return false;
    }
    return true;
}

/**
 * Calcula un score de relevancia (0-100) para ordenar resultados
 * Prioriza: título exacto > institución > categoría > texto completo
 */
export function scoreProject(searchTerm: string, project: Project): number {
    if (!searchTerm.trim()) return 0;

    const query = normalizeText(searchTerm);
    const words = query.split(/\s+/).filter(w => w.length > 2);
    let score = 0;

    const title = normalizeText(project.nombre);
    const institution = normalizeText(project.institucion);
    const category = normalizeText(project.categoria);
    const regions = (project.regiones || []).map(normalizeText).join(' ');
    const beneficiaries = (project.beneficiarios || []).map(normalizeText).join(' ');
    const summary = normalizeText([
        project.resumen?.cofinanciamiento || '',
        project.resumen?.observaciones || '',
        (project.resumen?.requisitos_clave || []).join(' '),
    ].join(' '));

    for (const word of words) {
        const expanded = expandWithSynonyms(word);

        for (const term of expanded) {
            // Título: máxima relevancia
            if (title.includes(term)) {
                score += title.startsWith(term) ? 40 : 30;
            }
            // Institución: alta relevancia
            if (institution.includes(term)) score += 25;
            // Categoría: alta relevancia
            if (category.includes(term)) score += 20;
            // Regiones/Beneficiarios: media relevancia
            if (regions.includes(term)) score += 10;
            if (beneficiaries.includes(term)) score += 10;
            // Resumen: baja relevancia
            if (summary.includes(term)) score += 5;
        }
    }

    // Bonus: proyectos abiertos y con cierre próximo
    const today = new Date();
    const closeDate = new Date(project.fecha_cierre);
    const diffDays = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 30) score += 5; // Cierra pronto → más relevante
    if (diffDays > 0) score += 3; // Está abierto

    return score;
}

/**
 * Filtra Y ordena proyectos por relevancia
 */
export function searchAndRankProjects(
    searchTerm: string,
    projects: Project[]
): Project[] {
    if (!searchTerm.trim()) return projects;

    const matched = projects.filter(project => {
        const searchableText = [
            project.nombre,
            project.institucion,
            project.categoria,
            ...(project.regiones || []),
            ...(project.beneficiarios || []),
            project.resumen?.cofinanciamiento || '',
            project.resumen?.observaciones || '',
            ...(project.resumen?.requisitos_clave || []),
        ].join(' ');
        return smartSearch(searchTerm, searchableText);
    });

    // Ordenar por score descendente
    return matched.sort((a, b) => scoreProject(searchTerm, b) - scoreProject(searchTerm, a));
}
