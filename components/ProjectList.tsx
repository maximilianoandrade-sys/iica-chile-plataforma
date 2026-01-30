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
import { Search, Filter, ExternalLink, Calendar, AlertCircle, X, ChevronDown, Check, Info } from "lucide-react";

export default function ProjectList({ projects }: { projects: Project[] }) {
    // State for client-side interactions
    const [selectedAgrovoc, setSelectedAgrovoc] = useState('Cualquiera');
    const [showAgrovoc, setShowAgrovoc] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);

    // New Features State
    const [favorites, setFavorites] = useState<number[]>([]);
    const [compareList, setCompareList] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

        return filtered;
    }, [projects, selectedAgrovoc, showFavoritesOnly, favorites]);

    // Helper for Closing Soon
    const isClosingSoon = (dateStr: string) => {
        if (!dateStr) return false;
        const today = new Date();
        const closeDate = new Date(dateStr);
        const diffTime = closeDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
    };

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
                                    <tbody className="divide-y divide-[var(--iica-border)]">
                                        <AnimatePresence>
                                            {displayedProjects.map((project) => (
                                                <React.Fragment key={project.id}>
                                                    <motion.tr
                                                        className={`hover:bg-blue-50/40 transition-colors group ${compareList.includes(project.id) ? 'bg-blue-50/30' : ''}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <td className="py-5 px-6 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={compareList.includes(project.id)}
                                                                onChange={() => toggleCompare(project.id)}
                                                                className="w-4 h-4 text-[var(--iica-blue)] border-gray-300 rounded focus:ring-[var(--iica-blue)] cursor-pointer"
                                                                title="Comparar este proyecto"
                                                            />
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-start gap-2">
                                                                {/* Heart Button Desktop */}
                                                                <button
                                                                    onClick={() => toggleFavorite(project.id)}
                                                                    className="mt-1 text-gray-300 hover:text-red-500 focus:outline-none transition-colors"
                                                                    title={favorites.includes(project.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24"
                                                                        fill={favorites.includes(project.id) ? "#ef4444" : "none"}
                                                                        stroke="currentColor"
                                                                        className={`w-5 h-5 ${favorites.includes(project.id) ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                </button>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className="font-bold text-[var(--iica-navy)] text-base">{project.nombre}</div>
                                                                        {isClosingSoon(project.fecha_cierre) && (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                                                                                Cierra Pronto
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                        {project.categoria}
                                                                    </span>
                                                                </div>
                                                                {project.resumen && (
                                                                    <button
                                                                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                                                                        className="text-[var(--iica-cyan)] hover:text-[var(--iica-blue)] transition-colors p-1"
                                                                        aria-label="Ver resumen ejecutivo"
                                                                    >
                                                                        <Info className="h-5 w-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative w-8 h-8 flex-shrink-0">
                                                                    <Image
                                                                        src={getLogoUrl(project.institucion)}
                                                                        alt={project.institucion}
                                                                        fill
                                                                        className="rounded bg-white shadow-sm p-0.5 object-contain border border-gray-100"
                                                                        sizes="32px"
                                                                    />
                                                                </div>
                                                                <span className="font-bold text-gray-700">{project.institucion}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <UrgencyBadge date={project.fecha_cierre} />
                                                        </td>
                                                        <td className="py-5 px-6 text-right">
                                                            <ActionButton
                                                                url={project.url_bases}
                                                                date={project.fecha_cierre}
                                                                projectName={project.nombre}
                                                                onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                                                            />
                                                        </td>
                                                    </motion.tr>

                                                    {/* Fila expandible con resumen ejecutivo */}
                                                    {expandedProject === project.id && project.resumen && (
                                                        <motion.tr
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-blue-50/30"
                                                        >
                                                            <td colSpan={5} className="px-6 py-4">
                                                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-inner">
                                                                    <h4 className="font-bold text-[var(--iica-navy)] mb-3 flex items-center gap-2">
                                                                        <Info className="h-4 w-4" />
                                                                        Resumen Ejecutivo
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        {project.resumen.cofinanciamiento && (
                                                                            <div>
                                                                                <strong className="text-gray-700">💰 Cofinanciamiento:</strong>
                                                                                <p className="text-gray-600 mt-1">{project.resumen.cofinanciamiento}</p>
                                                                            </div>
                                                                        )}
                                                                        {project.resumen.plazo_ejecucion && (
                                                                            <div>
                                                                                <strong className="text-gray-700">⏱️ Plazo de Ejecución:</strong>
                                                                                <p className="text-gray-600 mt-1">{project.resumen.plazo_ejecucion}</p>
                                                                            </div>
                                                                        )}
                                                                        {project.resumen.requisitos_clave && project.resumen.requisitos_clave.length > 0 && (
                                                                            <div className="md:col-span-2">
                                                                                <strong className="text-gray-700">📋 Requisitos Clave:</strong>
                                                                                <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                                                                                    {project.resumen.requisitos_clave.map((req, idx) => (
                                                                                        <li key={idx}>{req}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        {project.resumen.observaciones && (
                                                                            <div className="md:col-span-2">
                                                                                <strong className="text-gray-700">ℹ️ Observaciones:</strong>
                                                                                <p className="text-gray-600 mt-1">{project.resumen.observaciones}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE/TABLET CARD VIEW (Visible on screens smaller than Large) */}
                            <div className="lg:hidden min-h-[400px] flex flex-col gap-2">
                                <AnimatePresence>
                                    {displayedProjects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            className={`p-5 flex flex-col gap-4 mb-4 rounded-xl border shadow-sm ${compareList.includes(project.id) ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'} active:scale-[0.99] transition-all`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    {/* Checkbox Mobile */}
                                                    <input
                                                        type="checkbox"
                                                        checked={compareList.includes(project.id)}
                                                        onChange={() => toggleCompare(project.id)}
                                                        className="w-5 h-5 text-[var(--iica-blue)] border-gray-300 rounded focus:ring-[var(--iica-blue)]"
                                                    />

                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                        <Image
                                                            src={getLogoUrl(project.institucion)}
                                                            alt={project.institucion}
                                                            fill
                                                            className="rounded bg-white object-contain border border-gray-100"
                                                            sizes="32px"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleFavorite(project.id)}
                                                    className="p-1 focus:outline-none"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill={favorites.includes(project.id) ? "#ef4444" : "none"}
                                                        stroke="currentColor"
                                                        className={`w-6 h-6 ${favorites.includes(project.id) ? 'text-red-500' : 'text-gray-300'}`}
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-[var(--iica-secondary)] bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                        {project.institucion}
                                                    </span>
                                                    {isClosingSoon(project.fecha_cierre) && (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                                                            ¡Cierra Pronto!
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <h3 className="font-bold text-lg text-[var(--iica-navy)] leading-snug flex-1">
                                                        {project.nombre}
                                                    </h3>
                                                    {project.resumen && (
                                                        <button
                                                            onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                                                            className="text-[var(--iica-cyan)] hover:text-[var(--iica-blue)] transition-colors p-1 flex-shrink-0"
                                                            aria-label="Ver resumen ejecutivo"
                                                        >
                                                            <Info className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Resumen ejecutivo expandible (móvil) */}
                                            {expandedProject === project.id && project.resumen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-sm"
                                                >
                                                    <h4 className="font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-1 text-sm">
                                                        <Info className="h-3 w-3" />
                                                        Resumen Ejecutivo
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {project.resumen.cofinanciamiento && (
                                                            <div>
                                                                <strong className="text-gray-700 text-xs">💰 Cofinanciamiento:</strong>
                                                                <p className="text-gray-600 text-xs mt-0.5">{project.resumen.cofinanciamiento}</p>
                                                            </div>
                                                        )}
                                                        {project.resumen.requisitos_clave && project.resumen.requisitos_clave.length > 0 && (
                                                            <div>
                                                                <strong className="text-gray-700 text-xs">📋 Requisitos:</strong>
                                                                <ul className="list-disc list-inside text-gray-600 text-xs mt-0.5 space-y-0.5">
                                                                    {project.resumen.requisitos_clave.slice(0, 3).map((req, idx) => (
                                                                        <li key={idx}>{req}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="flex justify-between items-center pt-2">
                                                <UrgencyBadge date={project.fecha_cierre} mobile />
                                                <div className="w-1/2">
                                                    <ActionButton
                                                        url={project.url_bases}
                                                        date={project.fecha_cierre}
                                                        projectName={project.nombre}
                                                        onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                                                    />
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
