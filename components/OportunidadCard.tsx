import React, { useState } from 'react';
import { InstitutionLogo } from "./InstitutionLogo";
import { CheckCircle2, ChevronRight, Clock, MapPin, Zap, Info, Calendar, FileText, Award, LayoutDashboard, Copy, CheckCheck, Globe, Navigation, Search, ChevronDown } from "lucide-react";

export interface Oportunidad {
    id: string;
    nombre: string;
    institucion: string;
    cierre: string; // DD-MM-YYYY or similar for display
    diasRestantes: number;
    viabilidad?: 'Alta' | 'Media' | 'Baja';
    porcentajeViabilidad?: number;
    rolIICA?: string;
    url: string;
    adenda?: boolean;
    descripcion?: string;
    monto?: string;
    categoria?: string;
    ambito?: "Internacional" | "Nacional" | "Regional";
}

export interface OportunidadCardProps {
    op: Oportunidad;
    query?: string;
}

export function OportunidadCard({ op, query = "" }: OportunidadCardProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

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

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        const texto = `📋 ${op.nombre}\n🏛️ ${op.institucion}\n📅 Cierre: ${op.cierre}\n🔗 Bases: ${op.url}`;
        navigator.clipboard.writeText(texto);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addToPipeline = (e: React.MouseEvent) => {
        e.preventDefault();
        const current = JSON.parse(localStorage.getItem('iica-pipeline-v2') || '[]');
        if (current.some((t: any) => t.id === op.id)) {
            alert('Este proyecto ya está en tu pipeline institucional.');
            return;
        }
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
            priority: op.viabilidad === 'Alta' ? 'Alta' : 'Media',
            responsible: 'Pendiente Asignar',
            checklist: [
                { id: '1', text: 'Análisis de bases', completed: true },
                { id: '2', text: 'Validación técnica', completed: false },
                { id: '3', text: 'Cálculo de presupuesto', completed: false },
                { id: '4', text: 'Aprobación Representación', completed: false },
            ],
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('iica-pipeline-v2', JSON.stringify([...current, newTask]));
        alert('🚀 Proyecto enviado al Pipeline de Gestión IICA.');
    };

    return (
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
                {isImminent && !isClosed && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase tracking-[0.2em] animate-pulse">
                        <Zap className="w-3 h-3" /> Cierre Inminente
                    </div>
                )}
                {isClosed && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Convocatoria Cerrada
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-2xl shrink-0 group-hover:rotate-3 transition-transform border border-slate-100 shadow-sm mt-1 ring-4 ring-slate-50">
                        <InstitutionLogo nombre={op.institucion} size={42} />
                    </div>

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
                    {/* Resumen compacto siempre visible */}
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${op.viabilidad === 'Alta' ? 'bg-emerald-100 text-emerald-700' : op.viabilidad === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            Viabilidad {op.viabilidad}
                        </span>
                        <button
                            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[var(--iica-blue)] transition-colors"
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
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                                    <span>Viabilidad Técnica IICA</span>
                                </div>
                                <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-1000 rounded-full ${op.viabilidad === 'Alta' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : op.viabilidad === 'Media' ? 'bg-amber-400' : 'bg-rose-500'}`}
                                        style={{ width: `${op.porcentajeViabilidad || (op.viabilidad === 'Alta' ? 85 : op.viabilidad === 'Media' ? 50 : 25)}%` }}
                                    />
                                </div>
                                {op.rolIICA && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2 italic">
                                        <Navigation className="w-3 h-3 text-slate-300" /> Rol: {op.rolIICA}
                                    </div>
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
                    {/* Botones de acción secundaria agrupados por color */}
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
                        className="bg-[var(--iica-navy)] text-white text-[11px] font-black uppercase tracking-widest px-5 rounded-xl hover:bg-[var(--iica-blue)] shadow-lg shadow-blue-900/10 active:scale-95 transition-all flex items-center gap-2 group-hover:px-6"
                    >
                        Bases
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>


        </div>
    );
}
