'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const OFFICIAL_IICA_CHILE_URL = 'https://iica.int/es/countries/chile-es/';

interface HeaderProps {
    urgentCount?: number;
}

export function Header({ urgentCount = 0 }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-[var(--iica-border)] dark:border-gray-700 shadow-sm">
            {/* Institutional Top Bar */}
            <div className="bg-[var(--iica-navy)] dark:bg-gray-800 text-white text-xs py-1.5 px-4">
                <div className="container mx-auto max-w-[1200px] flex justify-between items-center">
                    <span className="font-medium truncate">Instituto Interamericano de Cooperación para la Agricultura — Oficina Chile</span>
                    <span className="opacity-75 hidden sm:block tracking-wide">Radar de Oportunidades 2026</span>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="flex items-center justify-between h-16">

                    {/* Logo — mantiene logo oficial IICA */}
                    <a
                        href={OFFICIAL_IICA_CHILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                    >
                        <Image
                            src="/logos/official/iica.png"
                            alt="Logo oficial IICA Chile"
                            width={36}
                            height={36}
                            priority
                            className="h-8 w-auto"
                        />
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="font-black text-[var(--iica-navy)] dark:text-white text-base">
                                IICA <span className="text-[var(--iica-blue)] dark:text-blue-400">Chile</span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Radar 2026</span>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-7" aria-label="Navegación principal">
                        <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--iica-navy)] dark:hover:text-white transition-colors">
                            Inicio
                        </Link>
                        <Link href="/#convocatorias" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--iica-navy)] dark:hover:text-white transition-colors">
                            Oportunidades
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--iica-navy)] dark:hover:text-white transition-colors">
                            Sobre IICA
                        </Link>
                        <Link href="/#fuentes" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--iica-navy)] dark:hover:text-white transition-colors">
                            Fuentes
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <Link
                            href="/#convocatorias"
                            className="hidden md:flex items-center gap-2 px-5 py-2 bg-secondary hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
                        >
                            <span>Explorar Oportunidades</span>
                            {urgentCount > 0 && (
                                <span
                                    className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse"
                                    aria-label={`${urgentCount} oportunidades urgentes`}
                                >
                                    {urgentCount}
                                </span>
                            )}
                        </Link>

                        <button
                            className="md:hidden p-2 text-[var(--iica-navy)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav
                        className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 animate-[slideDown_0.2s_ease-out]"
                        role="navigation"
                        aria-label="Menú móvil"
                    >
                        {[
                            { href: '/', label: 'Inicio' },
                            { href: '/#convocatorias', label: 'Oportunidades' },
                            { href: '/about', label: 'Sobre IICA' },
                            { href: '/#fuentes', label: 'Fuentes Oficiales' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[var(--iica-navy)] dark:hover:text-white rounded-lg min-h-[48px] transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/#convocatorias"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-3 bg-secondary hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors"
                        >
                            Explorar Oportunidades
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
