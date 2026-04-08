'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Globe, Users, Award, Leaf, DollarSign, Calendar } from 'lucide-react';

import { AnimatedCounter } from './AnimatedCounter';

// ──────────────────────────────────────────────────────
// Individual Metric Card
// ──────────────────────────────────────────────────────
function MetricCard({
    icon: Icon,
    value,
    suffix,
    prefix,
    label,
    description,
    color,
    delay,
}: {
    icon: React.ElementType;
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    description: string;
    color: string;
    delay: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
            {/* Decorative gradient blob */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />

            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${color} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
            </div>

            <div className="flex items-end gap-1 mb-1 text-4xl font-black text-[var(--iica-navy)] tabular-nums leading-none">
                <AnimatedCounter end={value} prefix={prefix} suffix={suffix} duration={1600} />
            </div>

            <div className="font-bold text-gray-800 mb-1 text-sm">{label}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
        </motion.div>
    );
}

// ──────────────────────────────────────────────────────
// Main ImpactSection
// ──────────────────────────────────────────────────────
const METRICS = [
    {
        icon: Calendar,
        value: 75,
        suffix: ' años',
        label: 'En Chile',
        description: 'Presencia ininterrumpida desde 1950 apoyando el desarrollo agrícola nacional.',
        color: 'bg-blue-600',
    },
    {
        icon: TrendingUp,
        value: 48,
        suffix: '+',
        label: 'Proyectos Activos 2026',
        description: 'Iniciativas en ejecución en cooperación técnica, innovación y desarrollo rural.',
        color: 'bg-green-600',
    },
    {
        icon: DollarSign,
        value: 85,
        prefix: 'USD ',
        suffix: 'M+',
        label: 'Fondos Gestionados',
        description: 'Millones de dólares canalizados hacia el agro chileno en la última década.',
        color: 'bg-amber-500',
    },
    {
        icon: Globe,
        value: 35,
        suffix: ' países',
        label: 'Red Hemisférica',
        description: 'Membresía activa en Americas con acceso a alianzas con FAO, BID, FONTAGRO y GEF.',
        color: 'bg-purple-600',
    },
    {
        icon: Users,
        value: 4200,
        suffix: '+',
        label: 'Agricultores Beneficiados',
        description: 'Familias rurales alcanzadas por programas de asistencia técnica y transferencia en Chile.',
        color: 'bg-teal-600',
    },
    {
        icon: Award,
        value: 12,
        label: 'Áreas de Expertise',
        description: 'Desde cambio climático y bioeconomía hasta sanidad agropecuaria y digitalización.',
        color: 'bg-red-500',
    },
    {
        icon: Leaf,
        value: 18,
        label: 'Acuerdos Vigentes',
        description: 'Convenios activos con ministerios, universidades, GOREs y organismos internacionales.',
        color: 'bg-emerald-600',
    },
    {
        icon: Globe,
        value: 6,
        label: 'Fondos Internacionales Accesibles',
        description: 'Ventanillas activas: GEF, GCF, EUROCLIMA+, FONTAGRO, BID y cooperación sur-sur.',
        color: 'bg-indigo-600',
    },
];

const WHY_IICA = [
    {
        icon: '🏛️',
        title: 'Mandato Regional Único',
        text: 'El IICA es el único organismo internacional especializado en agricultura de las Américas con sede permanente en Chile. Eso nos da acceso directo a fuentes de financiamiento que organismos nacionales no pueden gestionar.'
    },
    {
        icon: '🤝',
        title: 'Ejecutor Elegible por Diseño',
        text: 'Organismos como GEF, GCF, FONTAGRO y UE reconocen al IICA como ejecutor acreditado, lo que agiliza la aprobación y reduce riesgo fiduciario para contrapartes chilenas.'
    },
    {
        icon: '🔬',
        title: 'Capacidad Técnica Comprobada',
        text: 'Contamos con especialistas en cambio climático, bioeconomía, sanidad agropecuaria, agua, inclusión financiera y digitalización, disponibles para co-formular propuestas con nuestros aliados.'
    },
    {
        icon: '📊',
        title: 'Presencia Territorial',
        text: 'Además de la oficina en Santiago, operamos y monitoreamos proyectos activos en 10 de las 16 regiones de Chile, con redes de contraparte locales establecidas.'
    },
];

export default function ImpactSection() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true });

    return (
        <section id="impacto" className="py-20 bg-gradient-to-b from-[#f4f7f9] to-white relative overflow-hidden scroll-mt-20">
            {/* Background decoratives */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-100 rounded-full opacity-20 blur-3xl" />
            </div>

            <div className="container mx-auto max-w-[1200px] px-4 relative">

                {/* Header */}
                <div ref={headerRef} className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--iica-blue)] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mb-4">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Impacto IICA en Chile
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--iica-navy)] mb-4 leading-tight">
                            75 años al servicio del<br className="hidden md:block" /> <span className="text-[var(--iica-blue)]">agro chileno</span>
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            El IICA no es solo una ventanilla de fondos: es el socio estratégico que acompaña cada etapa, desde la formulación hasta el cierre técnico y financiero.
                        </p>
                    </motion.div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {METRICS.map((m, i) => (
                        <MetricCard key={m.label} {...m} delay={i * 0.07} />
                    ))}
                </div>

                {/* Why IICA */}
                <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] rounded-3xl p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                            ¿Por qué el IICA es el ejecutor ideal?
                        </h3>
                        <p className="text-blue-100 text-base max-w-xl mx-auto">
                            Cuatro razones por las que nuestras contrapartes nos eligen para co-ejecutar proyectos de cooperación internacional.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {WHY_IICA.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                            >
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h4 className="font-bold text-white text-base mb-2">{item.title}</h4>
                                <p className="text-blue-100 text-sm leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
