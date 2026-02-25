/**
 * analyticsEngine.ts
 * Calcula KPIs en tiempo real sobre el conjunto de proyectos visible
 * (ya filtrado/buscado). Se usa en AnalyticsStrip y para el score de urgencia.
 */

import { Project, daysUntilClose, formatMontoCLP } from './data';

// ────────────────────────────────────────────────
// Score de urgencia compuesto (0–100)
// Mayor score = más urgente / prioritario para el IICA
// ────────────────────────────────────────────────
export function calcUrgencyScore(project: Project): number {
    const days = daysUntilClose(project);
    if (days < 0) return 0; // Cerrado

    const ROL_MULT: Record<string, number> = {
        'Ejecutor': 1.0,
        'Implementador': 0.85,
        'Asesor': 0.65,
        'Indirecto': 0.4,
    };
    const VIA_MULT: Record<string, number> = {
        'Alta': 1.0,
        'Media': 0.7,
        'Baja': 0.4,
    };

    // Urgencia basada en días: 100 pts si cierra hoy, 0 pts si cierra en +120 días
    const urgencyByDays = Math.max(0, 100 - (days / 120) * 100);

    // Viabilidad (0–100)
    const viabilidadScore = (project.porcentajeViabilidad ?? 50);

    // Multiplicadores por rol y viabilidad categórica
    const rolMult = ROL_MULT[project.rolIICA ?? ''] ?? 0.5;
    const viaMult = VIA_MULT[project.viabilidadIICA ?? ''] ?? 0.5;

    // Ponderación: 40% urgencia temporal + 35% viabilidad % + 25% rol IICA
    const raw = (urgencyByDays * 0.40) + (viabilidadScore * 0.35) + (rolMult * viaMult * 100 * 0.25);
    return Math.round(Math.min(100, raw));
}

// ────────────────────────────────────────────────
// KPIs del conjunto filtrado
// ────────────────────────────────────────────────
export interface ProjectKPIs {
    total: number;
    abiertos: number;
    cerrados: number;
    urgentes: number;                // cierran en ≤ 7 días
    urgentesProximos: number;        // cierran en 8–30 días
    montoTotalPipeline: string;      // solo abiertos, formateado
    diasPromedioAlCierre: number;    // solo abiertos
    altaViabilidad: number;
    mediaViabilidad: number;
    bajaViabilidad: number;
    porEjecutor: number;
    porImplementador: number;
    scoreMasAlto: number;            // mejor score de urgencia del conjunto
    proyectoTop: string | null;      // nombre del proyecto más urgente/relevante
}

export function calcProjectKPIs(projects: Project[]): ProjectKPIs {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const abiertos = projects.filter(p => daysUntilClose(p) > 0);
    const cerrados = projects.filter(p => daysUntilClose(p) <= 0);

    const urgentes = abiertos.filter(p => {
        const d = daysUntilClose(p);
        return d > 0 && d <= 7;
    });
    const urgentesProximos = abiertos.filter(p => {
        const d = daysUntilClose(p);
        return d >= 8 && d <= 30;
    });

    const montoTotal = abiertos.reduce((sum, p) => sum + (p.monto || 0), 0);
    const montoTotalPipeline = montoTotal > 0 ? formatMontoCLP(montoTotal) : '—';

    const diasSuma = abiertos.reduce((sum, p) => sum + daysUntilClose(p), 0);
    const diasPromedioAlCierre = abiertos.length > 0
        ? Math.round(diasSuma / abiertos.length)
        : 0;

    const altaViabilidad = projects.filter(p => p.viabilidadIICA === 'Alta').length;
    const mediaViabilidad = projects.filter(p => p.viabilidadIICA === 'Media').length;
    const bajaViabilidad = projects.filter(p => p.viabilidadIICA === 'Baja').length;

    const porEjecutor = projects.filter(p => p.rolIICA === 'Ejecutor').length;
    const porImplementador = projects.filter(p => p.rolIICA === 'Implementador').length;

    // Proyecto top por score de urgencia
    let scoreMasAlto = 0;
    let proyectoTop: string | null = null;
    for (const p of abiertos) {
        const s = calcUrgencyScore(p);
        if (s > scoreMasAlto) {
            scoreMasAlto = s;
            proyectoTop = p.nombre;
        }
    }

    return {
        total: projects.length,
        abiertos: abiertos.length,
        cerrados: cerrados.length,
        urgentes: urgentes.length,
        urgentesProximos: urgentesProximos.length,
        montoTotalPipeline,
        diasPromedioAlCierre,
        altaViabilidad,
        mediaViabilidad,
        bajaViabilidad,
        porEjecutor,
        porImplementador,
        scoreMasAlto,
        proyectoTop,
    };
}

// ────────────────────────────────────────────────
// Exportar proyectos a CSV (para el botón de descarga)
// ────────────────────────────────────────────────
export function exportProjectsToCSV(projects: Project[]): string {
    const headers = [
        'Nombre',
        'Institución',
        'Categoría',
        'Monto (CLP)',
        'Fecha Cierre',
        'Días Restantes',
        'Viabilidad IICA',
        '% Viabilidad',
        'Rol IICA',
        'Ámbito',
        'Estado',
        'Complejidad',
        'Responsable IICA',
        'Eje IICA',
        'Score Urgencia',
        'URL Bases',
    ];

    const escape = (v: unknown) => {
        const s = String(v ?? '').replace(/"/g, '""');
        return `"${s}"`;
    };

    const rows = projects.map(p => [
        escape(p.nombre),
        escape(p.institucion),
        escape(p.categoria),
        escape(formatMontoCLP(p.monto)),
        escape(p.fecha_cierre),
        escape(daysUntilClose(p)),
        escape(p.viabilidadIICA ?? ''),
        escape(p.porcentajeViabilidad ?? ''),
        escape(p.rolIICA ?? ''),
        escape(p.ambito ?? ''),
        escape(p.estadoPostulacion ?? ''),
        escape(p.complejidad ?? ''),
        escape(p.responsableIICA ?? ''),
        escape(p.ejeIICA ?? ''),
        escape(calcUrgencyScore(p)),
        escape(p.url_bases),
    ].join(','));

    return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
}
