'use client';

import { trackEvent as trackEventLib, trackSearch as trackSearchLib } from '@/lib/analytics';
import { useCallback } from 'react';

export function useAnalytics() {
    const trackEvent = useCallback((action: string, category: string, label: string, value?: number) => {
        trackEventLib({ action, category, label, value });
    }, []);

    const trackSearch = useCallback((term: string, resultsCount: number, filters?: any) => {
        trackSearchLib(term, resultsCount, filters);
    }, []);

    return { trackEvent, trackSearch };
}
