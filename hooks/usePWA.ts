/**
 * PWA UTILITIES - Progressive Web App Helpers
 * Hooks esenciales en uso: push notifications, install prompt y offline detection.
 */

'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { getLogger } from '@/lib/utils/logger';
import type { BeforeInstallPromptEvent } from '@/types/pwa';

const logger = getLogger('usePWA');

// ============================================================================
// 1. PUSH NOTIFICATIONS
// ============================================================================

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('Notificaciones no soportadas');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const subscribe = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      logger.warn('Push no soportado');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
        if (!vapidPublicKey) {
          logger.warn('VAPID public key missing; push remains disabled');
          return null;
        }

        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });
      }

      let deviceId = localStorage.getItem('iica_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('iica_device_id', deviceId);
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sub.toJSON(), deviceId }),
      });
      if (!response.ok) return null;

      setSubscription(sub);
      return sub;
    } catch (error) {
      logger.error('Error suscribiendo a push', error as Error);
      return null;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      const deviceId = typeof window !== 'undefined' ? localStorage.getItem('iica_device_id') : null;

      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint, deviceId }),
      });
      if (response.ok) setSubscription(null);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================================================
// 2. INSTALL PROMPT
// ============================================================================

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
      logger.info('PWA instalada');
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    logger.info('Instalación de PWA rechazada');
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
}

// ============================================================================
// 3. OFFLINE DETECTION
// ============================================================================

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function useOfflineDetection() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);
  return { isOffline: !isOnline, wasOffline: false };
}
