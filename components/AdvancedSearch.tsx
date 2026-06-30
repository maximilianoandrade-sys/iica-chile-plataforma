'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Clock, Star, Loader2 } from 'lucide-react';
import { type FilterCounts } from '@/lib/data';

interface SavedSearch {
  id: string;
  query: string;
  timestamp: number;
}

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  filterCounts: FilterCounts;
  isPending?: boolean;
}

export default function AdvancedSearch({ value, onChange, onClear, filterCounts, isPending }: AdvancedSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = 'advanced-search-listbox';

  // Sincronizar con valor externo (URL param)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('iica_savedSearches');
      if (saved) setSavedSearches(JSON.parse(saved));
      const recent = localStorage.getItem('iica_recentSearches');
      if (recent) setRecentSearches(JSON.parse(recent));
    } catch {}
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounce: propaga cambios al padre (URL params) después de 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) onChange(inputValue);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue, value, onChange]);

  // Sugerencias en tiempo real desde los datos reales de filterCounts
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const lower = inputValue.toLowerCase();
    const results = new Set<{ text: string; type: 'institución' | 'región' | 'sector' }>();

    Object.keys(filterCounts.institucion ?? {}).forEach((inst) => {
      if (inst.toLowerCase().includes(lower)) results.add({ text: inst, type: 'institución' });
    });
    Object.keys(filterCounts.region ?? {}).forEach((region) => {
      if (region.toLowerCase().includes(lower)) results.add({ text: region, type: 'región' });
    });
    Object.keys(filterCounts.categoria ?? {}).forEach((cat) => {
      if (cat.toLowerCase().includes(lower)) results.add({ text: cat, type: 'sector' });
    });

    return Array.from(results).slice(0, 8);
  }, [inputValue, filterCounts]);

  // Flat list of all visible options for keyboard navigation
  const flatOptions = useMemo((): string[] => {
    if (inputValue.trim() && suggestions.length > 0) {
      return suggestions.map((s) => s.text);
    }
    if (!inputValue.trim()) {
      return [...recentSearches, ...savedSearches.map((s) => s.query)];
    }
    return [];
  }, [inputValue, suggestions, recentSearches, savedSearches]);

  // Reset activeIndex when options change
  useEffect(() => {
    setActiveIndex(-1);
  }, [flatOptions]);

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  const saveToRecent = (query: string) => {
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 6);
    setRecentSearches(updated);
    try { localStorage.setItem('iica_recentSearches', JSON.stringify(updated)); } catch {}
  };

  const handleSelect = (query: string) => {
    setInputValue(query);
    setShowDropdown(false);
    onChange(query);
    saveToRecent(query);
  };

  const handleSave = () => {
    if (!inputValue.trim()) return;
    const newSave: SavedSearch = { id: Date.now().toString(), query: inputValue.trim(), timestamp: Date.now() };
    const updated = [newSave, ...savedSearches.filter((s) => s.query !== inputValue.trim())].slice(0, 10);
    setSavedSearches(updated);
    try { localStorage.setItem('iica_savedSearches', JSON.stringify(updated)); } catch {}
  };

  const handleRemoveSaved = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    try { localStorage.setItem('iica_savedSearches', JSON.stringify(updated)); } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setShowDropdown(false); setActiveIndex(-1); inputRef.current?.blur(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) { setShowDropdown(true); return; }
      setActiveIndex((prev) => (prev < flatOptions.length - 1 ? prev + 1 : 0));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showDropdown) { setShowDropdown(true); return; }
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatOptions.length - 1));
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < flatOptions.length) {
        e.preventDefault();
        handleSelect(flatOptions[activeIndex]);
      } else {
        setShowDropdown(false);
        saveToRecent(inputValue.trim());
        onChange(inputValue);
      }
      setActiveIndex(-1);
    }
  };

  const showSuggestions = showDropdown && inputValue.trim().length > 0 && suggestions.length > 0;
  const showHistory = showDropdown && !inputValue.trim() && (recentSearches.length > 0 || savedSearches.length > 0);
  const dropdownVisible = showSuggestions || showHistory;

  const typeColors = {
    'institución': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'región': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'sector': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input principal */}
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--iica-blue)] animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Buscar oportunidades"
          aria-autocomplete="list"
          aria-expanded={dropdownVisible}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          placeholder="Busca por palabra clave, sector, institución..."
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); setActiveIndex(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border-2 border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white py-3 pl-12 pr-24 text-sm text-gray-900 placeholder:text-gray-400 min-h-[48px] focus:outline-none focus:border-[var(--iica-blue)] transition-colors"
        />
        {/* Botones derecha */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue.trim() && (
            <button
              type="button"
              onClick={handleSave}
              title="Guardar búsqueda"
              className="p-1.5 rounded-lg text-gray-300 hover:text-[var(--iica-yellow)] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
              aria-label="Guardar búsqueda"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); setShowDropdown(false); onClear(); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {dropdownVisible && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugerencias de búsqueda"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-[var(--iica-border)] dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {/* Sugerencias en tiempo real */}
          {showSuggestions && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Sugerencias
              </p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  id={`${listboxId}-option-${i}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => handleSelect(s.text)}
                  className={`w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${activeIndex === i ? 'bg-[var(--iica-blue)]/10 dark:bg-gray-700' : 'hover:bg-[var(--iica-blue)]/5 dark:hover:bg-gray-700'}`}
                >
                  <Search className="w-4 h-4 text-[var(--iica-secondary)] dark:text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-800 dark:text-white flex-1">{s.text}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[s.type]}`}>
                    {s.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Búsquedas recientes */}
          {showHistory && recentSearches.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Búsquedas recientes
              </p>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  id={`${listboxId}-option-${i}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === i}
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${activeIndex === i ? 'bg-[var(--iica-blue)]/10 dark:bg-gray-700' : 'hover:bg-[var(--iica-blue)]/5 dark:hover:bg-gray-700'}`}
                >
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Búsquedas guardadas */}
          {showHistory && savedSearches.length > 0 && (
            <div className={recentSearches.length > 0 ? 'border-t border-[var(--iica-border)] dark:border-gray-700' : ''}>
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Guardadas
              </p>
              {savedSearches.map((s, i) => {
                const optionIndex = recentSearches.length + i;
                return (
                <div key={s.id} className="flex items-center group">
                  <button
                    type="button"
                    id={`${listboxId}-option-${optionIndex}`}
                    role="option"
                    aria-selected={activeIndex === optionIndex}
                    onClick={() => handleSelect(s.query)}
                    className={`flex-1 text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${activeIndex === optionIndex ? 'bg-[var(--iica-blue)]/10 dark:bg-gray-700' : 'hover:bg-[var(--iica-blue)]/5 dark:hover:bg-gray-700'}`}
                  >
                    <Star className="w-4 h-4 text-[var(--iica-yellow)] shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.query}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSaved(s.id)}
                    className="px-3 py-2.5 text-gray-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Eliminar "${s.query}"`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                );
              })}
            </div>
          )}

          {/* Hint teclado */}
          <div className="px-4 py-2 border-t border-[var(--iica-border)] dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 flex items-center gap-3">
            <p className="text-[10px] text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-[10px] font-mono">↑↓</kbd>
              {' '}navegar
              {' · '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-[10px] font-mono">↵</kbd>
              {' '}seleccionar
              {' · '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-[10px] font-mono">Esc</kbd>
              {' '}cerrar
              {' · '}
              <Star className="w-3 h-3 inline text-[var(--iica-yellow)]" />
              {' '}guardar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
