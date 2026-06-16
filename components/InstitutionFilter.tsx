'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface InstitutionFilterProps {
  institutions: { name: string; count: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const QUICK_ACCESS_CHIPS = ['CNR', 'INDAP', 'FIA', 'CORFO', 'FONTAGRO', 'FAO'];

export default function InstitutionFilter({
  institutions,
  selected,
  onChange,
}: InstitutionFilterProps) {
  const [search, setSearch] = useState('');

  const filteredInstitutions = useMemo(() => {
    if (!search.trim()) return institutions;
    const term = search.toLowerCase();
    return institutions.filter((inst) => inst.name.toLowerCase().includes(term));
  }, [institutions, search]);

  function toggleInstitution(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  function toggleChip(name: string) {
    toggleInstitution(name);
  }

  return (
    <fieldset
      className="space-y-2 border-0 p-0 m-0"
      aria-label="Filtrar por institución"
    >
      <legend className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
        Institución
      </legend>

      {/* Quick-access chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Instituciones destacadas">
        {QUICK_ACCESS_CHIPS.map((chip) => {
          const isActive = selected.includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => toggleChip(chip)}
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

      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar institución..."
          aria-label="Buscar institución"
          className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white pl-8 pr-3 py-2 text-sm text-gray-800 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
        />
      </div>

      {/* Checkbox list */}
      <div
        className="max-h-40 overflow-y-auto rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800"
        role="group"
        aria-label="Lista de instituciones"
      >
        {filteredInstitutions.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron instituciones
          </p>
        ) : (
          filteredInstitutions.map((inst) => {
            const isChecked = selected.includes(inst.name);
            const inputId = `inst-filter-${inst.name.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <label
                key={inst.name}
                htmlFor={inputId}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleInstitution(inst.name)}
                  className="rounded border-gray-300 text-[var(--iica-blue)] focus:ring-[var(--iica-yellow)] w-4 h-4"
                />
                <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
                  {inst.name}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">
                  {inst.count}
                </span>
              </label>
            );
          })
        )}
      </div>
    </fieldset>
  );
}
