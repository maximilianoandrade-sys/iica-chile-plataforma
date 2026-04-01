"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Project, daysUntilClose, formatMontoCLP, rolIICAInfo } from "@/lib/data";
import { searchAndRankProjects } from "@/lib/searchEngine";
import { calcProjectKPIs, exportProjectsToCSV } from "@/lib/analyticsEngine";
import { Search, X, Sparkles, SlidersHorizontal, ChevronDown, Award, TrendingUp, Clock, AlertTriangle, Download, BarChart3, Globe, Zap } from "lucide-react";
import { OportunidadCard } from "./OportunidadCard";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_FILTERS = [
    { id: 'all', label: 'Todas', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'riego', label: 'Riego', icon: "💧" },
    { id: 'clima', label: 'Clima', icon: "🌱" },
    { id: 'innovacion', label: 'Innovación', icon: "💡" },
    { id: 'adaptacion', label: 'Adaptación', icon: <Zap className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'secano', label: 'Secano', icon: "🌵" },
    { id: 'hidroponia', label: 'Hidroponía', icon: "🧪" },
    { id: 'pasantia', label: 'Pasantías', icon: "🎓" },
];

export default function ProjectExplorer({ allProjects }: { allProjects: Project[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredProjects = useMemo(() => {
        // Lógica de Negocio: Ocultar proyectos con fecha_cierre anterior al 1 de Abril de 2026 (y por tanto, cualquier 2025)
        const thresholdDate = new Date('2026-04-01T00:00:00');
        
        let results = allProjects.filter(p => {
            const cierre = new Date(p.fecha_cierre);
            return cierre.getTime() >= thresholdDate.getTime();
        });

        if (debouncedSearch.trim()) {
            results = searchAndRankProjects(debouncedSearch, results);
        }

        // Always show ONLY open projects by default (relevance & less clicks)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        results = results.filter(p => new Date(p.fecha_cierre).getTime() >= today.getTime());

        return results;
    }, [allProjects, debouncedSearch]);

    // Calcular KPIs en tiempo real
    const kpis = useMemo(() => calcProjectKPIs(filteredProjects), [filteredProjects]);

    const handleExport = () => {
        const csv = exportProjectsToCSV(filteredProjects);
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IICA-Radar-Proyectos-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilters({ category: 'Todas', ambito: 'Todos', viabilidad: 'Todas', rol: 'Todos', soloAbiertos: true });
        setSortBy('relevance');
    };

    const categories = useMemo(() => ['Todas', ...Array.from(new Set(allProjects.map(p => p.categoria)))], [allProjects]);

    return (
        <div className="flex flex-col gap-6">
            
            {/* ── HEADER DE BÚSQUEDA DIRECTA ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 p-6 md:p-10 transition-all hover:shadow-2xl hover:shadow-blue-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-40 -mt-40 opacity-40 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="max-w-xl space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-blue-600/20">
                                    Inteligencia IICA
                                </span>
                                <div className="flex items-center gap-1.5 ml-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Radar Activo</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[var(--iica-navy)] tracking-tighter leading-[0.9] mb-4">
                                Radar de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--iica-blue)] to-indigo-600">Oportunidades</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-sm">
                                Gestiona el portafolio técnico con lenguaje natural. Filtra por <span className="text-[var(--iica-blue)] font-bold italic">impacto regional</span> o <span className="text-[var(--iica-blue)] font-bold italic">fuente financiera</span>.
                            </p>
                        </div>
                        
                        {/* Live Counter */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                            <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm text-center min-w-[100px] border border-slate-50">
                                <div className="text-2xl font-black text-[var(--iica-navy)] leading-none mb-1">{kpis.total}</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</div>
                            </div>
                            <div className="bg-emerald-500 px-6 py-4 rounded-[1.5rem] shadow-lg shadow-emerald-500/20 text-center min-w-[100px] border border-emerald-400/20">
                                <div className="text-2xl font-black text-white leading-none mb-1">{kpis.abiertos}</div>
                                <div className="text-[9px] font-black text-emerald-100 uppercase tracking-[0.2em]">Vigentes</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/search">
                        <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                            <Search className={`h-6 w-6 transition-all duration-500 ${searchTerm ? 'text-[var(--iica-blue)] scale-110' : 'text-slate-300'}`} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Ej: "proyectos de riego en el secano con fondos internacionales"'
                            className="w-full pl-16 pr-14 py-7 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-[var(--iica-blue)]/30 focus:ring-8 focus:ring-blue-100/50 outline-none transition-all text-xl font-bold text-slate-800 placeholder:text-slate-300 shadow-inner"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-4 pr-4 flex items-center text-slate-300 hover:text-rose-500 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        )}
                        <div className="absolute -bottom-3 right-10 flex items-center gap-2 px-4 py-2 bg-[var(--iica-navy)] border border-slate-700 rounded-full shadow-xl text-[9px] font-black text-white uppercase tracking-[0.2em] group-hover/search:translate-y-1 transition-transform">
                            {searchTerm !== debouncedSearch ? (
                                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="h-3 w-3 text-amber-400" />
                            )}
                            Buscador Inteligente
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
                        💡 Tip: Prueba con "fondos para riego en el secano" o "proyectos climáticos internacionales"
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {QUICK_FILTERS.map(chip => (
                            <button
                                key={chip.id}
                                onClick={() => setSearchTerm(chip.id === 'all' ? "" : chip.label)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 uppercase tracking-widest ${
                                    (searchTerm === chip.label || (chip.id === 'all' && !searchTerm))
                                    ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-lg shadow-blue-900/20 translate-y-[-2px]'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                                }`}
                            >
                                {chip.icon && <span>{chip.icon}</span>}
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BARRA DE ACCIÓN Y KPIs EN VIVO ── */}
            <div className="sticky top-[80px] z-40 bg-[#f4f7f9]/90 backdrop-blur-md py-4 px-1 -mx-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 flex flex-col xl:flex-row items-center gap-6 justify-between overflow-hidden">
                    
                    {/* Resumen KPI Compacto */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800 leading-none">{kpis.montoTotalPipeline}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Pipeline</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800 leading-none">{kpis.altaViabilidad}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Viabilidad Alta</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpis.urgentes > 0 ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800 leading-none">{kpis.urgentes}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Cierran ≤7d</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800 leading-none">{kpis.diasPromedioAlCierre}d</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Prom. Cierre</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center w-full xl:w-auto mt-4 xl:mt-0 pt-4 xl:pt-0 border-t xl:border-t-0">
                        <button 
                            onClick={handleExport}
                            className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[var(--iica-blue)] border-2 border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Exportar Pipeline CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* ── LISTADO DINÁMICO ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((p) => (
                        <motion.div
                            layout
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <OportunidadCard 
                                query={debouncedSearch}
                                op={{
                                    id: String(p.id),
                                    nombre: p.nombre,
                                    institucion: p.institucion,
                                    cierre: p.fecha_cierre,
                                    diasRestantes: daysUntilClose(p),
                                    viabilidad: p.viabilidadIICA,
                                    porcentajeViabilidad: p.porcentajeViabilidad,
                                    rolIICA: rolIICAInfo(p.rolIICA).label,
                                    url: p.url_bases,
                                    adenda: p.permite_adendas,
                                    descripcion: p.descripcionIICA || (p.resumen?.observaciones),
                                    monto: formatMontoCLP(p.monto),
                                    categoria: p.categoria,
                                    ambito: p.ambito
                                }} 
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProjects.length === 0 && (
                <div className="py-24 flex flex-col items-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--iica-navy)] mb-2">Sin resultados para la búsqueda</h3>
                    <p className="text-gray-500 max-w-sm mb-8 font-medium">
                        Intenta con términos más amplios o limpia los filtros para ver todas las oportunidades disponibles.
                    </p>
                    <button 
                        onClick={clearFilters}
                        className="bg-[var(--iica-navy)] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--iica-blue)] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                    >
                        Ver todos los proyectos
                    </button>
                </div>
            )}
        </div>
    );
}

