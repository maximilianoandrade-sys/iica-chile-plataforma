'use client';

import { Project } from '@/lib/data';
import { calcProjectKPIs, exportProjectsToCSV } from '@/lib/analyticsEngine';
import { Download, TrendingUp, Clock, AlertTriangle, Target, BarChart3 } from 'lucide-react';

interface AnalyticsStripProps {
    projects: Project[];         // proyectos YA filtrados/buscados
    totalAll: number;            // total sin filtros
    searchActive: boolean;       // true si hay búsqueda o filtros activos
}

export default function AnalyticsStrip({ projects, totalAll, searchActive }: AnalyticsStripProps) {
    const kpis = calcProjectKPIs(projects);

    const handleExport = () => {
        const csv = exportProjectsToCSV(projects);
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `IICA-Chile-Proyectos-${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Si no hay proyectos, no mostrar
    if (kpis.total === 0) return null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4">
            {/* Banda superior: resumen rápido + botón exportar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[var(--iica-blue)]/5 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-[var(--iica-blue)]" />
                    <span className="text-xs font-semibold text-gray-700">
                        {searchActive
                            ? `${kpis.total} resultado${kpis.total !== 1 ? 's' : ''} de ${totalAll} proyectos`
                            : `${kpis.total} proyectos en cartera`}
                    </span>
                    {kpis.urgentes > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            {kpis.urgentes} cierra en ≤7 días
                        </span>
                    )}
                </div>
                <button
                    onClick={handleExport}
                    title="Exportar resultados actuales a CSV (compatible con Excel)"
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--iica-blue)] hover:text-white hover:bg-[var(--iica-blue)] px-2.5 py-1 rounded-lg border border-[var(--iica-blue)]/30 hover:border-[var(--iica-blue)] transition-all duration-150"
                >
                    <Download className="h-3.5 w-3.5" />
                    Exportar CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">

                {/* Abiertos */}
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <span className="text-base">🟢</span>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-800 leading-none">
                            {kpis.abiertos}
                            <span className="text-xs font-normal text-gray-400 ml-1">/{kpis.total}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Abiertas ahora</div>
                    </div>
                </div>

                {/* Monto pipeline */}
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-[var(--iica-blue)]" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-800 leading-none">
                            {kpis.montoTotalPipeline}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Pipeline total (abiertas)</div>
                    </div>
                </div>

                {/* Alta viabilidad */}
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1 leading-none">
                            <span className="text-xl font-bold text-gray-800">{kpis.altaViabilidad}</span>
                            {kpis.mediaViabilidad > 0 && (
                                <span className="text-sm font-semibold text-amber-500">+{kpis.mediaViabilidad}</span>
                            )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Alta · Media viabilidad</div>
                    </div>
                </div>

                {/* Días promedio al cierre */}
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${kpis.diasPromedioAlCierre <= 14 ? 'bg-red-50' :
                            kpis.diasPromedioAlCierre <= 30 ? 'bg-amber-50' : 'bg-gray-50'
                        }`}>
                        <Clock className={`h-4 w-4 ${kpis.diasPromedioAlCierre <= 14 ? 'text-red-500' :
                                kpis.diasPromedioAlCierre <= 30 ? 'text-amber-500' : 'text-gray-400'
                            }`} />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-800 leading-none">
                            {kpis.diasPromedioAlCierre > 0 ? `${kpis.diasPromedioAlCierre}d` : '—'}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Promedio al cierre</div>
                    </div>
                </div>
            </div>

            {/* Barra de distribución de viabilidad */}
            {kpis.total > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Distribución viabilidad:</span>
                    <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                        {kpis.altaViabilidad > 0 && (
                            <div
                                className="bg-green-500 transition-all"
                                style={{ width: `${(kpis.altaViabilidad / kpis.total) * 100}%` }}
                                title={`Alta: ${kpis.altaViabilidad}`}
                            />
                        )}
                        {kpis.mediaViabilidad > 0 && (
                            <div
                                className="bg-amber-400 transition-all"
                                style={{ width: `${(kpis.mediaViabilidad / kpis.total) * 100}%` }}
                                title={`Media: ${kpis.mediaViabilidad}`}
                            />
                        )}
                        {kpis.bajaViabilidad > 0 && (
                            <div
                                className="bg-red-400 transition-all"
                                style={{ width: `${(kpis.bajaViabilidad / kpis.total) * 100}%` }}
                                title={`Baja: ${kpis.bajaViabilidad}`}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-500">
                        <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Alta</span>
                        <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Media</span>
                        <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Baja</span>
                    </div>
                </div>
            )}
        </div>
    );
}
