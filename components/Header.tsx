'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Plus, Target } from 'lucide-react';
import projects from '@/data/projects.json';
import { AnimatePresence, motion } from 'framer-motion';

// Calcular cuántas oportunidades cierran en ≤7 días
function getUrgentCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return projects.filter((p: any) => {
        const closing = new Date(p.fecha_cierre);
        const diff = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    }).length;
}

export function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const urgentCount = getUrgentCount();

    return (
        <header className="bg-white border-b border-[var(--iica-border)] sticky top-0 z-50">
            {/* Top Bar Institutional */}
            <div className="bg-[var(--iica-navy)] text-white text-xs py-1 px-4">
                <div className="container mx-auto max-w-[1200px] flex justify-between items-center">
                    <span>Instituto Interamericano de Cooperación para la Agricultura — Oficina Chile</span>
                    <span className="opacity-80 hidden sm:block">Radar de Oportunidades 2026</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="container mx-auto max-w-[1200px] px-4 py-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-bold text-2xl text-[var(--iica-navy)] tracking-tight hover:opacity-90 transition-opacity">
                        IICA <span className="text-[var(--iica-secondary)]">Chile</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-5 text-sm font-medium text-gray-600">
                    <Link href="/#inicio" className="hover:text-[var(--iica-navy)] transition-colors">Inicio</Link>
                    <Link href="/#convocatorias" className="hover:text-[var(--iica-navy)] transition-colors">Oportunidades</Link>
                    <Link href="/#fuentes" className="hover:text-[var(--iica-navy)] transition-colors">Fuentes</Link>
                    <Link href="/maletin" className="hover:text-[var(--iica-navy)] transition-colors text-[var(--iica-blue)] font-bold italic">Mi Maletín</Link>
                    <Link href="/consultores" className="hover:text-[var(--iica-navy)] transition-colors text-[var(--iica-secondary)] font-bold">Consultores</Link>
                    <Link href="/#impacto" className="hover:text-[var(--iica-navy)] transition-colors">Impacto</Link>
                    <Link href="/about" className="hover:text-[var(--iica-navy)] transition-colors">Sobre IICA</Link>
                    <Link href="/#contacto" className="hover:text-[var(--iica-navy)] transition-colors">Contacto</Link>
                </nav>

                <div className="flex items-center gap-2">
                    {/* Botón Agregar Oportunidad */}
                    <Link
                        href="/admin"
                        className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-[var(--iica-navy)] hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                        title="Agregar nueva oportunidad"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar
                    </Link>

                    {/* CTA con badge de urgentes */}
                    <Link
                        href="/#convocatorias"
                        className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[var(--iica-secondary)] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm min-h-[44px] relative"
                    >
                        <Target className="h-4 w-4" />
                        Ver Oportunidades
                        {urgentCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                                {urgentCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-[var(--iica-navy)] hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Abrir menú"
                    >
                        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        {urgentCount > 0 && !showMobileMenu && (
                            <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {urgentCount}
                            </span>
                        )}
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
                                { href: '/#convocatorias', label: '🎯 Ver Oportunidades' },
                                { href: '/#fuentes', label: '🔗 Fuentes Oficiales' },
                                { href: '/maletin', label: '💼 Mi Maletín' },
                                { href: '/consultores', label: '👤 Directorio de Consultores' },
                                { href: '/#impacto', label: '📈 Impacto IICA' },
                                { href: '/about', label: '🏦 Sobre el IICA' },
                                { href: '/admin', label: '➕ Agregar Oportunidad' },
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
        </header>
    );
}
