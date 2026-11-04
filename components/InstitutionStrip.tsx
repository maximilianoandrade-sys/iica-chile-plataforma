'use client';

import Image from 'next/image';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('InstitutionStrip');

const INSTITUTIONS = [
    { id: 'cnr', label: 'CNR', name: 'Comisión Nacional de Riego', logo: '/logos/pending/cnr.png' },
    { id: 'indap', label: 'INDAP', name: 'Instituto de Desarrollo Agropecuario', logo: '/logos/pending/indap.png' },
    { id: 'fia', label: 'FIA', name: 'Fundación para la Innovación Agraria', logo: '/logos/pending/fia.svg' },
    { id: 'corfo', label: 'CORFO', name: 'Corporación de Fomento de la Producción', logo: '/logos/pending/corfo.png' },
    { id: 'agcid', label: 'AGCID', name: 'Agencia Chilena de Cooperación Internacional para el Desarrollo', logo: '/logos/pending/agcid.webp' },
    { id: 'ocde', label: 'OCDE', name: 'Organización para la Cooperación y el Desarrollo Económicos', logo: '/logos/pending/oecd.svg' },
];

export default function InstitutionStrip() {
    return (
        <section
            aria-labelledby="institution-strip-heading"
            className="border-y border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-950"
        >
            <div className="container mx-auto max-w-[1200px] px-4">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--iica-blue)]">
                            Fuentes monitoreadas
                        </p>
                        <h2 id="institution-strip-heading" className="mt-1 text-xl font-bold text-[var(--iica-navy)] dark:text-white">
                            Instituciones a la vista
                        </h2>
                    </div>
                    <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                        Revise siempre las bases publicadas en el sitio oficial de cada institución.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {INSTITUTIONS.map((institution) => (
                        <a
                            key={institution.id}
                            href="#fuentes"
                            className="flex min-h-[104px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-center transition-colors hover:border-[var(--iica-blue)] hover:shadow-sm dark:border-gray-700 dark:bg-gray-900"
                            aria-label={`${institution.name}. Ver fuentes`}
                        >
                            <Image
                                src={institution.logo}
                                alt={`Logo ${institution.label}`}
                                width={110}
                                height={42}
                                className="mb-2 h-10 w-auto max-w-[110px] object-contain"
                                onError={() => logger.warn('Institution logo could not be loaded', { institution: institution.id })}
                            />
                            <span className="text-xs font-bold text-[var(--iica-navy)] dark:text-gray-200">
                                {institution.label}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
