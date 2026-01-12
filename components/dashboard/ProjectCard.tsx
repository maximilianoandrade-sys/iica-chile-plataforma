
import React from 'react';
import { Calendar, DollarSign, ExternalLink, Globe } from 'lucide-react';
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
    country
}) => {
    // Legacy Logic for status color (using the MVP classes conceptually)
    const statusColor = urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    const statusText = urgency === 'high' ? 'Cierra Pronto' : 'Abierto';

    return (
        <div className="bg-white border border-gray-300 rounded-sm p-4 mb-4 flex flex-col gap-2 border-l-[5px] border-l-[var(--iica-secondary)] hover:-translate-y-1 hover:shadow-lg transition-all duration-200">

            {/* Header aligned like MVP */}
            <div className="flex justify-between items-start">
                <h3 className="text-[1.2rem] font-bold text-[var(--iica-dark)] leading-tight">
                    {title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                    {statusText}
                </span>
            </div>

            <div className="text-sm text-gray-600 font-medium">
                <strong>Fuente:</strong> {agency} | <strong>Monto:</strong> {budget}
            </div>

            <div className="text-sm text-gray-500 line-clamp-2 mb-2">
                {/* Description placeholder or partial text */}
                Oportunidad de financiamiento para el sector agrícola enfocada en desarrollo sostenible...
                <TranslatorBtn text={title} />
            </div>

            <div className="flex gap-3 mt-1">
                <button className="flex-1 bg-[var(--iica-navy)] text-white py-2 px-4 rounded text-sm font-bold uppercase hover:bg-[var(--iica-blue)] text-center">
                    Ver Bases
                </button>
                <button className="border border-gray-300 bg-white rounded w-10 flex items-center justify-center hover:bg-gray-50">
                    ⭐
                </button>
            </div>

        </div>
    );
};
