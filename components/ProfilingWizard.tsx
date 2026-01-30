'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Target, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';

export default function ProfilingWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(0); // 0: Hidden/Intro, 1: Objective, 2: Region, 3: Profile
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
        { label: "Pequeño Productor", value: "Pequeño productor", icon: "👨‍🌾" },
        { label: "Empresa / Cooperativa", value: "Todo tipo de productor", icon: "🏢" }, // Aproximación
        { label: "Joven / Mujer", value: "Personas naturales", icon: "👩‍🌾" } // Aproximación
    ];

    const objectives = [
        { label: "Riego", value: "Riego y Drenaje", icon: "💧" },
        { label: "Suelos", value: "Suelos", icon: "🌱" },
        { label: "Maquinaria", value: "Inversión", icon: "🚜" },
        { label: "Inversión", value: "Inversión", icon: "💰" }
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else applyFilters();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else setStep(0); // Volver a intro si está en paso 1
    };

    const applyFilters = (finalBeneficiary?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        // Use provided value or state
        const beneficiaryToUse = finalBeneficiary || selections.beneficiary;

        if (selections.region && selections.region !== 'Nacional') params.set('region', selections.region);
        if (beneficiaryToUse) params.set('beneficiary', beneficiaryToUse);
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
        <div className="w-full mb-8 relative z-30">
            <AnimatePresence mode="wait">
                {step === 0 && isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] rounded-xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-block bg-[var(--iica-yellow)] text-[var(--iica-navy)] text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">
                                    Nuevo Asistente 2.0
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold mb-3">Encuentra tu fondo ideal en 3 pasos</h2>
                                <p className="text-blue-100/90 text-lg">Responde unas breves preguntas y filtraremos las oportunidades por ti.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <button
                                    onClick={skipWizard}
                                    className="px-4 py-3 text-blue-200 hover:text-white hover:underline text-sm font-medium transition-colors"
                                >
                                    Ver todo sin filtrar
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 bg-white text-[var(--iica-navy)] font-bold rounded-full shadow-lg hover:bg-gray-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    Comenzar Ahora <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            key="wizard-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="bg-[var(--iica-blue)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                        {step}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Paso {step} de 3
                                    </span>
                                </div>
                                <button onClick={skipWizard} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 bg-gray-100 w-full">
                                <motion.div
                                    className="h-full bg-[var(--iica-secondary)]"
                                    initial={{ width: `${((step - 1) / 3) * 100}%` }}
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                ></motion.div>
                            </div>

                            <div className="p-8">
                                {/* STEP 1: OBJECTIVE */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--iica-blue)]">
                                                <Target className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Cuál es tu objetivo principal?</h3>
                                            <p className="text-gray-500">Selecciona qué necesitas financiar para tu proyecto.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {objectives.map(o => (
                                                <button
                                                    key={o.value}
                                                    onClick={() => {
                                                        setSelections({ ...selections, category: o.value });
                                                        handleNext();
                                                    }}
                                                    className={`p-6 rounded-xl border-2 text-center transition-all hover:shadow-md ${selections.category === o.value ? 'border-[var(--iica-blue)] bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                                                >
                                                    <div className="text-3xl mb-3">{o.icon}</div>
                                                    <span className="font-bold text-gray-700 block">{o.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: REGION */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--iica-blue)]">
                                                <MapPin className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿En qué región te encuentras?</h3>
                                            <p className="text-gray-500">Te mostraremos fondos disponibles en tu zona.</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 custom-scrollbar">
                                            {regions.map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => {
                                                        setSelections({ ...selections, region: r });
                                                        handleNext();
                                                    }}
                                                    className={`p-3 rounded-lg border text-sm text-center transition-all ${selections.region === r ? 'border-[var(--iica-blue)] bg-blue-50 font-bold text-[var(--iica-blue)]' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: PROFILE */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--iica-blue)]">
                                                <User className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Cómo te defines?</h3>
                                            <p className="text-gray-500">Selecciona tu perfil para ajustar los requisitos.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {profiles.map(p => (
                                                <button
                                                    key={p.value}
                                                    onClick={() => {
                                                        setSelections({ ...selections, beneficiary: p.value });
                                                        applyFilters(p.value);
                                                    }}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md flex items-center gap-4 ${selections.beneficiary === p.value ? 'border-[var(--iica-blue)] bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                                                >
                                                    <div className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">{p.icon}</div>
                                                    <div>
                                                        <span className="font-bold text-gray-800 block">{p.label}</span>
                                                        <span className="text-xs text-gray-500">Filtrar para {p.value}</span>
                                                    </div>
                                                    <ChevronRight className="ml-auto text-gray-300" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Navigation */}
                            <div className="bg-gray-50 px-8 py-4 flex justify-between items-center border-t border-gray-100">
                                <button
                                    onClick={handleBack}
                                    className="text-gray-500 font-medium hover:text-[var(--iica-navy)] flex items-center gap-1 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Volver
                                </button>

                                <div className="flex gap-2">
                                    {/* Dots indicator */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-[var(--iica-blue)]' : 'bg-gray-300'}`}></div>
                                    ))}
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
