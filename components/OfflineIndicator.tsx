/**
 * OFFLINE INDICATOR
 * Indicador visual del estado de conexión
 */

'use client';

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/usePWA';

export default function OfflineIndicator() {
    const { isOffline, wasOffline } = useOfflineDetection();

    return (
        <>
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-50 animate-[slideDown_0.2s_ease-out]">
                    <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
                        <div className="container mx-auto flex items-center justify-center gap-2">
                            <WifiOff className="h-5 w-5" />
                            <span className="font-medium">
                                Sin conexión - Mostrando contenido en caché
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {!isOffline && wasOffline && (
                <div className="fixed top-0 left-0 right-0 z-50 animate-[slideDown_0.2s_ease-out]">
                    <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
                        <div className="container mx-auto flex items-center justify-center gap-2">
                            <Wifi className="h-5 w-5" />
                            <span className="font-medium">
                                Conexión restaurada
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
