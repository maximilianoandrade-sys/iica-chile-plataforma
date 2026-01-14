
'use client';

import React, { useState, useMemo } from 'react';
import { mockProjects, Project } from '@/lib/mock-data';
import { Calendar, DollarSign, ExternalLink, Search, Filter, AlertCircle, X } from 'lucide-react';

export function ProjectList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [showRequirements, setShowRequirements] = useState(false);

    // Extract unique categories for the dropdown
    const categories = useMemo(() => {
        const cats = new Set(mockProjects.map(p => p.categoria));
        return ['Todas', ...Array.from(cats)];
    }, []);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return mockProjects.filter(project => {
            const matchesSearch =
                project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.institucion.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'Todas' || project.categoria === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--iica-border)] overflow-hidden">

            {/* 2. SMART DASHBOARD HEADER (Search + Filters) */}
            <div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/50">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o institución..."
                            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-auto flex items-center gap-3">
                        <Filter className="h-5 w-5 text-gray-400 hidden md:block" />
                        <select
                            className="w-full md:w-48 py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none bg-white cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div>
                {filteredProjects.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No se encontraron proyectos con estos filtros.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
                            className="mt-4 text-[var(--iica-cyan)] hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f4f7f9] text-gray-600 text-sm font-semibold border-b border-[var(--iica-border)]">
                                        <th className="py-4 px-6">Proyecto</th>
                                        <th className="py-4 px-6">Institución</th>
                                        <th className="py-4 px-6">Cierre</th>
                                        <th className="py-4 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--iica-border)]">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-[var(--iica-navy)]">{project.nombre}</div>
                                                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                    {project.categoria}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-700">{project.institucion}</td>
                                            <td className="py-4 px-6">
                                                <UrgencyBadge date={project.fecha_cierre} />
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <ActionButton url={project.url_bases} date={project.fecha_cierre} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden divide-y divide-[var(--iica-border)]">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-[var(--iica-secondary)] bg-green-50 px-2 py-1 rounded">
                                            {project.institucion}
                                        </span>
                                        <UrgencyBadge date={project.fecha_cierre} mobile />
                                    </div>

                                    <h3 className="font-bold text-lg text-[var(--iica-navy)] leading-snug mb-2">
                                        {project.nombre}
                                    </h3>

                                    <div className="pt-2 flex justify-end items-center">
                                        <ActionButton url={project.url_bases} date={project.fecha_cierre} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* REQUIREMENTS MODAL */}
            {showRequirements && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[var(--iica-navy)] text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Documentación Requerida</h3>
                            <button
                                onClick={() => setShowRequirements(false)}
                                className="hover:bg-white/10 rounded-full p-1 transition-colors"
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
                                    <span className="text-[var(--iica-secondary)] font-bold">✓</span>
                                    <div>
                                        <strong className="text-gray-900 block text-sm">Carpeta Tributaria</strong>
                                        <span className="text-xs text-gray-500">Debe incluir los últimos 12 meses de IVAs (F29).</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-[var(--iica-secondary)] font-bold">✓</span>
                                    <div>
                                        <strong className="text-gray-900 block text-sm">Certificado de Vigencia</strong>
                                        <span className="text-xs text-gray-500">Vigencia de la sociedad y de poderes (antigüedad máxima 60 días).</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-[var(--iica-secondary)] font-bold">✓</span>
                                    <div>
                                        <strong className="text-gray-900 block text-sm">Rol de Avalúo</strong>
                                        <span className="text-xs text-gray-500">Certificado de avalúo fiscal detallado del predio.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-[var(--iica-secondary)] font-bold">✓</span>
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
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors text-sm"
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

function ActionButton({ url, date }: { url: string, date: string }) {
    const today = new Date();
    const closingDate = new Date(date);
    // Reset hours to compare only dates properly if needed, but timestamp diff is safer
    const isClosed = closingDate.getTime() < today.setHours(0, 0, 0, 0);

    if (isClosed) {
        return (
            <button disabled className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded cursor-not-allowed">
                Cerrado <X className="h-4 w-4" />
            </button>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[var(--iica-cyan)] hover:bg-[#008ec2] px-4 py-2 rounded transition-colors shadow-sm"
        >
            Ver Bases Oficiales <ExternalLink className="h-4 w-4" />
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
