'use client';

import { Printer } from 'lucide-react';

interface PrintProjectButtonProps {
  className?: string;
}

export function PrintProjectButton({ className = '' }: PrintProjectButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold px-4 py-3 rounded-xl transition-all shadow-xs min-h-[44px] ${className}`}
      title="Descargar Minuta en PDF o Imprimir Ficha"
    >
      <Printer className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      <span>Imprimir / PDF</span>
    </button>
  );
}
