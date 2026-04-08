'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Breadcrumb"
            className={`flex items-center gap-1 text-sm ${className}`}
        >
            {/* Home always first */}
            <Link
                href="/"
                className="flex items-center gap-1 text-gray-400 hover:text-[var(--iica-blue)] transition-colors group"
                aria-label="Inicio"
            >
                <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Inicio</span>
            </Link>

            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    {item.href && i < items.length - 1 ? (
                        <Link
                            href={item.href}
                            className="text-gray-500 hover:text-[var(--iica-blue)] transition-colors truncate max-w-[160px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className="text-[var(--iica-navy)] font-semibold truncate max-w-[200px]"
                            aria-current="page"
                        >
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </motion.nav>
    );
}
