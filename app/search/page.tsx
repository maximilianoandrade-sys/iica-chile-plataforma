'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FiltersPanel from '@/components/FiltersPanel';
import TenderCard from '@/components/TenderCard';
import SearchBar from '@/components/SearchBar';
import { fetchTenders } from '@/lib/tenders';

export default function TenderSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const filters = {
    query: searchParams.get('q') || '',
    locations: searchParams.get('locations') ? searchParams.get('locations')!.split(',') : [],
    sectors: searchParams.get('sectors') ? searchParams.get('sectors')!.split(',') : [],
    status: searchParams.get('status') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
  };

  useEffect(() => {
    setLoading(true);
    setError(null); // Limpiar errores previos
    fetchTenders(filters)
      .then(({data, count}) => {
        setTenders(data);
        setTotal(count);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tenders:', error);
        // En caso de error, usar datos vacíos y detener el loading
        setTenders([]);
        setTotal(0);
        setLoading(false);
        setError('Error al cargar las licitaciones. Por favor, intenta nuevamente.');
      });
  }, [filters.query, filters.locations.join(','), filters.sectors.join(','), filters.status, filters.page]);

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.set(key, Array.isArray(value) ? (value as string[]).join(',') : String(value));
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ ...filters, page: newPage });
  };

  const pageSize = 9;
  const totalPages = Math.ceil(total / pageSize);

      return (
        <div className="min-h-screen bg-gradient-to-br from-iica-light to-white">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-iica-primary to-iica-blue bg-clip-text text-transparent mb-2">
                Plataforma de Licitaciones IICA
              </h1>
              <p className="text-gray-600">Oportunidades de financiamiento 2025</p>
            </div>
        
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar 
            defaultValue={filters.query}
            onSearch={(query) => updateFilters({...filters, query, page: 1})}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <FiltersPanel filters={filters} onChange={updateFilters} />
          
          <main className="lg:col-span-3">
            <div className="mb-4 text-gray-600">
              <strong>{total}</strong> {total === 1 ? 'resultado' : 'resultados'} encontrados
            </div>
            
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iica-primary mb-4"></div>
                      <p className="text-gray-600">Cargando oportunidades...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col justify-center items-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchTenders(filters)
                          .then(({data, count}) => {
                            setTenders(data);
                            setTotal(count);
                            setLoading(false);
                          })
                          .catch((err) => {
                            console.error('Error fetching tenders:', err);
                            setTenders([]);
                            setTotal(0);
                            setLoading(false);
                            setError('Error al cargar las licitaciones. Por favor, intenta nuevamente.');
                          });
                      }}
                      className="px-6 py-2 bg-iica-primary text-white rounded-lg hover:bg-iica-blue transition-colors shadow-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : tenders.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-gray-500">No se encontraron licitaciones con los filtros seleccionados.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {tenders.map(t => <TenderCard key={t.id} tender={t} />)}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                          onClick={() => handlePageChange(filters.page - 1)}
                          disabled={filters.page === 1}
                          className="px-4 py-2 border border-iica-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-iica-primary hover:text-white transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="px-4 py-2 text-iica-dark font-medium">
                          Página {filters.page} de {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(filters.page + 1)}
                          disabled={filters.page === totalPages}
                          className="px-4 py-2 border border-iica-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-iica-primary hover:text-white transition-colors"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </>
                )}
          </main>
        </div>
      </div>
    </div>
  );
}
