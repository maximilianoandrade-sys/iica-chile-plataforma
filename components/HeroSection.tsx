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
        <section className="relative min-h-[580px] flex items-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663573662923/MMCKhgYRiHjKpTZNSuJJdS/hero-agricultural-landscape-7xaiHJXWKsB3BA6QjUhFga.webp)',
                }}
                role="img"
                aria-label="Paisaje agricola chileno"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />

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
                            className="flex items-center justify-center gap-2 bg-secondary hover:bg-emerald-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-xl transition-all hover:-translate-y-0.5 group min-h-[48px]"
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

            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-black/80 via-black/60 to-transparent p-8 hidden lg:block">
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

            {urgentes > 0 && (
                <Link
                    href="/?estado=Abierta&sort=date_asc#convocatorias"
                    className="absolute top-6 right-6 flex items-center gap-2 bg-rose-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-rose-600 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)]"
                    aria-label={`${urgentes} oportunidades cierran pronto`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    {urgentes} cierran pronto
                </Link>
            )}
        </section>
    );
}
