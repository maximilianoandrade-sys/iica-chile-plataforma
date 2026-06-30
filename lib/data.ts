// ============================================================================
// TIPO PROJECT — Definición completa de todos los campos del JSON
// ============================================================================

export interface Project {
    // ── Identificación básica ─────────────────────────────────────────────
    id: number;
    sourceId?: string;   // Scraper origin key, e.g. "anid:fondecyt-regular-2027"
    nombre: string;
    institucion: string;
    monto: number;
    montoTexto?: string | null;   // Monto tal cual viene de la fuente (con unidad)
    fecha_cierre: string;   // YYYY-MM-DD
    estado: string;
    categoria: string;
    url_bases: string;

    // ── Geografía y beneficiarios ─────────────────────────────────────────
    regiones?: string[];
    beneficiarios?: string[];

    // ── Resumen ejecutivo ─────────────────────────────────────────────────
    resumen?: {
        cofinanciamiento?: string;
        requisitos_clave?: string[];
        plazo_ejecucion?: string;
        observaciones?: string;
    };

    // ── Campos técnicos de gestión ────────────────────────────────────────
    monto_min?: number;
    monto_max?: number;
    plazo_meses?: number;
    requiere_cofinanciamiento?: boolean;
    idioma?: string;
    faq_disponible?: boolean;
    webinar_fecha?: string | null;
    permite_adendas?: boolean;
    bases_estado?: string;
    requiere_firma?: boolean;
    tipos_solicitante?: string[];

    // ── Campos IICA — Análisis institucional ──────────────────────────────

    /** Ámbito geográfico: Nacional / Internacional / Regional */
    ambito?: 'Nacional' | 'Internacional' | 'Regional';

    /** Publicación en catálogo público */
    publishable?: boolean;

    /** Elegibilidad para Chile en policy estricta */
    chileEligibility?: 'eligible' | 'ineligible';

    /** Puntaje de calidad de ingesta (0-100) */
    qualityScore?: number;

    /** Flags de calidad detectados en ingestión */
    qualityFlags?: string[];

    /** Explicaciones de flags de calidad */
    qualityReasons?: string[];

    /** Timestamp de última evaluación de calidad */
    qualityUpdatedAt?: Date | string;

    /** Estado de la ventana de postulación */
    estadoPostulacion?: 'Abierta' | 'Próxima' | 'Cerrada';

    /** Nivel de viabilidad para el IICA (semáforo) */
    viabilidadIICA?: 'Alta' | 'Media' | 'Baja';

    /** Porcentaje numérico de viabilidad 0–100 */
    porcentajeViabilidad?: number;

    /** Nombre del responsable IICA asignado */
    responsableIICA?: string;

    /** Región geográfica de cobertura principal */
    region?: string;

    /** Objetivo estratégico IICA para esta oportunidad */
    objetivo?: string;

    /** Descripción del rol del IICA como ejecutor */
    descripcionIICA?: string;

    /** Lista de requisitos de postulación */
    requisitos?: string[];

    /** Fortalezas del IICA para aprovechar esta oportunidad */
    fortalezas?: string[];

    /** Debilidades o riesgos institucionales */
    debilidades?: string[];

    /** Notas internas del equipo técnico IICA */
    notasInternas?: string;

    /** Eje temático IICA (alineado al Plan Estratégico 2022-2026) */
    ejeIICA?: string;

    /** Complejidad de postulación estimada */
    complejidad?: 'Fácil' | 'Media' | 'Alta';

    /**
     * Rol del IICA en esta oportunidad:
     * - 'Ejecutor': IICA postula y ejecuta directamente
     * - 'Implementador': IICA como agencia de implementación técnica
     * - 'Asesor': IICA apoya a terceros (indirecto)
     * - 'Indirecto': Sin rol claro o muy indirecto para IICA
     */
    rolIICA?: 'Ejecutor' | 'Implementador' | 'Asesor' | 'Indirecto';

    // ── Campo de checklist (legacy) ──────────────────────────────────────
    checklist?: string[];
}

// ============================================================================
// HELPERS DE DATOS
// ============================================================================

/**
 * "Fecha desconocida": el pipeline de ingesta usa 2099-12-31 como placeholder
 * cuando un scraper o AI Discovery no pudo extraer la fecha de cierre real.
 * Esta función detecta ese caso para que el UI muestre "Sin fecha definida"
 * en lugar de "31/12/2099".
 */
export function isDeadlineUnknown(date: Date | string | null | undefined): boolean {
    if (!date) return true;
    const d = new Date(date);
    if (isNaN(d.getTime())) return true;
    return d.getUTCFullYear() >= 2099;
}

/**
 * Formato user-friendly de fecha de cierre:
 *  - "Sin fecha definida" si el placeholder 2099 o null
 *  - "31/05/2026" en formato chileno si tiene fecha real
 */
export function formatDeadline(date: Date | string | null | undefined): string {
    if (isDeadlineUnknown(date)) return "Sin fecha definida";
    return new Date(date!).toLocaleDateString('es-CL', {
        timeZone: 'UTC',  // Las fechas se almacenan a mediodía UTC para
                          // estabilidad cross-timezone. Forzar UTC al
                          // formatear evita off-by-one en otras TZ.
    });
}

/** Calcula días hasta cierre (negativo = ya cerró, null = sin fecha) */
export function daysUntilClose(project: Project): number {
    if (isDeadlineUnknown(project.fecha_cierre)) return 999; // tratado como "indefinido"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const close = new Date(project.fecha_cierre);
    return Math.ceil((close.getTime() - today.getTime()) / 86_400_000);
}

/** Retorna true si la oportunidad cierra en ≤7 días */
export function isClosingSoon(project: Project): boolean {
    const d = daysUntilClose(project);
    return d > 0 && d <= 7;
}

/** Retorna true si está abierta (fecha de cierre en el futuro) */
export function isOpen(project: Project): boolean {
    return daysUntilClose(project) > 0;
}

/** Pluraliza correctamente: 1 día vs N días */
export function pluralizeDias(n: number): string {
    return n === 1 ? '1 día' : `${n} días`;
}

/** Devuelve la etiqueta de urgencia con color para UI */
export function urgencyLabel(project: Project): {
    label: string;
    color: string;
    bgColor: string;
} {
    const d = daysUntilClose(project);
    if (d < 0) return { label: 'Cerrada', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    if (d <= 3) return { label: `¡${d}d!`, color: 'text-red-700', bgColor: 'bg-red-100' };
    if (d <= 7) return { label: pluralizeDias(d), color: 'text-orange-700', bgColor: 'bg-orange-100' };
    if (d <= 30) return { label: pluralizeDias(d), color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { label: 'Abierta', color: 'text-green-700', bgColor: 'bg-green-100' };
}

/** Formatea monto en formato legible CLP */
export function formatMontoCLP(monto: number): string {
    if (monto <= 0) return 'Ver bases';
    if (monto >= 1_000_000_000) return `$${(monto / 1_000_000_000).toFixed(1)}B`;
    if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(0)}M`;
    return `$${monto.toLocaleString('es-CL')}`;
}

/**
 * Monto listo para mostrar al usuario. Prefiere `montoTexto` (string crudo
 * de la fuente con su unidad, ej. "8.500 UF" o "USD 50,000") cuando está
 * presente, porque el monto numérico chileno suele estar en UF/USD y la
 * conversión a CLP pierde la unidad real.
 */
export function displayMonto(project: Project): string {
    if (project.montoTexto && project.montoTexto.trim()) return project.montoTexto.trim();
    return formatMontoCLP(project.monto);
}

/** Devuelve color semáforo para viabilidad IICA */
export function viabilidadColors(nivel?: string): { text: string; bg: string; dot: string } {
    switch (nivel) {
        case 'Alta': return { text: 'text-green-800', bg: 'bg-green-100', dot: 'bg-green-500' };
        case 'Media': return { text: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-500' };
        case 'Baja': return { text: 'text-red-800', bg: 'bg-red-100', dot: 'bg-red-500' };
        default: return { text: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' };
    }
}

/** Devuelve color para complejidad */
export function complejidadColors(nivel?: string): { text: string; bg: string } {
    switch (nivel) {
        case 'Fácil': return { text: 'text-green-700', bg: 'bg-green-50' };
        case 'Media': return { text: 'text-blue-700', bg: 'bg-blue-50' };
        case 'Alta': return { text: 'text-purple-700', bg: 'bg-purple-50' };
        default: return { text: 'text-gray-600', bg: 'bg-gray-50' };
    }
}

/** Devuelve colores e icono para el rol del IICA en la oportunidad */
export function rolIICAInfo(rol?: string): { text: string; bg: string; border: string; label: string; icon: string } {
    switch (rol) {
        case 'Ejecutor': return { text: 'text-green-800', bg: 'bg-green-50', border: 'border-green-300', label: 'IICA Ejecutor', icon: '✅' };
        case 'Implementador': return { text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-300', label: 'IICA Implementador', icon: '🔧' };
        case 'Asesor': return { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', label: 'IICA Asesor técnico', icon: '💼' };
        case 'Indirecto': return { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300', label: 'Rol indirecto', icon: '⚠️' };
        default: return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Sin definir', icon: '❓' };
    }
}

import { cache } from 'react';
import { getLogger } from '@/lib/utils/logger';
import prisma from './prisma';

const logger = getLogger('Data');

// ... (Interface Project se mantiene igual arriba) ...

// ============================================================================
// CARGA DE DATOS DESDE SUPABASE
// ============================================================================

// ── Limpieza de proyectos ficticios ────────────────────────────────────
// IDs insertados por prisma/seed.ts que NO corresponden a convocatorias
// reales: FIDA(103), BID(104), EUROCLIMA+(106), FIA-Silvoagro(110),
// CNR-Ley18450(113). Ya eliminados de data/projects.json; esta rutina
// borra las filas residuales de la DB en el primer request del deploy.
const FAKE_PROJECT_IDS = [103, 104, 106, 110, 113];
let _fakesCleaned = false;

async function purgeFakeProjects(): Promise<void> {
    if (_fakesCleaned) return;
    _fakesCleaned = true;
    try {
        const { count } = await prisma.project.deleteMany({
            where: { id: { in: FAKE_PROJECT_IDS } },
        });
        if (count > 0) {
            logger.info('Eliminados proyectos ficticios de la DB', { count, ids: FAKE_PROJECT_IDS });
        }
    } catch (err) {
        // No crítico: el filtro notIn los excluye de todas formas.
        _fakesCleaned = false; // reintentar en el siguiente request
        logger.error('purgeFakeProjects error (no crítico)', err as Error);
    }
}

type UrlProject = { id: number; url_bases: string };

/** Deduplica proyectos por url_bases para evitar entradas duplicadas (ej: CNR) */
function deduplicateByUrl<T extends UrlProject>(projects: T[]): T[] {
    const seen = new Map<string, T>();
    for (const p of projects) {
        const key = p.url_bases?.toLowerCase().trim();
        if (!key) {
            // Sin URL, siempre incluir (usar id como key única)
            seen.set(`__no_url_${p.id}`, p);
        } else if (!seen.has(key)) {
            seen.set(key, p);
        }
        // Si ya existe esa URL, se descarta el duplicado
    }
    return Array.from(seen.values());
}

export type GetProjectsResult =
    | { ok: true; projects: Project[] }
    | { ok: false; error: string };

export interface ProjectFilterSnapshot {
    id: number;
    institucion: string;
    monto: number;
    fecha_cierre: string;
    estadoPostulacion: 'Abierta' | 'Próxima' | 'Cerrada' | undefined;
    regiones: string[];
    region: string | null;
    ambito: string | null;
    categoria: string;
    url_bases: string;
}

export type GetProjectFilterSnapshotResult =
    | { ok: true; projects: ProjectFilterSnapshot[] }
    | { ok: false; error: string };

export async function getProjects(): Promise<GetProjectsResult> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Limpieza one-shot de filas ficticias en la DB
    await purgeFakeProjects();

    try {
        const dbProjects = await prisma.project.findMany({
            where: {
                fecha_cierre: { gte: today },
                NOT: { estadoPostulacion: 'Cerrada' },
                publishable: true,
                relevanciaChile: true,
                // Defensa redundante: si purgeFakeProjects falló, esto los excluye
                id: { notIn: FAKE_PROJECT_IDS },
            },
            orderBy: { fecha_cierre: 'asc' },
        });

        logger.info('Prisma OK: proyectos vigentes', { count: dbProjects.length });

        const mapped = dbProjects.map(p => ({
            ...p,
            fecha_cierre: p.fecha_cierre.toISOString().split('T')[0],
            webinar_fecha: p.webinar_fecha ? p.webinar_fecha.toISOString() : null,
            ambito: p.ambito as Project['ambito'],
            publishable: p.publishable,
            chileEligibility: p.chileEligibility as 'eligible' | 'ineligible' | undefined,
            qualityScore: p.qualityScore,
            qualityFlags: p.qualityFlags,
            qualityReasons: p.qualityReasons,
            qualityUpdatedAt: p.qualityUpdatedAt,
            estadoPostulacion: p.estadoPostulacion as Project['estadoPostulacion'],
            viabilidadIICA: p.viabilidadIICA as Project['viabilidadIICA'],
            rolIICA: p.rolIICA as Project['rolIICA'],
            complejidad: p.complejidad as Project['complejidad']
        })) as Project[];

        return { ok: true, projects: deduplicateByUrl(mapped) };
    } catch (error) {
        logger.error('getProjects Prisma/Supabase falló', error as Error);
        return { ok: false, error: (error as Error).message };
    }
}

export async function getProjectFilterSnapshot(): Promise<GetProjectFilterSnapshotResult> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await purgeFakeProjects();

    try {
        const dbProjects = await prisma.project.findMany({
            where: {
                fecha_cierre: { gte: today },
                NOT: { estadoPostulacion: 'Cerrada' },
                id: { notIn: FAKE_PROJECT_IDS },
            },
            orderBy: { fecha_cierre: 'asc' },
            select: {
                id: true,
                institucion: true,
                monto: true,
                fecha_cierre: true,
                estadoPostulacion: true,
                regiones: true,
                region: true,
                ambito: true,
                categoria: true,
                url_bases: true,
            },
        });

        const mapped = dbProjects.map((project) => ({
            id: project.id,
            institucion: project.institucion,
            monto: project.monto,
            fecha_cierre: project.fecha_cierre.toISOString().split('T')[0],
            estadoPostulacion: project.estadoPostulacion as ProjectFilterSnapshot['estadoPostulacion'],
            regiones: project.regiones,
            region: project.region,
            ambito: project.ambito,
            categoria: project.categoria,
            url_bases: project.url_bases,
        }));

        const deduped = deduplicateByUrl(mapped);

        return { ok: true, projects: deduped };
    } catch (error) {
        logger.error('getProjectFilterSnapshot Prisma/Supabase falló', error as Error);
        return { ok: false, error: (error as Error).message };
    }
}

export async function getAllProjects(): Promise<GetProjectsResult> {
    return getProjects();
}

/**
 * Cached version of getProjects — deduplicates within a single React server request.
 * Use this in server components to avoid redundant DB calls when multiple components
 * need the same data in the same render tree.
 */
export const getCachedProjects = cache(getProjects);

/**
 * Cached version of getProjectFilterSnapshot — deduplicates within a single React server request.
 */
export const getCachedProjectFilterSnapshot = cache(getProjectFilterSnapshot);

export interface FilterCounts {
  estado: Record<string, number>;
  institucion: Record<string, number>;
  region: Record<string, number>;
  categoria?: Record<string, number>;
  ambito: Record<string, number>;
}
