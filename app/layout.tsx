import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Plataforma de Licitaciones IICA',
  description: 'Oportunidades de financiamiento 2025 - Instituto Interamericano de Cooperación para la Agricultura',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
