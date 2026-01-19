'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { useAnalytics } from '@/hooks/useAnalytics';

// Since I don't know if use-debounce is installed, I will implement a manual debounce effect
// or just use useEffect with timeout.

export default function ProjectFilters({
    categories,
    regions,
    beneficiaries,
    institutions,
    counts // { filtered, total }
}: {
    categories: string[];
    regions: string[];
    beneficiaries: string[];
    institutions: string[];
    counts: { filtered: number; total: number };
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackSearch } = useAnalytics();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || ''); // Wait, if I don't have this...

    // I will implementation a custom debounce hook if I can't use the library?
    // Let's assume I can't add packages.
    // I'll use a useEffect for debounce.

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== 'Todas' && value !== 'Todos') {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Initial sync
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    // Update URL when search term changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQ = searchParams.get('q') || '';
            if (searchTerm !== currentQ) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                    params.set('q', searchTerm);
                } else {
                    params.delete('q');
                }
                router.replace(`?${params.toString()}`, { scroll: false });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, router, searchParams]);

    const selectedCategory = searchParams.get('category') || 'Todas';
    const selectedRegion = searchParams.get('region') || 'Todas';
    const selectedBeneficiary = searchParams.get('beneficiary') || 'Todos';
    const selectedInstitution = searchParams.get('institution') || 'Todas';

    // Track search
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            trackSearch(query, counts.filtered, {
                category: selectedCategory,
                region: selectedRegion,
                beneficiary: selectedBeneficiary,
                institution: selectedInstitution
            });
        }
    }, [searchParams, counts.filtered, selectedCategory, selectedRegion, selectedBeneficiary, selectedInstitution, trackSearch]);

    const handleFilterChange = (key: string, value: string) => {
        router.push(`?${createQueryString(key, value)}`, { scroll: false });
    };

    return (
        <div className="p-6 border-b border-[var(--iica-border)] bg-gray-50/50">
            <div className="flex flex-col gap-6">

                {/* Search Bar */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        list="search-suggestions"
                        aria-label="Buscar convocatorias"
                        placeholder="Buscar por nombre, palabra clave o institución..."
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none transition-shadow text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Counter */}
                <div className="text-sm text-gray-600">
                    Mostrando <strong className="text-[var(--iica-navy)]">{counts.filtered}</strong> de <strong>{counts.total}</strong> convocatorias
                    {searchTerm && (
                        <span className="ml-2 text-[var(--iica-cyan)]">
                            (búsqueda inteligente activa)
                        </span>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">

                    {/* Category Chips */}
                    <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Filtros de categoría">
                        <span className="text-sm font-bold text-gray-700 mr-2 flex items-center gap-1">
                            <Filter className="h-4 w-4" /> Categoría:
                        </span>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange('category', cat)}
                                aria-pressed={selectedCategory === cat}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
                                    ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-gray-300 mx-2"></div>

                    {/* Advanced Dropdowns */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <FilterSelect
                            label="Región"
                            value={selectedRegion}
                            options={regions}
                            onChange={(val) => handleFilterChange('region', val)}
                            defaultText="Todas las Regiones"
                        />
                        <FilterSelect
                            label="Perfil"
                            value={selectedBeneficiary}
                            options={beneficiaries}
                            onChange={(val) => handleFilterChange('beneficiary', val)}
                            defaultText="Todos los Perfiles"
                        />
                        <FilterSelect
                            label="Institución"
                            value={selectedInstitution}
                            options={institutions}
                            onChange={(val) => handleFilterChange('institution', val)}
                            defaultText="Todas las Instituciones"
                        />
                        {/* Amount Filter */}
                        <div className="relative group">
                            <select
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (val === 'all') {
                                        params.delete('minAmount');
                                        params.delete('maxAmount');
                                    } else {
                                        const [min, max] = val.split('-');
                                        params.set('minAmount', min);
                                        params.set('maxAmount', max);
                                    }
                                    router.replace(`?${params.toString()}`, { scroll: false });
                                }}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block w-full pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="all">Cualquier Monto</option>
                                <option value="0-10000000">Menos de $10 Millones</option>
                                <option value="10000000-50000000">$10MM - $50 Millones</option>
                                <option value="50000000-100000000">$50MM - $100 Millones</option>
                                <option value="100000000-999999999999">Más de $100 Millones</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none group-hover:text-[var(--iica-blue)]" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Predictive Search Suggestions */}
            <datalist id="search-suggestions">
                <option value="Riego" />
                <option value="Agricultura Familiar" />
                <option value="Innovación Agrícola" />
                <option value="Mujeres Rurales" />
                <option value="Sustentabilidad" />
                <option value="Emergencia Agrícola" />
                <option value="Pueblos Indígenas" />
                <option value="Jóvenes Rurales" />
            </datalist>

        </div>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    defaultText: string;
}

function FilterSelect({ label, value, options, onChange, defaultText }: FilterSelectProps) {
    return (
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block w-full pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                style={{ maxWidth: '200px' }}
            >
                <option value={defaultText.includes("Todos") ? "Todos" : "Todas"}>{defaultText}</option>

                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none group-hover:text-[var(--iica-blue)]" />
        </div >
    )
}
