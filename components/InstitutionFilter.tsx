'use client';

import { SearchableMultiSelect, type MultiSelectOption } from '@/components/ui/SearchableMultiSelect';
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
  const quickAccessValues = useMemo(
    () => QUICK_ACCESS_CHIPS
      .map((alias) => institutions.find((institution) => institution.name.toLowerCase().includes(alias.toLowerCase()))?.name)
      .filter((value): value is string => Boolean(value)),
    [institutions]
  );

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="filter-institution-adv"
        className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        Institución
      </label>
      <SearchableMultiSelect
        id="filter-institution-adv"
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder="Todas las instituciones"
        selectedLabel={(n) => `${n} institución${n > 1 ? 'es' : ''} seleccionada${n > 1 ? 's' : ''}`}
        quickAccessValues={quickAccessValues}
        searchPlaceholder="Buscar institución..."
        ariaLabel="Filtrar por institución"
      />
    </div>
  );
}
