'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';
import projects from '@/data/projects.json';

// Calcular estadísticas para el hero
function getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOportunidades = projects.length;
    const internacionales = projects.filter((p: any) =>
        ['FONTAGRO', 'FAO', 'FIDA', 'BID', 'PNUD', 'GEF', 'GCF', 'UE', 'UE (EUROCLIMA+)', 'UE (AECID)', 'IICA Hemisférico'].includes(p.institucion)
    ).length;
    const abiertas = projects.filter((p: any) => {
        return new Date(p.fecha_cierre) >= today;
    }).length;
    const urgentCount = projects.filter((p: any) => {
        const closing = new Date(p.fecha_cierre);
        const diff = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    }).length;

    return { totalOportunidades, internacionales, abiertas, urgentCount };
}

export function HeroSection() {
    const { totalOportunidades, internacionales, abiertas, urgentCount } = getStats();

    return (
        <section className="relative">
            {/* Hero Section — ítems 2, 4 */}
            <div
                className="hero-iica relative overflow-hidden bg-[var(--iica-navy)] text-white py-20 md:py-28 text-center"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 45, 114, 0.85), rgba(0, 45, 114, 0.7)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Overlay decorativo graduado */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--iica-navy)]/40 pointer-events-none"></div>

                <div className="relative z-10 container mx-auto px-4">
                    {/* Estadísticas reales IICA (ítem 4) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium text-blue-100 mb-6"
                    >
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {abiertas} oportunidades activas · {internacionales} internacionales · FONTAGRO · FAO · BID · FIDA
                    </motion.div>

                    {/* H1 actualizado (ítem 2) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg"
                    >
                        Oportunidades de Proyectos para el{' '}
                        <span className="text-[var(--iica-yellow)]">IICA Chile 2026</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-medium text-blue-50 max-w-2xl mx-auto mb-10 drop-shadow-md"
                    >
                        Radar institucional de convocatorias, fondos y alianzas estratégicas para que el IICA Chile lidere proyectos de alto impacto en la región.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="#convocatorias"
                            className="bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2 cursor-pointer ring-4 ring-white/20 min-h-[56px]"
                        >
                            <Target className="h-5 w-5" />
                            Ver Oportunidades Activas
                        </Link>
                        <Link
                            href="#fuentes"
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2 cursor-pointer min-h-[56px]"
                        >
                            🔗 Fuentes Internacionales
                        </Link>
                    </motion.div>

                    {/* Mini stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 flex gap-6 justify-center flex-wrap"
                    >
                        {[
                            { label: 'Oportunidades', value: totalOportunidades, icon: '📋' },
                            { label: 'Abiertas Ahora', value: abiertas, icon: '🟢' },
                            { label: 'Internacionales', value: internacionales, icon: '🌎' },
                            { label: 'Cierran ≤7 días', value: urgentCount, icon: '⚠️' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                                <div className="text-2xl font-black text-white">{stat.icon} {stat.value}</div>
                                <div className="text-xs text-blue-200 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Agricultural Field Image Section */}
            <div className="relative w-full h-64 md:h-80 overflow-hidden">
                <Image
                    src="/agricultural-field.png"
                    alt="Trabajo institucional del IICA en territorio chileno"
                    fill
                    className="object-cover object-center"
                    priority
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
        </section>
    );
}
