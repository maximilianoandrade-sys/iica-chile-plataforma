'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Sprout, Target, ChevronRight, ArrowLeft, Sparkles, X } from 'lucide-react';

const REGIONES = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
    'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble',
    'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
];

const PRODUCTOS = [
    { emoji: '🌾', label: 'Cereales / Trigo' },
    { emoji: '🍇', label: 'Vitivinicultura' },
    { emoji: '🥑', label: 'Fruticultura' },
    { emoji: '🥦', label: 'Horticultura' },
    { emoji: '🐄', label: 'Ganadería' },
    { emoji: '🐑', label: 'Ovinos / Caprinos' },
    { emoji: '🐟', label: 'Acuicultura' },
    { emoji: '🌿', label: 'Hierbas / Aromáticas' },
    { emoji: '🌲', label: 'Forestal' },
    { emoji: '🍯', label: 'Apicultura' },
    { emoji: '🌱', label: 'Agricultura Orgánica' },
    { emoji: '🏔️', label: 'Agricultura de Montaña' },
];

const NECESIDADES = [
    { emoji: '💧', label: 'Riego', query: 'riego' },
    { emoji: '🚜', label: 'Maquinaria', query: 'maquinaria' },
    { emoji: '🌱', label: 'Suelos / Recuperación', query: 'suelos' },
    { emoji: '💡', label: 'Innovación / Tecnología', query: 'innovación' },
    { emoji: '🏗️', label: 'Infraestructura', query: 'infraestructura' },
    { emoji: '📦', label: 'Comercialización', query: 'comercialización' },
    { emoji: '🌍', label: 'Exportación', query: 'exportación' },
    { emoji: '👩‍🌾', label: 'Capacitación', query: 'capacitación' },
    { emoji: '🔬', label: 'Investigación', query: 'investigación' },
    { emoji: '🌊', label: 'Emergencia / Sequía', query: 'emergencia' },
    { emoji: '♻️', label: 'Sustentabilidad', query: 'sustentabilidad' },
    { emoji: '💰', label: 'Capital de Trabajo', query: 'capital' },
];

interface SimpleModeWizardProps {
    onClose: () => void;
}

export default function SimpleModeWizard({ onClose }: SimpleModeWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [region, setRegion] = useState('');
    const [producto, setProducto] = useState('');
    const [necesidad, setNecesidad] = useState<{ label: string; query: string } | null>(null);

    const steps = [
        { icon: <MapPin className="h-8 w-8" />, title: '¿Dónde estás?', subtitle: 'Selecciona tu región' },
        { icon: <Sprout className="h-8 w-8" />, title: '¿Qué produces?', subtitle: 'Selecciona tu rubro principal' },
        { icon: <Target className="h-8 w-8" />, title: '¿Qué necesitas?', subtitle: 'Selecciona tu necesidad principal' },
    ];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (necesidad?.query) params.set('q', necesidad.query);
        if (region) params.set('region', region);
        router.push(`/?${params.toString()}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--iica-navy)] to-[var(--iica-blue)] p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sparkles className="h-6 w-6 text-[var(--iica-yellow)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Modo Simple</h2>
                            <p className="text-blue-200 text-sm">3 preguntas para encontrar tu fondo</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-2">
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[var(--iica-yellow)]' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                    <p className="text-blue-200 text-xs mt-2">Paso {step + 1} de {steps.length}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-[var(--iica-blue)]">{steps[0].icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--iica-navy)]">{steps[0].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[0].subtitle}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {REGIONES.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => { setRegion(r); setStep(1); }}
                                            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] ${region === r
                                                ? 'border-[var(--iica-blue)] bg-blue-50 text-[var(--iica-navy)]'
                                                : 'border-gray-200 hover:border-[var(--iica-blue)] hover:bg-blue-50/50 text-gray-700'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-[var(--iica-secondary)]">{steps[1].icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--iica-navy)]">{steps[1].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[1].subtitle}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {PRODUCTOS.map((p) => (
                                        <button
                                            key={p.label}
                                            onClick={() => { setProducto(p.label); setStep(2); }}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] ${producto === p.label
                                                ? 'border-[var(--iica-secondary)] bg-green-50 text-[var(--iica-navy)]'
                                                : 'border-gray-200 hover:border-[var(--iica-secondary)] hover:bg-green-50/50 text-gray-700'
                                                }`}
                                        >
                                            <span className="text-xl">{p.emoji}</span>
                                            <span>{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-[var(--iica-yellow)]">{steps[2].icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--iica-navy)]">{steps[2].title}</h3>
                                        <p className="text-gray-500 text-sm">{steps[2].subtitle}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {NECESIDADES.map((n) => (
                                        <button
                                            key={n.label}
                                            onClick={() => setNecesidad(n)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] ${necesidad?.label === n.label
                                                ? 'border-[var(--iica-yellow)] bg-yellow-50 text-[var(--iica-navy)]'
                                                : 'border-gray-200 hover:border-[var(--iica-yellow)] hover:bg-yellow-50/50 text-gray-700'
                                                }`}
                                        >
                                            <span className="text-xl">{n.emoji}</span>
                                            <span>{n.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-between items-center gap-3">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors min-h-[48px]"
                        >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 2 && necesidad && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleSearch}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all min-h-[56px] text-lg"
                        >
                            <Sparkles className="h-5 w-5" />
                            Buscar Fondos
                            <ChevronRight className="h-5 w-5" />
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
