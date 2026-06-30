'use client';

import React, { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchableMultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  selectedLabel?: (count: number) => string;
  quickAccessValues?: string[];
  searchPlaceholder?: string;
  ariaLabel?: string;
  id?: string;
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Seleccionar...',
  selectedLabel,
  quickAccessValues,
  searchPlaceholder = 'Buscar...',
  ariaLabel,
  id,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const generatedId = useId();
  const componentId = id ?? generatedId;
  const listboxId = `${componentId}-listbox`;

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus search input when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the panel is rendered
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Return focus to trigger when panel closes (if focus is within the component)
  const closePanel = useCallback(() => {
    setIsOpen(false);
    if (wrapperRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
  }, []);

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === 'Escape') {
      closePanel();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Escape') {
      closePanel();
      return;
    }

    if (filteredOptions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case 'Enter':
        event.preventDefault();
        toggleOption(filteredOptions[highlightedIndex].value);
        break;
      case ' ':
        // Only intercept Space when input is empty to allow typing spaces in search
        if (searchTerm.trim() === '' || event.ctrlKey) {
          event.preventDefault();
          toggleOption(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Home':
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
    }
  };

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Derive display text for the trigger button
  const displayText = selected.length === 0
    ? placeholder
    : selectedLabel
      ? selectedLabel(selected.length)
      : `${selected.length} seleccionado${selected.length > 1 ? 's' : ''}`;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        id={componentId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={cn(
          'w-full min-h-[44px] bg-white border border-[var(--iica-border)] rounded-lg',
          'py-2 pl-3 pr-8 text-left text-sm text-gray-700',
          'hover:border-[var(--iica-blue)] cursor-pointer shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent',
          'flex items-center justify-between',
          'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:border-[var(--iica-blue)]'
        )}
      >
        <span className={cn('block truncate', selected.length === 0 && 'text-gray-400 dark:text-gray-500')}>
          {displayText}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-500 dark:text-gray-400 absolute right-2.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Floating dropdown panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full bg-white border border-[var(--iica-border)] rounded-lg shadow-lg',
            'py-1 text-sm',
            'dark:bg-gray-800 dark:border-gray-600'
          )}
        >
          {/* Quick-access chips */}
          {quickAccessValues && quickAccessValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-2 py-2 border-b border-gray-100 dark:border-gray-700">
              {quickAccessValues.map((value) => {
                const option = options.find((o) => o.value === value);
                if (!option) return null;
                const isActive = selected.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleOption(value)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      'focus:outline-none focus:ring-1 focus:ring-[var(--iica-blue)]',
                      isActive
                        ? 'bg-[var(--iica-blue)] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search input */}
          <div className="px-2 py-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={
                  filteredOptions.length > 0
                    ? `${listboxId}-option-${highlightedIndex}`
                    : undefined
                }
                aria-autocomplete="list"
                className={cn(
                  'block w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-md',
                  'text-sm leading-5 bg-gray-50 placeholder-gray-400',
                  'focus:outline-none focus:ring-1 focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)]',
                  'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500'
                )}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>

          {/* Checkbox list */}
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={ariaLabel ?? 'Opciones disponibles'}
            aria-activedescendant={
              filteredOptions.length > 0
                ? `${listboxId}-option-${highlightedIndex}`
                : undefined
            }
            className="max-h-48 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="text-gray-500 dark:text-gray-400 select-none py-2 px-3 text-xs italic text-center">
                No se encontraron resultados
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isChecked = selected.includes(option.value);
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={option.value}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isChecked}
                    className={cn(
                      'cursor-pointer select-none py-2 px-3 flex items-center gap-2',
                      'hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors',
                      isChecked && 'bg-blue-50/50 dark:bg-gray-700/50',
                      isHighlighted && 'bg-gray-100 dark:bg-gray-700'
                    )}
                    onClick={() => toggleOption(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(option.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'h-4 w-4 rounded border-gray-300',
                        'text-[var(--iica-blue)] focus:ring-[var(--iica-yellow)]',
                        'dark:border-gray-500 dark:bg-gray-700'
                      )}
                      tabIndex={-1}
                    />
                    <span className="flex-1 truncate text-gray-900 dark:text-gray-200">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-medium tabular-nums">
                        {option.count}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
