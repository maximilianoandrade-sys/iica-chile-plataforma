'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ClipboardList, CircleDot, Globe, AlertTriangle } from 'lucide-react';

interface HeroStats {
    total: number;
    internacionales: number;
    abiertas: number;
    urgentes: number;
}

interface HeroSectionProps {
    stats?: HeroStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
    const totalOportunidades = stats?.total ?? 0;
    const internacionales = stats?.internacionales ?? 0;
    const abiertas = stats?.abiertas ?? 0;
    const urgentCount = stats?.urgentes ?? 0;

    return (
        <section className="relative">
            <div
                className="hero-iica relative overflow-hidden bg-[var(--iica-navy)] text-white py-10 md:py-28 text-center"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 45, 114, 0.85), rgba(0, 45, 114, 0.7)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Overlay decorativo graduado */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--iica-navy)]/40 pointer-events-none"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <h1 className="animate-fade-in-up text-2xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                        Encuentre financiamiento agrícola{' '}
                        <span className="text-[var(--iica-yellow)]">verificado para Chile</span>
                    </h1>

                    <p className="animate-fade-in-up text-lg md:text-xl font-medium text-blue-50 max-w-2xl mx-auto mb-10 drop-shadow-md">
                        Compare convocatorias vigentes, revise requisitos clave y acceda a fuentes oficiales en minutos.
                    </p>

                    <div className="animate-fade-in-up flex justify-center">
                        <Link
                            href="#convocatorias"
                            className="bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2 cursor-pointer ring-4 ring-white/20 min-h-[44px]"
                        >
                            <Target className="h-5 w-5" />
                            Ver Oportunidades Activas
                        </Link>
                    </div>

                    {/* Mini stats row */}
                    <div className="animate-fade-in-up mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {([
                            { label: 'Oportunidades', value: totalOportunidades, icon: <ClipboardList className="h-5 w-5" /> },
                            { label: 'Abiertas Ahora', value: abiertas, icon: <CircleDot className="h-5 w-5 text-green-400" /> },
                            { label: 'Internacionales', value: internacionales, icon: <Globe className="h-5 w-5" /> },
                            { label: 'Cierran pronto', value: urgentCount, icon: <AlertTriangle className="h-5 w-5 text-amber-400" /> },
                        ] as { label: string; value: number; icon: React.ReactNode }[]).map(stat => (
                            <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                                <div className="text-2xl font-black text-white flex items-center justify-center gap-2">{stat.icon} {stat.value}</div>
                                <div className="text-xs text-blue-200 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
