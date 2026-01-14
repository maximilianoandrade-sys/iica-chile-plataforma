// ... imports
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plataforma de Financiamiento Agrícola | IICA Chile',
  description: 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. Información actualizada 2026 de INDAP, CORFO, CNR y FIA.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen bg-[#f4f7f9]">
        {children}
      </body>
    </html>
  )
}
