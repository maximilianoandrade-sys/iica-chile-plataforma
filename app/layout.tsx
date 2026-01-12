
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

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
      <body className="flex flex-col min-h-screen">

        {/* HEADER INSTITUCIONAL */}
        <header className="bg-white border-b-[3px] border-[var(--iica-navy)] sticky top-0 z-50 shadow-sm">
          {/* Top Bar */}
          <div className="bg-[var(--iica-navy)] text-white py-2 text-sm">
            <div className="container mx-auto px-4">
              Oficina en Chile | Instituto Interamericano de Cooperación para la Agricultura (IICA)
            </div>
          </div>

          {/* Main Nav */}
          <div className="container mx-auto px-4 h-20 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 no-underline group">
              <div className="font-[900] text-[2rem] leading-none tracking-tighter">
                <span className="text-[var(--iica-navy)]">IICA</span>
                <span className="font-[300] text-gray-500 ml-1">Chile</span>
              </div>
            </Link>

            <nav className="flex gap-6 items-center">
              <Link href="/" className="text-[var(--iica-dark)] font-medium uppercase hover:text-[var(--iica-secondary)] transition-colors">Inicio</Link>
              <Link href="#" className="text-[var(--iica-dark)] font-medium uppercase hover:text-[var(--iica-secondary)] transition-colors">Manual Técnico</Link>
              <Link href="#" className="hidden md:block btn-iica text-sm px-4 py-2">Ingresar</Link>
            </nav>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 w-full bg-white">
          {children}
        </main>

        {/* FOOTER INSTITUCIONAL */}
        <footer className="bg-[var(--iica-navy)] text-white pt-16 pb-8 mt-auto">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="border-b-2 border-[var(--iica-yellow)] pb-2 mb-4 font-bold text-lg">Contacto</h4>
              <p className="mb-2">📍 Calle Rancagua No.0320, Providencia</p>
              <p className="mb-2">Santiago, Chile</p>
              <p className="mb-2">📞 +56 2 2963 9900</p>
              <p>✉️ iica.chile@iica.int</p>
            </div>
            <div>
              <h4 className="border-b-2 border-[var(--iica-yellow)] pb-2 mb-4 font-bold text-lg">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="https://www.iica.int" className="hover:text-[var(--iica-yellow)]">Sede Central</a></li>
                <li><a href="https://www.minagri.gob.cl" className="hover:text-[var(--iica-yellow)]">Minagri Chile</a></li>
                <li><a href="https://www.indap.gob.cl" className="hover:text-[var(--iica-yellow)]">INDAP</a></li>
              </ul>
            </div>
            <div>
              <h4 className="border-b-2 border-[var(--iica-yellow)] pb-2 mb-4 font-bold text-lg">Idiomas</h4>
              <button className="border border-white rounded px-4 py-2 hover:bg-white hover:text-[var(--iica-navy)] transition-colors">
                Español / Mapudungun
              </button>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10 text-sm opacity-80">
            © 2025 IICA - Todos los derechos reservados.
          </div>
        </footer>

      </body>
    </html>
  )
}
