/**
 * PWA UTILITIES - Progressive Web App Helpers
 * Utilidades para gestionar PWA, notificaciones y service worker
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

// ============================================================================
// 1. SERVICE WORKER REGISTRATION
// ============================================================================

/**
 * Hook para registrar Service Worker
 */
export function useServiceWorker() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        // Registrar Service Worker
        navigator.serviceWorker
            .register('/sw.js')
            .then(reg => {
                console.log('✅ Service Worker registrado');
                setRegistration(reg);

                // Verificar actualizaciones
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
            })
            .catch(error => {
                console.error('❌ Error registrando Service Worker:', error);
            });

        // Monitorear estado online/offline
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateServiceWorker = useCallback(() => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [registration]);

    return {
        registration,
        updateAvailable,
        isOnline,
        updateServiceWorker
    };
}

// ============================================================================
// 2. PUSH NOTIFICATIONS
// ============================================================================

/**
 * Hook para gestionar notificaciones push
 */
export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('⚠️ Notificaciones no soportadas');
            return false;
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, []);

    const subscribe = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('⚠️ Push no soportado');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Verificar si ya existe suscripción
            let sub = await registration.pushManager.getSubscription();

            if (!sub) {
                // Crear nueva suscripción
                // NOTA: Necesitas generar tus propias VAPID keys
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
                });
            }

            setSubscription(sub);

            // Enviar suscripción al servidor
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });

            return sub;
        } catch (error) {
            console.error('❌ Error suscribiendo a push:', error);
            return null;
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        if (subscription) {
            await subscription.unsubscribe();
            setSubscription(null);

            // Notificar al servidor
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });
        }
    }, [subscription]);

    return {
        permission,
        subscription,
        requestPermission,
        subscribe,
        unsubscribe
    };
}

/**
 * Convierte VAPID key de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ============================================================================
// 3. INSTALL PROMPT
// ============================================================================

/**
 * Hook para gestionar instalación de PWA
 */
export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si ya está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) {
            return false;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ PWA instalada');
            setDeferredPrompt(null);
            setIsInstallable(false);
            return true;
        } else {
            console.log('❌ Instalación rechazada');
            return false;
        }
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        promptInstall
    };
}

// ============================================================================
// 4. OFFLINE DETECTION
// ============================================================================

/**
 * Hook para detectar estado offline
 */
export function useOfflineDetection() {
    const [isOffline, setIsOffline] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (wasOffline) {
                // Mostrar mensaje de reconexión
                console.log('✅ Conexión restaurada');
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
            setWasOffline(true);
        };

        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    return { isOffline, wasOffline };
}

// ============================================================================
// 5. BACKGROUND SYNC
// ============================================================================

/**
 * Hook para background sync
 */
export function useBackgroundSync() {
    const [canSync, setCanSync] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
            setCanSync(true);
        }
    }, []);

    const registerSync = useCallback(async (tag: string) => {
        if (!canSync) {
            console.warn('⚠️ Background Sync no soportado');
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await (registration as any).sync.register(tag);
            console.log(`✅ Sync registrado: ${tag}`);
            return true;
        } catch (error) {
            console.error('❌ Error registrando sync:', error);
            return false;
        }
    }, [canSync]);

    return { canSync, registerSync };
}

// ============================================================================
// 6. SHARE API
// ============================================================================

/**
 * Hook para Web Share API
 */
export function useWebShare() {
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare('share' in navigator);
    }, []);

    const share = useCallback(async (data: ShareData) => {
        if (!canShare) {
            console.warn('⚠️ Web Share API no soportada');
            return false;
        }

        try {
            await navigator.share(data);
            return true;
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('❌ Error compartiendo:', error);
            }
            return false;
        }
    }, [canShare]);

    return { canShare, share };
}

// ============================================================================
// 7. LOCAL NOTIFICATIONS
// ============================================================================

/**
 * Muestra notificación local
 */
export async function showLocalNotification(
    title: string,
    options?: NotificationOptions
) {
    if (!('Notification' in window)) {
        console.warn('⚠️ Notificaciones no soportadas');
        return null;
    }

    if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return null;
        }
    }

    return new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options
    });
}

// ============================================================================
// 8. CACHE MANAGEMENT
// ============================================================================

/**
 * Hook para gestionar caché
 */
export function useCacheManagement() {
    const clearCache = useCallback(async () => {
        if (!('caches' in window)) {
            return false;
        }

        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );
            console.log('✅ Caché limpiado');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando caché:', error);
            return false;
        }
    }, []);

    const getCacheSize = useCallback(async () => {
        if (!('caches' in window)) {
            return 0;
        }

        try {
            const cacheNames = await caches.keys();
            let totalSize = 0;

            for (const name of cacheNames) {
                const cache = await caches.open(name);
                const keys = await cache.keys();

                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.blob();
                        totalSize += blob.size;
                    }
                }
            }

            return totalSize;
        } catch (error) {
            console.error('❌ Error calculando tamaño de caché:', error);
            return 0;
        }
    }, []);

    return { clearCache, getCacheSize };
}

// ============================================================================
// 9. NETWORK INFORMATION
// ============================================================================

/**
 * Hook para información de red
 */
export function useNetworkInformation() {
    const [networkInfo, setNetworkInfo] = useState<{
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
    }>({});

    useEffect(() => {
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            const updateNetworkInfo = () => {
                setNetworkInfo({
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                });
            };

            updateNetworkInfo();
            connection.addEventListener('change', updateNetworkInfo);

            return () => {
                connection.removeEventListener('change', updateNetworkInfo);
            };
        }
    }, []);

    return networkInfo;
}

// ============================================================================
// 10. BATTERY STATUS
// ============================================================================

/**
 * Hook para estado de batería
 */
export function useBatteryStatus() {
    const [battery, setBattery] = useState<{
        level?: number;
        charging?: boolean;
        chargingTime?: number;
        dischargingTime?: number;
    }>({});

    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                const updateBattery = () => {
                    setBattery({
                        level: battery.level,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    });
                };

                updateBattery();
                battery.addEventListener('levelchange', updateBattery);
                battery.addEventListener('chargingchange', updateBattery);

                return () => {
                    battery.removeEventListener('levelchange', updateBattery);
                    battery.removeEventListener('chargingchange', updateBattery);
                };
            });
        }
    }, []);

    return battery;
}
