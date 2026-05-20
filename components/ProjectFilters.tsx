'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ProjectFilters');

export interface FilterCounts {
  estado: Record<string, number>;
  institucion: Record<string, number>;
  region: Record<string, number>;
  ambito: Record<string, number>;
}

interface ProjectFiltersProps {
  filterCounts: FilterCounts;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

const ESTADO_OPTIONS = ['Abierta', 'Próxima', 'Cerrada'] as const;
const AMBITO_OPTIONS = ['Nacional', 'Regional', 'Internacional'] as const;
const MONTO_OPTIONS = [
  { label: 'Cualquier monto', min: '', max: '' },
  { label: '<$100M', min: '', max: '100000000' },
  { label: '$100M–$300M', min: '100000000', max: '300000000' },
  { label: '>$300M', min: '300000000', max: '' },
] as const;

export function ProjectFilters({ filterCounts, totalCount, filteredCount, className }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentQ = searchParams.get('q') ?? '';
  const currentEstado = searchParams.get('estado') ?? '';
  const currentInstitution = searchParams.get('institution') ?? '';
  const currentRegion = searchParams.get('region') ?? '';
  const currentMinAmount = searchParams.get('minAmount') ?? '';
  const currentMaxAmount = searchParams.get('maxAmount') ?? '';
  const currentAmbito = searchParams.get('ambito') ?? '';

  const hasActiveFilters = currentQ || currentEstado || currentInstitution || currentRegion || currentMinAmount || currentMaxAmount || currentAmbito;

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete('page');
    const url = `${pathname}?${params.toString()}`;
    logger.debug('Updating filters', { updates });
    router.push(url, { scroll: false });
  }

  function clearFilters() {
    router.push(pathname, { scroll: false });
  }

  // Top 6 institutions sorted by count
  const topInstitutions = Object.entries(filterCounts.institucion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Top 6 regions sorted by count
  const topRegions = Object.entries(filterCounts.region)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const selectedInstitutions = currentInstitution ? currentInstitution.split(',') : [];
  const selectedRegions = currentRegion ? currentRegion.split(',') : [];

  function toggleMultiSelect(param: string, current: string[], value: string) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [param]: next.join(',') });
  }

  return (
    <aside
      aria-label="Filtros de búsqueda"
      className={`w-full lg:w-72 lg:shrink-0 ${className ?? ''}`}
    >
      <div className="space-y-6">
        {/* Header with clear */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {filteredCount} de {totalCount} resultados
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Search */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Búsqueda</legend>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              aria-label="Buscar oportunidades"
              placeholder="Buscar..."
              value={currentQ}
              onChange={(e) => updateParams({ q: e.target.value })}
              className="w-full pl-10 pr-10 py-3 border border-iica-border rounded-xl text-sm min-h-[44px] focus-visible:ring-2 focus-visible:ring-iica-yellow focus:outline-none"
            />
            {currentQ && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => updateParams({ q: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </fieldset>

        {/* Estado */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Estado</legend>
          <div className="space-y-1">
            <label className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="estado"
                value=""
                checked={currentEstado === ''}
                onChange={() => updateParams({ estado: '' })}
                className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
              />
              <span className="ml-2 text-sm">Todas</span>
            </label>
            {ESTADO_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value={opt}
                  checked={currentEstado === opt}
                  onChange={() => updateParams({ estado: opt })}
                  className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
                />
                <span className="ml-2 text-sm">{opt}</span>
                <span className="text-xs text-gray-400 ml-auto">{filterCounts.estado[opt] ?? 0}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Institución */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Institución</legend>
          <div className="space-y-1">
            {topInstitutions.map(([name, count]) => (
              <label key={name} className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedInstitutions.includes(name)}
                  onChange={() => toggleMultiSelect('institution', selectedInstitutions, name)}
                  className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
                />
                <span className="ml-2 text-sm truncate">{name}</span>
                <span className="text-xs text-gray-400 ml-auto">{count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Región */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Región</legend>
          <div className="space-y-1">
            {topRegions.map(([name, count]) => (
              <label key={name} className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(name)}
                  onChange={() => toggleMultiSelect('region', selectedRegions, name)}
                  className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
                />
                <span className="ml-2 text-sm truncate">{name}</span>
                <span className="text-xs text-gray-400 ml-auto">{count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Monto */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Monto</legend>
          <div className="space-y-1">
            {MONTO_OPTIONS.map((opt) => (
              <label key={opt.label} className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="monto"
                  checked={currentMinAmount === opt.min && currentMaxAmount === opt.max}
                  onChange={() => updateParams({ minAmount: opt.min, maxAmount: opt.max })}
                  className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
                />
                <span className="ml-2 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Ámbito */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-2">Ámbito</legend>
          <div className="space-y-1">
            <label className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="ambito"
                value=""
                checked={currentAmbito === ''}
                onChange={() => updateParams({ ambito: '' })}
                className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
              />
              <span className="ml-2 text-sm">Todos</span>
            </label>
            {AMBITO_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center min-h-[44px] py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="ambito"
                  value={opt}
                  checked={currentAmbito === opt}
                  onChange={() => updateParams({ ambito: opt })}
                  className="w-4 h-4 text-iica-blue focus:ring-iica-yellow"
                />
                <span className="ml-2 text-sm">{opt}</span>
                <span className="text-xs text-gray-400 ml-auto">{filterCounts.ambito[opt] ?? 0}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </aside>
  );
}
