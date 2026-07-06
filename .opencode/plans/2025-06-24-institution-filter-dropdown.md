# Institution Filter Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the always-visible institution filter (chips + search + checkboxes) into a collapsible dropdown that matches the region/sector filter UX.

**Architecture:** Create a generic `SearchableMultiSelect` component in `components/ui/` that renders a trigger button (matching existing filter styling) with a floating panel containing optional quick-access chips, a search input, and a scrollable multi-select checkbox list. Then refactor `InstitutionFilter.tsx` to use it.

**Tech Stack:** React 18, Next.js 14 (App Router), Tailwind CSS, Lucide icons, custom components (no Radix/shadcn).

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `components/ui/SearchableMultiSelect.tsx` | Generic multi-select dropdown with search, chips, checkboxes |
| Modify | `components/InstitutionFilter.tsx` | Thin wrapper that passes institution-specific props to `SearchableMultiSelect` |
| Modify | `components/FilterChips.tsx` (lines 343-350) | Minimal — same props interface, possibly adjust outer wrapper |

---

### Task 1: Create `SearchableMultiSelect` Component

**Files:**
- Create: `components/ui/SearchableMultiSelect.tsx`

- [ ] **Step 1: Create the component file with types and skeleton**

```tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchableMultiSelectProps {
  /** All available options */
  options: MultiSelectOption[];
  /** Currently selected values */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Text shown when items are selected, receives count. E.g. (n) => `${n} seleccionadas` */
  selectedLabel?: (count: number) => string;
  /** Optional quick-access chip values (must exist in options) */
  quickAccessValues?: string[];
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** ARIA label for the fieldset */
  ariaLabel?: string;
  /** Optional id for the trigger button */
  id?: string;
}
```

- [ ] **Step 2: Implement the full component body**

```tsx
export default function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Seleccionar...',
  selectedLabel = (n) => `${n} seleccionado(s)`,
  quickAccessValues = [],
  searchPlaceholder = 'Buscar...',
  ariaLabel = 'Seleccion multiple',
  id,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen && triggerRef.current && wrapperRef.current?.contains(document.activeElement)) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search]);

  function toggleValue(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  const triggerLabel = selected.length > 0 ? selectedLabel(selected.length) : placeholder;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={cn(
          'w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white',
          'px-3 py-2.5 text-sm min-h-[44px]',
          'flex items-center justify-between',
          'focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]',
          'cursor-pointer',
          selected.length > 0 && 'text-gray-900 dark:text-white',
          selected.length === 0 && 'text-gray-500 dark:text-gray-400'
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ml-2',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full',
            'bg-white dark:bg-gray-800',
            'border border-[var(--iica-border)] rounded-lg',
            'shadow-lg',
            'p-2'
          )}
          role="group"
          aria-label={ariaLabel}
        >
          {/* Quick-access chips */}
          {quickAccessValues.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2" role="group" aria-label="Acceso rapido">
              {quickAccessValues.map((chipValue) => {
                const isActive = selected.includes(chipValue);
                return (
                  <button
                    key={chipValue}
                    type="button"
                    onClick={() => toggleValue(chipValue)}
                    aria-pressed={isActive}
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[28px]',
                      isActive
                        ? 'bg-[var(--iica-blue)] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {chipValue}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search input */}
          <div className="relative mb-2">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className={cn(
                'w-full rounded-md border border-[var(--iica-border)]',
                'bg-gray-50 dark:bg-gray-900 dark:text-white',
                'pl-8 pr-3 py-2 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-[var(--iica-blue)]'
              )}
            />
          </div>

          {/* Checkbox list */}
          <div className="max-h-48 overflow-y-auto rounded-md" role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron resultados
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt.value);
                const inputId = `multi-select-${opt.value.replace(/\s+/g, '-').toLowerCase()}`;
                return (
                  <label
                    key={opt.value}
                    htmlFor={inputId}
                    role="option"
                    aria-selected={isChecked}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-sm text-sm',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      isChecked && 'bg-blue-50/50 dark:bg-blue-900/20'
                    )}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleValue(opt.value)}
                      className="rounded border-gray-300 text-[var(--iica-blue)] focus:ring-[var(--iica-yellow)] w-4 h-4 flex-shrink-0"
                    />
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
                      {opt.label}
                    </span>
                    {opt.count !== undefined && (
                      <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">
                        {opt.count}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify no lint/type errors**

Run: `npx tsc --noEmit --pretty`
Expected: No errors related to `SearchableMultiSelect.tsx`

- [ ] **Step 4: Commit**

```bash
git add components/ui/SearchableMultiSelect.tsx
git commit -m "feat(ui): add SearchableMultiSelect generic dropdown component"
```

---

### Task 2: Refactor `InstitutionFilter` to Use `SearchableMultiSelect`

**Files:**
- Modify: `components/InstitutionFilter.tsx`

- [ ] **Step 1: Rewrite InstitutionFilter as a thin wrapper**

Replace the entire content of `components/InstitutionFilter.tsx` with:

```tsx
'use client';

import SearchableMultiSelect, { type MultiSelectOption } from '@/components/ui/SearchableMultiSelect';
import { useMemo } from 'react';

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
  const options: MultiSelectOption[] = useMemo(
    () => institutions.map((inst) => ({ value: inst.name, label: inst.name, count: inst.count })),
    [institutions]
  );

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="filter-institution-adv"
        className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Institucion
      </label>
      <SearchableMultiSelect
        id="filter-institution-adv"
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder="Todas las instituciones"
        selectedLabel={(n) => `${n} institucion${n > 1 ? 'es' : ''} seleccionada${n > 1 ? 's' : ''}`}
        quickAccessValues={QUICK_ACCESS_CHIPS}
        searchPlaceholder="Buscar institucion..."
        ariaLabel="Filtrar por institucion"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify the integration in FilterChips.tsx still works**

No changes should be needed in `FilterChips.tsx` because `InstitutionFilter` maintains the same props interface:
- `institutions: { name: string; count: number }[]`
- `selected: string[]`
- `onChange: (selected: string[]) => void`

Run: `npx tsc --noEmit --pretty`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add components/InstitutionFilter.tsx
git commit -m "refactor(InstitutionFilter): use SearchableMultiSelect dropdown"
```

---

### Task 3: Visual Verification & Grid Alignment

**Files:**
- Possibly modify: `components/FilterChips.tsx` (lines 343-350) if needed

- [ ] **Step 1: Check that the grid cell wrapping is correct**

The current code in `FilterChips.tsx`:
```tsx
{/* Institucion searchable */}
<div>
  <InstitutionFilter
    institutions={deduplicatedInstitutions}
    selected={selectedInstitutions}
    onChange={(next) => updateParams({ institution: stringifyCsv(next) })}
  />
</div>
```

Since `InstitutionFilter` now includes its own `<div className="space-y-1.5">` wrapper with a `<label>` (matching the region/sector pattern), the outer `<div>` just acts as a CSS Grid cell. This should work as-is. No changes needed.

- [ ] **Step 2: Run dev server and verify visually**

Run: `npm run dev`
Check at `http://localhost:3000`:
- Institution trigger button has same height (`min-h-[44px]`), border, and border-radius as Region/Sector selects.
- Clicking trigger opens floating panel above other content (z-index 50).
- Chevron rotates 180deg when open.
- Quick-access chips appear inside dropdown above search.
- Search filters the checkbox list in real time.
- Selecting items updates URL params and shows filter chips in the bar.
- Clicking outside closes the dropdown.
- On mobile (375px), the dropdown stretches full width of its grid cell.

- [ ] **Step 3: If any spacing/sizing adjustments needed, apply them**

Potential adjustments:
- If the dropdown panel overflows the viewport on mobile, add `max-h-[60vh]` to the panel and make the checkbox list flex-shrink.
- If the outer `<div>` wrapper in `FilterChips.tsx` needs removal or className changes, apply minimal fix.

- [ ] **Step 4: Commit any visual fixes**

```bash
git add -A
git commit -m "style(filters): align institution dropdown with region/sector filter height and spacing"
```

---

### Task 4: Final Type Check and Build Verification

**Files:** (none to modify -- verification only)

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit --pretty`
Expected: 0 errors

- [ ] **Step 2: Run linter**

Run: `npx next lint`
Expected: No errors related to modified files

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address type/lint issues from institution dropdown refactor"
```

---

## Mandatory Checks (agro-specific)

- [x] No `console.*` -- component uses no logging (pure UI); if logging is added later, use `getLogger`.
- [x] No `process.env.X` -- component accesses no env vars.
- [x] Next.js 15+ async params -- N/A (this is a client component, not a route handler).
- [x] Supabase client init -- N/A (no DB access in this component).
- [x] API routes format -- N/A (no API routes involved).
- [x] RLS -- N/A (no new tables).
- [x] Type regeneration -- N/A (no migration).

---

## Summary of Visual Behavior

| Before | After |
|--------|-------|
| Always-visible fieldset with chips + search + scrollable checkboxes occupying vertical space in the grid | A single-line trigger button (`min-h-[44px]`) matching region/sector selects |
| Takes ~180px+ vertical space even when not in use | Takes ~44px; panel floats via `position: absolute; z-index: 50` only when open |
| No visual indication of how many are selected at a glance | Trigger shows "3 instituciones seleccionadas" or "Todas las instituciones" |
