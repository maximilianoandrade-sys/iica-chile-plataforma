'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROL_IICA_OPTIONS = [
    { value: 'Todos', label: '🎯 Todos los roles' },
    { value: 'Ejecutor', label: '✅ IICA Ejecutor' },
    { value: 'Implementador', label: '🔧 Implementador' },
    { value: 'Asesor', label: '💼 Asesor técnico' },
    { value: 'Indirecto', label: '⚠️ Rol indirecto' },
];

const AMBITO_OPTIONS = [
    { value: 'Todos', label: '🌐 Todos' },
    { value: 'Internacional', label: '🌎 Internacional' },
    { value: 'Nacional', label: '🇨🇱 Nacional' },
    { value: 'Regional', label: '🗺️ Regional' },
];

const VIABILIDAD_OPTIONS = [
    { value: 'Todas', label: '⭐ Todas' },
    { value: 'Alta', label: '★★★ Alta' },
    { value: 'Media', label: '★★ Media' },
    { value: 'Baja', label: '★ Baja' },
];

const ESTADO_OPTIONS = [
    { value: 'Todos', label: '📋 Todos los estados' },
    { value: 'Abierta', label: '🟢 Abierta' },
    { value: 'Próxima', label: '🟡 Próxima' },
    { value: 'Cerrada', label: '🔴 Cerrada' },
];

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileFilterDrawer({ isOpen, onClose }: MobileFilterDrawerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedRol = searchParams.get('rol') || 'Todos';
    const selectedAmbito = searchParams.get('ambito') || 'Todos';
    const selectedViabilidad = searchParams.get('viabilidad') || 'Todas';
    const selectedEstado = searchParams.get('estado') || 'Todos';
    const soloAbiertos = searchParams.get('open') === '1';

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedRol !== 'Todos') count++;
        if (selectedAmbito !== 'Todos') count++;
        if (selectedViabilidad !== 'Todas') count++;
        if (selectedEstado !== 'Todos') count++;
        if (soloAbiertos) count++;
        return count;
    }, [selectedRol, selectedAmbito, selectedViabilidad, selectedEstado, soloAbiertos]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const empties = ['Todas', 'Todos'];
        if (value && !empties.includes(value)) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    const toggleSoloAbiertos = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (soloAbiertos) { params.delete('open'); } else { params.set('open', '1'); }
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [searchParams, soloAbiertos, router]);

    const clearAllFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('rol');
        params.delete('ambito');
        params.delete('viabilidad');
        params.delete('estado');
        params.delete('open');
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filtros"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <button
                                onClick={onClose}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Cerrar filtros"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                            <h2 className="text-base font-bold text-gray-900">Filtros</h2>
                            <button
                                onClick={clearAllFilters}
                                className="text-sm font-medium text-red-500 hover:text-red-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                                Limpiar todo
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                            {/* Rol IICA */}
                            <FilterSection label="Rol IICA">
                                <div className="flex flex-wrap gap-2">
                                    {ROL_IICA_OPTIONS.map(opt => (
                                        <PillButton
                                            key={opt.value}
                                            label={opt.label}
                                            active={selectedRol === opt.value}
                                            onClick={() => handleFilterChange('rol', opt.value)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Ámbito */}
                            <FilterSection label="Ámbito">
                                <div className="flex flex-wrap gap-2">
                                    {AMBITO_OPTIONS.map(opt => (
                                        <PillButton
                                            key={opt.value}
                                            label={opt.label}
                                            active={selectedAmbito === opt.value}
                                            onClick={() => handleFilterChange('ambito', opt.value)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Viabilidad */}
                            <FilterSection label="Viabilidad">
                                <div className="flex flex-wrap gap-2">
                                    {VIABILIDAD_OPTIONS.map(opt => (
                                        <PillButton
                                            key={opt.value}
                                            label={opt.label}
                                            active={selectedViabilidad === opt.value}
                                            onClick={() => handleFilterChange('viabilidad', opt.value)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Estado */}
                            <FilterSection label="Estado">
                                <div className="flex flex-wrap gap-2">
                                    {ESTADO_OPTIONS.map(opt => (
                                        <PillButton
                                            key={opt.value}
                                            label={opt.label}
                                            active={selectedEstado === opt.value}
                                            onClick={() => handleFilterChange('estado', opt.value)}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Solo abiertos */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-gray-700">Solo oportunidades abiertas</span>
                                <button
                                    onClick={toggleSoloAbiertos}
                                    role="switch"
                                    aria-checked={soloAbiertos}
                                    className={`relative w-12 h-7 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center ${soloAbiertos ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${soloAbiertos ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 bg-white">
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-[var(--iica-navy)] text-white font-bold text-sm rounded-xl hover:bg-[var(--iica-navy)]/90 transition-colors min-h-[44px]"
                            >
                                Aplicar filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
            {children}
        </div>
    );
}

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border min-h-[44px] ${active
                ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
        >
            {label}
        </button>
    );
}
