'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Filter, ChevronDown } from 'lucide-react';
import { type FilterCounts } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';
import { sortRegionLabels } from '@/lib/search/region-normalization';
import { normalizeInstitution } from '@/lib/search/filtering';
import AdvancedSearch from '@/components/AdvancedSearch';
import InstitutionFilter from '@/components/InstitutionFilter';

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
  'TarapacÃ¡',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'ValparaÃ­so',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ã‘uble',
  'BiobÃ­o',
  'La AraucanÃ­a',
  'Los RÃ­os',
  'Los Lagos',
  'AysÃ©n',
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
  const coverage = currentAmbito === 'Internacional' ? 'internacional' : currentAmbito ? 'chile' : 'all';

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

  // Deduplicated institution list for InstitutionFilter (merges aliases)
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

  const activeFilterChips: Array<{ key: string; label: string; clear: Record<string, string> }> = [];

  if (currentQ.trim()) {
    activeFilterChips.push({ key: `q:${currentQ.trim()}`, label: `BÃºsqueda: "${currentQ.trim()}"`, clear: { q: '' } });
  }

  if (estadoParam && estadoParam !== 'all') {
    activeFilterChips.push({ key: `estado:${estadoParam}`, label: `Estado: ${estadoParam}`, clear: { estado: '' } });
  }

  if (currentAmbito) {
    activeFilterChips.push({ key: `ambito:${currentAmbito}`, label: `Ãmbito: ${currentAmbito}`, clear: { ambito: '' } });
  }

  selectedInstitutions.forEach((institution) => {
    const nextInstitutions = selectedInstitutions.filter((value) => value !== institution);
    activeFilterChips.push({
      key: `institution:${institution}`,
      label: `InstituciÃ³n: ${institution}`,
      clear: { institution: stringifyCsv(nextInstitutions) },
    });
  });

  selectedRegions.forEach((region) => {
    const nextRegions = selectedRegions.filter((value) => value !== region);
    activeFilterChips.push({
      key: `region:${region}`,
      label: `RegiÃ³n: ${region}`,
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
    <section className="bg-white dark:bg-gray-900 border-b border-[var(--iica-border)] dark:border-gray-700 sticky top-16 z-40">
      <div className="container mx-auto max-w-[1200px] px-4 py-5">

        {/* ── Search bar avanzado ── */}
        <div className="mb-5">
          <AdvancedSearch
            value={currentQ}
            onChange={(v) => updateParams({ q: v }, 'replace')}
            onClear={() => updateParams({ q: '' }, 'replace')}
            filterCounts={filterCounts}
          />
        </div>

        {/* ── Main filters (5 cols = ZIP layout) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">

          {/* 1. Cobertura */}
          <SelectField
            id="filter-coverage"
            aria-label="Cobertura"
            value={coverage}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'internacional') updateParams({ ambito: 'Internacional', relevanceMode: 'all', region: '' });
              else if (v === 'chile') updateParams({ ambito: '', relevanceMode: 'chile_strict' });
              else updateParams({ ambito: '', relevanceMode: 'all' });
            }}
          >
            <option value="all">Cobertura</option>
            <option value="all">Chile + Internacional</option>
            <option value="chile">Solo Chile</option>
            <option value="internacional">Solo Internacional</option>
          </SelectField>

          {/* 2. Estado */}
          <SelectField
            id="filter-estado"
            aria-label="Estado"
            value={currentEstado}
            onChange={(e) => updateParams({ estado: e.target.value })}
          >
            <option value="all">Estado</option>
            <option value="all">Todos los estados</option>
            <option value="Abierta">Abiertas</option>
            <option value="PrÃ³xima">PrÃ³ximas</option>
            <option value="Cerrada">Cerradas</option>
          </SelectField>

          {/* 3. RegiÃ³n */}
          <SelectField
            id="filter-region-main"
            aria-label="RegiÃ³n"
            value={selectedRegions[0] ?? ''}
            onChange={(e) => updateParams({ region: e.target.value })}
          >
            <option value="">Ubicaciones</option>
            <option value="">Todas las regiones</option>
            {filteredRegionOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </SelectField>

          {/* 4. InstituciÃ³n */}
          <SelectField
            id="filter-inst-main"
            aria-label="InstituciÃ³n"
            value={selectedInstitutions[0] ?? ''}
            onChange={(e) => updateParams({ institution: e.target.value })}
          >
            <option value="">Instituciones</option>
            <option value="">Todas las instituciones</option>
            {filteredInstitutionOptions.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </SelectField>

          {/* 5. BotÃ³n Avanzados */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            aria-expanded={advancedOpen}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold min-h-[44px] transition-colors ${
              advancedOpen
                ? 'border-[var(--iica-blue)] bg-[var(--iica-blue)]/5 text-[var(--iica-blue)]'
                : 'border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Avanzados
            {activeFilterCount > 0 && (
              <span className="ml-auto bg-[var(--iica-navy)] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* â”€â”€ Active filter chips + reset â”€â”€ */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-3" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500">
                {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''} activo{activeFilterCount !== 1 ? 's' : ''}
              </span>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    updateParams(chip.clear);
                  }}
                  aria-label={`Quitar filtro ${chip.label}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--iica-border)] bg-white dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          </div>
        )}

        {/* â”€â”€ Advanced filters panel â”€â”€ */}
        {advancedOpen && (
          <div className="pt-4 border-t border-[var(--iica-border)] dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* Institución searchable filter */}
              <div>
                <InstitutionFilter
                  institutions={deduplicatedInstitutions}
                  selected={selectedInstitutions}
                  onChange={(next) => updateParams({ institution: stringifyCsv(next) })}
                />
              </div>

              {/* Sectores */}
              <div className="space-y-1.5">
                <label htmlFor="filter-category-adv" className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Sectores
                </label>
                <select
                  id="filter-category-adv"
                  multiple
                  aria-label="Sectores"
                  value={selectedCategories}
                  onChange={(e) => {
                    const next = Array.from(e.target.selectedOptions).map((o) => o.value);
                    updateParams({ category: stringifyCsv(next) });
                  }}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                  disabled={categoryOptions.length === 0}
                >
                  {categoryOptions.length === 0
                    ? <option value="">Disponible prÃ³ximamente</option>
                    : categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>

              {/* Ãmbito */}
              <div className="space-y-1.5">
                <label htmlFor="filter-ambito" className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Ãmbito
                </label>
                <select
                  id="filter-ambito"
                  aria-label="Ãmbito"
                  value={currentAmbito}
                  onChange={(e) => updateParams({ ambito: e.target.value })}
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                >
                  <option value="">Todos</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Regional">Regional</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>

              {/* Fecha desde */}
              <div className="space-y-1.5">
                <label htmlFor="filter-posted-from" className="text-xs font-bold uppercase tracking-wide text-gray-500">
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
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                />
              </div>

              {/* Fecha hasta */}
              <div className="space-y-1.5">
                <label htmlFor="filter-posted-till" className="text-xs font-bold uppercase tracking-wide text-gray-500">
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
                  className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                />
              </div>

              {/* Presupuesto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Presupuesto (CLP)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label="Monto mÃ­nimo"
                    placeholder="MÃ­n"
                    value={currentMinAmount}
                    onChange={(e) => {
                      const normalized = normalizeAmountRange(e.target.value, currentMaxAmount);
                      updateParams(normalized, 'replace');
                    }}
                    className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
                  />
                  <span className="text-gray-400 shrink-0" aria-hidden>â€”</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    aria-label="Monto mÃ¡ximo"
                    placeholder="MÃ¡x"
                    value={currentMaxAmount}
                    onChange={(e) => {
                      const normalized = normalizeAmountRange(currentMinAmount, e.target.value);
                      updateParams(normalized, 'replace');
                    }}
                    className="w-full rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-yellow)]"
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

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

function SelectField({ children, ...props }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none rounded-lg border border-[var(--iica-border)] bg-white dark:bg-gray-800 dark:text-white pl-3 pr-8 py-2.5 text-sm text-gray-700 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent cursor-pointer transition-colors hover:border-[var(--iica-blue)]"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
