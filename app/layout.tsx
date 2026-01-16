import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Plataforma de Financiamiento Agrícola | IICA Chile',
  description: 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. Información actualizada 2026 de INDAP, CORFO, CNR y FIA.',
  manifest: '/manifest.json',
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
}

// Removed duplicate import
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen bg-[#f4f7f9]">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
