'use client';

import PWAInstallBanner from '@/components/PWAInstallBanner';
import ScrollToTop from '@/components/ScrollToTop';
import PushNotificationManager from '@/components/PushNotificationManager';
import RouteAnnouncer from '@/components/RouteAnnouncer';

export default function ClientOnlyGlobalComponents() {
  return (
    <>
      <PWAInstallBanner />
      <ScrollToTop />
      <PushNotificationManager />
      <RouteAnnouncer />
    </>
  );
}