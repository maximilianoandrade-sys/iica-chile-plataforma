'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProjectSearchProps {
  onSearchResults: (results: any[] | null, meta?: any) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function ProjectSearch({ onSearchResults, onClear, placeholder }: ProjectSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMeta, setSearchMeta] = useState<any | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/search-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, scope: "all", role: "all", use_ai: true }),
      });
      const data = await res.json();
      setSearchMeta(data.meta);
      setHasResults(true);
      onSearchResults(data.results, data.meta);
    } catch (e) {
      setSearchError("Error al buscar proyectos");
    } finally {
      setSearching(false);
    }
  }, [onSearchResults]);

  const handleClear = () => {
    setSearchQuery("");
    setSearchMeta(null);
    setSearchError(null);
    setHasResults(false);
    onClear();
  };

  return (
    <div className="p-6 bg-white border-b border-gray-100">
      <div className="flex gap-2 mb-3 text-gray-900">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
          placeholder={placeholder || "Buscar proyectos reales... ej: riego, cambio climático, emprendimiento mujeres"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[var(--iica-blue)] focus:ring-1 focus:ring-[var(--iica-blue)] transition-all bg-gray-50/50"
          style={{ color: '#111827' }}
          aria-label="Buscar oportunidades"
        />
        <button
          onClick={() => handleSearch(searchQuery)}
          disabled={searching}
          className="px-6 py-3 bg-[var(--iica-blue)] text-white rounded-xl text-sm font-bold hover:bg-[var(--iica-navy)] disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
          aria-label="Buscar con inteligencia artificial"
        >
          {searching ? "Buscando..." : "🔍 Buscar con IA"}
        </button>
        {hasResults && (
          <button
            onClick={handleClear}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors bg-white whitespace-nowrap"
            aria-label="Limpiar búsqueda"
          >
            ✕ Limpiar
          </button>
        )}
      </div>
      {searchMeta && (
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {searchMeta.total} Resultados Reales
          </span>
          <p className="text-xs text-gray-500 font-medium ml-1">
            {searchMeta.ai_generated ? "✨ Potenciado por Inteligencia Artificial y Búsqueda Web" : "📋 Desde Base de Datos Institucional"}
          </p>
        </div>
      )}
      {searchError && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">{searchError}</span>
        </div>
      )}
    </div>
  );
}
