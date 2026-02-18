'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Info, ExternalLink, Calendar, AlertCircle, X, ChevronDown, Check, MessageCircle, Share2, ArrowRight } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { Project } from "@/lib/data";
import { getInstitutionalLogo } from "@/lib/logos";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLinkGuardian } from "@/lib/linkGuardian";
import { generateWhatsAppLink, downloadICSFile, generateGoogleCalendarLink } from "@/lib/ruralTools";
import Toast from "@/components/ui/Toast";

interface ProjectItemProps {
    project: Project;
    viewMode: 'table' | 'card';
}

export default function ProjectItem({ project, viewMode }: ProjectItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const { trackEvent } = useAnalytics();

    const getLogoUrl = (institution: string) => {
        return getInstitutionalLogo(institution);
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
        if (!expanded) {
            trackEvent('expand_project', 'Interaction', project.nombre);
        }
    };

    if (viewMode === 'table') {
        return (
            <React.Fragment>
                {toastMessage && (
                    <div className="fixed top-4 right-4 z-50">
                        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
                    </div>
                )}
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
                                    onClick={toggleExpand}
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
                            <div className="relative w-8 h-8 rounded bg-white shadow-sm p-0.5 border border-gray-100 overflow-hidden">
                                <Image
                                    src={getLogoUrl(project.institucion)}
                                    alt={project.institucion}
                                    fill
                                    className="object-contain"
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
                        <div className="flex items-center justify-end gap-2">
                            <Link
                                href={`/proyecto/${project.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--iica-blue)] hover:text-[var(--iica-navy)] transition-colors"
                                title="Ver página de detalle"
                            >
                                Detalle <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <ActionButton
                                url={project.url_bases}
                                date={project.fecha_cierre}
                                projectName={project.nombre}
                                onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                            />
                            <RuralTools project={project} />
                        </div>
                    </td>
                </motion.tr>

                <AnimatePresence>
                    {expanded && project.resumen && (
                        <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-50/30"
                        >
                            <td colSpan={4} className="px-6 py-4">
                                <ProjectSummary resumen={project.resumen} />
                            </td>
                        </motion.tr>
                    )}
                </AnimatePresence>
            </React.Fragment>
        );
    }

    // Card View (Mobile/Tablet)
    return (
        <React.Fragment>
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
                </div>
            )}
            <motion.div
                className="p-5 flex flex-col gap-4 active:bg-blue-50/50 transition-colors border-b border-[var(--iica-border)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded bg-white overflow-hidden border border-gray-100">
                            <Image
                                src={getLogoUrl(project.institucion)}
                                alt={project.institucion}
                                fill
                                className="object-contain"
                                sizes="24px"
                            />
                        </div>
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
                            onClick={toggleExpand}
                            className="text-[var(--iica-cyan)] hover:text-[var(--iica-blue)] transition-colors p-1 flex-shrink-0"
                            aria-label="Ver resumen ejecutivo"
                        >
                            <Info className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {expanded && project.resumen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-sm"
                        >
                            <ProjectSummary resumen={project.resumen} mobile />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-2 flex gap-2">
                    <Link
                        href={`/proyecto/${project.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[var(--iica-navy)] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
                    >
                        Ver Detalle <ArrowRight className="h-4 w-4" />
                    </Link>
                    <ActionButton
                        url={project.url_bases}
                        date={project.fecha_cierre}
                        projectName={project.nombre}
                        onTrack={() => setToastMessage("Redirigiendo a sitio oficial...")}
                    />
                </div>
            </motion.div>
        </React.Fragment>
    );
}

function ProjectSummary({ resumen, mobile = false }: { resumen: any, mobile?: boolean }) {
    return (
        <div className={mobile ? "space-y-2" : "bg-white rounded-lg p-4 border border-blue-200"}>
            {!mobile && <h4 className="font-bold text-[var(--iica-navy)] mb-3 flex items-center gap-2"><Info className="h-4 w-4" /> Resumen Ejecutivo</h4>}

            <div className={mobile ? "" : "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"}>
                {resumen.cofinanciamiento && (
                    <div>
                        <strong className="text-gray-700 text-xs md:text-sm">{mobile ? '💰 Cofinanciamiento:' : '💰 Cofinanciamiento:'}</strong>
                        <p className={`text-gray-600 ${mobile ? 'text-xs mt-0.5' : 'mt-1'}`}>{resumen.cofinanciamiento}</p>
                    </div>
                )}
                {resumen.plazo_ejecucion && (
                    <div>
                        <strong className="text-gray-700 text-xs md:text-sm">{mobile ? '⏱️ Plazo:' : '⏱️ Plazo de Ejecución:'}</strong>
                        <p className={`text-gray-600 ${mobile ? 'text-xs mt-0.5' : 'mt-1'}`}>{resumen.plazo_ejecucion}</p>
                    </div>
                )}
                {resumen.requisitos_clave && resumen.requisitos_clave.length > 0 && (
                    <div className={!mobile ? "md:col-span-2" : ""}>
                        <strong className="text-gray-700 text-xs md:text-sm">{mobile ? '📋 Requisitos:' : '📋 Requisitos Clave:'}</strong>
                        <ul className={`list-disc list-inside text-gray-600 ${mobile ? 'text-xs mt-0.5 space-y-0.5' : 'mt-1 space-y-1'}`}>
                            {resumen.requisitos_clave.map((req: string, idx: number) => (
                                <li key={idx}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {!mobile && resumen.observaciones && (
                    <div className="md:col-span-2">
                        <strong className="text-gray-700">ℹ️ Observaciones:</strong>
                        <p className="text-gray-600 mt-1">{resumen.observaciones}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionButton({ url, date, projectName, onTrack }: { url: string, date: string, projectName: string, onTrack?: () => void }) {
    const { trackEvent } = useAnalytics();
    const { linkStatus, shouldShow, finalUrl, isFallback } = useLinkGuardian(url, projectName);

    const today = new Date();
    const closingDate = new Date(date);
    const isClosed = closingDate.getTime() < today.setHours(0, 0, 0, 0);

    const handleClick = () => {
        trackEvent('click_outbound_link', 'Outbound', `Bases: ${projectName}${isFallback ? ' (Fallback)' : ''}`);
        if (onTrack) onTrack();
    };

    // Si está cerrado, mostrar botón deshabilitado
    if (isClosed) {
        return (
            <button disabled className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded cursor-not-allowed">
                Cerrado <X className="h-4 w-4" aria-hidden="true" />
            </button>
        );
    }

    // Si el guardián determinó que debe ocultarse, no mostrar nada
    if (!shouldShow) {
        return null;
    }

    // Mostrar botón con la URL final (original o fallback)
    return (
        <a
            href={finalUrl || url}
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
    today.setHours(0, 0, 0, 0);
    const isExpired = targetDate.getTime() < today.getTime();
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

// Componente de Herramientas Rurales
function RuralTools({ project }: { project: Project }) {
    const { trackEvent } = useAnalytics();
    const [showMenu, setShowMenu] = useState(false);

    const handleWhatsApp = () => {
        const link = generateWhatsAppLink(project);
        window.open(link, '_blank');
        trackEvent('share_whatsapp', 'Share', project.nombre);
        setShowMenu(false);
    };

    const handleCalendar = () => {
        downloadICSFile(project);
        trackEvent('add_to_calendar', 'Calendar', project.nombre);
        setShowMenu(false);
    };

    const handleGoogleCalendar = () => {
        const link = generateGoogleCalendarLink(project);
        window.open(link, '_blank');
        trackEvent('add_to_google_calendar', 'Calendar', project.nombre);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                aria-label="Herramientas adicionales"
                title="Compartir y recordatorios"
            >
                <Share2 className="h-4 w-4" />
            </button>

            <AnimatePresence>
                {showMenu && (
                    <>
                        {/* Overlay para cerrar */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />

                        {/* Menú */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20"
                        >
                            <button
                                onClick={handleWhatsApp}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <MessageCircle className="h-4 w-4 text-green-600" />
                                <span>Compartir por WhatsApp</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={handleCalendar}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>Descargar .ics</span>
                            </button>

                            <button
                                onClick={handleGoogleCalendar}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span>Google Calendar</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
