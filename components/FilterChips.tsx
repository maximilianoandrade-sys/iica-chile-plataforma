'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { type FilterCounts } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import { sortRegionLabels } from '@/lib/search/region-normalization';

const logger = getLogger('FilterChips');

interface FilterChipsProps {
  filterCounts: FilterCounts;
}

const NATIONAL_INSTITUTION_KEYS = [
  'CNR',
  'INDAP',
  'FIA',
  'CORFO',
  'SAG',
  'SERCOTEC',
  'GORE',
  'SUBDERE',
  'MINAGRI',
];

const INTERNATIONAL_INSTITUTION_KEYS = [
  'FONTAGRO',
  'FAO',
  'FIDA',
  'IFAD',
  'BID',
  'IADB',
  'PNUD',
  'GEF',
  'GCF',
  'WORLD BANK',
  'IICA',
  'UE',
  'EUROCLIMA',
  'UNGM',
];

const CHILE_REGION_LABELS = new Set([
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
  'Nacional',
  'Todas las regiones',
  'Macrozona Norte',
  'Macrozona Centro',
  'Macrozona Sur',
  'Macrozona',
  'Chile',
]);

function classifyInstitutionCoverage(value: string): 'chile' | 'internacional' | 'unknown' {
  const upper = value.toUpperCase();
  if (NATIONAL_INSTITUTION_KEYS.some((key) => upper.includes(key))) return 'chile';
  if (INTERNATIONAL_INSTITUTION_KEYS.some((key) => upper.includes(key))) return 'internacional';
  return 'unknown';
}

function parseCsvParam(value: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyCsv(values: string[]): string {
  return values.join(',');
}

export function FilterChips({ filterCounts }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const currentQ = searchParams.get('q') ?? '';
  const estadoParam = searchParams.get('estado');
  const currentEstado = estadoParam ?? 'Abierta';
  const currentInstitution = searchParams.get('institution') ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentCategory = searchParams.get('category') ?? '';
  const currentMinAmount = searchParams.get('minAmount') ?? '';
  const currentMaxAmount = searchParams.get('maxAmount') ?? '';
  const currentAmbito = searchParams.get('ambito') ?? '';
  const currentPostedFrom = searchParams.get('postedFrom') ?? '';
  const currentPostedTill = searchParams.get('postedTill') ?? '';
  const [searchInput, setSearchInput] = useState(currentQ);
  const coverage = currentAmbito === 'Internacional' ? 'internacional' : currentAmbito ? 'chile' : 'all';

  useEffect(() => {
    setSearchInput(currentQ);
  }, [currentQ]);

  useEffect(() => {
    const hasAdvancedFilters = Boolean(currentAmbito || currentMinAmount || currentMaxAmount || currentPostedFrom || currentPostedTill);
    if (hasAdvancedFilters) {
      setAdvancedOpen(true);
    }
  }, [currentAmbito, currentMinAmount, currentMaxAmount, currentPostedFrom, currentPostedTill]);

  const updateParams = useCallback((updates: Record<string, string>, mode: 'push' | 'replace' = 'push') => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    if (mode === 'replace') {
      router.replace(href, { scroll: false });
      return;
    }
    router.push(href, { scroll: false });
  }, [searchParams, pathname, router]);

  const normalizeAmountRange = useCallback(
    (nextMinAmount: string, nextMaxAmount: string): { minAmount: string; maxAmount: string } => {
      const parsedMin = nextMinAmount ? Number.parseInt(nextMinAmount, 10) : NaN;
      const parsedMax = nextMaxAmount ? Number.parseInt(nextMaxAmount, 10) : NaN;

      if (Number.isFinite(parsedMin) && Number.isFinite(parsedMax) && parsedMin > parsedMax) {
        return { minAmount: String(parsedMin), maxAmount: String(parsedMin) };
      }

      return { minAmount: nextMinAmount, maxAmount: nextMaxAmount };
    },
    []
  );

  const normalizeDateRange = useCallback(
    (nextPostedFrom: string, nextPostedTill: string): { postedFrom: string; postedTill: string } => {
      if (nextPostedFrom && nextPostedTill && nextPostedTill < nextPostedFrom) {
        return { postedFrom: nextPostedTill, postedTill: nextPostedTill };
      }

      return { postedFrom: nextPostedFrom, postedTill: nextPostedTill };
    },
    []
  );

  useEffect(() => {
    const debounceMs = 350;
    const timer = setTimeout(() => {
      if (searchInput === currentQ) return;
      updateParams({ q: searchInput }, 'replace');
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchInput, currentQ, updateParams]);

  function clearAll() {
    router.push(pathname, { scroll: false });
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
  const categoryOptions = Object.keys(filterCounts.categoria ?? {}).sort((a, b) => a.localeCompare(b, 'es'));

  const selectedInstitutions = parseCsvParam(currentInstitution);
  const selectedRegions = parseCsvParam(currentRegion);
  const selectedCategories = parseCsvParam(currentCategory);

  const activeFilterChips: Array<{ key: string; label: string; clear: Record<string, string> }> = [];

  if (currentQ.trim()) {
    activeFilterChips.push({ key: `q:${currentQ.trim()}`, label: `Búsqueda: "${currentQ.trim()}"`, clear: { q: '' } });
  }

  if (estadoParam && estadoParam !== 'all') {
    activeFilterChips.push({ key: `estado:${estadoParam}`, label: `Estado: ${estadoParam}`, clear: { estado: '' } });
  }

  if (currentAmbito) {
    activeFilterChips.push({ key: `ambito:${currentAmbito}`, label: `Ámbito: ${currentAmbito}`, clear: { ambito: '' } });
  }

  selectedInstitutions.forEach((institution) => {
    const nextInstitutions = selectedInstitutions.filter((value) => value !== institution);
    activeFilterChips.push({
      key: `institution:${institution}`,
      label: `Institución: ${institution}`,
      clear: { institution: stringifyCsv(nextInstitutions) },
    });
  });

  selectedRegions.forEach((region) => {
    const nextRegions = selectedRegions.filter((value) => value !== region);
    activeFilterChips.push({
      key: `region:${region}`,
      label: `Región: ${region}`,
      clear: { region: stringifyCsv(nextRegions) },
    });
  });

  selectedCategories.forEach((category) => {
    const nextCategories = selectedCategories.filter((value) => value !== category);
    activeFilterChips.push({
      key: `category:${category}`,
      label: `Sector: ${category}`,
      clear: { category: stringifyCsv(nextCategories) },
    });
  });

  if (currentMinAmount || currentMaxAmount) {
    const amountLabel = currentMinAmount && currentMaxAmount
      ? `Monto: ${currentMinAmount} - ${currentMaxAmount}`
      : `Monto: ${currentMinAmount || currentMaxAmount}`;
    activeFilterChips.push({ key: 'amount', label: amountLabel, clear: { minAmount: '', maxAmount: '' } });
  }

  if (currentPostedFrom) {
    activeFilterChips.push({
      key: `postedFrom:${currentPostedFrom}`,
      label: `Publicado desde: ${currentPostedFrom}`,
      clear: { postedFrom: '' },
    });
  }

  if (currentPostedTill) {
    activeFilterChips.push({
      key: `postedTill:${currentPostedTill}`,
      label: `Publicado hasta: ${currentPostedTill}`,
      clear: { postedTill: '' },
    });
  }

  const activeFilterCount = activeFilterChips.length;

  const hasActiveFilters = activeFilterCount > 0;

  logger.debug('Render FilterChips', { hasActiveFilters });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[var(--iica-border)] shadow-sm overflow-hidden">
      {/* Search bar */}
      <div className="px-5 pt-5 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            role="searchbox"
            aria-label="Buscar oportunidades"
            placeholder="Buscar por palabra clave, institución o región..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white py-3 pl-12 pr-10 text-sm text-gray-900 placeholder:text-gray-400 min-h-[48px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none focus:border-[var(--iica-blue)] transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); updateParams({ q: '' }, 'replace'); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main filters grid */}
      <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Cobertura */}
        <div className="space-y-1">
          <label htmlFor="filter-coverage" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Cobertura
          </label>
          <select
            id="filter-coverage"
            aria-label="Cobertura"
            value={coverage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'internacional') {
                updateParams({ ambito: 'Internacional', relevanceMode: 'all', region: '' });
              } else if (value === 'chile') {
                updateParams({ ambito: '', relevanceMode: 'chile_strict' });
              } else {
                updateParams({ ambito: '', relevanceMode: 'all' });
              }
            }}
            className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">Chile + Internacional</option>
            <option value="chile">Solo Chile</option>
            <option value="internacional">Solo Internacional</option>
          </select>
        </div>

        {/* Estado */}
        <div className="space-y-1">
          <label htmlFor="filter-estado" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Estado
          </label>
          <select
            id="filter-estado"
            aria-label="Estado"
            value={currentEstado}
            onChange={(e) => updateParams({ estado: e.target.value })}
            className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="Abierta">Abiertas</option>
            <option value="Próxima">Próximas</option>
            <option value="Cerrada">Cerradas</option>
          </select>
        </div>

        {/* Región (single-select principal) */}
        <div className="space-y-1">
          <label htmlFor="filter-region-main" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Región
          </label>
          <select
            id="filter-region-main"
            aria-label="Región"
            value={selectedRegions[0] ?? ''}
            onChange={(e) => updateParams({ region: e.target.value })}
            className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las regiones</option>
            {filteredRegionOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Institución (single-select principal) */}
        <div className="space-y-1">
          <label htmlFor="filter-inst-main" className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Institución
          </label>
          <select
            id="filter-inst-main"
            aria-label="Institución"
            value={selectedInstitutions[0] ?? ''}
            onChange={(e) => updateParams({ institution: e.target.value })}
            className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Todas las instituciones</option>
            {filteredInstitutionOptions.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* Botón avanzados */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wide text-transparent select-none">
            &nbsp;
          </span>
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            aria-expanded={advancedOpen}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold min-h-[44px] transition-colors ${
              advancedOpen
                ? 'border-[var(--iica-blue)] bg-[var(--iica-blue)]/5 text-[var(--iica-blue)]'
                : 'border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Avanzados
            {activeFilterCount > 0 && (
              <span className="ml-auto bg-[var(--iica-navy)] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips + reset */}
      {hasActiveFilters && (
        <div className="px-5 pb-4 flex flex-wrap items-center gap-2 border-t border-[var(--iica-border)] pt-3">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                if (chip.clear.q === '') setSearchInput('');
                updateParams(chip.clear);
              }}
              aria-label={`Quitar filtro ${chip.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--iica-border)] bg-[var(--iica-blue)]/5 px-3 py-1 text-xs font-medium text-[var(--iica-navy)] dark:text-blue-300 hover:bg-[var(--iica-blue)]/10"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--iica-border)] bg-white dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 ml-auto"
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Advanced filters panel */}
      {advancedOpen && (
        <div className="px-5 pb-5 pt-3 border-t border-[var(--iica-border)] bg-gray-50 dark:bg-gray-700/30 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Filtros avanzados</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sectores multi-select */}
            <Field label="Sectores" htmlFor="filter-category">
              <select
                id="filter-category"
                multiple
                aria-label="Sectores"
                value={selectedCategories}
                onChange={(e) => {
                  const next = Array.from(e.target.selectedOptions).map((o) => o.value);
                  updateParams({ category: stringifyCsv(next) });
                }}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
                disabled={categoryOptions.length === 0}
              >
                {categoryOptions.length === 0 ? (
                  <option value="">Disponible próximamente</option>
                ) : (
                  categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)
                )}
              </select>
            </Field>

            {/* Ámbito */}
            <Field label="Ámbito" htmlFor="filter-ambito">
              <select
                id="filter-ambito"
                aria-label="Ámbito"
                value={currentAmbito}
                onChange={(e) => updateParams({ ambito: e.target.value })}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none appearance-none"
              >
                <option value="">Todos</option>
                <option value="Nacional">Nacional</option>
                <option value="Regional">Regional</option>
                <option value="Internacional">Internacional</option>
              </select>
            </Field>

            {/* Fechas */}
            <Field label="Publicado desde" htmlFor="filter-posted-from">
              <input
                id="filter-posted-from"
                type="date"
                aria-label="Publicado desde"
                value={currentPostedFrom}
                onChange={(e) => {
                  const normalized = normalizeDateRange(e.target.value, currentPostedTill);
                  updateParams(normalized, 'replace');
                }}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
              />
            </Field>

            <Field label="Publicado hasta" htmlFor="filter-posted-till">
              <input
                id="filter-posted-till"
                type="date"
                aria-label="Publicado hasta"
                value={currentPostedTill}
                onChange={(e) => {
                  const normalized = normalizeDateRange(currentPostedFrom, e.target.value);
                  updateParams(normalized, 'replace');
                }}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
              />
            </Field>

            {/* Presupuesto */}
            <Field label="Presupuesto (CLP)" htmlFor="filter-min-amount">
              <div className="flex items-center gap-2">
                <input
                  id="filter-min-amount"
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
                  className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
                />
                <span className="text-gray-400 shrink-0" aria-hidden>—</span>
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
                  className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
                />
              </div>
            </Field>

            {/* Regiones multi-select en avanzados */}
            <Field label="Regiones (múltiple)" htmlFor="filter-region-adv">
              <select
                id="filter-region-adv"
                multiple
                aria-label="Regiones múltiple"
                value={selectedRegions}
                onChange={(e) => {
                  const next = Array.from(e.target.selectedOptions).map((o) => o.value);
                  updateParams({ region: stringifyCsv(next) });
                }}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
                disabled={filteredRegionOptions.length === 0}
              >
                {filteredRegionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>

            {/* Instituciones multi-select en avanzados */}
            <Field label="Instituciones (múltiple)" htmlFor="filter-institution-adv">
              <select
                id="filter-institution-adv"
                multiple
                aria-label="Instituciones múltiple"
                value={selectedInstitutions}
                onChange={(e) => {
                  const next = Array.from(e.target.selectedOptions).map((o) => o.value);
                  updateParams({ institution: stringifyCsv(next) });
                }}
                className="w-full rounded-xl border border-[var(--iica-border)] bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-[var(--iica-yellow)] focus:outline-none"
                disabled={filteredInstitutionOptions.length === 0}
              >
                {filteredInstitutionOptions.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </label>
      {children}
    </div>
  );
}
