/**
 * OFFLINE INDICATOR
 * Indicador visual del estado de conexión
 */

'use client';

import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
    const { isOffline, wasOffline } = useOfflineDetection();

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    className="fixed top-0 left-0 right-0 z-50"
                >
                    <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
                        <div className="container mx-auto flex items-center justify-center gap-2">
                            <WifiOff className="h-5 w-5" />
                            <span className="font-medium">
                                Sin conexión - Mostrando contenido en caché
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {!isOffline && wasOffline && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    className="fixed top-0 left-0 right-0 z-50"
                >
                    <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
                        <div className="container mx-auto flex items-center justify-center gap-2">
                            <Wifi className="h-5 w-5" />
                            <span className="font-medium">
                                Conexión restaurada
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
