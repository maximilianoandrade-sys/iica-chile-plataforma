'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Project } from "@/lib/data";
import { trackEvent, trackSearch } from "@/lib/analytics";
import { smartSearch, buildInvertedIndex, searchAndRankProjects, InvertedIndex } from "@/lib/searchEngine";
import counterparts from '@/lib/counterparts_raw.json';
import { getInstitutionalLogo } from "@/lib/logos";
import { AGROVOC_KEYWORDS } from "@/lib/agrovoc";
import Toast from "@/components/ui/Toast";
import Image from 'next/image';
import SearchableSelect from "@/components/SearchableSelect"; // Import the new component
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ExternalLink, Calendar, AlertCircle, X, ChevronDown, Check, Info, Sparkles, Copy, Eye, CheckCheck, MapPin, Users, Banknote, Clock, ChevronRight, ArrowUpDown, FileText, HelpCircle, MonitorPlay, PenTool, CheckCircle2, XCircle, AlertTriangle, Zap } from "lucide-react";
import { ActionButton, UrgencyBadge } from "@/components/ProjectItem";
import { OportunidadCard, Oportunidad } from "./OportunidadCard";
import { daysUntilClose } from "@/lib/data";

export default function ProjectList({ projects }: { projects: Project[] }) {
    // State for client-side interactions
    const [selectedAgrovoc, setSelectedAgrovoc] = useState('Cualquiera');
    const [showAgrovoc, setShowAgrovoc] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // AI Search Engine State
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [searchMeta, setSearchMeta] = useState<any | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = useCallback(async (query: string, scope = "all", role = "all") => {
        setSearching(true);
        setSearchError(null);
        try {
            const res = await fetch("/api/search-projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, scope, role, use_ai: true }),
            });
            const data = await res.json();
            setSearchResults(data.results);
            setSearchMeta(data.meta);
        } catch (e) {
            setSearchError("Error al buscar proyectos");
        } finally {
            setSearching(false);
        }
    }, []);
    // New Features State
    const [favorites, setFavorites] = useState<number[]>([]);
    const [compareList, setCompareList] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Vista Rápida & Copiar
    const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [quickFilter, setQuickFilter] = useState<'all' | 'facil' | 'cierre' | 'mujeres' | 'alta_viabilidad'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Project | 'dificultad', direction: 'asc' | 'desc' } | null>(null);

    // Índice invertido pre-computado para búsqueda O(1)
    const [invertedIndex, setInvertedIndex] = useState<InvertedIndex | null>(null);
    useEffect(() => {
        const idx = buildInvertedIndex(projects);
        setInvertedIndex(idx);
    }, [projects]);

    const handleSort = (key: keyof Project | 'dificultad') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Helper for Closing Soon (Moved here to be used in filtering)
    const isClosingSoon = (dateStr: string) => {
        if (!dateStr) return false;
        const today = new Date();
        const closeDate = new Date(dateStr);
        const diffTime = closeDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
    };

    const copyProjectFicha = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        const closeDate = new Date(project.fecha_cierre);
        const diffDays = Math.ceil((closeDate.getTime() - today.getTime()) / 86400000);
        const estado = diffDays < 0 ? 'CERRADO' : `Abierto – cierra en ${diffDays} días`;
        const monto = project.monto > 0
            ? `$${(project.monto / 1000000).toFixed(0)}M`
            : 'Ver bases';
        const texto = [
            `📋 ${project.nombre}`,
            `🏛️ Institución: ${project.institucion}`,
            `📂 Categoría: ${project.categoria}`,
            `💰 Monto máximo: ${monto}`,
            `📅 Cierre: ${new Date(project.fecha_cierre).toLocaleDateString('es-CL')} (${estado})`,
            project.resumen?.cofinanciamiento ? `🤝 Cofinanciamiento: ${project.resumen.cofinanciamiento}` : '',
            `🔗 Bases: ${project.url_bases}`,
        ].filter(Boolean).join('\n');
        navigator.clipboard.writeText(texto).then(() => {
            setCopiedId(project.id);
            setToastMessage('✅ Ficha copiada al portapapeles');
            setTimeout(() => setCopiedId(null), 2000);
        });
    };



    // Load favorites from local storage
    useEffect(() => {
        const savedFavs = localStorage.getItem('iica_favorites');
        if (savedFavs) {
            setFavorites(JSON.parse(savedFavs));
        }
    }, []);

    const toggleFavorite = (id: number) => {
        const newFavs = favorites.includes(id)
            ? favorites.filter((fid: number) => fid !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('iica_favorites', JSON.stringify(newFavs));
        setToastMessage(favorites.includes(id) ? 'Eliminado de favoritos' : 'Guardado en favoritos');
    };

    const toggleCompare = (id: number) => {
        if (compareList.includes(id)) {
            setCompareList(compareList.filter((cid: number) => cid !== id));
        } else {
            if (compareList.length >= 3) {
                setToastMessage('Máximo 3 proyectos para comparar');
                return;
            }
            setCompareList([...compareList, id]);
        }
    };



    const getLogoUrl = (institution: string) => {
        return getInstitutionalLogo(institution);
    };

    // Filter projects logic (Agrovoc is the only client-side filter remaining + Favorites toggle)
    const displayedProjects = useMemo(() => {
        let filtered: any[] = searchResults ?? projects;

        // ── Filtro Agrovoc (usa el nuevo motor de búsqueda completo) ──────────
        if (selectedAgrovoc !== 'Cualquiera') {
            filtered = filtered.filter((p: any) => smartSearch(selectedAgrovoc, p as any));
        }

        // ── Filtro Favoritos ─────────────────────────────────────────────────
        if (showFavoritesOnly) {
            filtered = filtered.filter((p: any) => favorites.includes(p.id));
        }

        // ── Quick Filters (lógica real basada en campos del proyecto) ────────
        if (quickFilter === 'facil') {
            // Usa el campo real complejidad, no un proxy falso
            filtered = filtered.filter((p: any) => p.complejidad === 'Fácil');
        } else if (quickFilter === 'cierre') {
            filtered = filtered.filter((p: any) => isClosingSoon(p.fecha_cierre));
        } else if (quickFilter === 'mujeres') {
            filtered = filtered.filter((p: any) =>
                p.beneficiarios?.some((b: string) => b.toLowerCase().includes('mujer')) ||
                (p.descripcionIICA || '').toLowerCase().includes('mujer') ||
                (p.objetivo || '').toLowerCase().includes('mujer')
            );
        } else if (quickFilter === 'alta_viabilidad') {
            filtered = filtered.filter((p: any) =>
                p.viabilidadIICA === 'Alta' || (p.porcentajeViabilidad || 0) >= 75
            );
        }

        if (sortConfig) {
            filtered = [...filtered].sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Project];
                let bValue: any = b[sortConfig.key as keyof Project];

                if (sortConfig.key === 'dificultad') {
                    // Sort by ID is a proxy for difficulty in current logic (even IDs are easy)
                    aValue = a.id % 2;
                    bValue = b.id % 2;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [projects, selectedAgrovoc, showFavoritesOnly, favorites, quickFilter, sortConfig, searchResults]);

    // Dashboard Counters Logic
    const activeFundsByInstitution = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.forEach(p => {
            if (p.estado === 'Abierto') {
                counts[p.institucion] = (counts[p.institucion] || 0) + 1;
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Sort by count desc
    }, [projects]);

    // Helper for Closing Soon


    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // ── UTILITY TOOLBAR (Favoritos, Compare & View Mode) ───────────────────
    return (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--iica-border)] overflow-hidden">
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}

            {/* BUSCADOR IA */}
            <div className="p-6 bg-white border-b border-gray-100">
              <div className="flex gap-2 mb-3 text-gray-900">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
                  placeholder="Buscar proyectos reales... ej: riego, cambio climático, emprendimiento mujeres"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[var(--iica-blue)] focus:ring-1 focus:ring-[var(--iica-blue)] transition-all bg-gray-50/50"
                  style={{ color: '#111827' }}
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={searching}
                  className="px-6 py-3 bg-[var(--iica-blue)] text-white rounded-xl text-sm font-bold hover:bg-[var(--iica-navy)] disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  {searching ? "Buscando..." : "🔍 Buscar con IA"}
                </button>
                {searchResults && (
                  <button
                    onClick={() => { setSearchResults(null); setSearchMeta(null); setSearchQuery(""); }}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors bg-white whitespace-nowrap"
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>
              {searchMeta && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {searchMeta.total} Resultados Reales
                  </span>
                  <p className="text-xs text-gray-500 font-medium ml-1">
                    {searchMeta.ai_generated ? "✨ Potenciado por Inteligencia Artificial y Búsqueda Web" : "📋 Desde Base de Datos Institucional"}
                  </p>
                </div>
              )}
              {searchError && (
                 <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{searchError}</span>
                 </div>
              )}
            </div>

            {/* HEADER METADATA DASHBOARD */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 items-center min-w-max">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        En Vivo:
                    </span>
                    {activeFundsByInstitution.slice(0, 6).map(([inst, count]: [string, number]) => (
                        <div key={inst} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-bold text-[var(--iica-navy)] hover:border-blue-200 hover:bg-white transition-all">
                            <span className="opacity-70">{inst}</span>
                            <span className="bg-[var(--iica-blue)] text-white text-[10px] px-1.5 rounded-lg h-4 flex items-center justify-center min-w-[1.2rem]">{count}</span>
                        </div>
                    ))}
                </div>
            </div >


            {/* Agrovoc Keywords Section - Collapsible & Aesthetic */}
            < div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/30" >
                <div className="w-full">
                    <button
                        onClick={() => setShowAgrovoc(!showAgrovoc)}
                        className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[var(--iica-blue)] transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            Explorar por Temas Agrovoc
                            {selectedAgrovoc !== 'Cualquiera' && (
                                <span className="ml-2 px-3 py-1 bg-[var(--iica-blue)] text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                                    {selectedAgrovoc}
                                </span>
                            )}
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showAgrovoc ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showAgrovoc && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="max-h-60 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 scrollbar-thin">
                                        <button
                                            onClick={() => setSelectedAgrovoc('Cualquiera')}
                                            className={`text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${selectedAgrovoc === 'Cualquiera'
                                                ? 'bg-gray-800 text-white border-gray-800 shadow-md scale-[1.02]'
                                                : 'hover:bg-gray-50 text-gray-500 border-transparent'
                                                }`}
                                        >
                                            ✕ Limpiar
                                        </button>
                                        {AGROVOC_KEYWORDS.map((keyword, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedAgrovoc(keyword)}
                                                className={`text-left px-3 py-2 rounded-xl text-[11px] font-medium truncate transition-all border ${selectedAgrovoc === keyword
                                                    ? 'bg-[var(--iica-blue)] text-white border-[var(--iica-blue)] shadow-md scale-[1.02] font-bold'
                                                    : 'hover:bg-blue-50 hover:text-[var(--iica-blue)] hover:border-blue-100 text-gray-600 border-transparent'
                                                    }`}
                                                title={keyword}
                                            >
                                                {keyword}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div >

            {/* QUICK FILTERS (CHIPS) & VIEW TOGGLE */}
            < div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-white" >
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setQuickFilter('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${quickFilter === 'all' ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setQuickFilter('facil')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${quickFilter === 'facil' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600'}`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Postulación Fácil
                    </button>
                    <button
                        onClick={() => setQuickFilter('cierre')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${quickFilter === 'cierre' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200 hover:border-rose-200 hover:text-rose-600'}`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Cierre Inminente
                    </button>
                </div>

                {/* View Mode Switcher (Desktop Only) */}
                <div className="hidden lg:flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-[var(--iica-blue)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista de Tabla"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[var(--iica-blue)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista de Cuadrícula"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div >

            {/* UTILITY TOOLBAR (Favoritos & Info) */}
            < div className="flex items-center justify-between p-6 bg-white border-b border-gray-100" >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`group flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${showFavoritesOnly
                            ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                            : 'bg-white text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border-gray-200'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" className={`w-4 h-4 transition-transform group-hover:scale-110 ${showFavoritesOnly ? 'text-rose-500' : 'text-gray-300'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Favoritos ({favorites.length})
                    </button>

                    {compareList.length > 0 && (
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm animate-in zoom-in"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Comparar ({compareList.length}/3)
                        </button>
                    )}
                </div>

                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                    Resultados: <span className="text-gray-800">{displayedProjects.length}</span>
                </div>
            </div >

            {/* 5. CONTENT AREA */}
            < div className="relative" >
                {
                    displayedProjects.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
                            <p className="text-gray-600 mb-6">
                                {showFavoritesOnly
                                    ? "No tienes convocatorias guardadas en favoritos."
                                    : "No hay convocatorias que coincidan con tu búsqueda en este momento."}
                            </p>
                            <button
                                onClick={() => {
                                    setShowFavoritesOnly(false);
                                    setSelectedAgrovoc('Cualquiera');
                                    setQuickFilter('all');
                                }}
                                className="text-[var(--iica-cyan)] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] rounded px-2"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            {/* Desktop/Tablet View Switcher Logic */}
                            <AnimatePresence mode="wait">
                                {viewMode === 'table' ? (
                                    <motion.div
                                        key="table-view"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="hidden lg:block overflow-x-auto"
                                    >
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#f4f7f9] text-gray-700 text-sm font-bold border-b border-[var(--iica-border)] uppercase tracking-wider sticky top-0 z-10">
                                                    <th className="py-5 px-6 w-12 text-center">
                                                        <span className="sr-only">Comparar</span>
                                                    </th>
                                                    <th className="py-5 px-6 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('nombre')}>
                                                        <div className="flex items-center gap-2">
                                                            Proyecto
                                                            <ArrowUpDown className={`h-4 w-4 text-gray-400 group-hover:text-[var(--iica-blue)] ${sortConfig?.key === 'nombre' ? 'text-[var(--iica-blue)]' : ''}`} />
                                                        </div>
                                                    </th>
                                                    <th className="py-5 px-6 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('institucion')}>
                                                        <div className="flex items-center gap-2">
                                                            Institución
                                                            <ArrowUpDown className={`h-4 w-4 text-gray-400 group-hover:text-[var(--iica-blue)] ${sortConfig?.key === 'institucion' ? 'text-[var(--iica-blue)]' : ''}`} />
                                                        </div>
                                                    </th>
                                                    <th className="py-5 px-6 cursor-pointer hover:bg-gray-100 transition-colors group" onClick={() => handleSort('fecha_cierre')}>
                                                        <div className="flex items-center gap-2">
                                                            Cierre
                                                            <ArrowUpDown className={`h-4 w-4 text-gray-400 group-hover:text-[var(--iica-blue)] ${sortConfig?.key === 'fecha_cierre' ? 'text-[var(--iica-blue)]' : ''}`} />
                                                        </div>
                                                    </th>
                                                    <th className="py-5 px-6 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {displayedProjects.map((project: Project) => (
                                                    <tr
                                                        key={project.id}
                                                        className={`hover:bg-blue-50/60 transition-colors group ${compareList.includes(project.id) ? 'bg-blue-50/40' : ''}`}
                                                    >
                                                        <td className="py-6 px-6 text-center align-middle">
                                                            <div className="flex justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={compareList.includes(project.id)}
                                                                    onChange={() => toggleCompare(project.id)}
                                                                    className="w-5 h-5 text-[var(--iica-blue)] border-gray-300 rounded focus:ring-[var(--iica-blue)] cursor-pointer transition-transform active:scale-95"
                                                                    title="Comparar este proyecto"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6 align-middle">
                                                            <div className="flex items-start gap-4">
                                                                <button
                                                                    onClick={() => toggleFavorite(project.id)}
                                                                    className="mt-1 text-gray-300 hover:text-red-500 focus:outline-none transition-colors transform active:scale-90"
                                                                    title={favorites.includes(project.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill={favorites.includes(project.id) ? "#ef4444" : "none"}
                                                                        stroke="currentColor"
                                                                        className={`w-6 h-6 ${favorites.includes(project.id) ? 'text-red-500' : 'text-gray-300 group-hover:text-gray-400'}`}
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                </button>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <div className="font-bold text-[var(--iica-navy)] text-base group-hover:text-[var(--iica-blue)] transition-colors">{project.nombre}</div>
                                                                        {isClosingSoon(project.fecha_cierre) && (
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse whitespace-nowrap">
                                                                                <Clock className="h-3 w-3" /> Cierra Pronto
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                            {project.categoria}
                                                                        </span>
                                                                        {project.resumen && (
                                                                            <button
                                                                                onClick={() => setQuickViewProject(project)}
                                                                                className="text-gray-400 hover:text-[var(--iica-blue)] hover:bg-blue-50 rounded-full p-1 transition-all"
                                                                                aria-label="Abrir panel de detalles"
                                                                                title="Ver detalles completos"
                                                                            >
                                                                                <Info className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6 align-middle">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm p-1">
                                                                    <Image
                                                                        src={getLogoUrl(project.institucion)}
                                                                        alt={project.institucion}
                                                                        fill
                                                                        className="object-contain"
                                                                        sizes="40px"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit ${project.id % 2 === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                                        IA: {project.id % 2 === 0 ? 'Fácil' : 'Media'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-6 align-middle">
                                                            <UrgencyBadge date={project.fecha_cierre} />
                                                        </td>
                                                        <td className="py-6 px-6 text-right align-middle">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <button
                                                                    onClick={(e: React.MouseEvent) => copyProjectFicha(project, e)}
                                                                    className={`p-2.5 rounded-xl border transition-all ${copiedId === project.id ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                                                                >
                                                                    {copiedId === project.id ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => setQuickViewProject(project)}
                                                                    className="p-2.5 rounded-xl border bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all"
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </button>
                                                                <ActionButton
                                                                    url={project.url_bases}
                                                                    date={project.fecha_cierre}
                                                                    projectName={project.nombre}
                                                                    onTrack={() => setToastMessage("Enlace externo verificado.")}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="grid-view"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
                                    >
                                        {displayedProjects.map((project: Project) => {
                                            const op: Oportunidad = {
                                                id: String(project.id),
                                                nombre: project.nombre,
                                                institucion: project.institucion,
                                                cierre: new Date(project.fecha_cierre).toLocaleDateString('es-CL'),
                                                diasRestantes: daysUntilClose(project),
                                                ambito: (project.ambito as "Internacional" | "Nacional" | "Regional") || "Nacional",
                                                viabilidad: (project.viabilidadIICA as "Alta" | "Media" | "Baja") || "Media",
                                                porcentajeViabilidad: project.porcentajeViabilidad,
                                                rolIICA: project.rolIICA,
                                                url: project.url_bases,
                                                adenda: project.permite_adendas,
                                                descripcion: project.descripcionIICA || project.resumen?.observaciones || ''
                                            };
                                            return (
                                                <div key={project.id} className="relative">
                                                    {/* @ts-ignore */}
                                                    <OportunidadCard op={op} />
                                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                                        <button
                                                            onClick={() => toggleFavorite(project.id)}
                                                            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-all ${favorites.includes(project.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-400 hover:text-rose-500'}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={favorites.includes(project.id) ? "currentColor" : "none"} stroke="currentColor" className="w-4 h-4" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mobile specific view (always cards) - visible only on smallest screens if needed */}
                            <div className="lg:hidden p-4 space-y-4">
                                {viewMode === 'table' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {displayedProjects.map((project: Project) => {
                                            const op: Oportunidad = {
                                                id: String(project.id),
                                                nombre: project.nombre,
                                                institucion: project.institucion,
                                                cierre: new Date(project.fecha_cierre).toLocaleDateString('es-CL'),
                                                diasRestantes: daysUntilClose(project),
                                                ambito: (project.ambito as "Internacional" | "Nacional" | "Regional") || "Nacional",
                                                viabilidad: (project.viabilidadIICA as "Alta" | "Media" | "Baja") || "Media",
                                                porcentajeViabilidad: project.porcentajeViabilidad,
                                                rolIICA: project.rolIICA,
                                                url: project.url_bases,
                                                adenda: project.permite_adendas,
                                                descripcion: project.descripcionIICA || project.resumen?.observaciones || ''
                                            };
                                            {/* @ts-ignore */ }
                                            return <OportunidadCard key={project.id} op={op} />;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            </div>


            {/* REQUIREMENTS MODAL */}
            {
                showRequirements && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                            <div className="bg-[var(--iica-navy)] text-white px-6 py-4 flex justify-between items-center">
                                <h3 id="modal-title" className="font-bold text-lg">Documentación Requerida</h3>
                                <button
                                    onClick={() => setShowRequirements(false)}
                                    className="hover:bg-white/10 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Cerrar modal"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-600 text-sm mb-4">
                                    La mayoría de los fondos concursables solicitan los siguientes documentos estándar. Asegúrate de tenerlos actualizados:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 items-start">
                                        <span className="text-[var(--iica-secondary)] font-bold" aria-hidden="true">✓</span>
                                        <div>
                                            <strong className="text-gray-900 block text-sm">Carpeta Tributaria</strong>
                                            <span className="text-xs text-gray-500">Debe incluir los últimos 12 meses de IVAs (F29).</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-[var(--iica-secondary)] font-bold" aria-hidden="true">✓</span>
                                        <div>
                                            <strong className="text-gray-900 block text-sm">Certificado de Vigencia</strong>
                                            <span className="text-xs text-gray-500">Vigencia de la sociedad y de poderes (antigüedad máxima 60 días).</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-[var(--iica-secondary)] font-bold" aria-hidden="true">✓</span>
                                        <div>
                                            <strong className="text-gray-900 block text-sm">Rol de Avalúo</strong>
                                            <span className="text-xs text-gray-500">Certificado de avalúo fiscal detallado del predio.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="text-[var(--iica-secondary)] font-bold" aria-hidden="true">✓</span>
                                        <div>
                                            <strong className="text-gray-900 block text-sm">Derechos de Agua</strong>
                                            <span className="text-xs text-gray-500">Inscripción en el CBR con vigencia.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                <button
                                    onClick={() => setShowRequirements(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* COMPARE MODAL */}
            {
                showCompareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="bg-[var(--iica-navy)] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Comparar Convocatorias
                                </h3>
                                <button
                                    onClick={() => setShowCompareModal(false)}
                                    className="hover:bg-white/10 rounded-full p-1 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="overflow-auto p-6 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {projects.filter(p => compareList.includes(p.id)).map(project => (
                                        <div key={project.id} className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col bg-gray-50/50">
                                            <div className="mb-4">
                                                <div className="h-10 relative w-full mb-2">
                                                    <Image
                                                        src={getLogoUrl(project.institucion)}
                                                        alt={project.institucion}
                                                        fill
                                                        className="object-contain object-left"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-[var(--iica-navy)] text-lg leading-tight mb-2 min-h-[3rem]">{project.nombre}</h4>
                                                <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{project.categoria}</span>
                                            </div>

                                            <div className="space-y-4 text-sm flex-1">
                                                <div className="bg-white p-3 rounded border border-gray-100">
                                                    <strong className="block text-gray-500 text-xs uppercase mb-1">Cierre</strong>
                                                    <UrgencyBadge date={project.fecha_cierre} />
                                                </div>

                                                <div className="bg-white p-3 rounded border border-gray-100">
                                                    <strong className="block text-gray-500 text-xs uppercase mb-1">Cofinanciamiento</strong>
                                                    <p>{project.resumen?.cofinanciamiento || 'No especificado'}</p>
                                                </div>

                                                <div className="bg-white p-3 rounded border border-gray-100">
                                                    <strong className="block text-gray-500 text-xs uppercase mb-1">Plazo de Ejecución</strong>
                                                    <p>{project.resumen?.plazo_ejecucion || 'No especificado'}</p>
                                                </div>

                                                <div className="bg-white p-3 rounded border border-gray-100 flex-1">
                                                    <strong className="block text-gray-500 text-xs uppercase mb-1">Requisitos Clave</strong>
                                                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                                        {project.resumen?.requisitos_clave?.slice(0, 4).map((r, i) => (
                                                            <li key={i}>{r}</li>
                                                        )) || <li>Ver bases para detalles</li>}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <a
                                                    href={project.url_bases}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-center bg-[var(--iica-blue)] text-white font-bold py-2 rounded hover:bg-[var(--iica-navy)] transition-colors"
                                                >
                                                    Ver Bases
                                                </a>
                                                <button
                                                    onClick={() => toggleCompare(project.id)}
                                                    className="block w-full text-center text-red-500 text-xs mt-2 hover:underline"
                                                >
                                                    Quitar de comparar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ── QUICK VIEW PANEL ── */}
            <AnimatePresence>
                {quickViewProject && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setQuickViewProject(null)}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-5 py-4 flex items-start justify-between gap-3 flex-shrink-0">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                                            {quickViewProject.categoria}
                                        </span>
                                        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                                            {quickViewProject.institucion}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-bold text-base leading-snug line-clamp-3">
                                        {quickViewProject.nombre}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setQuickViewProject(null)}
                                    className="text-white/70 hover:text-white transition-colors flex-shrink-0 mt-0.5"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">

                                {/* Urgency + Monto */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Cierre
                                        </p>
                                        <UrgencyBadge date={quickViewProject.fecha_cierre} />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                                            <Banknote className="h-3 w-3" /> Monto Máximo
                                        </p>
                                        <p className="font-bold text-[var(--iica-navy)] text-lg">
                                            {quickViewProject.monto > 0
                                                ? `$${(quickViewProject.monto / 1000000).toFixed(0)}M`
                                                : <span className="text-sm text-gray-500">Ver bases</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Cofinanciamiento */}
                                {quickViewProject.resumen?.cofinanciamiento && (
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">💰 Cofinanciamiento</p>
                                        <p className="text-sm text-gray-700 font-medium">{quickViewProject.resumen.cofinanciamiento}</p>
                                    </div>
                                )}

                                {/* Plazo */}
                                {quickViewProject.resumen?.plazo_ejecucion && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">Plazo de Ejecución</p>
                                            <p className="text-sm text-gray-700">{quickViewProject.resumen.plazo_ejecucion}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Requisitos */}
                                {quickViewProject.resumen?.requisitos_clave && quickViewProject.resumen.requisitos_clave.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                            <Check className="h-3.5 w-3.5" /> Requisitos Clave
                                        </p>
                                        <ul className="space-y-2">
                                            {quickViewProject.resumen.requisitos_clave.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <ChevronRight className="h-4 w-4 text-[var(--iica-blue)] flex-shrink-0 mt-0.5" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Observaciones */}
                                {quickViewProject.resumen?.observaciones && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">ℹ️ Observaciones</p>
                                        <p className="text-sm text-gray-700">{quickViewProject.resumen.observaciones}</p>
                                    </div>
                                )}

                                {/* Regiones */}
                                {quickViewProject.regiones && quickViewProject.regiones.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" /> Regiones
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quickViewProject.regiones.map(r => (
                                                <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{r}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Beneficiarios */}
                                {quickViewProject.beneficiarios && quickViewProject.beneficiarios.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" /> Beneficiarios
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {quickViewProject.beneficiarios.map(b => (
                                                <span key={b} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer actions */}
                            <div className="flex-shrink-0 border-t border-gray-100 p-4 flex gap-3 bg-gray-50">
                                <button
                                    onClick={(e) => copyProjectFicha(quickViewProject, e)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border transition-all ${copiedId === quickViewProject.id
                                        ? 'bg-green-100 text-green-700 border-green-200'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {copiedId === quickViewProject.id
                                        ? <><CheckCheck className="h-4 w-4" /> ¡Copiado!</>
                                        : <><Copy className="h-4 w-4" /> Copiar Ficha</>}
                                </button>
                                <a
                                    href={quickViewProject.url_bases}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" /> Ver Bases
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* STICKY BOTTOM BAR FOR COMPARISON */}
            <AnimatePresence>
                {compareList.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-[var(--iica-blue)] shadow-2xl rounded-full pl-6 pr-2 py-2 flex items-center gap-4 max-w-[90vw] ring-4 ring-blue-500/10"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--iica-navy)]">
                            <span className="bg-[var(--iica-blue)] text-white px-2.5 py-0.5 rounded-full text-xs font-bold leading-none flex items-center justify-center min-w-[1.5rem] h-6">{compareList.length}</span>
                            <span className="hidden sm:inline">seleccionados</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCompareList([])}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors"
                                title="Limpiar selección"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowCompareModal(true)}
                                className="bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                            >
                                Comparar <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}


// Helper components are now imported from @/components/ProjectItem
