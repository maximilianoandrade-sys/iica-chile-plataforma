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

const AMBITO_OPTIONS = ['Todos', 'Internacional', 'Nacional', 'Regional'];
const VIABILIDAD_OPTIONS = ['Todas', 'Alta', 'Media', 'Baja'];
const ROL_OPTIONS = ['Todos', 'Ejecutor', 'Implementador', 'Asesor', 'Indirecto'];

export default function ProjectExplorer({ allProjects }: { allProjects: Project[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filters, setFilters] = useState({
        category: 'Todas',
        ambito: 'Todos',
        viabilidad: 'Todas',
        rol: 'Todos',
        soloAbiertos: true // Por defecto solo abiertos para "Menos clicks" y relevancia
    });
    const [sortBy, setSortBy] = useState('relevance');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredProjects = useMemo(() => {
        let results = allProjects;

        if (debouncedSearch.trim()) {
            results = searchAndRankProjects(debouncedSearch, results);
        }

        if (filters.category !== 'Todas') {
            results = results.filter(p => p.categoria === filters.category);
        }

        if (filters.ambito !== 'Todos') {
            results = results.filter(p => p.ambito === filters.ambito);
        }

        if (filters.viabilidad !== 'Todas') {
            results = results.filter(p => p.viabilidadIICA === filters.viabilidad);
        }

        if (filters.rol !== 'Todos') {
            results = results.filter(p => p.rolIICA === filters.rol);
        }

        if (filters.soloAbiertos) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            results = results.filter(p => new Date(p.fecha_cierre).getTime() >= today.getTime());
        }

        if (sortBy !== 'relevance' || !debouncedSearch) {
            const sorted = [...results];
            if (sortBy === 'date_asc') {
                sorted.sort((a, b) => new Date(a.fecha_cierre).getTime() - new Date(b.fecha_cierre).getTime());
            } else if (sortBy === 'amount_desc') {
                sorted.sort((a, b) => b.monto - a.monto);
            } else if (sortBy === 'viabilidad_desc') {
                sorted.sort((a, b) => (b.porcentajeViabilidad || 0) - (a.porcentajeViabilidad || 0));
            }
            return sorted;
        }

        return results;
    }, [allProjects, debouncedSearch, filters, sortBy]);

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
                        <div className="max-w-xl">
                            <h1 className="text-3xl md:text-4xl font-black text-[var(--iica-navy)] tracking-tight mb-3">
                                Radar de <span className="text-[var(--iica-blue)]">Oportunidades</span>
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                                Encuentra financiamiento internacional y nacional para el IICA Chile. 
                                <span className="hidden sm:inline"> Usa lenguaje natural para filtrar por impacto o tecnología.</span>
                            </p>
                        </div>
                        
                        {/* Live Counter */}
                        <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 shadow-inner">
                            <div className="text-center">
                                <div className="text-xl font-black text-[var(--iica-navy)] leading-none">{kpis.total}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Vistos</div>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-200" />
                            <div className="text-center">
                                <div className="text-xl font-black text-emerald-600 leading-none">{kpis.abiertos}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Abiertos</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className={`h-6 w-6 transition-colors ${searchTerm ? 'text-[var(--iica-blue)]' : 'text-gray-300'}`} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Ej: "proyectos adaptación climática fondo de adaptación"'
                            className="w-full pl-16 pr-14 py-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--iica-blue)] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-xl font-semibold text-gray-800 placeholder:text-gray-400 shadow-inner"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-rose-500 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        )}
                        <div className="absolute -bottom-3 right-8 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full shadow-sm text-[10px] font-black text-[var(--iica-blue)] uppercase tracking-widest animate-pulse">
                            <Sparkles className="h-3 w-3" /> Motor IA Activo
                        </div>
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

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-4 xl:pt-0">
                        {/* Categoría Select */}
                        <div className="relative group">
                            <select 
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                                className="appearance-none bg-gray-50 border border-gray-100 text-gray-700 font-black text-[10px] uppercase tracking-widest py-2.5 pl-4 pr-10 rounded-xl hover:bg-white hover:border-blue-200 transition-all cursor-pointer outline-none focus:ring-4 focus:ring-blue-50"
                            >
                                {categories.map(c => <option key={c} value={c}>📌 {c === 'Todas' ? 'Todas las Áreas' : c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                        </div>

                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                showAdvanced 
                                ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)]' 
                                : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:text-blue-600'
                            }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtros
                        </button>

                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[var(--iica-blue)] border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            CSV
                        </button>
                    </div>
                </div>

                {/* Advanced Panel */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
                                        <Globe className="w-3 h-3" /> Ámbito Geográfico
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                                        {AMBITO_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setFilters({...filters, ambito: opt})}
                                                className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                                                    filters.ambito === opt 
                                                    ? 'bg-white text-[var(--iica-blue)] shadow-md' 
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
                                        <AlertTriangle className="w-3 h-3" /> Viabilidad IICA
                                    </label>
                                    <select 
                                        value={filters.viabilidad}
                                        onChange={(e) => setFilters({...filters, viabilidad: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl outline-none focus:border-blue-300 transition-all font-bold"
                                    >
                                        {VIABILIDAD_OPTIONS.map(o => <option key={o} value={o}>{o === 'Todas' ? 'Cualquier Viabilidad' : o}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
                                        <Award className="w-3 h-3" /> Rol del IICA
                                    </label>
                                    <select 
                                        value={filters.rol}
                                        onChange={(e) => setFilters({...filters, rol: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl outline-none focus:border-blue-300 transition-all font-bold"
                                    >
                                        {ROL_OPTIONS.map(o => <option key={o} value={o}>{o === 'Todos' ? 'Cualquier Rol' : o}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 px-1">
                                        <Clock className="w-3 h-3" /> Estado Temporal
                                    </label>
                                    <button
                                        onClick={() => setFilters({...filters, soloAbiertos: !filters.soloAbiertos})}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            filters.soloAbiertos 
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-white text-gray-400 border-gray-100'
                                        }`}
                                    >
                                        Solo Abiertos
                                        <div className={`w-2 h-2 rounded-full ${filters.soloAbiertos ? 'bg-white animate-pulse' : 'bg-gray-200'}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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

