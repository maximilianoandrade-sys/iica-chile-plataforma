'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <>
            <header className="bg-white border-b border-[var(--iica-border)] sticky top-0 z-50">
                {/* Top Bar Institutional */}
                <div className="bg-[var(--iica-navy)] text-white text-xs py-1 px-4">
                    <div className="container mx-auto max-w-[1200px] flex justify-between items-center">
                        <span>Instituto Interamericano de Cooperación para la Agricultura - Oficina Chile</span>
                        <span className="opacity-80 hidden sm:block">Conectando las Américas</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="container mx-auto max-w-[1200px] px-4 py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-2xl text-[var(--iica-navy)] tracking-tight">
                            IICA <span className="text-[var(--iica-secondary)]">Chile</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-5 text-sm font-medium text-gray-600">
                        <Link href="/#inicio" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Inicio</Link>
                        <Link href="/#convocatorias" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Convocatorias</Link>
                        <Link href="/#fuentes" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Fuentes Oficiales</Link>
                        <Link href="/maletin" className="hover:text-[var(--iica-navy)] transition-colors">Mi Maletín</Link>
                        <Link href="/consultores" className="hover:text-[var(--iica-navy)] transition-colors">Consultores</Link>
                        <Link href="/#contacto" className="hover:text-[var(--iica-navy)] transition-colors scroll-smooth">Contacto</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        {/* CTA Desktop */}
                        <Link
                            href="/#convocatorias"
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm min-h-[44px]"
                        >
                            <Search className="h-4 w-4" />
                            Buscar Fondos
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-[var(--iica-navy)] hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            aria-label="Abrir menú"
                        >
                            {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
                        >
                            <nav className="flex flex-col p-4 gap-1">
                                {[
                                    { href: '/#inicio', label: '🏠 Inicio' },
                                    { href: '/#convocatorias', label: '🔍 Buscar Convocatorias' },
                                    { href: '/#fuentes', label: '🔗 Fuentes Oficiales' },
                                    { href: '/maletin', label: '💼 Mi Maletín' },
                                    { href: '/consultores', label: '👤 Directorio de Consultores' },
                                    { href: '/#contacto', label: '📞 Contacto' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[var(--iica-navy)] rounded-xl font-medium transition-colors min-h-[48px] flex items-center"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium text-blue-100 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            25 fondos activos · CNR · INDAP · FIA · CORFO · Sercotec · GOREs
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                            Encuentra Financiamiento para tu Campo <span className="text-[var(--iica-yellow)]">2026</span>
                        </h1>
                        <p className="text-lg md:text-xl font-medium text-blue-50 max-w-2xl mx-auto mb-10 drop-shadow-md">
                            Fondos concursables, subsidios y créditos reales de instituciones oficiales chilenas. Busca por región, rubro o institución.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="#convocatorias"
                                className="bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2 cursor-pointer ring-4 ring-white/20 min-h-[56px]"
                            >
                                <Search className="h-5 w-5" />
                                Buscar Convocatorias Abiertas
                            </Link>
                            <Link
                                href="#fuentes"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2 cursor-pointer min-h-[56px]"
                            >
                                🔗 Ver Fuentes Oficiales
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Agricultural Field Image Section */}
                <div className="relative w-full h-64 md:h-80 overflow-hidden">
                    <Image
                        src="/agricultural-field.png"
                        alt="Campos agrícolas chilenos con cultivos verdes y montañas al fondo"
                        fill
                        className="object-cover object-center"
                        priority
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>
            </header>
        </>
    );
}
