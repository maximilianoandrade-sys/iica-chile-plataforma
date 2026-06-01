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
  const categoryOptions = Object.keys(filterCounts.categoria ?? {}).sort((a, b) => a.localeCompare(b, 'es'));

  const selectedInstitutions = parseCsvParam(currentInstitution);
  const selectedRegions = parseCsvParam(currentRegion);
  const selectedCategories = parseCsvParam(currentCategory);

  const activeFilterChips: Array<{ key: string; label: string; clear: Record<string, string> }> = [];

  if (currentQ.trim()) {
    activeFilterChips.push({ key: `q:${currentQ.trim()}`, label: `Busqueda: "${currentQ.trim()}"`, clear: { q: '' } });
  }

  if (estadoParam && estadoParam !== 'all') {
    activeFilterChips.push({ key: `estado:${estadoParam}`, label: `Estado: ${estadoParam}`, clear: { estado: '' } });
  }

  if (currentAmbito) {
    activeFilterChips.push({ key: `ambito:${currentAmbito}`, label: `Ambito: ${currentAmbito}`, clear: { ambito: '' } });
  }

  selectedInstitutions.forEach((institution) => {
    const nextInstitutions = selectedInstitutions.filter((value) => value !== institution);
    activeFilterChips.push({
      key: `institution:${institution}`,
      label: `Institucion: ${institution}`,
      clear: { institution: stringifyCsv(nextInstitutions) },
    });
  });

  selectedRegions.forEach((region) => {
    const nextRegions = selectedRegions.filter((value) => value !== region);
    activeFilterChips.push({
      key: `region:${region}`,
      label: `Region: ${region}`,
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
    <div className="rounded-2xl border border-iica-border bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            role="searchbox"
            aria-label="Buscar oportunidades"
            placeholder="Buscar por palabra clave"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="w-full rounded-xl border border-iica-border bg-white py-3 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParams({ q: '' }, 'replace');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">Buscar en</span>
          <select
            aria-label="Buscar en"
            value="all"
            disabled
            className="rounded-xl border border-iica-border bg-gray-50 px-3 py-2 text-sm text-gray-600 min-h-[44px]"
          >
            <option value="all">Todas las oportunidades</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Estado" htmlFor="filter-estado">
            <select
              id="filter-estado"
              aria-label="Estado"
              value={currentEstado}
              onChange={(event) => updateParams({ estado: event.target.value })}
            className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="Abierta">Abiertas</option>
            <option value="Próxima">Próximas</option>
            <option value="Cerrada">Cerradas</option>
          </select>
        </Field>

        <Field label="Ubicaciones" htmlFor="filter-region">
          <select
            id="filter-region"
            multiple
            aria-label="Ubicaciones"
            value={selectedRegions}
            onChange={(event) => {
              const next = Array.from(event.target.selectedOptions).map((option) => option.value);
              updateParams({ region: stringifyCsv(next) });
            }}
            className="w-full rounded-xl border border-iica-border bg-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
          >
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Instituciones" htmlFor="filter-institution">
          <select
            id="filter-institution"
            multiple
            aria-label="Instituciones"
            value={selectedInstitutions}
            onChange={(event) => {
              const next = Array.from(event.target.selectedOptions).map((option) => option.value);
              updateParams({ institution: stringifyCsv(next) });
            }}
            className="w-full rounded-xl border border-iica-border bg-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
          >
            {institutionOptions.map((institution) => (
              <option key={institution} value={institution}>
                {institution}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sectores" htmlFor="filter-category">
          <select
            id="filter-category"
            multiple
            aria-label="Sectores"
            value={selectedCategories}
            onChange={(event) => {
              const next = Array.from(event.target.selectedOptions).map((option) => option.value);
              updateParams({ category: stringifyCsv(next) });
            }}
            className="w-full rounded-xl border border-iica-border bg-white px-3 py-2 text-sm text-gray-800 min-h-[88px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
            disabled={categoryOptions.length === 0}
          >
            {categoryOptions.length === 0 ? (
              <option value="">Disponible próximamente</option>
            ) : (
              categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            )}
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-iica-border pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm min-h-[44px] transition-colors ${
            advancedOpen ? 'border-iica-blue bg-iica-blue/5 text-iica-blue' : 'border-iica-border bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-expanded={advancedOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros avanzados
        </button>

        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center rounded-full border border-iica-border bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] hover:bg-gray-50"
        >
          Restablecer todo
        </button>

        <span className="text-sm text-gray-500" aria-live="polite">
          {activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} activo{activeFilterCount === 1 ? '' : 's'}
        </span>
      </div>

      {advancedOpen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-iica-border pt-3">
          <Field label="Ambito" htmlFor="filter-ambito">
            <select
              id="filter-ambito"
              aria-label="Ambito"
              value={currentAmbito}
              onChange={(event) => updateParams({ ambito: event.target.value })}
              className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="Nacional">Nacional</option>
              <option value="Regional">Regional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </Field>

          <Field label="Publicado desde" htmlFor="filter-posted-from">
            <input
              id="filter-posted-from"
              type="date"
              aria-label="Publicado desde"
              value={currentPostedFrom}
              onChange={(event) => {
                const normalized = normalizeDateRange(event.target.value, currentPostedTill);
                updateParams(normalized, 'replace');
              }}
              className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
            />
          </Field>

          <Field label="Publicado hasta" htmlFor="filter-posted-till">
            <input
              id="filter-posted-till"
              type="date"
              aria-label="Publicado hasta"
              value={currentPostedTill}
              onChange={(event) => {
                const normalized = normalizeDateRange(currentPostedFrom, event.target.value);
                updateParams(normalized, 'replace');
              }}
              className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
            />
          </Field>

          <Field label="Presupuesto (CLP)" htmlFor="filter-min-amount">
            <div className="flex items-center gap-2">
              <input
                id="filter-min-amount"
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Monto minimo"
                placeholder="Min"
                value={currentMinAmount}
                onChange={(event) => {
                  const normalized = normalizeAmountRange(event.target.value, currentMaxAmount);
                  updateParams(normalized, 'replace');
                }}
                className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
              />

              <span className="text-gray-400" aria-hidden="true">-</span>

              <input
                type="number"
                inputMode="numeric"
                min={0}
                aria-label="Monto maximo"
                placeholder="Max"
                value={currentMaxAmount}
                onChange={(event) => {
                  const normalized = normalizeAmountRange(currentMinAmount, event.target.value);
                  updateParams(normalized, 'replace');
                }}
                className="w-full rounded-xl border border-iica-border bg-white px-3 py-2.5 text-sm text-gray-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
              />
            </div>
          </Field>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                if (chip.clear.q === '') setSearchInput('');
                updateParams(chip.clear);
              }}
              aria-label={`Quitar filtro ${chip.label}`}
              className="inline-flex items-center gap-1 rounded-full border border-iica-border bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              <span>{chip.label}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="text-xs text-gray-500">
          Los resultados se actualizan automaticamente mientras ajusta filtros.
        </div>
      ) : null}
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
