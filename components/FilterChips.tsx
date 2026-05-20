'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { type FilterCounts } from '@/lib/data';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('FilterChips');

interface FilterChipsProps {
  filterCounts: FilterCounts;
}

const MONTO_OPTIONS = [
  { label: '<$100M', min: '0', max: '100000000' },
  { label: '$100M–$300M', min: '100000000', max: '300000000' },
  { label: '>$300M', min: '300000000', max: '' },
] as const;

export function FilterChips({ filterCounts }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const currentQ = searchParams.get('q') ?? '';
  const currentEstado = searchParams.get('estado') ?? '';
  const currentInstitution = searchParams.get('institution') ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentMinAmount = searchParams.get('minAmount') ?? '';
  const currentMaxAmount = searchParams.get('maxAmount') ?? '';
  const currentAmbito = searchParams.get('ambito') ?? '';

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleChip(key: string, value: string) {
    const current = searchParams.get(key) ?? '';
    if (current === value) {
      updateParams({ [key]: '' });
    } else {
      updateParams({ [key]: value });
    }
  }

  function toggleMultiChip(key: string, value: string) {
    const current = searchParams.get(key) ?? '';
    const items = current ? current.split(',') : [];
    const next = items.includes(value)
      ? items.filter((i) => i !== value)
      : [...items, value];
    updateParams({ [key]: next.join(',') });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const hasActiveFilters = currentQ || currentEstado || currentInstitution || currentRegion || currentMinAmount || currentMaxAmount || currentAmbito;

  const topInstitutions = Object.entries(filterCounts.institucion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  const topRegions = Object.entries(filterCounts.region)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const selectedInstitutions = currentInstitution ? currentInstitution.split(',') : [];
  const selectedRegions = currentRegion ? currentRegion.split(',') : [];

  logger.debug('Render FilterChips', { hasActiveFilters });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            role="searchbox"
            aria-label="Buscar oportunidades"
            placeholder="Buscar..."
            value={currentQ}
            onChange={(e) => updateParams({ q: e.target.value })}
            className="pl-9 pr-8 py-2 w-48 sm:w-56 border border-iica-border rounded-full text-sm bg-white text-gray-900 placeholder:text-gray-400 min-h-[40px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
          />
          {currentQ && (
            <button
              type="button"
              onClick={() => updateParams({ q: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Chip label="Abiertas" count={filterCounts.estado['Abierta']} active={currentEstado === 'Abierta'} onClick={() => toggleChip('estado', 'Abierta')} />
        <Chip label="Próximas" count={filterCounts.estado['Próxima']} active={currentEstado === 'Próxima'} onClick={() => toggleChip('estado', 'Próxima')} />

        {topInstitutions.map((name) => (
          <Chip key={name} label={name} active={selectedInstitutions.includes(name)} onClick={() => toggleMultiChip('institution', name)} />
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm min-h-[40px] transition-colors ${
            moreOpen ? 'border-iica-blue bg-iica-blue/5 text-iica-blue' : 'border-iica-border bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Más filtros"
          aria-expanded={moreOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Más filtros
        </button>

        {hasActiveFilters && (
          <button type="button" onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700 underline ml-1">
            Limpiar
          </button>
        )}
      </div>

      {moreOpen && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-iica-border/50">
          {topRegions.map((name) => (
            <Chip key={name} label={name} active={selectedRegions.includes(name)} onClick={() => toggleMultiChip('region', name)} size="sm" />
          ))}
          <span className="text-xs text-gray-400 mx-1">|</span>
          {(['Nacional', 'Regional', 'Internacional'] as const).map((opt) => (
            <Chip key={opt} label={opt} active={currentAmbito === opt} onClick={() => toggleChip('ambito', opt)} size="sm" />
          ))}
          <span className="text-xs text-gray-400 mx-1">|</span>
          {MONTO_OPTIONS.map((opt) => (
            <Chip key={opt.label} label={opt.label} active={currentMinAmount === opt.min && currentMaxAmount === opt.max} onClick={() => updateParams({ minAmount: opt.min, maxAmount: opt.max })} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  size?: 'default' | 'sm';
}

function Chip({ label, count, active, onClick, size = 'default' }: ChipProps) {
  const base = size === 'sm' ? 'px-2.5 py-1.5 text-xs min-h-[32px]' : 'px-3 py-2 text-sm min-h-[40px]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border font-medium transition-colors ${base} ${
        active ? 'border-iica-blue bg-iica-blue text-white shadow-sm' : 'border-iica-border bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      {label}
      {count != null && <span className={active ? 'text-white/80' : 'text-gray-400'}>({count})</span>}
    </button>
  );
}
