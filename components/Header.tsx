
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
            <div className="hero-iica relative overflow-hidden bg-[var(--iica-navy)] text-white py-16 md:py-20 text-center">
                {/* Overlay gradient is handled by CSS class 'hero-iica' in globals.css, but we can enforce style here if needed */}
                <div className="relative z-10 container mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Encuentra Financiamiento para tu Campo 2026
                    </h1>
                    <p className="text-lg md:text-xl font-light text-blue-100 max-w-2xl mx-auto mb-8">
                        Accede a fondos concursables, subsidios y créditos para modernizar tu producción agrícola. Información actualizada y simplificada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="#convocatorias"
                            className="bg-[var(--iica-secondary)] hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1 inline-block"
                        >
                            Ver Convocatorias Abiertas
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
