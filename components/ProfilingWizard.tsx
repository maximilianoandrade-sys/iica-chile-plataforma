'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Target, CheckCircle, ChevronRight, X } from 'lucide-react';

export default function ProfilingWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(0); // 0: Hidden/Intro, 1: Region, 2: Profile, 3: Objective
    const [isVisible, setIsVisible] = useState(true);

    // Check if user has already searched or filtered
    useEffect(() => {
        const hasFilters = searchParams.has('region') || searchParams.has('category') || searchParams.has('beneficiary') || searchParams.has('q');
        if (hasFilters) {
            setIsVisible(false);
        }
    }, [searchParams]);

    const [selections, setSelections] = useState({
        region: '',
        beneficiary: '',
        category: ''
    });

    const regions = [
        "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
        "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
        "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes", "Nacional"
    ];

    const profiles = [
        { label: "Pequeño Agricultor / INDAP", value: "Pequeño productor" },
        { label: "Mediano / Empresario", value: "Todo tipo de productor" },
        { label: "Agtech / Innovador", value: "Personas naturales" }, // Mapping is approximate, user can refine later
        { label: "Organización / Cooperativa", value: "Organizaciones" }
    ];

    const objectives = [
        { label: "Mejorar Riego (Eficiencia Hídrica)", value: "Riego y Drenaje" },
        { label: "Recuperar Suelos", value: "Suelos" },
        { label: "Inversión y Maquinaria", value: "Inversión" },
        { label: "Innovación y Sustentabilidad", value: "Innovación" },
        { label: "Exportación / Mercado", value: "Comercialización" }
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else applyFilters();
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (selections.region && selections.region !== 'Nacional') params.set('region', selections.region);
        if (selections.beneficiary) params.set('beneficiary', selections.beneficiary);
        if (selections.category) params.set('category', selections.category);

        // Scroll to results
        const results = document.getElementById('convocatorias');
        if (results) results.scrollIntoView({ behavior: 'smooth' });

        router.push(`/?${params.toString()}`);
        setIsVisible(false);
    };

    const skipWizard = () => {
        setIsVisible(false);
    };

    if (!isVisible && step === 0) return null;

    return (
        <div className="w-full mb-8">
            <AnimatePresence mode="wait">
                {step === 0 && isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <span className="inline-block bg-[var(--iica-yellow)] text-[var(--iica-navy)] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">
                                    Nuevo Asistente
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">¿No sabes qué fondo elegir?</h2>
                                <p className="text-blue-100/90 text-lg">Responde 3 simples preguntas y te mostraremos las oportunidades ideales para tu perfil.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={skipWizard}
                                    className="px-4 py-2 text-blue-200 hover:text-white hover:underline text-sm font-medium"
                                >
                                    Ver todo sin filtrar
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 bg-white text-[var(--iica-navy)] font-bold rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    Comenzar Asistente <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step > 0 && (
                    <motion.div
                        key="wizard-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 relative overflow-hidden"
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                            <motion.div
                                className="h-full bg-[var(--iica-secondary)]"
                                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            ></motion.div>
                        </div>

                        <button onClick={skipWizard} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mt-4">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[var(--iica-blue)]">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">¿En qué región se ubica tu predio?</h3>
                                            <p className="text-gray-500 text-sm">Selecciona la ubicación principal del proyecto.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                                        {regions.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => {
                                                    setSelections({ ...selections, region: r });
                                                    handleNext();
                                                }}
                                                className={`p-3 rounded border text-sm text-left transition-all ${selections.region === r ? 'border-[var(--iica-secondary)] bg-green-50 ring-1 ring-[var(--iica-secondary)]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[var(--iica-blue)]">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">¿Cuál es tu perfil de usuario?</h3>
                                            <p className="text-gray-500 text-sm">Esto ayuda a filtrar por requisitos de venta o tamaño.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {profiles.map(p => (
                                            <button
                                                key={p.value}
                                                onClick={() => {
                                                    setSelections({ ...selections, beneficiary: p.value });
                                                    handleNext();
                                                }}
                                                className={`p-4 rounded-lg border text-left transition-all flex items-center justify-between ${selections.beneficiary === p.value ? 'border-[var(--iica-secondary)] bg-green-50 ring-1 ring-[var(--iica-secondary)]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <span className="font-medium text-gray-700">{p.label}</span>
                                                {selections.beneficiary === p.value && <CheckCircle className="h-5 w-5 text-[var(--iica-secondary)]" />}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={() => handleNext()} className="text-sm text-gray-400 hover:text-gray-600 underline mt-2">
                                        Omitir este paso
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[var(--iica-blue)]">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">¿Qué necesitas financiar?</h3>
                                            <p className="text-gray-500 text-sm">Selecciona tu objetivo principal.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {objectives.map(o => (
                                            <button
                                                key={o.value}
                                                onClick={() => {
                                                    setSelections({ ...selections, category: o.value });
                                                    // Trigger finish immediately on selection or wait? 
                                                    // Better state update then finish. 
                                                    // Due to closure issues with state in current render, we pass value directly to apply
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    if (selections.region && selections.region !== 'Nacional') params.set('region', selections.region);
                                                    if (selections.beneficiary) params.set('beneficiary', selections.beneficiary);
                                                    params.set('category', o.value);

                                                    const results = document.getElementById('convocatorias');
                                                    if (results) results.scrollIntoView({ behavior: 'smooth' });

                                                    router.push(`/?${params.toString()}`);
                                                    setIsVisible(false);
                                                }}
                                                className={`p-4 rounded-lg border text-left transition-all flex items-center justify-between ${selections.category === o.value ? 'border-[var(--iica-secondary)] bg-green-50 ring-1 ring-[var(--iica-secondary)]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                <span className="font-medium text-gray-700">{o.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => applyFilters()} className="text-sm text-[var(--iica-blue)] hover:underline mt-2 font-bold">
                                        Ver todos los resultados (Sin filtro de objetivo)
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
