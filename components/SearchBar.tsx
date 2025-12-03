'use client';

import { useState } from 'react';

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ defaultValue = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar licitaciones por palabras clave..."
        className="w-full p-4 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-iica-primary focus:border-transparent"
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-iica-primary text-white rounded-lg hover:bg-[#0066cc] transition-colors shadow-sm"
      >
        Buscar
      </button>
    </div>
  );
}

