import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ui/ToastProvider'
import CookieConsent from '@/components/CookieConsent';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import OfflineIndicator from '@/components/OfflineIndicator';
import PushNotificationManager from '@/components/PushNotificationManager';
import ScrollToTop from '@/components/ScrollToTop';

const outfit = Outfit({ subsets: ['latin'] })
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://iica-chile-plataforma.vercel.app'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IICA Chile',
  url: SITE_URL,
  logo: `${SITE_URL}/logos/official/iica.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'representacion.chile@iica.int',
    areaServed: 'CL',
    availableLanguage: 'es',
  },
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Radar de Oportunidades IICA Chile',
  url: SITE_URL,
  inLanguage: 'es-CL',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--')
}

function mainFocusScript() {
  return `
    (function () {
      function focusMainIfHashPresent() {
        if (window.location.hash !== '#main-content') return;
        var main = document.getElementById('main-content');
        if (main && typeof main.focus === 'function') {
          main.focus({ preventScroll: true });
        }
      }

      window.addEventListener('hashchange', focusMainIfHashPresent);
      window.addEventListener('load', focusMainIfHashPresent);
    })();
  `;
}

// ============================================================================
// METADATA - SEO & PWA
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Radar de Oportunidades IICA Chile 2026',
    template: '%s | IICA Chile'
  },
  description: 'Encuentre convocatorias agrícolas vigentes y verificadas por IICA Chile. Incluye fondos nacionales e internacionales con actualización continua.',
  keywords: ['IICA Chile', 'oportunidades proyectos', 'FONTAGRO', 'FAO', 'BID', 'FIDA', 'cooperación agrícola internacional', 'convocatorias 2026'],
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
    title: 'Radar de Oportunidades IICA Chile 2026',
    description: 'Plataforma oficial de IICA Chile para identificar oportunidades de financiamiento agrícola vigentes.',
    url: '/',
    siteName: 'IICA Chile',
    images: [
      {
        url: '/agricultural-field.png',
        width: 1200,
        height: 630,
        alt: 'Radar de Oportunidades IICA Chile',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar de Oportunidades IICA Chile 2026',
    description: 'Oportunidades de financiamiento agrícola verificadas para organizaciones y equipos técnicos en Chile.',
    images: ['/agricultural-field.png'],
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
    <html lang="es" dir="ltr" className={`${outfit.className} scroll-smooth`}>
      <head>
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Theme Color */}
        <meta name="theme-color" content="#0066CC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Security Headers (via meta tags) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(webSiteJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: mainFocusScript() }}
        />
      </head>

      <body className="flex flex-col min-h-screen bg-[#f4f7f9] dark:bg-gray-900 antialiased transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
          <ToastProvider>
          <div id="main-content" tabIndex={-1} className="scroll-mt-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-iica-yellow">
            {children}
          </div>
          </ToastProvider>

        {/* Componentes globales */}
        <CookieConsent />
        <PWAInstallBanner />
        <ScrollToTop />
        <PushNotificationManager />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  )
}
