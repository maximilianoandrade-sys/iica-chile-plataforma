"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InstitutionLogo } from "./InstitutionLogo";
import { ProposalGenerator } from "./ProposalGenerator";
import { CheckCircle2, ChevronRight, Clock, MapPin, Zap, Info, Sparkles, Calendar, FileText, Award } from "lucide-react";

export interface Oportunidad {
    id: string;
    nombre: string;
    institucion: string;
    cierre: string; // YYYY-MM-DD
    diasRestantes: number;
    viabilidad?: 'Alta' | 'Media' | 'Baja';
    porcentajeViabilidad?: number;
    rolIICA?: string;
    url: string;
    adenda?: boolean;
    descripcion?: string;
    monto?: string;
    categoria?: string;
}

export interface OportunidadCardProps {
    op: Oportunidad;
    query?: string;
}

export function OportunidadCard({ op, query = "" }: OportunidadCardProps) {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    // Determines the visual color of days left
    const isImminent = op.diasRestantes <= 7;

    const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-1 py-0.5">{part}</mark> : part
                )}
            </span>
        );
    };

    const colorDias = isImminent ? 'text-rose-600 font-bold' :
        op.diasRestantes <= 20 ? 'text-amber-600' : 'text-emerald-600';

    return (
        <div className="bg-white border hover:border-[var(--iica-blue)] hover:shadow-lg transition-all duration-300 rounded-2xl p-5 flex flex-col group relative overflow-hidden h-full z-10">
            {isImminent && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3" /> Cierre Inminente
                </div>
            )}
            
            {op.adenda && (
                <div className="absolute top-0 left-0 bg-amber-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-br-lg flex items-center gap-1 shadow-sm">
                    Modificación de Bases
                </div>
            )}

            <div className={`flex-1 ${isImminent || op.adenda ? 'pt-4' : ''}`}>
                <div className="flex items-start gap-4">
                    <div className="bg-slate-50 p-2 rounded-xl shrink-0 group-hover:scale-105 transition-transform border border-slate-100 shadow-sm mt-1">
                        <InstitutionLogo nombre={op.institucion} size={48} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                        <h3 className="font-bold text-[var(--iica-navy)] text-[15px] leading-snug line-clamp-2 pr-4 mb-2 group-hover:text-[var(--iica-blue)] transition-colors">
                            <Highlight text={op.nombre} highlight={query} />
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-auto">
                            <span className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-slate-400" />
                                {op.institucion}
                            </span>
                        </div>
                        {op.rolIICA && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                <Info className="w-3 h-3" />
                                {op.rolIICA}
                            </div>
                        )}
                    </div>
                </div>
                
                {op.descripcion && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                         <Highlight text={op.descripcion} highlight={query} />
                    </p>
                )}
            </div>

            <div className="mt-5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Semáforo de Viabilidad</span>
                    <span className={op.viabilidad === 'Alta' ? 'text-emerald-600' : op.viabilidad === 'Media' ? 'text-amber-600' : 'text-rose-600'}>
                        {op.porcentajeViabilidad ? `${op.porcentajeViabilidad}%` : op.viabilidad}
                    </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${op.viabilidad === 'Alta' ? 'bg-emerald-500' : op.viabilidad === 'Media' ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${op.porcentajeViabilidad || (op.viabilidad === 'Alta' ? 85 : op.viabilidad === 'Media' ? 50 : 25)}%` }}
                    />
                </div>
            </div>

            <div className="flex items-end justify-between mt-6 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        Cierre
                    </div>
                    <p className={`text-sm ${colorDias}`}>
                        {op.cierre} <span className="text-slate-300 mx-1">|</span> <span className="font-bold">{op.diasRestantes} días</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsGeneratorOpen(true);
                        }}
                        className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5 border border-purple-200 shadow-sm"
                        title="Generar borrador de concepto con IA"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const endDate = new Date(op.cierre.split('-').reverse().join('-') || Date.now());
                            const dateStr = endDate.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
                            const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${op.url}\nDTSTART:${dateStr}\nDTEND:${dateStr}\nSUMMARY:Cierre: ${op.nombre}\nDESCRIPTION:Convocatoria Institucional: ${op.institucion}. Cierre de Postulaciones.\nEND:VEVENT\nEND:VCALENDAR`;
                            
                            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                            const link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.setAttribute('download', `cierre_proyecto_iica_${op.id}.ics`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 border border-blue-200 shadow-sm"
                        title="Añadir cierre al calendario"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                    </button>

                    <a
                        href={op.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[var(--iica-blue)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--iica-navy)] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                    >
                        Bases
                        <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            <ProposalGenerator 
                project={{ nombre: op.nombre, institucion: op.institucion, monto: op.monto, categoria: op.categoria, descripcion: op.descripcion }} 
                isOpen={isGeneratorOpen} 
                onClose={() => setIsGeneratorOpen(false)} 
            />
        </div>
    );
}
