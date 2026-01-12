
import React from 'react';
import { Calendar, DollarSign, ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TranslatorBtn } from '@/components/features/TranslatorBtn';

interface ProjectProps {
    id: number;
    title: string;
    agency: string;
    budget: string;
    deadline: string;
    urgency: 'high' | 'medium' | 'low';
    country: string;
    ods: number[];
    imageUrl?: string;
}

export const ProjectCard: React.FC<ProjectProps> = ({
    title,
    agency,
    budget,
    deadline,
    urgency,
    country,
    ods
}) => {
    const urgencyColor = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-green-100 text-green-700 border-green-200',
    };

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
            {/* Urgency Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${urgencyColor[urgency]}`}>
                {urgency === 'high' ? 'Cierra pronto' : urgency === 'medium' ? 'Cierre próximo' : 'Abierto'}
            </div>

            {/* Header */}
            <div className="mb-4 flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    {/* Placeholder for Agency Logo */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {agency.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-500">{agency}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors mb-2">
                    {title}
                </h3>
                {/* Translator Button */}
                <div className="mb-2">
                    <TranslatorBtn text={title} />
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{new Date(deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>{budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span>{country}</span>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-1">
                    {ods.slice(0, 3).map((odsId) => (
                        <span key={odsId} title={`ODS ${odsId}`} className="w-6 h-6 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-mono">
                            {odsId}
                        </span>
                    ))}
                </div>

                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Ver Detalles <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
