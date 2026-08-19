'use client';

import { useState } from 'react';
import { Code, Copy, Check, X, Layout, Sparkles } from 'lucide-react';

interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedWidgetModal({ isOpen, onClose }: EmbedWidgetModalProps) {
  const [copied, setCopied] = useState(false);
  const [widgetCategory, setWidgetCategory] = useState<string>('all');

  if (!isOpen) return null;

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://iica-chile-plataforma.vercel.app';
  const iframeSrc = widgetCategory === 'all' 
    ? `${siteUrl}/widget` 
    : `${siteUrl}/widget?categoria=${encodeURIComponent(widgetCategory)}`;

  const embedCode = `<iframe
  src="${iframeSrc}"
  width="100%"
  height="620"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"
  title="Radar de Oportunidades IICA Chile"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-[var(--iica-blue)] dark:text-blue-300 rounded-xl">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--iica-navy)] dark:text-white">
              Incrustar Widget en tu Sitio Web
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Widget oficial del Radar IICA para Municipios, INDAP regional o escuelas agrícolas.
            </p>
          </div>
        </div>

        {/* Category selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Filtrar categoría inicial del widget:
          </label>
          <select
            value={widgetCategory}
            onChange={(e) => setWidgetCategory(e.target.value)}
            className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-2.5 text-gray-800 dark:text-gray-100"
          >
            <option value="all">Todas las Oportunidades (Global)</option>
            <option value="Riego e Infraestructura Hídrica">Riego e Infraestructura Hídrica</option>
            <option value="Innovación Agrícola y Agtech">Innovación Agrícola y Agtech</option>
            <option value="Sostenibilidad y Cambio Climático">Sostenibilidad y Cambio Climático</option>
            <option value="Capacitación y Becas Internacionales">Capacitación y Becas Internacionales</option>
          </select>
        </div>

        {/* Code Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-blue-500" /> Código HTML iframe
            </span>
            {copied && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ¡Copiado al portapapeles!
              </span>
            )}
          </div>
          <div className="relative bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
            <pre>{embedCode}</pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            100% responsivo y actualizado automáticamente.
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Código HTML</span>
          </button>
        </div>
      </div>
    </div>
  );
}
