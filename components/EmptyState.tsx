'use client';

import { motion } from 'framer-motion';
import { SearchX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
    onClear: () => void;
    searchTerm?: string;
    filtersActive?: boolean;
}

export default function EmptyState({ onClear, searchTerm, filtersActive }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            {/* Illustration */}
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <SearchX className="h-10 w-10 text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                    🔍
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-700 mb-2">
                No encontramos resultados
            </h3>

            {searchTerm ? (
                <p className="text-gray-500 mb-6 max-w-sm">
                    No hay oportunidades que coincidan con{' '}
                    <strong className="text-[var(--iica-navy)]">&ldquo;{searchTerm}&rdquo;</strong>.
                    Prueba con términos más generales como &ldquo;FONTAGRO&rdquo;, &ldquo;clima&rdquo; o &ldquo;BID&rdquo;.
                </p>
            ) : filtersActive ? (
                <p className="text-gray-500 mb-6 max-w-sm">
                    Ninguna convocatoria coincide con los filtros seleccionados. Intenta ampliar la búsqueda eliminando algún filtro.
                </p>
            ) : (
                <p className="text-gray-500 mb-6 max-w-sm">
                    No hay oportunidades disponibles en este momento. Vuelve pronto o limpia los filtros.
                </p>
            )}

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {['FONTAGRO', 'BID', 'FAO', 'clima', 'innovación'].map(term => (
                    <button
                        key={term}
                        onClick={() => {
                            // Navigate with quick search
                            const params = new URLSearchParams();
                            params.set('q', term);
                            window.location.href = `/?${params.toString()}`;
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-[var(--iica-blue)] border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        {term}
                    </button>
                ))}
            </div>

            <button
                onClick={onClear}
                id="empty-state-clear-btn"
                className="inline-flex items-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
                <RefreshCw className="h-4 w-4" />
                Limpiar todos los filtros
            </button>
        </motion.div>
    );
}
