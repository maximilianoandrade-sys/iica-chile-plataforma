"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { InstitutionLogo } from "./InstitutionLogo";
// @ts-ignore
import { Clock, MapPin, Award, Zap, ChevronRight, Info } from "lucide-react";

export interface Oportunidad {
    id: string;
    nombre: string;
    institucion: string;
    cierre: string;
    diasRestantes: number;
    ambito: "Internacional" | "Nacional" | "Regional";
    viabilidad: "Alta" | "Media" | "Baja";
    porcentajeViabilidad?: number;
    rolIICA?: string;
    url: string;
    adenda?: boolean;
    descripcion?: string;
}

export function OportunidadCard({ op }: { op: Oportunidad }) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    // Utilidad simple para resaltar el texto buscado (similar a mark)
    const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
        if (!highlight.trim() || !text) return <>{text}</>;
        
        // Excluye búsqueda por campo 'inst:xxx' del highlighter
        const cleanHighlight = highlight.replace(/\w+:\S+/g, '').replace(/"/g, '').trim();
        if (!cleanHighlight || cleanHighlight.length < 3) return <>{text}</>;

        const escaped = cleanHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </>
        );
    };

    const colorViabilidad = {
        Alta: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Media: "bg-amber-50 text-amber-700 border-amber-100",
        Baja: "bg-rose-50 text-rose-700 border-rose-100",
    };

    const colorDias = op.diasRestantes <= 7
        ? "text-rose-600 font-bold"
        : op.diasRestantes <= 30
            ? "text-amber-600 font-semibold"
            : "text-emerald-700";

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-[var(--iica-blue)]/30 transition-all duration-300 relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors" />

            <div className="flex items-start gap-4">
                <div className="relative z-10 p-2 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-blue-100 transition-colors">
                    <InstitutionLogo nombre={op.institucion} size={48} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                            <MapPin className="w-3 h-3" />
                            {op.ambito}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border ${colorViabilidad[op.viabilidad]}`}>
                            <Zap className="w-3 h-3" />
                            {op.viabilidad}
                        </span>
                        {op.adenda && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[var(--iica-blue)] rounded-full px-2.5 py-1 border border-blue-100">
                                <Award className="w-3 h-3" />
                                Adendas
                            </span>
                        )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[var(--iica-blue)] transition-colors">
                        <Highlight text={op.nombre} highlight={query} />
                    </h3>
                    <div className="flex flex-col gap-1.5 mt-2">
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {op.institucion}
                        </p>
                        {op.rolIICA && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Info className="w-3 h-3" />
                                {op.rolIICA}
                            </div>
                        )}
                    </div>
                    {op.descripcion && (
                        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                             <Highlight text={op.descripcion} highlight={query} />
                        </p>
                    )}
                </div>
            </div>

            {/* Viability Progress Bar */}
            <div className="mt-5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Semáforo de Viabilidad</span>
                    <span className={op.viabilidad === 'Alta' ? 'text-emerald-600' : op.viabilidad === 'Media' ? 'text-amber-600' : 'text-rose-600'}>
                        {op.porcentajeViabilidad ? `${op.porcentajeViabilidad}%` : op.viabilidad}
                    </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${op.viabilidad === 'Alta' ? 'bg-emerald-500' : op.viabilidad === 'Media' ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${op.porcentajeViabilidad || (op.viabilidad === 'Alta' ? 85 : op.viabilidad === 'Media' ? 50 : 25)}%` }}
                    />
                </div>
            </div>

            <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        Cierre
                    </div>
                    <p className={`text-sm ${colorDias}`}>
                        {op.cierre} <span className="text-gray-300 mx-1">|</span> <span className="font-bold">{op.diasRestantes} días</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <a
                        href={op.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[var(--iica-blue)] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--iica-navy)] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                    >
                        Bases
                        <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
