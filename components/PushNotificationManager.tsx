/**
 * PUSH NOTIFICATION MANAGER
 * Componente para gestionar suscripciones a notificaciones push
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export default function PushNotificationManager() {
    const { permission, subscription, requestPermission, subscribe, unsubscribe } = usePushNotifications();
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Mostrar prompt después de 10 segundos si no hay permiso
        const timer = setTimeout(() => {
            if (permission === 'default') {
                const hasSeenPrompt = localStorage.getItem('notification_prompt_seen');
                if (!hasSeenPrompt) {
                    setShowPrompt(true);
                }
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, [permission]);

    const handleEnable = async () => {
        setIsLoading(true);
        const granted = await requestPermission();

        if (granted) {
            await subscribe();
            setShowPrompt(false);
            localStorage.setItem('notification_prompt_seen', 'true');
        }

        setIsLoading(false);
    };

    const handleDisable = async () => {
        setIsLoading(true);
        await unsubscribe();
        setIsLoading(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_seen', 'true');
    };

    return (
        <>
            {/* Botón en header/toolbar */}
            <button
                onClick={() => {
                    if (subscription) {
                        handleDisable();
                    } else {
                        handleEnable();
                    }
                }}
                disabled={isLoading || permission === 'denied'}
                className={`relative p-2 rounded-lg transition-colors ${subscription
                        ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={subscription ? 'Desactivar notificaciones' : 'Activar notificaciones'}
                aria-label={subscription ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            >
                {subscription ? (
                    <>
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    </>
                ) : (
                    <BellOff className="h-5 w-5" />
                )}
            </button>

            {/* Prompt inicial */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
                    >
                        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">
                                            Recibe Notificaciones
                                        </h3>
                                        <p className="text-sm text-blue-50">
                                            Te avisaremos de nuevas convocatorias
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="text-white/80 hover:text-white transition-colors"
                                        aria-label="Cerrar"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <ul className="space-y-2 mb-4 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Alertas de convocatorias próximas a cerrar</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Nuevas oportunidades de financiamiento</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Actualizaciones importantes</span>
                                    </li>
                                </ul>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEnable}
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Activando...' : 'Activar Notificaciones'}
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Ahora no
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    Puedes desactivarlas en cualquier momento
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
