'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Search, Filter, ChevronDown, X, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useAnalytics } from '@/hooks/useAnalytics';

// ─────────────────────────────────────
// Chips de búsqueda rápida IICA
// ─────────────────────────────────────
const QUICK_SEARCHES = [
    { label: '🌎 FONTAGRO', query: 'FONTAGRO' },
    { label: '🌍 FAO', query: 'FAO' },
    { label: '🏦 BID', query: 'BID' },
    { label: '🤝 FIDA', query: 'FIDA' },
    { label: '🌿 GEF/GCF', query: 'GEF' },
    { label: '🇪🇺 EUROCLIMA', query: 'EUROCLIMA' },
    { label: '💧 Agua', query: 'agua' },
    { label: '🌱 Innovación', query: 'innovación' },
    { label: '🌡️ Clima', query: 'cambio climático' },
    { label: '🤝 Cooperación', query: 'cooperación' },
];

const NATURAL_SUGGESTIONS = [
    'innovación agropecuaria regional',
    'adaptación climática zonas áridas',
    'cooperación técnica FAO TCP',
    'fondos FONTAGRO consorcio',
    'asistencia técnica BID',
    'inclusión financiera pequeños agricultores',
    'sistemas alimentarios sostenibles',
    'agroforestería patagonia',
    'trazabilidad sanidad vegetal',
    'extensión agrícola digital',
    'biodiversidad suelos degradados',
    'resiliencia climática chile central',
    'financiamiento climático GCF',
    'agricultura familiar campesina',
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Más relevantes' },
    { value: 'date_asc', label: 'Cierre más próximo' },
    { value: 'date_desc', label: 'Cierre más lejano' },
    { value: 'viabilidad_desc', label: 'Mayor viabilidad IICA' },
    { value: 'amount_desc', label: 'Mayor monto' },
    { value: 'amount_asc', label: 'Menor monto' },
];

// Opciones de ámbito (ítem 8)
const AMBITO_OPTIONS = [
    { value: 'Todos', label: '🌐 Todos' },
    { value: 'Internacional', label: '🌎 Internacional' },
    { value: 'Nacional', label: '🇨🇱 Nacional' },
    { value: 'Regional', label: '🗺️ Regional' },
];

// Opciones de viabilidad (ítem 9)
const VIABILIDAD_OPTIONS = [
    { value: 'Todas', label: '⭐ Todas' },
    { value: 'Alta', label: '★★★ Alta' },
    { value: 'Media', label: '★★ Media' },
    { value: 'Baja', label: '★ Baja' },
];

// Opciones de Rol IICA
const ROL_IICA_OPTIONS = [
    { value: 'Todos', label: '🎯 Todos los roles', title: 'Mostrar todas las oportunidades' },
    { value: 'Ejecutor', label: '✅ IICA Ejecutor', title: 'IICA postula y ejecuta directamente' },
    { value: 'Implementador', label: '🔧 Implementador', title: 'IICA como agencia de implementación técnica' },
    { value: 'Asesor', label: '💼 Asesor técnico', title: 'IICA apoya a terceros que ejecutan' },
    { value: 'Indirecto', label: '⚠️ Rol indirecto', title: 'Rol muy indirecto o sin apropiación directa' },
];

// Opciones de estado de postulación (ítem 10)
const ESTADO_OPTIONS = [
    { value: 'Todos', label: '📋 Todos los estados' },
    { value: 'Abierta', label: '🟢 Abierta' },
    { value: 'Próxima', label: '🟡 Próxima' },
    { value: 'Cerrada', label: '🔴 Cerrada' },
];

export default function ProjectFilters({
    categories,
    regions,
    beneficiaries,
    institutions,
    counts,
    dynamicSuggestions = [],
    zeroResultsSuggestions = [],
}: {
    categories: string[];
    regions: string[];
    beneficiaries: string[];
    institutions: string[];
    counts: { filtered: number; total: number; open: number };
    dynamicSuggestions?: string[];
    zeroResultsSuggestions?: string[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackSearch } = useAnalytics();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Cargar búsquedas recientes
    useEffect(() => {
        try {
            const saved = localStorage.getItem('iica_recent_searches');
            if (saved) setRecentSearches(JSON.parse(saved));
        } catch (e) { console.error('Error reading recent searches', e); }
    }, []);

    const saveRecentSearch = useCallback((term: string) => {
        const cleanTerm = term.trim();
        if (!cleanTerm || cleanTerm.length < 3) return;
        setRecentSearches(prev => {
            const updated = [cleanTerm, ...prev.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 5);
            try { localStorage.setItem('iica_recent_searches', JSON.stringify(updated)); } catch (e) { }
            return updated;
        });
    }, []);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            const empties = ['Todas', 'Todos', 'Todas las Regiones', 'Todos los Perfiles', 'Todas las Instituciones'];
            if (value && !empties.includes(value)) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Sync desde URL
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    // Debounced URL update (300ms) — ítem 7
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQ = searchParams.get('q') || '';
            if (searchTerm !== currentQ) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                    params.set('q', searchTerm);
                    saveRecentSearch(searchTerm); // Guardamos historial en el submit demorado
                } else {
                    params.delete('q');
                }
                startTransition(() => {
                    router.replace(`?${params.toString()}`, { scroll: false });
                });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, router, searchParams]);

    // Autocompletado — usa sugerencias dinámicas del servidor
    useEffect(() => {
        if (searchTerm.length >= 2) {
            const term = searchTerm.toLowerCase();
            // Combina sugerencias dinámicas (del JSON real) con las estáticas como fallback
            const allSuggestions = dynamicSuggestions.length > 0
                ? dynamicSuggestions
                : NATURAL_SUGGESTIONS;
            const matches = allSuggestions.filter(s =>
                s.toLowerCase().includes(term) ||
                term.split(' ').some(word => word.length > 2 && s.toLowerCase().includes(word))
            );
            setFilteredSuggestions(matches.slice(0, 6));
        } else if (searchTerm.length === 0) {
            // Sin query: mostrar recientes, sino sugerir las 5 más útiles
            if (recentSearches.length > 0) {
                setFilteredSuggestions(recentSearches);
            } else {
                const topPicks = [
                    'IICA Ejecutor directo',
                    'Alta viabilidad IICA',
                    'Sin cofinanciamiento requerido',
                    'Cooperación Sur-Sur ALC',
                    'Resiliencia climática',
                ];
                setFilteredSuggestions(topPicks);
            }
        } else {
            setFilteredSuggestions([]);
        }
    }, [searchTerm, dynamicSuggestions, recentSearches]);

    // Leer filtros de URL
    const selectedCategory = searchParams.get('category') || 'Todas';
    const selectedRegion = searchParams.get('region') || 'Todas';
    const selectedBeneficiary = searchParams.get('beneficiary') || 'Todos';
    const selectedInstitution = searchParams.get('institution') || 'Todas';
    const selectedAmbito = searchParams.get('ambito') || 'Todos';       // ítem 8
    const selectedViabilidad = searchParams.get('viabilidad') || 'Todas'; // ítem 9
    const selectedEstado = searchParams.get('estado') || 'Todos';        // ítem 10
    const selectedRol = searchParams.get('rol') || 'Todos';              // Rol IICA
    const soloAbiertos = searchParams.get('open') === '1';
    const sortBy = searchParams.get('sort') || 'relevance';

    const hasActiveFilters = !!(
        searchTerm ||
        selectedCategory !== 'Todas' ||
        selectedRegion !== 'Todas' ||
        selectedBeneficiary !== 'Todos' ||
        selectedInstitution !== 'Todas' ||
        selectedAmbito !== 'Todos' ||
        selectedViabilidad !== 'Todas' ||
        selectedEstado !== 'Todos' ||
        selectedRol !== 'Todos' ||
        soloAbiertos
    );

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
        startTransition(() => {
            router.push(`?${createQueryString(key, value)}`, { scroll: false });
        });
    };

    const toggleSoloAbiertos = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (soloAbiertos) { params.delete('open'); } else { params.set('open', '1'); }
        startTransition(() => { router.push(`?${params.toString()}`, { scroll: false }); });
    };

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'relevance') { params.delete('sort'); } else { params.set('sort', value); }
        startTransition(() => { router.push(`?${params.toString()}`, { scroll: false }); });
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        startTransition(() => { router.push('/', { scroll: false }); });
    };

    const applyQuickSearch = (query: string) => {
        setSearchTerm(query);
        setShowSuggestions(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Search Bar — ítem 7 */}
            <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        aria-label="Buscar oportunidades IICA"
                        placeholder='Busca por fuente, tema, región o tipo: "FONTAGRO", "adaptación climática", "BID"...'
                        className="pl-11 pr-10 py-3.5 w-full border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-[var(--iica-blue)] outline-none transition-colors text-gray-700 text-sm md:text-base bg-gray-50 focus:bg-white"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') { setSearchTerm(''); setShowSuggestions(false); }
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {/* Autocomplete */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <span>{searchTerm.length === 0 && recentSearches.length > 0 ? 'Búsquedas Recientes' : 'Sugerencias'}</span>
                                {searchTerm.length === 0 && recentSearches.length > 0 && (
                                    <button 
                                        onMouseDown={(e) => { 
                                            e.preventDefault(); 
                                            setRecentSearches([]); 
                                            localStorage.removeItem('iica_recent_searches'); 
                                        }} 
                                        className="text-[10px] text-gray-400 hover:text-red-500 lowercase font-normal"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            {filteredSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onMouseDown={() => applyQuickSearch(suggestion)}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--iica-navy)] flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-[var(--iica-blue)] flex-shrink-0" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tip: búsqueda por frase exacta */}
                {searchTerm && !searchTerm.includes('"') && (
                    <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                        <span>💡</span>
                        <span>Frase exacta:</span>
                        <button
                            onClick={() => setSearchTerm(`"${searchTerm}"`)}
                            className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            &quot;{searchTerm.slice(0, 30)}&quot;
                        </button>
                    </p>
                )}

                {/* Banner ¿Quisiste decir? — cuando hay 0 resultados */}
                {zeroResultsSuggestions.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs font-semibold text-amber-800 mb-2">🔍 Sin resultados. ¿Quisiste decir...?</p>
                        <div className="flex flex-wrap gap-2">
                            {zeroResultsSuggestions.map(sug => (
                                <button
                                    key={sug}
                                    onClick={() => setSearchTerm(sug)}
                                    className="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 rounded-full text-xs hover:bg-amber-100 transition-colors font-medium"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2">
                            Prueba filtrar por Ámbito &quot;Internacional&quot; o Rol &quot;Ejecutor&quot; para oportunidades directas del IICA.
                        </p>
                    </div>
                )}

                {/* Quick Search Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {QUICK_SEARCHES.map(({ label, query }) => (
                        <button
                            key={query}
                            onClick={() => applyQuickSearch(query)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${searchTerm === query
                                ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-md'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PILLS de Rol IICA ── */}
            <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-blue-50/30">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-[var(--iica-navy)] uppercase tracking-wider flex-shrink-0">Rol IICA:</span>
                    {ROL_IICA_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFilterChange('rol', opt.value)}
                            aria-pressed={selectedRol === opt.value}
                            title={opt.title}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${selectedRol === opt.value
                                ? opt.value === 'Indirecto'
                                    ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                                    : 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <span className="ml-auto text-[10px] text-gray-400 italic hidden md:block">
                        Filtra por cómo puede participar el IICA Chile
                    </span>
                </div>
            </div>

            {/* ── PILLS de Ámbito (ítem 8) ── */}
            <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">Ámbito:</span>
                    {AMBITO_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFilterChange('ambito', opt.value)}
                            aria-pressed={selectedAmbito === opt.value}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${selectedAmbito === opt.value
                                ? 'bg-[var(--iica-blue)] text-white border-[var(--iica-blue)] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}

                    {/* Viabilidad IICA (ítem 9) */}
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0 ml-3">Viabilidad:</span>
                    {VIABILIDAD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFilterChange('viabilidad', opt.value)}
                            aria-pressed={selectedViabilidad === opt.value}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${selectedViabilidad === opt.value
                                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:border-green-300'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PILLS de Estado de Postulación (ítem 10) ── */}
            <div className="px-4 md:px-6 py-3 bg-gray-50/30 flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 flex-shrink-0">
                    <Filter className="h-4 w-4" />
                    Más filtros:
                </div>

                {/* Estado de postulación */}
                <div className="flex flex-wrap gap-1.5">
                    {ESTADO_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFilterChange('estado', opt.value)}
                            aria-pressed={selectedEstado === opt.value}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${selectedEstado === opt.value
                                ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Solo Abiertos toggle */}
                <button
                    onClick={toggleSoloAbiertos}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${soloAbiertos
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                        }`}
                    title={`${counts.open} oportunidades abiertas`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${soloAbiertos ? 'bg-white' : 'bg-green-500'}`}></span>
                    Solo Abiertas ({counts.open})
                </button>

                {/* Categoría chips */}
                <div className="flex overflow-x-auto md:flex-wrap gap-2 md:gap-1.5 pb-2 md:pb-0 scrollbar-hide snap-x">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleFilterChange('category', cat)}
                            aria-pressed={selectedCategory === cat}
                            className={`flex-shrink-0 snap-start px-4 md:px-3 py-2 md:py-1.5 rounded-full text-sm md:text-xs font-bold transition-all border whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-[var(--iica-blue)] text-white border-[var(--iica-blue)] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${showAdvanced
                        ? 'bg-[var(--iica-navy)] text-white border-[var(--iica-navy)]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filtros avanzados
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
                <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-center">
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
                        label="Fuente"
                        value={selectedInstitution}
                        options={institutions}
                        onChange={(val) => handleFilterChange('institution', val)}
                        defaultText="Todas las Fuentes"
                    />

                    {/* Monto */}
                    <div className="relative">
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
                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                        >
                            <option value="all">Cualquier Monto</option>
                            <option value="0-100000000">Menos de $100M</option>
                            <option value="100000000-300000000">$100M – $300M</option>
                            <option value="300000000-600000000">$300M – $600M</option>
                            <option value="600000000-999999999999">Más de $600M</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Ordenamiento — ítem 11 */}
                    <div className="relative flex items-center gap-1.5">
                        <ArrowUpDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Results Counter */}
            <div className="px-4 md:px-6 py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                    Mostrando{' '}
                    <strong className="text-[var(--iica-navy)] text-base">{counts.filtered}</strong>
                    {' '}de{' '}
                    <strong>{counts.total}</strong>
                    {' '}oportunidades
                    {searchTerm && (
                        <span className="inline-flex items-center gap-1 text-[var(--iica-blue)] font-medium text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            <Sparkles className="h-3 w-3" />
                            por relevancia
                        </span>
                    )}
                    {counts.filtered === 0 && (
                        <span className="text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-xs">
                            💡 Prueba con &quot;FONTAGRO&quot;, &quot;BID&quot; o &quot;clima&quot;
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition-all"
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpiar filtros
                        </button>
                    )}
                    <a
                        href={`/api/export-csv?${new URLSearchParams({
                            ...(searchTerm ? { q: searchTerm } : {}),
                            ...(selectedCategory !== 'Todas' ? { category: selectedCategory } : {}),
                            ...(selectedRegion !== 'Todas' ? { region: selectedRegion } : {}),
                            ...(selectedInstitution !== 'Todas' ? { institution: selectedInstitution } : {}),
                            ...(selectedAmbito !== 'Todos' ? { ambito: selectedAmbito } : {}),
                        }).toString()}`}
                        download
                        title="Exportar lista a Excel/CSV"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--iica-secondary)] hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full border border-green-200 transition-all"
                    >
                        📊 Exportar CSV
                    </a>
                </div>
            </div>
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
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] block pl-3 pr-8 py-2 cursor-pointer hover:border-[var(--iica-blue)] transition-colors shadow-sm"
            >
                <option value={defaultText.includes("Todos") ? "Todos" : "Todas"}>{defaultText}</option>
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    )
}
