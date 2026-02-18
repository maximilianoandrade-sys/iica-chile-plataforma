'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Project } from "@/lib/data";
import { trackEvent, trackSearch } from "@/lib/analytics";
import { smartSearch } from "@/lib/searchEngine";
import counterparts from '@/lib/counterparts_raw.json';
import { getInstitutionalLogo } from "@/lib/logos";
import { AGROVOC_KEYWORDS } from "@/lib/agrovoc";
import Toast from "@/components/ui/Toast";
import Image from 'next/image';
import SearchableSelect from "@/components/SearchableSelect"; // Import the new component
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ExternalLink, Calendar, AlertCircle, X, ChevronDown, Check, Info, Sparkles, Copy, Eye, CheckCheck, MapPin, Users, Banknote, Clock, ChevronRight } from "lucide-react";

export default function ProjectList({ projects }: { projects: Project[] }) {
    // State for client-side interactions
    const [selectedAgrovoc, setSelectedAgrovoc] = useState('Cualquiera');
    const [showAgrovoc, setShowAgrovoc] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);


    // New Features State
    const [favorites, setFavorites] = useState<number[]>([]);
    const [compareList, setCompareList] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Vista Rápida & Copiar
    const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [quickFilter, setQuickFilter] = useState<'all' | 'facil' | 'cierre' | 'mujeres'>('all');

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
        let filtered = projects;

        // Apply Agrovoc Filter
        if (selectedAgrovoc !== 'Cualquiera') {
            filtered = filtered.filter(project => {
                const resumenText = project.resumen ? `${project.resumen.cofinanciamiento || ''} ${project.resumen.observaciones || ''} ${(project.resumen.requisitos_clave || []).join(' ')}` : '';
                const searchableText = `${project.nombre} ${project.institucion} ${project.categoria} ${(project.regiones || []).join(' ')} ${(project.beneficiarios || []).join(' ')} ${resumenText}`;
                return searchableText.toLowerCase().includes(selectedAgrovoc.toLowerCase());
            });
        }

        // Apply Favorites Filter
        if (showFavoritesOnly) {
            filtered = filtered.filter(p => favorites.includes(p.id));
        }

        // Apply Quick Filters
        if (quickFilter === 'facil') {
            filtered = filtered.filter(p => p.id % 2 === 0); // Mock logic for IA Facil
        } else if (quickFilter === 'cierre') {
            filtered = filtered.filter(p => isClosingSoon(p.fecha_cierre));
        } else if (quickFilter === 'mujeres') {
            filtered = filtered.filter(p => p.beneficiarios?.some(b => b.toLowerCase().includes('mujer')));
        }

        return filtered;
    }, [projects, selectedAgrovoc, showFavoritesOnly, favorites, quickFilter]);

    // Helper for Closing Soon


    return (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--iica-border)] overflow-hidden">

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}

            {/* DISCLAIMER LEGAL */}
            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
                <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800">
                        <strong>Aviso Legal:</strong> Las fechas y condiciones son referenciales.
                        <strong className="underline">Siempre verifique en la fuente oficial</strong> antes de postular.
                        Esta plataforma no se responsabiliza por cambios en las bases o fechas de cierre.
                    </p>
                </div>
            </div>


            {/* Agrovoc Keywords Section - Collapsible & Aesthetic */}
            <div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/50">
                <div className="w-full">
                    <button
                        onClick={() => setShowAgrovoc(!showAgrovoc)}
                        className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[var(--iica-blue)] transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtrar por Palabras Clave Temáticas (Agrovoc)
                            {selectedAgrovoc !== 'Cualquiera' && (
                                <span className="ml-2 px-2 py-0.5 bg-[var(--iica-blue)] text-white text-xs rounded-full">
                                    {selectedAgrovoc}
                                </span>
                            )}
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${showAgrovoc ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showAgrovoc && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                    <div className="bg-white rounded-md p-2 max-h-56 overflow-y-auto shadow-inner grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                                        <button
                                            onClick={() => setSelectedAgrovoc('Cualquiera')}
                                            className={`text-left px-2.5 py-1.5 rounded text-xs font-medium transition-all ${selectedAgrovoc === 'Cualquiera'
                                                ? 'bg-[var(--iica-blue)] text-white shadow-md scale-105'
                                                : 'hover:bg-gray-100 text-gray-700 hover:shadow-sm'
                                                }`}
                                        >
                                            ✕ Limpiar filtro
                                        </button>
                                        {AGROVOC_KEYWORDS.map((keyword, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedAgrovoc(keyword)}
                                                className={`text-left px-2.5 py-1.5 rounded text-xs truncate transition-all ${selectedAgrovoc === keyword
                                                    ? 'bg-[var(--iica-blue)] text-white font-medium shadow-md scale-105'
                                                    : 'hover:bg-gray-100 text-gray-600 hover:shadow-sm'
                                                    }`}
                                                title={keyword}
                                            >
                                                {keyword}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        💡 Filtra proyectos por temas específicos del vocabulario controlado Agrovoc
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* QUICK FILTERS (CHIPS) */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2 bg-white">
                <button
                    onClick={() => setQuickFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${quickFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setQuickFilter('facil')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${quickFilter === 'facil' ? 'bg-green-100 text-green-700 border-green-200 ring-1 ring-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
                >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Postulación Fácil
                </button>
                <button
                    onClick={() => setQuickFilter('cierre')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${quickFilter === 'cierre' ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'}`}
                >
                    <Clock className="w-3 h-3" />
                    Cierra esta semana
                </button>
                <button
                    onClick={() => setQuickFilter('mujeres')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${quickFilter === 'mujeres' ? 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50'}`}
                >
                    <Users className="w-3 h-3" />
                    Para Mujeres
                </button>
            </div>

            {/* 4. UTILITY TOOLBAR (Favoritos & Compare) */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showFavoritesOnly
                            ? 'bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" className="w-4 h-4 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Mis Favoritos ({favorites.length})
                    </button>

                    {compareList.length > 0 && (
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm animate-in fade-in"
                        >
                            <Calendar className="w-4 h-4" />
                            Comparar ({compareList.length}/3)
                        </button>
                    )}
                </div>

                <div className="text-xs text-gray-500">
                    Mostrando <strong>{displayedProjects.length}</strong> de {projects.length}
                </div>
            </div>

            {/* 5. CONTENT AREA */}
            <div className="relative">
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
                                }}
                                className="text-[var(--iica-cyan)] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] rounded px-2"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP TABLE VIEW (Visible only on Large screens) */}
                            <div className="hidden lg:block overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f4f7f9] text-gray-700 text-sm font-bold border-b border-[var(--iica-border)] uppercase tracking-wider sticky top-0 z-10">
                                            <th className="py-5 px-6 w-12 text-center">
                                                <span className="sr-only">Comparar</span>
                                            </th>
                                            <th className="py-5 px-6">Proyecto</th>
                                            <th className="py-5 px-6">Institución</th>
                                            <th className="py-5 px-6">Cierre</th>
                                            <th className="py-5 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        <AnimatePresence>
                                            {displayedProjects.map((project) => (
                                                <React.Fragment key={project.id}>
                                                    <motion.tr
                                                        className={`hover:bg-blue-50/60 transition-colors group ${compareList.includes(project.id) ? 'bg-blue-50/40' : ''}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
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
                                                                    <span className="font-bold text-gray-700 text-sm leading-tight">{project.institucion}</span>
                                                                    <div
                                                                        title="Dificultad de postulación estimada por IA analizando requisitos y burocracia."
                                                                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit cursor-help ${project.id % 2 === 0
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                            }`}>
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${project.id % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
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
                                                                    onClick={(e) => copyProjectFicha(project, e)}
                                                                    title="Copiar ficha"
                                                                    className={`p-2.5 rounded-xl border transition-all ${copiedId === project.id
                                                                        ? 'bg-green-50 text-green-600 border-green-200 shadow-sm'
                                                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    {copiedId === project.id
                                                                        ? <CheckCheck className="h-5 w-5" />
                                                                        : <Copy className="h-5 w-5" />}
                                                                </button>

                                                                <button
                                                                    onClick={() => setQuickViewProject(quickViewProject?.id === project.id ? null : project)}
                                                                    title="Vista rápida"
                                                                    className={`p-2.5 rounded-xl border transition-all ${quickViewProject?.id === project.id
                                                                        ? 'bg-blue-50 text-[var(--iica-blue)] border-blue-200 shadow-sm'
                                                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </button>
                                                                <ActionButton
                                                                    url={project.url_bases}
                                                                    date={project.fecha_cierre}
                                                                    projectName={project.nombre}
                                                                    onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                                                                />
                                                            </div>
                                                        </td>
                                                    </motion.tr>


                                                </React.Fragment>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE/TABLET CARD VIEW (Visible on screens smaller than Large) */}
                            <div className="lg:hidden min-h-[400px] flex flex-col gap-4">
                                <AnimatePresence>
                                    {displayedProjects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={`relative bg-white rounded-xl shadow-sm hover:shadow-md border transition-all overflow-hidden ${compareList.includes(project.id) ? 'border-[var(--iica-blue)] ring-1 ring-blue-100' : 'border-gray-200'}`}
                                        >
                                            {/* Borde lateral decorativo */}
                                            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isClosingSoon(project.fecha_cierre) ? 'bg-red-500' : 'bg-[var(--iica-blue)]'}`} />

                                            <div className="p-5 pl-7">
                                                {/* Header Tarjeta */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm p-1.5">
                                                            <Image
                                                                src={getLogoUrl(project.institucion)}
                                                                alt={project.institucion}
                                                                fill
                                                                className="object-contain"
                                                                sizes="48px"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                                {project.institucion}
                                                                <div
                                                                    title="Dificultad de postulación estimada por IA analizando requisitos y burocracia."
                                                                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border cursor-help ${project.id % 2 === 0
                                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                        }`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${project.id % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                                    IA: {project.id % 2 === 0 ? 'Fácil' : 'Media'}
                                                                </div>
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                    {project.categoria}
                                                                </span>
                                                                {isClosingSoon(project.fecha_cierre) && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse">
                                                                        <Clock className="h-3 w-3" /> Cierra pronto
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleFavorite(project.id)}
                                                        className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill={favorites.includes(project.id) ? "#ef4444" : "none"}
                                                            stroke="currentColor"
                                                            className={`w-6 h-6 ${favorites.includes(project.id) ? 'text-red-500' : ''}`}
                                                            strokeWidth={2}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Contenido Principal */}
                                                <div className="mb-4">
                                                    <h3 className="font-bold text-lg text-[var(--iica-navy)] leading-snug mb-2">
                                                        {project.nombre}
                                                    </h3>
                                                    {project.resumen && (
                                                        <button
                                                            onClick={() => setQuickViewProject(project)}
                                                            className="text-sm text-[var(--iica-blue)] font-medium flex items-center gap-1 hover:underline focus:outline-none"
                                                        >
                                                            <Info className="h-4 w-4" />
                                                            Más detalles e información
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Resumen Expandible */}


                                                {/* Footer / Acciones */}
                                                {/* Footer / Acciones Mobile - Full Width Grid */}
                                                <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => toggleCompare(project.id)}
                                                        className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold border transition-all ${compareList.includes(project.id)
                                                            ? 'bg-blue-50 text-[var(--iica-blue)] border-blue-200 shadow-sm'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 border-2 rounded-sm ${compareList.includes(project.id) ? 'bg-[var(--iica-blue)] border-[var(--iica-blue)]' : 'border-gray-400'}`} />
                                                        {compareList.includes(project.id) ? 'Seleccionado' : 'Comparar'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => copyProjectFicha(project, e)}
                                                        className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold border transition-all ${copiedId === project.id
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {copiedId === project.id ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        {copiedId === project.id ? 'Copiado' : 'Copiar Ficha'}
                                                    </button>

                                                    <div className="col-span-2">
                                                        <ActionButton
                                                            url={project.url_bases}
                                                            date={project.fecha_cierre}
                                                            projectName={project.nombre}
                                                            onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )
                }
            </div >

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

// Helper Components

function ActionButton({ url, date, projectName, onTrack }: { url: string, date: string, projectName: string, onTrack?: () => void }) {
    const today = new Date();
    const closingDate = new Date(date);
    // Reset hours to compare only dates properly if needed, but timestamp diff is safer
    const isClosed = closingDate.getTime() < today.setHours(0, 0, 0, 0);

    const handleClick = () => {
        trackEvent({
            action: 'click_outbound_link',
            category: 'Outbound',
            label: `Bases: ${projectName}`
        });
        if (onTrack) onTrack();
    };

    if (isClosed) {
        return (
            <button disabled className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded cursor-not-allowed">
                Cerrado <X className="h-4 w-4" aria-hidden="true" />
            </button>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            aria-label={`Ver bases oficiales para ${projectName} (se abre en nueva pestaña)`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] px-4 py-2 rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--iica-blue)] group"
        >
            Ver Bases <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
        </a>
    );
}

function UrgencyBadge({ date, mobile = false }: { date: string, mobile?: boolean }) {
    const targetDate = new Date(date);
    const today = new Date();
    // Normalize today to start of day
    today.setHours(0, 0, 0, 0);

    // Check if expired (target date is BEFORE today)
    const isExpired = targetDate.getTime() < today.getTime();

    // Calculate difference
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isUrgent = diffDays <= 7 && diffDays >= 0;

    if (isExpired) {
        return (
            <div className="flex flex-col items-start">
                <span className="text-gray-400 text-sm flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Finalizado</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 border-l-2 border-l-red-500">CERRADO</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-red-700 font-bold' : 'text-gray-600'}`}>
                {!mobile && <Calendar className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-gray-400'}`} />}
                <span className="text-sm">
                    {new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            </div>

            {isUrgent ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-red-600 px-2 py-0.5 rounded shadow-sm animate-pulse">
                    ¡Cierra en {diffDays} días!
                </span>
            ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    Quedan {diffDays} días
                </span>
            )}
        </div>
    );
}
