'use client';

/**
 * SearchableFilterList — versión genérica de InstitutionFilter.
 *
 * Reutilizado para Institución, Región y Sector en el panel de filtros avanzados.
 * Muestra chips de acceso rápido (opcionales), buscador de texto y lista scrollable
 * de checkboxes con conteo.
 */
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface SearchableFilterListProps {
  /** Etiqueta del fieldset */
  label: string;
  /** Placeholder del input de búsqueda */
  placeholder?: string;
  /** Opciones disponibles con conteo de proyectos */
  items: { name: string; count: number }[];
  /** Valores actualmente seleccionados */
  selected: string[];
  /** Callback cuando cambia la selección */
  onChange: (selected: string[]) => void;
  /** Chips de acceso rápido (se muestran sobre el buscador) */
  quickChips?: string[];
}

export default function SearchableFilterList({
  label,
  placeholder = 'Buscar...',
  items,
  selected,
  onChange,
  quickChips = [],
}: SearchableFilterListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, search]);

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  // Chips de acceso rápido visibles sólo si existen en los items
  const visibleChips = quickChips.filter((chip) =>
    items.some((item) => item.name === chip)
  );

  const legendId = `filter-legend-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <fieldset className="space-y-2 border-0 p-0 m-0" aria-labelledby={legendId}>
      <legend
        id={legendId}
        className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"
      >
        {label}
      </legend>

      {/* Chips de acceso rápido */}
      {visibleChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${label} destacados`}>
          {visibleChips.map((chip) => {
            const isActive = selected.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggle(chip)}
                aria-pressed={isActive}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[32px] ${
                  isActive
                    ? 'bg-[var(--iica-blue)] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={`Buscar ${label.toLowerCase()}`}
          className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white pl-8 pr-3 py-2 text-sm text-gray-800 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
        />
      </div>

      {/* Lista scrollable de checkboxes */}
      <div
        className="max-h-40 overflow-y-auto rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800"
        role="group"
        aria-label={`Lista de ${label.toLowerCase()}`}
      >
        {items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            Sin opciones disponibles
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron resultados
          </p>
        ) : (
          filtered.map((item) => {
            const isChecked = selected.includes(item.name);
            const inputId = `filter-${label.replace(/\s+/g, '-').toLowerCase()}-${item.name
              .replace(/\s+/g, '-')
              .toLowerCase()}`;
            return (
              <label
                key={item.name}
                htmlFor={inputId}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.name)}
                  className="rounded border-gray-300 text-[var(--iica-blue)] focus:ring-[var(--iica-yellow)] w-4 h-4"
                />
                <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{item.count}</span>
              </label>
            );
          })
        )}
      </div>
    </fieldset>
  );
}
