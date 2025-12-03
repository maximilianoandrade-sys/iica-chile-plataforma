'use client';

import { useState, useEffect } from 'react';

interface Filter {
  query: string;
  locations: string[];
  sectors: string[];
  status: string;
  page: number;
}

interface FiltersPanelProps {
  filters: Filter;
  onChange: (filters: Filter) => void;
}

export default function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  const locations = [
    { id: '84', name: 'Chile' },
    { id: '75', name: 'Argentina' },
    { id: '85', name: 'Colombia' },
    { id: '86', name: 'Perú' },
    { id: '87', name: 'Ecuador' },
    { id: '88', name: 'Bolivia' },
  ];

  const sectors = [
    { id: '70', name: 'ICT & Telecom' },
    { id: '25', name: 'Energía' },
    { id: '16', name: 'Infraestructura' },
    { id: '10', name: 'Agricultura' },
    { id: '15', name: 'Educación' },
    { id: '20', name: 'Salud' },
  ];

  const toggleSelection = (list: string[], setList: (list: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(x => x !== value));
    } else {
      setList([...list, value]);
    }
  };

  const [loc, setLoc] = useState<string[]>(filters.locations);
  const [sec, setSec] = useState<string[]>(filters.sectors);
  const [status, setStatus] = useState(filters.status);

  useEffect(() => {
    setLoc(filters.locations);
    setSec(filters.sectors);
    setStatus(filters.status);
  }, [filters.locations.join(','), filters.sectors.join(','), filters.status]);

  useEffect(() => {
    onChange({ ...filters, locations: loc, sectors: sec, status, page: 1 });
  }, [loc.join(','), sec.join(','), status]);

  return (
    <aside className="bg-white rounded-xl p-6 shadow-md border border-gray-200 w-full h-fit">
      <h2 className="text-xl font-bold mb-6 text-iica-primary border-b border-iica-primary/20 pb-3">Filtros</h2>
      
      <fieldset className="mb-6">
        <legend className="mb-3 font-semibold text-gray-700">Ubicación</legend>
        <div className="space-y-2">
          {locations.map(l => (
            <label key={l.id} className="flex items-center cursor-pointer hover:bg-iica-light p-2 rounded transition-colors">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 text-iica-primary focus:ring-iica-primary"
                checked={loc.includes(l.id)}
                onChange={() => toggleSelection(loc, setLoc, l.id)}
              />
              <span className="text-gray-700">{l.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="mb-3 font-semibold text-gray-700">Sector</legend>
        <div className="space-y-2">
          {sectors.map(s => (
            <label key={s.id} className="flex items-center cursor-pointer hover:bg-iica-light p-2 rounded transition-colors">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 text-iica-primary focus:ring-iica-primary"
                checked={sec.includes(s.id)}
                onChange={() => toggleSelection(sec, setSec, s.id)}
              />
              <span className="text-gray-700">{s.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-semibold text-gray-700">Estado</legend>
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iica-primary focus:border-iica-primary"
        >
          <option value="open">Abierto</option>
          <option value="closed">Cerrado</option>
          <option value="draft">Borrador</option>
        </select>
      </fieldset>
    </aside>
  );
}
