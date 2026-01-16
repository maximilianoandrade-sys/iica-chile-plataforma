'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Project } from "@/lib/data";
import { trackEvent, trackSearch } from "@/lib/analytics";
import { smartSearch } from "@/lib/searchEngine";
import counterparts from '@/lib/counterparts_raw.json';
import { getInstitutionalLogo } from "@/lib/logos";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ExternalLink, Calendar, AlertCircle, X, ChevronDown, Check, Info } from "lucide-react";

export default function ProjectList({ projects }: { projects: Project[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedRegion, setSelectedRegion] = useState('Todas');
    const [selectedBeneficiary, setSelectedBeneficiary] = useState('Todos');
    const [selectedCounterpart, setSelectedCounterpart] = useState('Todas');
    const [showRequirements, setShowRequirements] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);

    // Extract unique categories for the dropdown
    const categories = useMemo(() => {
        const cats = new Set(projects.map(p => p.categoria));
        return ['Todas', ...Array.from(cats)];
    }, [projects]);

    // Extract unique Regions (Flattening the arrays)
    const uniqueRegions = useMemo(() => {
        const allRegions = projects.flatMap(p => p.regiones || []);
        return Array.from(new Set(allRegions)).sort();
    }, [projects]);

    // Extract unique Beneficiaries
    const uniqueBeneficiaries = useMemo(() => {
        const allBen = projects.flatMap(p => p.beneficiarios || []);
        return Array.from(new Set(allBen)).sort();
    }, [projects]);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        trackEvent({
            action: 'filter_change',
            category: 'Projects',
            label: cat,
        });
    };

    const getLogoUrl = (institution: string) => {
        return getInstitutionalLogo(institution);
    };


    // Filter projects with SMART SEARCH
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Usar búsqueda inteligente con sinónimos y tolerancia a errores
            const searchableText = `${project.nombre} ${project.institucion} ${project.categoria} ${(project.regiones || []).join(' ')} ${(project.beneficiarios || []).join(' ')}`;
            const matchesSearch = smartSearch(searchTerm, searchableText);

            const matchesCategory = selectedCategory === 'Todas' || project.categoria === selectedCategory;

            // Advanced Filters
            const matchesRegion = selectedRegion === 'Todas' || (project.regiones && project.regiones.includes(selectedRegion));
            const matchesBeneficiary = selectedBeneficiary === 'Todos' || (project.beneficiarios && project.beneficiarios.includes(selectedBeneficiary));

            // Counterpart Filter (Institución) matching against counterpart names
            const matchesCounterpart = selectedCounterpart === 'Todas' || project.institucion === selectedCounterpart || project.institucion.includes(selectedCounterpart);

            return matchesSearch && matchesCategory && matchesRegion && matchesBeneficiary && matchesCounterpart;
        });
    }, [projects, searchTerm, selectedCategory, selectedRegion, selectedBeneficiary, selectedCounterpart]);

    // Track searches (especialmente las que no tienen resultados)
    useEffect(() => {
        if (searchTerm.trim()) {
            trackSearch(searchTerm, filteredProjects.length, {
                category: selectedCategory,
                region: selectedRegion,
                beneficiary: selectedBeneficiary,
                counterpart: selectedCounterpart
            });
        }
    }, [filteredProjects.length, searchTerm, selectedCategory, selectedRegion, selectedBeneficiary, selectedCounterpart]);

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

            {/* 2. SMART DASHBOARD HEADER (Search + Filters) */}
            <div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/50">
                <div className="flex flex-col gap-6">

                    {/* Search Bar */}
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            aria-label="Buscar convocatorias por nombre o institución"
                            placeholder="Buscar por nombre, palabra clave o institución..."
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none transition-shadow text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Contador de Resultados */}
                    <div className="text-sm text-gray-600">
                        Mostrando <strong className="text-[var(--iica-navy)]">{filteredProjects.length}</strong> de <strong>{projects.length}</strong> convocatorias
                        {searchTerm && (
                            <span className="ml-2 text-[var(--iica-cyan)]">
                                (búsqueda inteligente activa con sinónimos)
                            </span>
                        )}
                    </div>

                    {/* Filter Chips & Advanced Selects */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">

                        {/* 1. Category Chips */}
                        <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Filtros de categoría">
                            <span className="text-sm font-bold text-gray-700 mr-2 flex items-center gap-1">
                                <Filter className="h-4 w-4" /> Categoría:
                            </span>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    aria-pressed={selectedCategory === cat}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
                                        ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:block w-px h-8 bg-gray-300 mx-2"></div>

                        {/* 2. Advanced Filters (Region & User) */}
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">

                            {/* Region Filter */}
                            <div className="relative group">
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block w-full pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                                >
                                    <option value="Todas">Todas las Regiones</option>
                                    {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none group-hover:text-[var(--iica-blue)]" />
                            </div>

                            {/* Beneficiary Filter */}
                            <div className="relative group">
                                <select
                                    value={selectedBeneficiary}
                                    onChange={(e) => setSelectedBeneficiary(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block w-full pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                                >
                                    <option value="Todos">Todos los Perfiles</option>
                                    {uniqueBeneficiaries.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none group-hover:text-[var(--iica-blue)]" />
                            </div>

                            {/* Counterpart Filter */}
                            <div className="relative group w-full md:w-auto">
                                <select
                                    value={selectedCounterpart}
                                    onChange={(e) => setSelectedCounterpart(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block w-full pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                                    style={{ maxWidth: '250px' }}
                                >
                                    <option value="Todas">Todas las Instituciones</option>
                                    {Array.from(new Set([
                                        ...projects.map(p => p.institucion),
                                        ...counterparts.slice(0, 20).map(c => c.name)
                                    ])).sort().map(inst => (
                                        <option key={inst} value={inst}>{inst}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none group-hover:text-[var(--iica-blue)]" />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div>
                {filteredProjects.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No se encontraron resultados</h3>
                        <p className="text-gray-600 mb-6">No hay convocatorias que coincidan con tu búsqueda en este momento.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setSelectedRegion('Todas'); setSelectedBeneficiary('Todos'); setSelectedCounterpart('Todas'); }}
                            className="text-[var(--iica-cyan)] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] rounded px-2"
                        >

                            Limpiar filtros y ver todo
                        </button>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE VIEW (Visible only on Large screens) */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f4f7f9] text-gray-700 text-sm font-bold border-b border-[var(--iica-border)] uppercase tracking-wider">
                                        <th className="py-5 px-6">Proyecto</th>
                                        <th className="py-5 px-6">Institución</th>
                                        <th className="py-5 px-6">Cierre</th>
                                        <th className="py-5 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--iica-border)]">
                                    <AnimatePresence>
                                        {filteredProjects.map((project) => (
                                            <React.Fragment key={project.id}>
                                                <motion.tr
                                                    className="hover:bg-blue-50/40 transition-colors group"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex-1">
                                                                <div className="font-bold text-[var(--iica-navy)] text-base mb-1">{project.nombre}</div>
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
                                                            <img
                                                                src={getLogoUrl(project.institucion)}
                                                                alt={project.institucion}
                                                                className="w-8 h-8 rounded bg-white shadow-sm p-0.5 object-contain border border-gray-100"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
                                                            />
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
                                                        <td colSpan={4} className="px-6 py-4">
                                                            <div className="bg-white rounded-lg p-4 border border-blue-200">
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
                        <div className="lg:hidden divide-y divide-[var(--iica-border)]">
                            <AnimatePresence>
                                {filteredProjects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        className="p-5 flex flex-col gap-4 active:bg-blue-50/50 transition-colors"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={getLogoUrl(project.institucion)}
                                                    alt={project.institucion}
                                                    className="w-6 h-6 rounded bg-white object-contain border border-gray-100"
                                                />
                                                <span className="text-xs font-bold text-[var(--iica-secondary)] bg-green-50 px-2 py-1 rounded border border-green-100">
                                                    {project.institucion}
                                                </span>
                                            </div>
                                            <UrgencyBadge date={project.fecha_cierre} mobile />
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
                                                    {project.resumen.plazo_ejecucion && (
                                                        <div>
                                                            <strong className="text-gray-700 text-xs">⏱️ Plazo:</strong>
                                                            <p className="text-gray-600 text-xs mt-0.5">{project.resumen.plazo_ejecucion}</p>
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

                                        <div className="pt-2">
                                            <ActionButton
                                                url={project.url_bases}
                                                date={project.fecha_cierre}
                                                projectName={project.nombre}
                                                onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* REQUIREMENTS MODAL */}
            {showRequirements && (
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
            )}

        </div>
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
            aria-label={`Ver bases oficiales para ${projectName}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] px-4 py-2 rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--iica-blue)]"
        >
            Ver Bases Oficiales <ExternalLink className="h-4 w-4" aria-hidden="true" />
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">🔴 Cerrado</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-0.5">
            <div className={`flex items-center gap-1.5 ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                {!mobile && <Calendar className="h-4 w-4 text-gray-400" />}
                <span className="text-sm">
                    {isUrgent ? `¡Cierra en ${diffDays} días!` : new Date(date).toLocaleDateString('es-CL')}
                </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                🟢 Abierto
            </span>
        </div>
    );
}
