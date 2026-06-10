import Link from 'next/link';
import { TrendingUp, Globe, Clock, Zap } from 'lucide-react';

interface StatsSectionProps {
    total: number;
    abiertas: number;
    internacionales: number;
    urgentes: number;
}

export default function StatsSection({ total, abiertas, internacionales, urgentes }: StatsSectionProps) {
    const stats = [
        {
            icon: <Zap className="w-6 h-6" />,
            label: 'Total',
            value: total,
            description: 'Oportunidades disponibles',
            iconClass: 'text-[var(--iica-blue)] bg-blue-50 dark:bg-blue-950/40',
            href: '/?estado=all#convocatorias',
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            label: 'Activas',
            value: abiertas,
            description: 'Abiertas ahora',
            iconClass: 'text-secondary dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
            href: '/?estado=Abierta#convocatorias',
        },
        {
            icon: <Globe className="w-6 h-6" />,
            label: 'Internacionales',
            value: internacionales,
            description: 'Oportunidades globales',
            iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
            href: '/?ambito=Internacional#convocatorias',
        },
        {
            icon: <Clock className="w-6 h-6" />,
            label: 'Urgentes',
            value: urgentes,
            description: 'Cierran en ≤7 días',
            iconClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
            href: '/?urgencia=7#convocatorias',
        },
    ];

    return (
        <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-10">
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <Link
                            key={i}
                            href={stat.href}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 md:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[var(--iica-blue)] transition-all cursor-pointer group"
                        >
                            <div className={`w-11 h-11 rounded-lg ${stat.iconClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white mb-0.5 leading-none">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {stat.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
