'use client';

import { Search, Filter, Calendar, MapPin, DollarSign, Building2, Tag, ExternalLink, ChevronDown, X } from 'lucide-react';
import { realTenders, TenderFilters } from '../lib/types';
import { useState, useMemo } from 'react';

type Tender = typeof realTenders[number];

const TenderCard = ({ tender, onViewMore }: { tender: Tender; onViewMore: (t: Tender) => void }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-lg text-gray-900 flex-1 pr-2 line-clamp-2">{tender.title}</h3>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        tender.status === 'open' ? 'bg-green-100 text-green-800' : 
        tender.status === 'approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {tender.status.toUpperCase()}
      </span>
    </div>
    
    <div className="flex flex-wrap gap-2 mb-3">
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <Building2 size={14} /> <strong>{tender.agency}</strong>
      </span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        tender.category === 'consulting' ? 'bg-blue-100 text-blue-800' :
        tender.category === 'services' ? 'bg-purple-100 text-purple-800' :
        tender.category === 'works' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
      }`}>
        {tender.category}
      </span>
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Tag size={12} /> {tender.source}
      </span>
    </div>

    <div className="space-y-2 mb-4 text-sm text-gray-600">
      <div className="flex items-center gap-2"><MapPin size={14} />{tender.location}</div>
      <div className="flex items-center gap-2"><DollarSign size={14} /><strong>{tender.budget}</strong></div>
      <div className="flex items-center gap-2"><Calendar size={14} />Deadline: {tender.deadline?.toLocaleDateString('es-CL')}</div>
    </div>

    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{tender.description}</p>

    <div className="flex gap-2">
      <button onClick={() => onViewMore(tender)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
        Ver Detalle
      </button>
      <a href={tender.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm">
        <ExternalLink size={14} /> Fuente
      </a>
    </div>
  </div>
);

const FiltersPanel = ({ filters, onFilterChange, onReset }: {
  filters: TenderFilters;
  onFilterChange: (key: keyof TenderFilters, value: string) => void;
  onReset: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 lg:sticky lg:top-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Filter size={18} /> Filtros</h3>
        <button onClick={() => setExpanded(!expanded)} className="lg:hidden text-gray-600">
          <ChevronDown size={20} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {expanded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select value={filters.status || ''} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Todos</option><option value="open">Abierto</option><option value="approval">Aprobación</option><option value="awarded">Adjudicado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agencia</label>
            <select value={filters.agency || ''} onChange={(e) => onFilterChange('agency', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Todas</option><option value="FAO">FAO</option><option value="BID">BID</option><option value="FONTAGRO">FONTAGRO</option>
            </select>
          </div>
          <button onClick={onReset} className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2 text-sm">
            <X size={16} /> Limpiar
          </button>
        </div>
      )}
    </div>
  );
};

export default function IICAPlataforma() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TenderFilters>({});
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'deadline' | 'budget' | 'postedDate'>('deadline');

  const itemsPerPage = 8;

  const filteredTenders = useMemo(() => {
    return realTenders.filter(tender => {
      const matchesSearch = !searchQuery || 
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters = !filters.status || tender.status === filters.status;
      const matchesAgency = !filters.agency || tender.agency.includes(filters.agency);
      
      return matchesSearch && matchesFilters && matchesAgency;
    }).sort((a, b) => {
      if (sortBy === 'budget') return (b.budget || '').localeCompare(a.budget || '');
      if (sortBy === 'postedDate') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      return (a.deadline?.getTime() || 0) - (b.deadline?.getTime() || 0);
    });
  }, [searchQuery, filters, sortBy]);

  const paginatedTenders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTenders.slice(start, start + itemsPerPage);
  }, [filteredTenders, currentPage]);

  const stats = {
    total: filteredTenders.length,
    open: filteredTenders.filter(t => t.status === 'open').length,
    chile: filteredTenders.filter(t => t.location.toLowerCase().includes('chile')).length
  };

  const exportCSV = () => {
    const csv = [
      ['Título', 'Agencia', 'Estado', 'Ubicación', 'Presupuesto', 'Deadline', 'Link'],
      ...filteredTenders.map(t => [t.title, t.agency, t.status, t.location, t.budget || '', t.deadline?.toLocaleDateString('es-CL') || '', t.link])
    ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenders-iica-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">I</div>
              <div><h1 className="text-xl font-bold text-gray-900">IICA Chile</h1><p className="text-sm text-gray-600">Plataforma de Financiamiento</p></div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Oportunidades Agrícolas 2026</h2>
          <p className="text-xl mb-8 opacity-90">Proyectos reales de FAO, BID, FONTAGRO</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6"><p className="text-3xl font-bold">{stats.total}</p><p className="text-sm mt-1">Total</p></div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6"><p className="text-3xl font-bold">{stats.open}</p><p className="text-sm mt-1">Abiertos</p></div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6"><p className="text-3xl font-bold">{stats.chile}</p><p className="text-sm mt-1">Chile</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              placeholder="Buscar tenders por título o descripción..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><FiltersPanel filters={filters} onFilterChange={(key, value) => { setFilters({...filters, [key]: value}); setCurrentPage(1); }} onReset={() => { setFilters({}); setSearchQuery(''); setCurrentPage(1); }} /></div>
          
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-wrap gap-3 items-center">
              <p className="text-xl font-semibold text-gray-900"><strong>{filteredTenders.length}</strong> tenders encontrados</p>
              <div className="ml-auto flex gap-2">
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="deadline">Deadline próximo</option>
                  <option value="budget">Presupuesto alto</option>
                  <option value="postedDate">Más recientes</option>
                </select>
                <button onClick={exportCSV} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                  <Tag size={16} /> CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedTenders.map(tender => (
                <TenderCard key={tender.id} tender={tender} onViewMore={setSelectedTender} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 p-4">
                <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage === 1} className="px-6 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} disabled={currentPage === totalPages} className="px-6 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
                  Siguiente →
                </button>
              </div>
            )}

            {filteredTenders.length === 0 && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-500 mb-4">No se encontraron tenders</p>
                <button onClick={() => { setFilters({}); setSearchQuery(''); }} className="text-blue-600 hover:text-blue-700 font-semibold">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTender && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTender(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{selectedTender.title}</h2>
                <button onClick={() => setSelectedTender(null)} className="text-gray-500 hover:text-gray-700"><X size={28} /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agencia</p><p className="font-semibold text-xl">{selectedTender.agency}</p>
                  <p className="text-sm text-gray-600 mt-4 mb-1">Ubicación</p><p className="font-semibold">{selectedTender.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado</p><p className={`font-semibold px-4 py-2 rounded-full inline-block max-w-max ${
                    selectedTender.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{selectedTender.status}</p>
                  <p className="text-sm text-gray-600 mt-4 mb-1">Presupuesto</p><p className="font-semibold text-xl">{selectedTender.budget}</p>
                  <p className="text-sm text-gray-600 mt-2">Deadline: <span className="font-semibold text-red-600">{selectedTender.deadline?.toLocaleDateString('es-CL')}</span></p>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-semibold text-xl mb-4">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{selectedTender.description}</p>
              </div>
              <a href={selectedTender.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 text-white text-center py-4 px-8 rounded-xl hover:bg-blue-700 font-semibold text-lg">
                → Ver Tender Completo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
