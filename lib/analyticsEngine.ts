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
// Exportar proyectos a CSV (Reporte Ejecutivo para Excel)
// ────────────────────────────────────────────────
export function exportProjectsToCSV(projects: Project[]): string {
    const today = new Date().toLocaleDateString('es-CL');
    
    // Títulos de columnas más didácticos y con guías visuales (emojis)
    const headers = [
        'ID',
        '📌 PRIORIDAD (0-100)',
        '🚀 NOMBRE DEL PROYECTO',
        '🏛️ INSTITUCIÓN',
        '💰 PRESUPUESTO EST. (CLP)',
        '📅 CIERRE CONVOCATORIA',
        '⏳ DÍAS RESTANTES',
        '🚦 VIABILIDAD IICA',
        '📈 ÉXITO (%)',
        '🔧 ROL IICA CHILE',
        '🌎 ÁMBITO',
        '📝 ESTADO',
        '🧩 COMPLEJIDAD',
        '👤 RESPONSABLE ASIGNADO',
        '💡 EJE ESTRATÉGICO IICA',
        '🔗 ENLACE DIRECTO BASES',
    ];

    const clean = (v: unknown) => {
        if (v === null || v === undefined || v === '') return '"—"';
        // Limpieza profunda: quitar comas, puntos y coma de dentro del texto, saltos de línea y escapar comillas
        const s = String(v)
            .replace(/"/g, '""')
            .replace(/\n|\r/g, ' ')
            .replace(/;/g, ','); // Cambiar ; interno por , para no romper el delimitador
        return `"${s}"`;
    };

    // Ordenar por prioridad real del IICA para el reporte
    const sortedProjects = [...projects].sort((a, b) => {
        const scoreA = calcUrgencyScore(a);
        const scoreB = calcUrgencyScore(b);
        return scoreB - scoreA;
    });

    const rows = sortedProjects.map(p => {
        const score = calcUrgencyScore(p);
        const days = daysUntilClose(p);
        
        // Agregar indicadores visuales de texto para Excel
        const priorLabel = score >= 80 ? '🔥 CRÍTICA' : score >= 60 ? '⚡ ALTA' : '⭐ NORMAL';
        const daysLabel = days < 0 ? '❌ Cerrada' : days <= 7 ? `⚠️ EN 7 DÍAS` : `${days} d`;

        return [
            clean(p.id),
            clean(`${score} (${priorLabel})`),
            clean(p.nombre.toUpperCase()), // Título en mayúsculas para jerarquía
            clean(p.institucion),
            clean(formatMontoCLP(p.monto)),
            clean(p.fecha_cierre),
            clean(daysLabel),
            clean(p.viabilidadIICA?.toUpperCase() || 'NO DEFINIDA'),
            clean(`${p.porcentajeViabilidad ?? 0}%`),
            clean(p.rolIICA || 'POR ASIGNAR'),
            clean(p.ambito || 'NACIONAL'),
            clean(p.estadoPostulacion || 'ABIERTA'),
            clean(p.complejidad || 'MEDIA'),
            clean(p.responsableIICA || 'EQUIPO TÉCNICO IICA'),
            clean(p.ejeIICA || 'PLAN ESTRATÉGICO 2022-2026'),
            clean(p.url_bases),
        ].join(';');
    });

    // Construcción del reporte con metadatos iniciales para que el usuario sepa qué está leyendo
    const reportTitle = `"RADAR DE OPORTUNIDADES IICA CHILE - REPORTE EJECUTIVO DE GESTIÓN";;;;;;;;;;;;;;;`;
    const reportDate = `"Fecha de generación: ${today}";;;;;;;;;;;;;;;`;
    const reportSummary = `"Total de oportunidades analizadas: ${projects.length}";;;;;;;;;;;;;;;`;
    const emptyRow = `;;;;;;;;;;;;;;;`;
    
    const headerRow = headers.map(h => `"${h}"`).join(';');

    return [
        reportTitle,
        reportDate,
        reportSummary,
        emptyRow,
        headerRow,
        ...rows
    ].join('\n');
}
