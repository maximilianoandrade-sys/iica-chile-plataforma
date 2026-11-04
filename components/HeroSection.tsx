'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
    const [query, setQuery] = useState('');
    const totalOportunidades = stats?.total ?? 0;
    const abiertas = stats?.abiertas ?? 0;
    const urgentes = stats?.urgentes ?? 0;

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = query.trim();
        router.push(value ? `/?q=${encodeURIComponent(value)}#convocatorias` : '#convocatorias');
    };

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

                    <h1 className="max-w-full break-words text-3xl font-extrabold leading-tight text-white drop-shadow-lg md:mb-4 md:text-5xl">
                        Encuentre financiamiento{' '}
                        <span className="text-[var(--iica-yellow)] sm:inline">verificado para Chile</span>
                    </h1>

                    <p className="mb-6 max-w-xl break-words text-base leading-relaxed text-gray-100 drop-shadow-md md:text-lg">
                        Compare convocatorias vigentes, revise requisitos clave y acceda a fuentes oficiales en minutos.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className="mb-5 flex max-w-2xl flex-col gap-1 rounded-lg bg-white p-1 shadow-lg sm:flex-row"
                        role="search"
                    >
                        <label htmlFor="hero-search" className="sr-only">
                            Buscar oportunidades
                        </label>
                        <input
                            id="hero-search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Palabra clave, sector o institución"
                            className="min-h-[44px] min-w-0 flex-1 rounded-md border-0 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                        />
                        <button
                            type="submit"
                            className="min-h-[44px] w-full rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700 sm:w-auto"
                        >
                            Buscar
                        </button>
                    </form>

                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link
                            href="#convocatorias"
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl group sm:w-auto"
                        >
                            Explorar {totalOportunidades > 0 ? `${totalOportunidades} ` : ''}Oportunidades
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsNewsletterOpen(true)}
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-white/95 px-5 py-3 text-sm font-bold text-[var(--iica-navy)] shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto"
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
