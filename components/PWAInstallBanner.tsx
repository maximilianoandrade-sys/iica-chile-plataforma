/**
 * PWA INSTALL BANNER
 * Banner para promover instalación de PWA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallBanner() {
    const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Verificar si el usuario ya dismissió el banner
        const wasDismissed = localStorage.getItem('pwa_install_dismissed');
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    const handleInstall = async () => {
        const installed = await promptInstall();
        if (installed) {
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (!isInstallable || isInstalled || dismissed) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
            >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 border border-blue-500">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-start gap-3 pr-6">
                        <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                            <Smartphone className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                                Instala la App
                            </h3>
                            <p className="text-sm text-blue-50 mb-3">
                                Accede más rápido y recibe notificaciones de nuevas convocatorias
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
                                >
                                    <Download className="h-4 w-4" />
                                    Instalar
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-2 text-sm text-white/90 hover:text-white transition-colors"
                                >
                                    Ahora no
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
