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
            {/* Background Image con overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663573662923/MMCKhgYRiHjKpTZNSuJJdS/hero-agricultural-landscape-7xaiHJXWKsB3BA6QjUhFga.webp)',
                }}
                role="img"
                aria-label="Paisaje agrícola chileno"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />

            {/* Content */}
            <div className="container mx-auto max-w-[1200px] px-4 relative z-10 py-20">
                <div className="max-w-2xl">
                    {/* Label superior */}
                    <div className="mb-5">
                        <span className="inline-block text-[var(--iica-yellow)] font-semibold text-xs tracking-widest uppercase">
                            ✓ Financiamiento Agrícola Verificado
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

            {/* Stats overlay — esquina inferior derecha (desktop) */}
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

            {/* Badge urgentes */}
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
                            stat.label === 'Cierran pronto' ? (
                                <Link
                                    key={stat.label}
                                    href="/?estado=Abierta&sort=date_asc#convocatorias"
                                    className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 hover:bg-white/20 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow"
                                >
                                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2">{stat.icon} {stat.value}</div>
                                    <div className="text-xs text-blue-200 font-medium">{stat.label}</div>
                                </Link>
                            ) : (
                                <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2">{stat.icon} {stat.value}</div>
                                    <div className="text-xs text-blue-200 font-medium">{stat.label}</div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
