import type { Metadata, Viewport } from 'next'
import './globals.css'
import CookieConsent from '@/components/CookieConsent';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import OfflineIndicator from '@/components/OfflineIndicator';
import PushNotificationManager from '@/components/PushNotificationManager';
import { SECURITY_HEADERS } from '@/lib/security';

// ============================================================================
// METADATA - SEO & PWA
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'Plataforma de Financiamiento Agrícola | IICA Chile',
    template: '%s | IICA Chile'
  },
  description: 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. Información actualizada 2026 de INDAP, CORFO, CNR, FIA y organismos internacionales.',
  keywords: ['financiamiento agrícola', 'fondos concursables', 'INDAP', 'CORFO', 'subsidios', 'agricultura Chile', 'IICA'],
  authors: [{ name: 'IICA Chile' }],
  creator: 'IICA Chile',
  publisher: 'IICA Chile',
  manifest: '/manifest.json',
  applicationName: 'IICA Chile',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IICA Chile',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Plataforma de Financiamiento Agrícola | IICA Chile',
    description: 'Buscador oficial de fondos concursables para el agro chileno 2026.',
    url: 'https://iica-chile-plataforma.vercel.app',
    siteName: 'IICA Chile',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Campo Chileno - IICA',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plataforma de Financiamiento Agrícola 2026',
    description: 'Encuentra subsidios y créditos para tu campo.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar cuando estén disponibles
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0066CC' },
    { media: '(prefers-color-scheme: dark)', color: '#003366' },
  ],
}

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" dir="ltr">
      <head>
        {/* Preconnect a dominios externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Iconos PWA */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme Color */}
        <meta name="theme-color" content="#0066CC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Security Headers (via meta tags) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Preload Critical Resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>

      <body className="flex flex-col min-h-screen bg-[#f4f7f9] antialiased">
        {/* Skip to main content - Accesibilidad */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Saltar al contenido principal
        </a>

        {/* Indicadores de estado */}
        <OfflineIndicator />

        {/* Contenido principal */}
        <div id="main-content" role="main">
          {children}
        </div>

        {/* Componentes globales */}
        <CookieConsent />
        <PWAInstallBanner />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registrado:', registration.scope);
                    },
                    function(err) {
                      console.log('Error registrando Service Worker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />

        {/* Web Vitals Reporting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Report Web Vitals
                function sendToAnalytics(metric) {
                  const body = JSON.stringify(metric);
                  const url = '/api/analytics/web-vitals';
                  
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, body);
                  } else {
                    fetch(url, { body, method: 'POST', keepalive: true });
                  }
                }
                
                // Lazy load web-vitals
                import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                  onCLS(sendToAnalytics);
                  onFID(sendToAnalytics);
                  onFCP(sendToAnalytics);
                  onLCP(sendToAnalytics);
                  onTTFB(sendToAnalytics);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
