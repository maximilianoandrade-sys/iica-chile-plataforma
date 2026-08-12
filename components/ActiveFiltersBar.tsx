'use client';

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export interface ActiveFilterItem {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersBarProps {
  activeFilters: ActiveFilterItem[];
  onClearAll: () => void;
  totalResults: number;
}

export default function ActiveFiltersBar({ activeFilters, onClearAll, totalResults }: ActiveFiltersBarProps) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="sticky top-16 z-30 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-2.5 px-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="container mx-auto max-w-[1200px] flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[var(--iica-navy)] dark:text-white shrink-0">
            <Filter className="h-3.5 w-3.5 text-[var(--iica-blue)]" />
            <span>Filtros Activos ({activeFilters.length}):</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => (
              <span
                key={filter.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[var(--iica-blue)] dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-semibold"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title={`Remover filtro: ${filter.label}`}
                  aria-label={`Remover filtro ${filter.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            {totalResults} resultado{totalResults !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Limpiar todo
          </button>
        </div>
      </div>
    </div>
  );
}
