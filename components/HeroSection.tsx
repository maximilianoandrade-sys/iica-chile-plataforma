'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';

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
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const totalOportunidades = stats?.total ?? 0;
    const abiertas = stats?.abiertas ?? 0;
    const urgentes = stats?.urgentes ?? 0;

    const handleUrgentClick = () => {
        startTransition(() => {
            router.push('/?estado=Abierta&sort=date_asc#convocatorias', { scroll: false });
        });
        document.getElementById('convocatorias')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            className="relative min-h-[580px] flex items-center overflow-hidden"
        >
            {/* LCP hero image — self-hosted for performance */}
            <Image
                src="/hero-campo.webp"
                alt="Campo agrícola chileno"
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
            />
            {/* Gradient overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20"
            />
            <div className="container mx-auto max-w-[1200px] px-4 relative z-10 py-20">
                <div className="max-w-2xl">
                    <div className="mb-5">
                        <span className="inline-block text-[var(--iica-yellow)] font-semibold text-sm tracking-widest uppercase">
                            Financiamiento Agrícola Verificado
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight drop-shadow-lg">
                        Encuentre financiamiento{' '}
                        <span className="text-[var(--iica-yellow)]">verificado para Chile</span>
                    </h1>

                    <p className="text-lg text-gray-100 mb-8 max-w-xl leading-relaxed drop-shadow-md">
                        Compare convocatorias vigentes, revise requisitos clave y acceda a fuentes oficiales en minutos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <Link
                            href="#convocatorias"
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-4 px-8 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl group min-h-[48px]"
                        >
                            Explorar Oportunidades
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center justify-center gap-2 border-2 border-white/80 text-white hover:bg-white/10 font-medium py-3 px-6 rounded-lg transition-all min-h-[44px]"
                        >
                            Conocer IICA Chile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Badge urgentes */}
            {urgentes > 0 && (
                <button
                    type="button"
                    onClick={handleUrgentClick}
                    disabled={isPending}
                    className="absolute top-6 right-6 flex items-center gap-2 bg-rose-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-rose-600 transition-colors disabled:opacity-70"
                    aria-label={`${urgentes} oportunidades cierran pronto`}
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <AlertTriangle className="w-4 h-4" />
                    )}
                    {urgentes} cierran pronto
                </button>
            )}
        </section>
    );
}
