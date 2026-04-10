/**
 * Sistema de Analítica Mejorado
 * Rastrea búsquedas sin resultados, clics salientes y comportamiento del usuario
 */

export interface AnalyticsEvent {
    action: string;
    category: string;
    label: string;
    value?: number;
}

export interface SearchAnalytics {
    searchTerm: string;
    resultsCount: number;
    timestamp: string;
    filters?: {
        category?: string;
        region?: string;
        beneficiary?: string;
    };
}

// Almacenamiento local de eventos (para debugging y análisis)
const analyticsQueue: SearchAnalytics[] = [];

/**
 * Rastrea un evento de búsqueda
 */
export function trackSearch(searchTerm: string, resultsCount: number, filters?: any) {
    const event: SearchAnalytics = {
        searchTerm: searchTerm.trim(),
        resultsCount,
        timestamp: new Date().toISOString(),
        filters
    };

    analyticsQueue.push(event);

    // Si no hay resultados, registrar en consola para debugging
    if (resultsCount === 0) {
        console.warn('🔍 Búsqueda sin resultados:', {
            término: searchTerm,
            filtros: filters
        });

        // Enviar a servidor (si existe endpoint)
        sendToServer('search_no_results', event);
    }

    // Mantener solo los últimos 100 eventos en memoria
    if (analyticsQueue.length > 100) {
        analyticsQueue.shift();
    }

    // Guardar en localStorage para persistencia
    try {
        const stored = JSON.parse(localStorage.getItem('iica_analytics') || '[]');
        stored.push(event);
        // Mantener solo últimos 50 en localStorage
        if (stored.length > 50) stored.shift();
        localStorage.setItem('iica_analytics', JSON.stringify(stored));
    } catch (e) {
        console.error('Error guardando analytics:', e);
    }
}

/**
 * Rastrea eventos generales
 */
export function trackEvent(event: AnalyticsEvent) {
    console.log('📊 Evento:', event);

    // Google Analytics (si está configurado)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
            event_category: event.category,
            event_label: event.label,
            value: event.value
        });
    }

    // Enviar a servidor propio
    sendToServer('event', event);
}

/**
 * Obtiene estadísticas de búsquedas sin resultados
 */
export function getNoResultsStats(): { term: string; count: number }[] {
    try {
        const stored: SearchAnalytics[] = JSON.parse(localStorage.getItem('iica_analytics') || '[]');
        const noResults = stored.filter(s => s.resultsCount === 0);

        // Agrupar por término
        const grouped = noResults.reduce((acc, curr) => {
            const term = curr.searchTerm.toLowerCase();
            acc[term] = (acc[term] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Convertir a array y ordenar
        return Object.entries(grouped)
            .map(([term, count]) => ({ term, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    } catch (e) {
        return [];
    }
}

/**
 * Envía datos al servidor (implementación futura)
 */
async function sendToServer(eventType: string, data: any) {
    // TODO: Implementar endpoint en el backend
    // Por ahora, solo registramos en consola

    if (process.env.NODE_ENV === 'development') {
        console.log(`📤 [${eventType}]`, data);
    }

    // Ejemplo de implementación futura:
    /*
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: eventType, data })
        });
    } catch (e) {
        console.error('Error enviando analytics:', e);
    }
    */
}

/**
 * Obtiene el reporte de búsquedas más populares
 */
export function getPopularSearches(): { term: string; count: number }[] {
    try {
        const stored: SearchAnalytics[] = JSON.parse(localStorage.getItem('iica_analytics') || '[]');

        // Agrupar por término
        const grouped = stored.reduce((acc, curr) => {
            const term = curr.searchTerm.toLowerCase();
            if (term) { // Ignorar búsquedas vacías
                acc[term] = (acc[term] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([term, count]) => ({ term, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    } catch (e) {
        return [];
    }
}
