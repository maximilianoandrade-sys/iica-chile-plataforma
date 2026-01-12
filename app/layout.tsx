import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IICA Chile - Plataforma de Financiamiento',
  description: 'Oportunidades Agrícolas 2026 - Proyectos reales de FAO, BID, FONTAGRO',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
