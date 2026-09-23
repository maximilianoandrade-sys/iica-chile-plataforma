// ============================================================================
// LIB/DATA.TS — Servicios de datos del servidor con fallback resiliente
// Tipos y formateadores desacoplados en lib/project-utils.ts
// ============================================================================

export * from './project-utils';
import { isDeadlineUnknown, type Project } from './project-utils';

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
import projectsJson from '../data/projects.json';

export function getStaticProjects(today: Date): Project[] {
    const todayStr = today.toISOString().split('T')[0];
    return (projectsJson as any[])
        .filter(p => {
            if ([103, 104, 106, 110, 113].includes(p.id)) return false;
            if (p.publishable === false) return false;
            if (p.relevanciaChile === false) return false;
            if (p.estadoPostulacion === 'Cerrada') return false;
            if (p.fecha_cierre && p.fecha_cierre < todayStr && !isDeadlineUnknown(p.fecha_cierre)) return false;
            return true;
        })
        .map(p => ({
            ...p,
            fecha_cierre: p.fecha_cierre,
            ambito: p.ambito as Project['ambito'],
            estadoPostulacion: p.estadoPostulacion as Project['estadoPostulacion'],
            viabilidadIICA: p.viabilidadIICA as Project['viabilidadIICA'],
            rolIICA: p.rolIICA as Project['rolIICA'],
            complejidad: p.complejidad as Project['complejidad']
        })) as Project[];
}

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

        const staticList = getStaticProjects(today);
        const combined = deduplicateByUrl([...mapped, ...staticList]);
        return { ok: true, projects: combined };
    } catch (error) {
        logger.warn('getProjects Prisma/Supabase no disponible, usando catálogo estático', { error: (error as Error).message });
        const staticList = getStaticProjects(today);
        return { ok: true, projects: staticList };
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
                publishable: true,
                relevanciaChile: true,
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

        const staticList = getStaticProjects(today).map(p => ({
            id: p.id,
            institucion: p.institucion,
            monto: p.monto,
            fecha_cierre: p.fecha_cierre,
            estadoPostulacion: p.estadoPostulacion,
            regiones: p.regiones || [],
            region: p.region || null,
            ambito: p.ambito || null,
            categoria: p.categoria,
            url_bases: p.url_bases,
        }));
        const deduped = deduplicateByUrl([...mapped, ...staticList]);

        return { ok: true, projects: deduped };
    } catch (error) {
        logger.warn('getProjectFilterSnapshot Prisma/Supabase no disponible, usando snapshot estático', { error: (error as Error).message });
        const staticList = getStaticProjects(today).map(p => ({
            id: p.id,
            institucion: p.institucion,
            monto: p.monto,
            fecha_cierre: p.fecha_cierre,
            estadoPostulacion: p.estadoPostulacion,
            regiones: p.regiones || [],
            region: p.region || null,
            ambito: p.ambito || null,
            categoria: p.categoria,
            url_bases: p.url_bases,
        }));
        return { ok: true, projects: staticList };
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
// ponytail: React.cache solo existe en el runtime de servidor (condición react-server).
// En el bundle del cliente (react 18.3) es undefined y rompe el módulo al evaluarlo.
const maybeCache = <T>(fn: () => T): (() => T) =>
  typeof cache === 'function' ? cache(fn) : fn;

export const getCachedProjects = maybeCache(getProjects);

/**
 * Cached version of getProjectFilterSnapshot — deduplicates within a single React server request.
 */
export const getCachedProjectFilterSnapshot = maybeCache(getProjectFilterSnapshot);

export interface FilterCounts {
  estado: Record<string, number>;
  institucion: Record<string, number>;
  region: Record<string, number>;
  categoria?: Record<string, number>;
  ambito: Record<string, number>;
}
