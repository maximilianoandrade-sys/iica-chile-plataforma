'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, FileCheck, Star, Quote, CheckCircle, ExternalLink, Award } from 'lucide-react';

const CASOS_EXITO = [
    {
        id: 1,
        nombre: "Familia Contreras",
        region: "Maule",
        fondo: "CNR - Riego Tecnificado",
        monto: "$8.5 millones",
        historia: "Gracias a la plataforma encontré el fondo de riego en 5 minutos. Antes perdía días buscando en distintos sitios. Ahora tengo goteo en mis 3 hectáreas de tomates.",
        emoji: "🍅",
        rating: 5
    },
    {
        id: 2,
        nombre: "Cooperativa Mujeres Rurales",
        region: "Araucanía",
        fondo: "INDAP - PRODESAL",
        monto: "$12 millones",
        historia: "El filtro de 'Mujeres Rurales' nos mostró exactamente los fondos para nuestra cooperativa. El consultor que encontramos aquí nos ayudó a ganar la postulación.",
        emoji: "👩‍🌾",
        rating: 5
    },
    {
        id: 3,
        nombre: "Don Pedro Soto",
        region: "Coquimbo",
        fondo: "CORFO - Innovación",
        monto: "$25 millones",
        historia: "Escribí 'se me secó el pozo' en el buscador y me apareció el fondo de profundización. Nunca pensé que una plataforma entendería lo que yo necesitaba.",
        emoji: "💧",
        rating: 5
    }
];

const STATS = [
    { label: 'Agricultores Atendidos', value: 2847, suffix: '+', icon: <Users className="h-6 w-6" />, color: 'from-blue-500 to-blue-600' },
    { label: 'Fondos Disponibles', value: 48, suffix: '', icon: <FileCheck className="h-6 w-6" />, color: 'from-green-500 to-green-600' },
    { label: 'Bases Descargadas Hoy', value: 156, suffix: '', icon: <TrendingUp className="h-6 w-6" />, color: 'from-purple-500 to-purple-600' },
    { label: 'Tasa de Éxito', value: 73, suffix: '%', icon: <Award className="h-6 w-6" />, color: 'from-orange-500 to-orange-600' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [target]);

    return <span>{count.toLocaleString('es-CL')}{suffix}</span>;
}

export default function ImpactDashboard() {
    const [activeCase, setActiveCase] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveCase(prev => (prev + 1) % CASOS_EXITO.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-16 bg-gradient-to-b from-[#f4f7f9] to-white">
            <div className="container mx-auto max-w-[1200px] px-4">

                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <TrendingUp className="h-4 w-4" />
                        Impacto Real
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--iica-navy)] mb-3">
                        La plataforma que <span className="text-[var(--iica-secondary)]">transforma</span> el agro
                    </h2>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Datos en tiempo real del impacto de nuestra plataforma en el financiamiento agrícola chileno.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow"
                        >
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3`}>
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-extrabold text-[var(--iica-navy)] mb-1">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Success Stories */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] px-6 py-4 flex items-center gap-3">
                        <Star className="h-5 w-5 text-[var(--iica-yellow)] fill-current" />
                        <h3 className="text-white font-bold text-lg">Casos de Éxito</h3>
                        <span className="ml-auto text-blue-200 text-sm">Testimonios verificados</span>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {CASOS_EXITO.map((caso, i) => (
                                <button
                                    key={caso.id}
                                    onClick={() => setActiveCase(i)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${activeCase === i
                                        ? 'border-[var(--iica-blue)] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{caso.emoji}</div>
                                    <p className="font-bold text-[var(--iica-navy)] text-sm">{caso.nombre}</p>
                                    <p className="text-gray-500 text-xs">{caso.region}</p>
                                    <div className="flex mt-2">
                                        {[...Array(caso.rating)].map((_, j) => (
                                            <Star key={j} className="h-3 w-3 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <motion.div
                            key={activeCase}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100"
                        >
                            <Quote className="h-8 w-8 text-[var(--iica-blue)] opacity-30 mb-3" />
                            <p className="text-gray-700 text-lg italic leading-relaxed mb-4">
                                "{CASOS_EXITO[activeCase].historia}"
                            </p>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="font-bold text-[var(--iica-navy)]">{CASOS_EXITO[activeCase].nombre}</p>
                                    <p className="text-gray-500 text-sm">{CASOS_EXITO[activeCase].region} · {CASOS_EXITO[activeCase].fondo}</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    {CASOS_EXITO[activeCase].monto} obtenidos
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Live Activity */}
                <div className="mt-8 bg-[var(--iica-navy)] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50"></div>
                        </div>
                        <div>
                            <p className="font-bold">Plataforma Activa</p>
                            <p className="text-blue-200 text-sm">Última actualización: hace 2 horas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--iica-yellow)]">48</p>
                            <p className="text-blue-200">Fondos activos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">100%</p>
                            <p className="text-blue-200">Links verificados</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--iica-cyan)]">6</p>
                            <p className="text-blue-200">Fuentes monitoreadas</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
