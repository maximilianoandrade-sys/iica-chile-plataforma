'use client';

import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import counterparts from '@/lib/counterparts_raw.json';

export default function CounterpartLinks() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<typeof counterparts[0] | null>(null);

    // Filter partners based on search
    const filteredPartners = counterparts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <h3 className="font-bold text-[var(--iica-navy)] mb-4 flex items-center gap-2">
                🤝 Directorio de Contrapartes
            </h3>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Accede a los sitios web oficiales de nuestra red de aliados estratégicos y organismos de cooperación.
            </p>

            <div className="relative mb-4 flex-grow">
                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar contraparte (Ej: INDAP, FAO)..."
                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedPartner(null); // Reset selection on search
                        }}
                    />
                </div>

                {/* Dropdown Results (Limited height) */}
                {searchTerm && !selectedPartner && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredPartners.length > 0 ? (
                            filteredPartners.slice(0, 50).map((partner) => (
                                <button
                                    key={partner.id}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 border-b border-gray-50 last:border-0"
                                    onClick={() => {
                                        setSelectedPartner(partner);
                                        setSearchTerm(partner.name);
                                    }}
                                >
                                    {partner.name}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-xs text-gray-500">
                                No se encontraron resultados.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Partner Action */}
            {selectedPartner ? (
                <div className="mt-auto bg-blue-50 border border-blue-100 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="font-bold text-[var(--iica-navy)] text-sm mb-2 line-clamp-2">
                        {selectedPartner.name}
                    </p>
                    <a
                        href={selectedPartner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[var(--iica-blue)] hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors"
                    >
                        Visitar Sitio Web <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                        onClick={() => {
                            setSelectedPartner(null);
                            setSearchTerm('');
                        }}
                        className="w-full text-center text-xs text-gray-500 mt-2 hover:underline"
                    >
                        Buscar otro
                    </button>
                </div>
            ) : (
                /* Default / Empty State Tip */
                <div className="mt-auto bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 italic">
                        Selecciona una institución de la lista para ver su enlace oficial.
                    </p>
                </div>
            )}
        </div>
    );
}
