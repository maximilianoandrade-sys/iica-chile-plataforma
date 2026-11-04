'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bell } from 'lucide-react';
import NewsletterModal from '@/components/NewsletterModal';

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
    const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
    const totalOportunidades = stats?.total ?? 0;
    const abiertas = stats?.abiertas ?? 0;
    const urgentes = stats?.urgentes ?? 0;

    return (
        <section
            className="relative min-h-[440px] flex items-center overflow-hidden"
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
            <div className="container mx-auto max-w-[1200px] px-4 relative z-10 py-14 md:py-16">
                <div className="max-w-2xl">
                    <div className="mb-5">
                        <span className="inline-block text-[var(--iica-yellow)] font-semibold text-sm tracking-widest uppercase">
                            Financiamiento Agrícola Verificado
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                        Encuentre financiamiento{' '}
                        <span className="text-[var(--iica-yellow)]">verificado para Chile</span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-100 mb-6 max-w-xl leading-relaxed drop-shadow-md">
                        Compare convocatorias vigentes, revise requisitos clave y acceda a fuentes oficiales en minutos.
                    </p>

                    <div className="flex flex-wrap gap-3 items-center">
                        <Link
                            href="#convocatorias"
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-base py-3 px-6 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl group min-h-[48px]"
                        >
                            Explorar {totalOportunidades > 0 ? `${totalOportunidades} ` : ''}Oportunidades
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsNewsletterOpen(true)}
                            className="flex items-center justify-center gap-2 bg-white/95 hover:bg-white text-[var(--iica-navy)] font-bold text-sm py-3 px-5 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 min-h-[48px]"
                        >
                            <Bell className="w-5 h-5 text-gray-900" />
                            Recibir Alertas WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <NewsletterModal
                isOpen={isNewsletterOpen}
                onClose={() => setIsNewsletterOpen(false)}
            />

            <p className="absolute bottom-4 right-4 hidden text-xs text-white/85 md:block">
                {urgentes > 0 ? `${urgentes} oportunidades cierran pronto` : 'Datos actualizados continuamente'}
            </p>
        </section>
    );
}
