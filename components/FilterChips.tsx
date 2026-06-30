'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { type FilterCounts } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import { sortRegionLabels } from '@/lib/search/region-normalization';
import { normalizeInstitution } from '@/lib/search/filtering';
import AdvancedSearch from '@/components/AdvancedSearch';
import InstitutionFilter from '@/components/InstitutionFilter';

const logger = getLogger('FilterChips');

import { NATIONAL_INSTITUTIONS, INTERNATIONAL_INSTITUTIONS } from '@/lib/constants/institutions';

interface FilterChipsProps {
  filterCounts: FilterCounts;
}

const NATIONAL_INSTITUTION_KEYS = NATIONAL_INSTITUTIONS;
const INTERNATIONAL_INSTITUTION_KEYS = INTERNATIONAL_INSTITUTIONS;

const CHILE_REGION_LABELS = new Set([
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble', 'Biobío',
  'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
  'Nacional', 'Todas las regiones', 'Macrozona Norte', 'Macrozona Centro',
  'Macrozona Sur', 'Macrozona', 'Chile',
]);

const SECTOR_OPTIONS = [
  'Comercio Internacional',
  'Desarrollo Territorial',
  'Digitalización Agroalimentaria',
  'Innovación y Bioeconomía',
  'Sanidad Agropecuaria',
];

function classifyInstitutionCoverage(value: string): 'chile' | 'internacional' | 'unknown' {
  const upper = value.toUpperCase();
  if (NATIONAL_INSTITUTION_KEYS.some((key) => upper.includes(key))) return 'chile';
  if (INTERNATIONAL_INSTITUTION_KEYS.some((key) => upper.includes(key))) return 'internacional';
  return 'unknown';
}

function parseCsvParam(value: string): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function stringifyCsv(values: string[]): string {
  return values.join(',');
}

export function FilterChips({ filterCounts }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get('q') ?? '';
  const estadoParam = searchParams.get('estado');
  const currentEstado = estadoParam ?? 'Abierta';
  const currentInstitution = searchParams.get('institution') ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentMinAmount = searchParams.get('minAmount') ?? '';
  const currentMaxAmount = searchParams.get('maxAmount') ?? '';
  const currentAmbito = searchParams.get('ambito') ?? 'chile';
  const currentPostedFrom = searchParams.get('postedFrom') ?? '';
  const currentPostedTill = searchParams.get('postedTill') ?? '';
  const currentUrgencia = searchParams.get('urgencia') ?? '';
  const coverage = currentAmbito === 'Internacional' ? 'internacional' : currentAmbito ? 'chile' : 'all';

  useEffect(() => {
    const hasAdvancedFilters = Boolean(
      currentInstitution || currentRegion || currentCategory ||
      currentMinAmount || currentMaxAmount || currentPostedFrom || currentPostedTill
    );
    if (hasAdvancedFilters) {
      setAdvancedOpen(true);
    }
  }, [currentInstitution, currentRegion, currentCategory, currentMinAmount, currentMaxAmount, currentPostedFrom, currentPostedTill]);

  const updateParams = useCallback((updates: Record<string, string>, mode: 'push' | 'replace' = 'push') => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      if (mode === 'replace') {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    });
  }, [searchParams, pathname, router, startTransition]);

  const normalizeAmountRange = useCallback(
    (nextMinAmount: string, nextMaxAmount: string): { minAmount: string; maxAmount: string } => {
      const parsedMin = nextMinAmount ? Number.parseInt(nextMinAmount, 10) : NaN;
      const parsedMax = nextMaxAmount ? Number.parseInt(nextMaxAmount, 10) : NaN;
      if (Number.isFinite(parsedMin) && Number.isFinite(parsedMax) && parsedMin > parsedMax) {
        return { minAmount: String(parsedMin), maxAmount: String(parsedMin) };
      }
      return { minAmount: nextMinAmount, maxAmount: nextMaxAmount };
    }, []
  );

  const normalizeDateRange = useCallback(
    (nextPostedFrom: string, nextPostedTill: string): { postedFrom: string; postedTill: string } => {
      if (nextPostedFrom && nextPostedTill && nextPostedTill < nextPostedFrom) {
        return { postedFrom: nextPostedTill, postedTill: nextPostedTill };
      }
      return { postedFrom: nextPostedFrom, postedTill: nextPostedTill };
    }, []
  );

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const institutionOptions = Object.keys(filterCounts.institucion).sort((a, b) => a.localeCompare(b, 'es'));
  const regionOptions = sortRegionLabels(Object.keys(filterCounts.region));
  const filteredInstitutionOptions = institutionOptions.filter((institution) => {
    if (coverage === 'all') return true;
    const detected = classifyInstitutionCoverage(institution);
    if (detected === 'unknown') return true;
    return detected === coverage;
  });
  const filteredRegionOptions = regionOptions.filter((region) => {
    if (coverage === 'all') return true;
    if (coverage === 'chile') return CHILE_REGION_LABELS.has(region);
    return !CHILE_REGION_LABELS.has(region);
  });
  const categoryOptions = SECTOR_OPTIONS;

  const deduplicatedInstitutions = useMemo(() => {
    const merged: Record<string, number> = {};
    for (const [rawName, count] of Object.entries(filterCounts.institucion)) {
      const canonical = normalizeInstitution(rawName);
      merged[canonical] = (merged[canonical] || 0) + count;
    }
    return Object.entries(merged)
      .map(([name, count]) => ({ name, count }))
      .filter((inst) => {
        if (coverage === 'all') return true;
        const detected = classifyInstitutionCoverage(inst.name);
        if (detected === 'unknown') return true;
        return detected === coverage;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [filterCounts.institucion, coverage]);

  const selectedInstitutions = parseCsvParam(currentInstitution);
  const selectedRegions = parseCsvParam(currentRegion);
  const selectedCategories = parseCsvParam(currentCategory);

  // Build active filter chips for display
  // Quick-chip filters (urgencia, ambito chile/Internacional) don't need tags — the chip highlight IS the indicator
  const activeFilterChips: Array<{ key: string; label: string; clear: Record<string, string> }> = [];

  if (currentQ.trim()) {
    activeFilterChips.push({ key: `q:${currentQ.trim()}`, label: `"${currentQ.trim()}"`, clear: { q: '' } });
  }
  // Only show ambito tag for values NOT covered by quick chips (Nacional, Regional from advanced panel)
  if (currentAmbito && currentAmbito !== 'Internacional' && currentAmbito !== 'chile') {
    activeFilterChips.push({ key: `ambito:${currentAmbito}`, label: `Ámbito: ${currentAmbito}`, clear: { ambito: '' } });
  }
  selectedInstitutions.forEach((institution) => {
    const nextInstitutions = selectedInstitutions.filter((v) => v !== institution);
    activeFilterChips.push({
      key: `institution:${institution}`,
      label: `${institution}`,
      clear: { institution: stringifyCsv(nextInstitutions) },
    });
  });
  selectedRegions.forEach((region) => {
    const nextRegions = selectedRegions.filter((v) => v !== region);
    activeFilterChips.push({
      key: `region:${region}`,
      label: `${region}`,
      clear: { region: stringifyCsv(nextRegions) },
    });
  });
  selectedCategories.forEach((category) => {
    const nextCategories = selectedCategories.filter((v) => v !== category);
    activeFilterChips.push({
      key: `category:${category}`,
      label: `Sector: ${category}`,
      clear: { category: stringifyCsv(nextCategories) },
    });
  });
  if (currentMinAmount || currentMaxAmount) {
    const amountLabel = currentMinAmount && currentMaxAmount
      ? `$${currentMinAmount} – $${currentMaxAmount}`
      : `Monto: ${currentMinAmount || currentMaxAmount}`;
    activeFilterChips.push({ key: 'amount', label: amountLabel, clear: { minAmount: '', maxAmount: '' } });
  }
  if (currentPostedFrom) {
    activeFilterChips.push({ key: `postedFrom`, label: `Desde: ${currentPostedFrom}`, clear: { postedFrom: '' } });
  }
  if (currentPostedTill) {
    activeFilterChips.push({ key: `postedTill`, label: `Hasta: ${currentPostedTill}`, clear: { postedTill: '' } });
  }

  const activeFilterCount = activeFilterChips.length;
  const hasActiveFilters = activeFilterCount > 0;
  const advancedFilterCount = selectedInstitutions.length + selectedRegions.length + selectedCategories.length
    + (currentMinAmount || currentMaxAmount ? 1 : 0) + (currentPostedFrom ? 1 : 0) + (currentPostedTill ? 1 : 0);

  logger.debug('Render FilterChips', { hasActiveFilters });

  // Determine which quick chip is active
  const isUrgentActive = currentUrgencia === '7';
  const isInternacionalActive = currentAmbito === 'Internacional' && !isUrgentActive;
  const isChileActive = currentAmbito === 'chile' && !isUrgentActive;
  const isAbiertaActive = currentEstado === 'Abierta' && !isUrgentActive && !isInternacionalActive && !isChileActive && estadoParam !== 'all' && !currentAmbito;
  const isTodosActive = estadoParam === 'all' && !isUrgentActive && !isInternacionalActive && !isChileActive;

  return (
    <section className="bg-white dark:bg-gray-900 border-b border-[var(--iica-border)] dark:border-gray-700 sticky top-[var(--header-height)] z-40">
      <div className="container mx-auto max-w-[1200px] px-4 py-4">

        {/* ── Search bar ── */}
        <div className="mb-3">
          <AdvancedSearch
            value={currentQ}
            onChange={(v) => updateParams({ q: v }, 'replace')}
            onClear={() => updateParams({ q: '' }, 'replace')}
            filterCounts={filterCounts}
            isPending={isPending}
          />
          {isPending && (
            <div className="flex items-center gap-2 mt-2 text-sm text-[var(--iica-blue)] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Filtrando resultados...</span>
            </div>
          )}
        </div>

        {/* ── Quick-access chips ── */}
        <div className={`flex flex-wrap items-center gap-2 transition-opacity duration-200 ${isPending ? 'opacity-70' : ''}`}>
          <QuickChip
            active={isTodosActive}
            onClick={() => updateParams({ estado: 'all', urgencia: '', ambito: '' })}
          >
            Todos
          </QuickChip>
          <QuickChip
            active={isAbiertaActive}
            onClick={() => updateParams({ estado: 'Abierta', urgencia: '', ambito: '' })}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Abiertas
          </QuickChip>
          <QuickChip
            active={isUrgentActive}
            variant="urgent"
            onClick={() => updateParams({ urgencia: '7', estado: 'Abierta', ambito: '' })}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Urgentes ≤7d
          </QuickChip>
          <QuickChip
            active={isInternacionalActive}
            variant="intl"
            onClick={() => updateParams({ ambito: 'Internacional', urgencia: '', estado: 'Abierta' })}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Internacional
          </QuickChip>
          <QuickChip
            active={isChileActive}
            onClick={() => updateParams({ ambito: 'chile', urgencia: '', estado: 'Abierta' })}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Solo Chile
          </QuickChip>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          {/* Más filtros button */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            aria-expanded={advancedOpen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              advancedOpen || advancedFilterCount > 0
                ? 'bg-[var(--iica-blue)] text-white shadow-sm'
                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Más filtros
            {advancedFilterCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center ml-0.5">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800" aria-live="polite">
            <span className="text-xs text-gray-400 font-medium">
              {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''}:
            </span>
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => updateParams(chip.clear)}
                aria-label={`Quitar filtro ${chip.label}`}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline ml-1"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* ── Advanced filters panel ── */}
        {advancedOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* Institución searchable */}
              <div>
                <InstitutionFilter
                  institutions={deduplicatedInstitutions}
                  selected={selectedInstitutions}
                  onChange={(next) => updateParams({ institution: stringifyCsv(next) })}
                />
              </div>

              {/* Región */}
              <div className="space-y-1.5">
                <label htmlFor="filter-region-adv" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Región
                </label>
                <select
                  id="filter-region-adv"
                  aria-label="Región"
                  value={selectedRegions[0] ?? ''}
                  onChange={(e) => updateParams({ region: e.target.value })}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                >
                  <option value="">Todas las regiones</option>
                  {filteredRegionOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Sectores */}
              <div className="space-y-1.5">
                <label htmlFor="filter-category-adv" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Sector
                </label>
                <select
                  id="filter-category-adv"
                  aria-label="Sector"
                  value={selectedCategories[0] ?? ''}
                  onChange={(e) => updateParams({ category: e.target.value })}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                >
                  <option value="">Todos los sectores</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Fecha cierre desde */}
              <div className="space-y-1.5">
                <label htmlFor="filter-posted-from" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Publicado desde
                </label>
                <input
                  id="filter-posted-from"
                  type="date"
                  aria-label="Publicado desde"
                  value={currentPostedFrom}
                  onChange={(e) => {
                    const normalized = normalizeDateRange(e.target.value, currentPostedTill);
                    updateParams(normalized, 'replace');
                  }}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                />
              </div>

              {/* Fecha cierre hasta */}
              <div className="space-y-1.5">
                <label htmlFor="filter-posted-till" className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Publicado hasta
                </label>
                <input
                  id="filter-posted-till"
                  type="date"
                  aria-label="Publicado hasta"
                  value={currentPostedTill}
                  onChange={(e) => {
                    const normalized = normalizeDateRange(currentPostedFrom, e.target.value);
                    updateParams(normalized, 'replace');
                  }}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                />
              </div>

              {/* Presupuesto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Presupuesto (CLP)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label="Monto mínimo"
                    placeholder="Mín"
                    value={currentMinAmount}
                    onChange={(e) => {
                      const normalized = normalizeAmountRange(e.target.value, currentMaxAmount);
                      updateParams(normalized, 'replace');
                    }}
                    className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                  />
                  <span className="text-gray-400 shrink-0" aria-hidden>–</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label="Monto máximo"
                    placeholder="Máx"
                    value={currentMaxAmount}
                    onChange={(e) => {
                      const normalized = normalizeAmountRange(currentMinAmount, e.target.value);
                      updateParams(normalized, 'replace');
                    }}
                    className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Quick Chip sub-component ── */
interface QuickChipProps {
  active: boolean;
  variant?: 'default' | 'urgent' | 'intl';
  onClick: () => void;
  children: React.ReactNode;
}

function QuickChip({ active, variant = 'default', onClick, children }: QuickChipProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer min-h-[44px] select-none';

  const variantClasses = active
    ? variant === 'urgent'
      ? 'bg-red-600 text-white shadow-sm'
      : variant === 'intl'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-[var(--iica-blue)] text-white shadow-sm'
    : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
}
