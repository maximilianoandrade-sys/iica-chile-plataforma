
import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

export const FacetedFilter = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Mocks for prototype
    const filters = {
        agencies: ['BID', 'Banco Mundial', 'CORFO', 'FIA', 'IICA'],
        countries: ['Chile', 'Perú', 'Argentina', 'Regional'],
        ods: [1, 2, 5, 8, 13, 15]
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar proyectos, palabras clave..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Agency Filter */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organismo</label>
                    <select className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm">
                        <option value="">Todos</option>
                        {filters.agencies.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">País Destino</label>
                    <select className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm">
                        <option value="">Todos</option>
                        {filters.countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Amount Filter */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Fondo</label>
                    <select className="w-full p-2 rounded-md border border-slate-200 bg-slate-50 text-sm">
                        <option value="all">Cualquier monto</option>
                        <option value="small">Menos de $10k USD</option>
                        <option value="medium">$10k - $100k USD</option>
                        <option value="large">Más de $100k USD</option>
                    </select>
                </div>

                {/* Smart Search Toggle */}
                <div className="flex items-end">
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" /> Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};
