'use client';

import { X, Check, History, Search } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLinkGuardian } from "@/lib/linkGuardian";
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('ActionButton');

export interface ActionButtonProps {
    url: string;
    date: string;
    projectName: string;
    institution?: string;
    onTrack?: () => void;
}

export function ActionButton({ url, date, projectName, institution, onTrack }: ActionButtonProps) {
    const { trackEvent } = useAnalytics();
    const { shouldShow, finalUrl, archivedUrl, isFallback, isLoading } = useLinkGuardian(url, projectName, institution);

    const today = new Date();
    const closingDate = new Date(date);
    const isClosed = closingDate.getTime() < today.setHours(0, 0, 0, 0);

    const handleClick = () => {
        trackEvent('click_outbound_link', 'Outbound', `Bases: ${projectName}${isFallback ? ' (Fallback)' : ''}`);
        if (onTrack) onTrack();
    };

    if (isClosed) {
        return (
            <button disabled className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded cursor-not-allowed min-h-[44px]">
                Cerrado <X className="h-4 w-4" aria-hidden="true" />
            </button>
        );
    }

    if (isLoading) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                aria-label={`Abrir bases para ${projectName}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded transition-colors hover:bg-gray-100 min-w-[120px] min-h-[44px] justify-center"
                title="Abre el enlace oficial mientras se verifica en segundo plano"
            >
                Abrir bases
            </a>
        );
    }

    if (!shouldShow) return null;

    if (isFallback) {
        return (
            <div className="flex items-center gap-1">
                <a
                    href={finalUrl || url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                    aria-label={`Buscar bases para ${projectName}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded transition-colors shadow-sm min-h-[44px]"
                    title="Búsqueda Inteligente (PDFs y Bases 2026)"
                >
                    Buscar Bases <Search className="h-3.5 w-3.5" />
                </a>

                {archivedUrl && (
                    <a
                        href={archivedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-[var(--iica-blue)] hover:bg-blue-50 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Ver versión histórica (Wayback Machine)"
                    >
                        <History className="h-4 w-4" />
                    </a>
                )}
            </div>
        );
    }

    return (
        <a
            href={finalUrl || url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            aria-label={`Ver bases oficiales para ${projectName}`}
            className="group relative inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] px-4 py-2 rounded transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--iica-blue)] hover:-translate-y-0.5 min-h-[44px]"
        >
            Sitio Oficial <Check className="h-4 w-4 text-green-300" />

            {/* Tooltip de veracidad */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50 shadow-xl opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                Convocatoria Real y Verificada 2026 ✓
            </div>
        </a>
    );
}
