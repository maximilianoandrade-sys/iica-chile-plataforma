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
                    <span className="font-medium">Instituto Interamericano de Cooperación para la Agricultura — Oficina Chile</span>
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
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Radar 2026</span>
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
                            Explorar Oportunidades
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


    return (
        <header className="bg-white dark:bg-gray-900 border-b border-[var(--iica-border)] dark:border-gray-700 sticky top-0 z-50">
            {/* Top Bar Institutional */}
            <div className="bg-[var(--iica-navy)] dark:bg-gray-800 text-white text-xs py-1 px-4">
                <div className="container mx-auto max-w-[1200px] flex justify-between items-center">
                    <span>Instituto Interamericano de Cooperación para la Agricultura - Oficina Chile</span>
                    <span className="opacity-80 hidden sm:block">Radar de Oportunidades 2026</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="container mx-auto max-w-[1200px] px-4 py-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <a
                        href={OFFICIAL_IICA_CHILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Image
                            src="/logos/official/iica.png"
                            alt="Logo oficial IICA Chile"
                            width={34}
                            height={34}
                            priority
                            className="h-7 w-auto sm:h-8"
                        />
                        <span className="font-black text-xl sm:text-2xl text-[var(--iica-navy)] dark:text-white tracking-tighter leading-none">
                            IICA <span className="text-[var(--iica-blue)] dark:text-blue-400">Chile</span>
                        </span>
                    </a>
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest hidden sm:block">Radar 2026</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400" aria-label="Navegación principal">
                    <Link href="/" className="hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors">Inicio</Link>
                    <Link href="/#convocatorias" className="hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors">Oportunidades</Link>
                    <Link href="/about" className="hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors">Sobre IICA</Link>
                    <Link href="/#fuentes" className="hover:text-[var(--iica-blue)] dark:hover:text-blue-400 transition-colors">Fuentes</Link>
                </nav>

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* CTA Compacto */}
                    <Link
                        href="/#convocatorias"
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[var(--iica-navy)] dark:bg-blue-600 hover:bg-[var(--iica-blue)] dark:hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-0.5 text-[10px]"
                    >
                        <Target className="h-4 w-4" aria-hidden="true" />
                        <span>Explorar Oportunidades</span>
                        {urgentCount > 0 && (
                            <span className="bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse" aria-label={`${urgentCount} oportunidades urgentes`}>
                                {urgentCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-[var(--iica-navy)] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label={showMobileMenu ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={showMobileMenu}
                    >
                        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="overflow-hidden md:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 animate-[slideDown_0.2s_ease-out]">
                    <nav className="flex flex-col p-4 gap-1" role="navigation" aria-label="Menu principal">
                        {[
                            { href: '/', label: 'Inicio', icon: Home },
                            { href: '/#convocatorias', label: 'Oportunidades', icon: Crosshair },
                            { href: '/#fuentes', label: 'Fuentes Oficiales', icon: Link2 },
                            { href: '/about', label: 'Sobre IICA', icon: Building2 },
                            { href: '/#contacto', label: 'Contacto', icon: Phone },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMobileMenu(false)}
                                className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[var(--iica-navy)] dark:hover:text-white rounded-xl font-medium transition-colors min-h-[48px] flex items-center gap-3"
                            >
                                <item.icon className="h-5 w-5" aria-hidden="true" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
