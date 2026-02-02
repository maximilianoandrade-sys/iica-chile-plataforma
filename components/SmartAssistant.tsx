'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Project } from '@/lib/data';

interface SmartAssistantProps {
    projects: Project[];
}

export default function SmartAssistant({ projects }: SmartAssistantProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVisible, setIsVisible] = useState(true);

    // Check if user has already searched or filtered
    useEffect(() => {
        const hasFilters = searchParams.has('region') || searchParams.has('category') || searchParams.has('beneficiary') || searchParams.has('q');
        if (hasFilters) {
            setIsVisible(false);
        }
    }, [searchParams]);

    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [selectedNeed, setSelectedNeed] = useState<string>('');

    const profiles = [
        { label: "Pequeño Productor", value: "Pequeño productor", icon: "👨‍🌾" },
        { label: "Empresa / Cooperativa", value: "Todo tipo de productor", icon: "🏢" },
        { label: "Joven / Mujer", value: "Personas naturales", icon: "👩‍🌾" }
    ];

    const needs = [
        { label: "Riego", value: "Riego y Drenaje", icon: "💧" },
        { label: "Suelos", value: "Suelos", icon: "🌱" },
        { label: "Maquinaria", value: "Inversión", icon: "🚜" },
        { label: "Innovación", value: "Innovación", icon: "💡" }
    ];

    // Calculate matching results in real-time
    const calculateResults = () => {
        return projects.filter(project => {
            const matchesProfile = !selectedProfile || (project.beneficiarios && project.beneficiarios.includes(selectedProfile));
            const matchesNeed = !selectedNeed || project.categoria === selectedNeed;
            return matchesProfile && matchesNeed;
        }).length;
    };

    const resultCount = calculateResults();

    const handleViewResults = () => {
        const params = new URLSearchParams();
        if (selectedProfile) params.set('beneficiary', selectedProfile);
        if (selectedNeed) params.set('category', selectedNeed);

        // Scroll to results
        const results = document.getElementById('convocatorias');
        if (results) results.scrollIntoView({ behavior: 'smooth' });

        router.push(`/?${params.toString()}#convocatorias`);
        setIsVisible(false);
    };

    const skipAssistant = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-8 bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] rounded-xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-[var(--iica-yellow)]" />
                            <span className="inline-block bg-[var(--iica-yellow)] text-[var(--iica-navy)] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                Asistente 2.0
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">Encuentra tu fondo ideal</h2>
                        <p className="text-blue-100/90 mt-1">Selecciona tu perfil y necesidad para filtrar oportunidades</p>
                    </div>
                    <button
                        onClick={skipAssistant}
                        className="text-blue-200 hover:text-white text-sm font-medium transition-colors hidden md:block"
                    >
                        Omitir
                    </button>
                </div>

                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Profile Selection */}
                    <div>
                        <label className="block text-sm font-bold mb-3 text-blue-100">
                            👤 ¿Cómo te defines?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {profiles.map(profile => (
                                <button
                                    key={profile.value}
                                    onClick={() => setSelectedProfile(selectedProfile === profile.value ? '' : profile.value)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                        selectedProfile === profile.value
                                            ? 'bg-white text-[var(--iica-navy)] shadow-lg scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    <span>{profile.icon}</span>
                                    <span>{profile.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Need Selection */}
                    <div>
                        <label className="block text-sm font-bold mb-3 text-blue-100">
                            🎯 ¿Qué necesitas?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {needs.map(need => (
                                <button
                                    key={need.value}
                                    onClick={() => setSelectedNeed(selectedNeed === need.value ? '' : need.value)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                        selectedNeed === need.value
                                            ? 'bg-white text-[var(--iica-navy)] shadow-lg scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    <span>{need.icon}</span>
                                    <span>{need.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/20">
                    <div className="text-sm text-blue-100">
                        {selectedProfile || selectedNeed ? (
                            <>
                                <span className="font-bold text-[var(--iica-yellow)]">{resultCount}</span> {resultCount === 1 ? 'fondo coincide' : 'fondos coinciden'} con tu selección
                            </>
                        ) : (
                            'Selecciona al menos un filtro para ver resultados'
                        )}
                    </div>
                    <button
                        onClick={handleViewResults}
                        disabled={!selectedProfile && !selectedNeed}
                        className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${
                            selectedProfile || selectedNeed
                                ? 'bg-[var(--iica-secondary)] hover:bg-green-600 text-white hover:scale-105'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                    >
                        Ver {resultCount} {resultCount === 1 ? 'Resultado' : 'Resultados'}
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
