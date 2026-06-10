'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';

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
    const abiertas = stats?.abiertas ?? 0;
    const urgentes = stats?.urgentes ?? 0;

    return (
        <section
            className="relative min-h-[580px] flex items-center overflow-hidden"
            style={{
                backgroundImage: [
                    'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)',
                    'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop)',
                ].join(', '),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="container mx-auto max-w-[1200px] px-4 relative z-10 py-20">
                <div className="max-w-2xl">
                    <div className="mb-5">
                        <span className="inline-block text-[var(--iica-yellow)] font-semibold text-xs tracking-widest uppercase">
                            Financiamiento Agricola Verificado
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight drop-shadow-lg">
                        Encuentre financiamiento{' '}
                        <span className="text-[var(--iica-yellow)]">verificado para Chile</span>
                    </h1>

                    <p className="text-lg text-gray-100 mb-8 max-w-xl leading-relaxed drop-shadow-md">
                        Compare convocatorias vigentes, revise requisitos clave y acceda a fuentes oficiales en minutos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="#convocatorias"
                            className="flex items-center justify-center gap-2 bg-[var(--iica-secondary)] hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-xl transition-all hover:-translate-y-0.5 group min-h-[48px]"
                        >
                            Explorar Oportunidades
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center justify-center gap-2 border-2 border-white/60 text-white hover:bg-white/10 font-semibold py-3.5 px-8 rounded-xl transition-all min-h-[48px]"
                        >
                            Conocer IICA Chile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats overlay bottom-right (desktop) */}
            <div className="absolute bottom-0 right-0 p-8 hidden lg:block" style={{background: 'linear-gradient(to left, rgba(0,0,0,0.75) 0%, transparent 100%)'}}>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[var(--iica-yellow)] text-[10px] font-black uppercase tracking-widest">Total</p>
                        <p className="text-white text-4xl font-black leading-none">{totalOportunidades}</p>
                        <p className="text-gray-300 text-sm mt-1">Oportunidades</p>
                    </div>
                    <div>
                        <p className="text-[var(--iica-yellow)] text-[10px] font-black uppercase tracking-widest">Activas</p>
                        <p className="text-white text-4xl font-black leading-none">{abiertas}</p>
                        <p className="text-gray-300 text-sm mt-1">Abiertas Ahora</p>
                    </div>
                </div>
            </div>

            {/* Badge urgentes */}
            {urgentes > 0 && (
                <Link
                    href="/?estado=Abierta&sort=date_asc#convocatorias"
                    className="absolute top-6 right-6 flex items-center gap-2 bg-rose-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-rose-600 transition-colors"
                    aria-label={`${urgentes} oportunidades cierran pronto`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    {urgentes} cierran pronto
                </Link>
            )}
        </section>
    );
}
