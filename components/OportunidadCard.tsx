import React, { useState } from 'react';
import { InstitutionLogo } from "./InstitutionLogo";
import { addPipelineTask } from "@/lib/pipelineManager";
import {
    CheckCircle2, ChevronRight, Clock, MapPin, Zap, Info, Calendar, FileText,
    Award, LayoutDashboard, Copy, CheckCheck, Globe, Navigation, Search,
    ChevronDown, X, Users, Target, ListChecks, Banknote, Building2, UserCheck
} from "lucide-react";

export interface Oportunidad {
    id: string;
    nombre: string;
    institucion: string;
    cierre: string;
    diasRestantes: number;
    rolIICA?: string;
    url: string;
    adenda?: boolean;
    descripcion?: string;
    monto?: string;
    categoria?: string;
    ambito?: "Internacional" | "Nacional" | "Regional";
    // Campos adicionales para modal de detalle
    objetivo?: string;
    requisitos?: string[];
    fortalezas?: string[];
    region?: string;
    responsable?: string;
    complejidad?: string;
    viabilidad?: string;
    beneficiarios?: string[];
    plazoMeses?: number;
    requiereCofinanciamiento?: boolean;
    requisitosClave?: string[];
    cofinanciamiento?: string;
}

export interface OportunidadCardProps {
    op: Oportunidad;
    query?: string;
}

export function OportunidadCard({ op, query = "" }: OportunidadCardProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const isImminent = op.diasRestantes <= 7;
    const isClosed = op.diasRestantes < 0;

    const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark> : part
                )}
            </span>
        );
    };

    const colorDias = isClosed ? 'text-slate-400' : isImminent ? 'text-rose-600 font-black animate-pulse' :
        op.diasRestantes <= 20 ? 'text-amber-600' : 'text-emerald-600';

    const urgencyBadge = () => {
        if (isClosed) return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">🚫 Cerrada</span>;
        if (isImminent) return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">⚠️ Cierra en {op.diasRestantes}d</span>;
        if (op.diasRestantes <= 30) return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">🕐 {op.diasRestantes} días</span>;
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">✅ {op.diasRestantes} días</span>;
    };

    const viabilidadColor = () => {
        if (op.viabilidad === 'Alta') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (op.viabilidad === 'Media') return 'text-amber-700 bg-amber-50 border-amber-200';
        if (op.viabilidad === 'Baja') return 'text-rose-700 bg-rose-50 border-rose-200';
        return 'text-slate-500 bg-slate-50 border-slate-200';
    };

    const complejidadColor = () => {
        if (op.complejidad === 'Fácil') return 'text-emerald-700 bg-emerald-50';
        if (op.complejidad === 'Media') return 'text-blue-700 bg-blue-50';
        if (op.complejidad === 'Alta') return 'text-purple-700 bg-purple-50';
        return 'text-slate-500 bg-slate-50';
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        const texto = `📋 ${op.nombre}\n🏛️ ${op.institucion}\n📅 Cierre: ${op.cierre}\n🔗 Bases: ${op.url}`;
        navigator.clipboard.writeText(texto);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addToPipeline = (e: React.MouseEvent) => {
        e.preventDefault();
        const newTask = {
            id: op.id,
            project: {
                id: op.id,
                nombre: op.nombre,
                institucion: op.institucion,
                fecha_cierre: op.cierre.split('-').reverse().join('-'),
                url_bases: op.url,
                monto: 0,
                categoria: op.categoria || 'Nacional'
            },
            column: 'identificacion',
            priority: op.diasRestantes <= 7 ? 'Alta' : 'Media',
            responsible: 'Pendiente Asignar',
            checklist: [
                { id: '1', text: 'Análisis de bases', completed: true },
                { id: '2', text: 'Validación técnica', completed: false },
                { id: '3', text: 'Cálculo de presupuesto', completed: false },
                { id: '4', text: 'Aprobación Representación', completed: false },
            ],
            lastUpdate: new Date().toISOString()
        };
        const success = addPipelineTask(newTask);
        if (success) {
            alert('🚀 Proyecto enviado al Pipeline de Gestión IICA.');
        } else {
            alert('Este proyecto ya está en tu pipeline institucional.');
        }
    };

    const hasModalData = op.objetivo || (op.requisitos && op.requisitos.length > 0) || op.region || op.responsable;

    return (
        <>
            {/* ── CARD ── */}
            <div className={`bg-white border hover:border-[var(--iica-blue)] hover:shadow-2xl transition-all duration-500 rounded-3xl p-6 flex flex-col group relative overflow-hidden h-full z-10 ${isClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}>

                {/* Badges de Estado */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        {op.ambito === 'Internacional' ? (
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                <Globe className="w-2.5 h-2.5" /> Internacional
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-200">
                                 Nacional
                            </span>
                        )}
                        {op.adenda && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-200">
                               📝 Adenda bases
                            </span>
                        )}
                    </div>
                    {urgencyBadge()}
                </div>

                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0 flex flex-col pt-1">
                            <h3 className="font-black text-[var(--iica-navy)] text-base leading-tight pr-4 mb-2 group-hover:text-[var(--iica-blue)] transition-colors">
                                <Highlight text={op.nombre} highlight={query} />
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-[var(--iica-blue)]" />
                                    {op.institucion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progressive Disclosure: Ver más ↓ */}
                {!isClosed && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            {/* Botón Ver Detalle */}
                            {hasModalData && (
                                <button
                                    onClick={(e) => { e.preventDefault(); setModalOpen(true); }}
                                    className="flex items-center gap-1 text-[11px] font-black text-[var(--iica-blue)] hover:text-indigo-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                                >
                                    <Info className="w-3 h-3" />
                                    Ver detalle
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[var(--iica-blue)] transition-colors ml-auto"
                            >
                                {expanded ? 'Menos ↑' : 'Ver más ↓'}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Contenido expandible */}
                        {expanded && (
                            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                {op.descripcion && (
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium pl-3 border-l-2 border-slate-200">
                                        <Highlight text={op.descripcion} highlight={query} />
                                    </p>
                                )}
                                {op.rolIICA && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2 italic px-3">
                                        <Navigation className="w-3 h-3 text-slate-300" /> Rol para el IICA: {op.rolIICA}
                                    </div>
                                )}
                                {/* Mini-resumen datos clave */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {op.monto && (
                                        <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                            💰 {op.monto}
                                        </span>
                                    )}
                                    {op.complejidad && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${complejidadColor()}`}>
                                            ⚙️ Complejidad {op.complejidad}
                                        </span>
                                    )}
                                    {op.viabilidad && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${viabilidadColor()}`}>
                                            📊 Viabilidad {op.viabilidad}
                                        </span>
                                    )}
                                    {op.region && (
                                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                                            📍 {op.region}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Cierre Convocatoria
                        </span>
                        <span className={`text-xs font-black ${colorDias}`}>
                            {op.cierre} {!isClosed && <span className="text-[10px] ml-1 opacity-70">({op.diasRestantes}d)</span>}
                        </span>
                    </div>

                    <div className="flex gap-1.5">
                        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                            <button
                                onClick={handleCopy}
                                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'hover:bg-white text-slate-400 hover:text-slate-700'}`}
                                title="Copiar ficha técnica rápida"
                            >
                                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={addToPipeline}
                                className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all"
                                title="Gestionar en Pipeline"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <a
                            href={op.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all flex items-center gap-2 group-hover:px-6"
                        >
                            📄 Ver bases
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── MODAL DE DETALLE ── */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setModalOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[var(--iica-navy)]/60 backdrop-blur-sm" />

                    {/* Panel */}
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom-4 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header modal */}
                        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-8 pt-8 pb-5 z-10">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {op.ambito === 'Internacional' ? (
                                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1">
                                                <Globe className="w-2.5 h-2.5" /> Internacional
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                                                Nacional
                                            </span>
                                        )}
                                        {op.viabilidad && (
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${viabilidadColor()}`}>
                                                📊 Viabilidad {op.viabilidad}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-[var(--iica-navy)] leading-tight pr-4">
                                        {op.nombre}
                                    </h2>
                                    <p className="text-sm font-bold text-slate-400 mt-1.5 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" /> {op.institucion}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Cuerpo modal */}
                        <div className="px-8 py-6 flex flex-col gap-6">

                            {/* Datos clave en grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {op.monto && (
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">💰 Monto</div>
                                        <div className="text-sm font-black text-emerald-800">{op.monto}</div>
                                    </div>
                                )}
                                <div className={`rounded-2xl p-4 border ${isImminent ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">📅 Cierre</div>
                                    <div className={`text-sm font-black ${colorDias}`}>{op.cierre}</div>
                                    {!isClosed && <div className="text-[10px] text-slate-400 mt-0.5">{op.diasRestantes} días restantes</div>}
                                </div>
                                {op.complejidad && (
                                    <div className={`rounded-2xl p-4 ${complejidadColor()}`}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">⚙️ Complejidad</div>
                                        <div className="text-sm font-black">{op.complejidad}</div>
                                    </div>
                                )}
                                {op.region && (
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">📍 Región/Cobertura</div>
                                        <div className="text-sm font-black text-slate-700">{op.region}</div>
                                    </div>
                                )}
                                {op.plazoMeses && (
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">⏱️ Plazo ejecución</div>
                                        <div className="text-sm font-black text-blue-800">{op.plazoMeses} meses</div>
                                    </div>
                                )}
                                {op.responsable && (
                                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                                        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">👤 Responsable IICA</div>
                                        <div className="text-sm font-black text-indigo-800">{op.responsable}</div>
                                    </div>
                                )}
                            </div>

                            {/* Descripción / Rol IICA */}
                            {op.descripcion && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5" /> Descripción del Rol IICA
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium pl-4 border-l-2 border-[var(--iica-blue)]/30">
                                        {op.descripcion}
                                    </p>
                                </div>
                            )}

                            {/* Objetivo */}
                            {op.objetivo && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5" /> Objetivo Estratégico
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium pl-4 border-l-2 border-indigo-200">
                                        {op.objetivo}
                                    </p>
                                </div>
                            )}

                            {/* Requisitos clave */}
                            {op.requisitosClave && op.requisitosClave.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <ListChecks className="w-3.5 h-3.5" /> Requisitos Clave
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {op.requisitosClave.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-[var(--iica-blue)] rounded-full mt-2 flex-shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Fortalezas */}
                            {op.fortalezas && op.fortalezas.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5" /> Fortalezas IICA
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {op.fortalezas.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Beneficiarios */}
                            {op.beneficiarios && op.beneficiarios.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Beneficiarios Elegibles
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {op.beneficiarios.map((b, i) => (
                                            <span key={i} className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cofinanciamiento */}
                            {op.cofinanciamiento && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                    <h4 className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Banknote className="w-3.5 h-3.5" /> Cofinanciamiento
                                    </h4>
                                    <p className="text-sm text-amber-800 font-semibold">{op.cofinanciamiento}</p>
                                    {op.requiereCofinanciamiento !== undefined && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1">
                                            {op.requiereCofinanciamiento ? '⚠️ Requiere cofinanciamiento' : '✓ No requiere cofinanciamiento propio'}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer modal */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-3xl px-8 py-5 flex items-center justify-between gap-4">
                            <button
                                onClick={addToPipeline}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Agregar al Pipeline
                            </button>
                            <a
                                href={op.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-900/10"
                            >
                                📄 Ver bases oficiales
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
