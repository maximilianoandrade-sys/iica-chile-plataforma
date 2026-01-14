
import React from 'react';
import Link from 'next/link';

export function Header() {
    return (
        <header className="bg-white border-b border-[var(--iica-border)] sticky top-0 z-50">
            {/* Top Bar Institutional */}
            <div className="bg-[var(--iica-navy)] text-white text-xs py-1 px-4">
                <div className="container mx-auto max-w-[1200px] flex justify-between items-center">
                    <span>Instituto Interamericano de Cooperación para la Agricultura - Oficina Chile</span>
                    <span className="opacity-80">Conectando las Américas</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="container mx-auto max-w-[1200px] px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {/* Logo Placeholder - Text based for now if image not available */}
                    <div className="font-bold text-2xl text-[var(--iica-navy)] tracking-tight">
                        IICA <span className="text-[var(--iica-secondary)]">Chile</span>
                    </div>
                </div>

                <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                    <Link href="#inicio" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Inicio</Link>
                    <Link href="#convocatorias" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Convocatorias</Link>
                    <Link href="#manual" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Ayuda</Link>
                    <Link href="#recursos" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Recursos</Link>
                    <Link href="#contacto" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Contacto</Link>
                </nav>

                <button
                    onClick={() => alert("🔧 Módulo de Gestión Interna\n\nEsta funcionalidad está en desarrollo para la Fase 2.")}
                    className="hidden md:block border border-[var(--iica-navy)] text-[var(--iica-navy)] px-4 py-1.5 rounded text-sm font-bold hover:bg-[var(--iica-navy)] hover:text-white transition-colors"
                >
                    Ingresar
                </button>

                <button className="md:hidden text-[var(--iica-navy)]">
                    ☰
                </button>
            </div>

            {/* Hero Section */}
            <div
                className="hero-iica relative overflow-hidden bg-[var(--iica-navy)] text-white py-20 md:py-28 text-center"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 45, 114, 0.85), rgba(0, 45, 114, 0.7)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="relative z-10 container mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                        Encuentra Financiamiento para tu Campo <span className="text-[var(--iica-secondary)]">2026</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-blue-50 max-w-2xl mx-auto mb-10 drop-shadow-md">
                        Accede a fondos concursables, subsidios y créditos para modernizar tu producción agrícola. Información actualizada y simplificada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="#convocatorias"
                            className="bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-block cursor-pointer ring-4 ring-white/20"
                        >
                            Ver Convocatorias Abiertas
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
