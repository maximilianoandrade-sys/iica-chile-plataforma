'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, ExternalLink, Check, Minus, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/lib/data';

// ──────────────────────────────────────────────────────
// Context for Comparador
// ──────────────────────────────────────────────────────
interface ComparadorContextType {
    selected: Project[];
    toggle: (project: Project) => void;
    isSelected: (id: number) => boolean;
    clear: () => void;
    openModal: () => void;
    closeModal: () => void;
    isOpen: boolean;
}

const ComparadorContext = createContext<ComparadorContextType | null>(null);

export function ComparadorProvider({ children }: { children: React.ReactNode }) {
    const [selected, setSelected] = useState<Project[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = useCallback((project: Project) => {
        setSelected(prev => {
            const exists = prev.find(p => p.id === project.id);
            if (exists) return prev.filter(p => p.id !== project.id);
            if (prev.length >= 3) return prev; // max 3
            return [...prev, project];
        });
    }, []);

    const isSelected = useCallback((id: number) => selected.some(p => p.id === id), [selected]);
    const clear = useCallback(() => setSelected([]), []);
    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);

    return (
        <ComparadorContext.Provider value={{ selected, toggle, isSelected, clear, openModal, closeModal, isOpen }}>
            {children}
            <ComparadorBar />
            <ComparadorModal />
        </ComparadorContext.Provider>
    );
}

export function useComparador() {
    const ctx = useContext(ComparadorContext);
    if (!ctx) throw new Error('useComparador must be used within ComparadorProvider');
    return ctx;
}

// ──────────────────────────────────────────────────────
// Floating bar
// ──────────────────────────────────────────────────────
function ComparadorBar() {
    const { selected, clear, openModal, isOpen } = useComparador();

    if (selected.length === 0 || isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="bg-[var(--iica-navy)] text-white rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 border border-white/10">
                    <Scale className="h-5 w-5 text-blue-300 flex-shrink-0" />
                    <span className="font-bold text-sm">
                        {selected.length} {selected.length === 1 ? 'oportunidad' : 'oportunidades'} seleccionadas
                    </span>
                    <div className="flex items-center gap-1">
                        {selected.map((p) => (
                            <span key={p.id} className="text-xs bg-white/10 rounded-full px-2 py-0.5 max-w-[80px] truncate">
                                {p.institucion}
                            </span>
                        ))}
                    </div>
                    {selected.length < 3 && (
                        <span className="text-xs text-blue-300">
                            (máx. 3)
                        </span>
                    )}
                    <button
                        onClick={openModal}
                        className="bg-[var(--iica-blue)] hover:bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        Comparar <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={clear}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Limpiar comparador"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ──────────────────────────────────────────────────────
// Compare Button (used in ProjectItem)
// ──────────────────────────────────────────────────────
export function CompareButton({ project }: { project: Project }) {
    const { toggle, isSelected, selected } = useComparador();
    const selected_ = isSelected(project.id);
    const isFull = selected.length >= 3 && !selected_;

    return (
        <button
            onClick={() => toggle(project)}
            disabled={isFull}
            title={isFull ? 'Máximo 3 para comparar' : selected_ ? 'Quitar del comparador' : 'Agregar al comparador'}
            aria-label={selected_ ? 'Quitar del comparador' : 'Agregar al comparador'}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${selected_
                ? 'bg-[var(--iica-blue)] text-white border-[var(--iica-blue)] shadow-sm'
                : isFull
                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--iica-blue)] hover:text-[var(--iica-blue)]'
                }`}
        >
            <Scale className="h-3.5 w-3.5" />
            {selected_ ? 'En comparador' : 'Comparar'}
        </button>
    );
}

// ──────────────────────────────────────────────────────
// Modal
// ──────────────────────────────────────────────────────
function formatMonto(monto: number) {
    if (monto <= 0) return 'Consultar';
    if (monto >= 1_000_000_000) return `$${(monto / 1_000_000_000).toFixed(1)} mil M`;
    return `$${(monto / 1_000_000).toFixed(0)}M`;
}

function ViabilidadPct({ pct }: { pct?: number }) {
    if (!pct) return <Minus className="h-4 w-4 text-gray-300" />;
    const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-8 flex-shrink-0">{pct}%</span>
        </div>
    );
}

const COMPARE_ROWS: { label: string; key: keyof Project | 'monto_fmt' | 'fecha_fmt' | 'regiones_fmt'; render?: (val: unknown) => React.ReactNode }[] = [
    { label: 'Institución', key: 'institucion' },
    { label: 'Categoría', key: 'categoria' },
    { label: 'Monto Máximo', key: 'monto_fmt' },
    { label: 'Cierre', key: 'fecha_fmt' },
    { label: 'Ámbito', key: 'ambito' },
    { label: 'Viabilidad IICA', key: 'porcentajeViabilidad', render: (v) => <ViabilidadPct pct={v as number} /> },
    { label: 'Complejidad', key: 'complejidad' },
    { label: 'Regiones', key: 'regiones_fmt' },
    { label: 'Responsable IICA', key: 'responsableIICA' },
    { label: 'Estado', key: 'estadoPostulacion' },
];

function getVal(project: Project, key: string): unknown {
    if (key === 'monto_fmt') return formatMonto(project.monto);
    if (key === 'fecha_fmt') return new Date(project.fecha_cierre).toLocaleDateString('es-CL');
    if (key === 'regiones_fmt') {
        if (!project.regiones) return '—';
        if (project.regiones.includes('Todas')) return 'Todo Chile';
        return project.regiones.slice(0, 3).join(', ') + (project.regiones.length > 3 ? '...' : '');
    }
    return (project as unknown as Record<string, unknown>)[key] ?? '—';
}

function ComparadorModal() {
// Asegura export default para soporte con dynamic import

    const { selected, isOpen, closeModal, clear, toggle } = useComparador();
    const [collapsed, setCollapsed] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-[var(--iica-blue)] rounded-xl p-2">
                                <Scale className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-black text-[var(--iica-navy)] text-lg">Comparador de Oportunidades</h2>
                                <p className="text-xs text-gray-500">{selected.length} de 3 oportunidades seleccionadas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Cerrar comparador"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {!collapsed && (
                        <div className="overflow-auto flex-1">
                            <table className="w-full min-w-[600px]">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr>
                                        <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 w-36 border-b border-gray-200">
                                            Característica
                                        </th>
                                        {selected.map((p) => (
                                            <th key={p.id} className="px-4 py-3 border-b border-gray-200 min-w-[200px]">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="text-left">
                                                        <div className="font-black text-[var(--iica-navy)] text-sm leading-snug line-clamp-2">
                                                            {p.nombre}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{p.institucion}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => { toggle(p); if (selected.length === 1) closeModal(); }}
                                                        className="text-gray-300 hover:text-red-500 flex-shrink-0 mt-0.5"
                                                        aria-label="Quitar"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    <Link
                                                        href={`/proyecto/${p.id}`}
                                                        onClick={closeModal}
                                                        className="flex-1 text-center text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-1.5 transition-colors"
                                                    >
                                                        Detalle
                                                    </Link>
                                                    {new Date(p.fecha_cierre) > new Date() && (
                                                        <a
                                                            href={p.url_bases}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 text-center text-xs font-bold bg-[var(--iica-blue)] text-white rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            Bases <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        {/* Empty slot indicators */}
                                        {Array.from({ length: 3 - selected.length }).map((_, i) => (
                                            <th key={`empty-${i}`} className="px-4 py-3 border-b border-gray-200 min-w-[180px]">
                                                <div className="h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                                                    + Añadir
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMPARE_ROWS.map((row, ri) => (
                                        <tr key={row.key} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                            <td className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                {row.label}
                                            </td>
                                            {selected.map((p) => {
                                                const val = getVal(p, row.key);
                                                return (
                                                    <td key={p.id} className="px-4 py-3 text-sm text-gray-700">
                                                        {row.render ? row.render(val) : (
                                                            typeof val === 'boolean'
                                                                ? (val ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-400" />)
                                                                : (val as string) || <Minus className="h-4 w-4 text-gray-300" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {Array.from({ length: 3 - selected.length }).map((_, i) => (
                                                <td key={`empty-${i}`} className="px-4 py-3" />
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => { clear(); closeModal(); }}
                            className="text-sm text-red-500 hover:text-red-700 font-bold transition-colors"
                        >
                            Limpiar comparador
                        </button>
                        <button
                            onClick={closeModal}
                            className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
