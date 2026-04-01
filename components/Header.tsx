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
            <div className="container mx-auto max-w-[1200px] px-4 py-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-black text-2xl text-[var(--iica-navy)] tracking-tighter hover:opacity-90 transition-opacity">
                        IICA <span className="text-[var(--iica-blue)]">Chile</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest hidden sm:block">Radar 2026</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <Link href="/#convocatorias" className="hover:text-[var(--iica-blue)] transition-colors">Oportunidades</Link>
                    <Link href="/pipeline" className="hover:text-[var(--iica-blue)] transition-colors">Pipeline</Link>
                    <Link href="/admin" className="hover:text-[var(--iica-blue)] transition-colors">Admin</Link>
                </nav>

                <div className="flex items-center gap-2">
                    {/* CTA Compacto */}
                    <Link
                        href="/#convocatorias"
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[var(--iica-navy)] hover:bg-[var(--iica-blue)] text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-0.5 text-[10px]"
                    >
                        <Target className="h-4 w-4" />
                        Explorar
                        {urgentCount > 0 && (
                            <span className="bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">
                                {urgentCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[var(--iica-navy)] hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
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
                                { href: '/#convocatorias', label: '🎯 Ver Oportunidades' },
                                { href: '/#fuentes', label: '🔗 Fuentes Oficiales' },
                                { href: '/consultores', label: '👤 Directorio de Consultores' },
                                { href: '/#impacto', label: '📈 Impacto IICA' },
                                { href: '/about', label: '🏦 Sobre el IICA' },
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
