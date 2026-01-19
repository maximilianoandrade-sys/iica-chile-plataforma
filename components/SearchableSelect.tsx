import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar..." }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative w-full md:w-auto" ref={wrapperRef} style={{ minWidth: '250px' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-left text-sm text-gray-700 hover:border-[var(--iica-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--iica-blue)] focus:border-transparent cursor-pointer shadow-sm flex items-center justify-between"
            >
                <span className="block truncate">{value}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2.5" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {/* Search Input */}
                    <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b border-gray-100">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-md text-xs leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--iica-blue)] focus:border-[var(--iica-blue)] sm:text-sm"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <li className="text-gray-500 select-none relative py-2 pl-3 pr-9 text-xs italic p-2 text-center">
                                No se encontraron resultados
                            </li>
                        ) : (
                            filteredOptions.map((option) => (
                                <li
                                    key={option}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors ${value === option ? 'text-[var(--iica-blue)] font-bold bg-blue-50/50' : 'text-gray-900'
                                        }`}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    <span className="block truncate">{option}</span>
                                    {value === option && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--iica-blue)]">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
