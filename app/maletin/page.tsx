import Link from 'next/link';
import type { Metadata } from 'next';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('Maletin');

export const metadata: Metadata = {
  title: 'Recursos de Referencia',
  description: 'Acceda a portales oficiales de financiamiento y apoyo técnico para el sector agropecuario chileno.',
  openGraph: {
    title: 'Recursos de Referencia | IICA Chile',
    description: 'Fuentes oficiales para revisar bases, programas y convocatorias del sector agrícola.',
  },
};

const RESOURCES = [
  {
    name: 'CNR — Comisión Nacional de Riego',
    description: 'Subsidios y concursos de riego tecnificado para la agricultura.',
    url: 'https://www.cnr.gob.cl/agricultores/concursos-de-riego/',
  },
  {
    name: 'INDAP — Instituto de Desarrollo Agropecuario',
    description: 'Programas de fomento para la agricultura familiar campesina.',
    url: 'https://www.indap.gob.cl/plataforma-de-servicios/',
  },
  {
    name: 'CORFO — Corporación de Fomento',
    description: 'Instrumentos de escalamiento productivo e innovación empresarial.',
    url: 'https://www.corfo.gob.cl/sites/cpp/convocatorias_programas_innovacion/',
  },
  {
    name: 'FIA — Fundación para la Innovación Agraria',
    description: 'Proyectos de innovación en el sector silvoagropecuario.',
    url: 'https://www.fia.cl/convocatorias/',
  },
  {
    name: 'SERCOTEC — Servicio de Cooperación Técnica',
    description: 'Capital semilla, digitalización y apoyo a microempresas.',
    url: 'https://www.sercotec.cl/programas/capital-semilla-emprende/',
  },
  {
    name: 'GOREs — Gobiernos Regionales',
    description: 'Fondos concursables regionales (FIC-R, FNDR) para desarrollo territorial.',
    url: 'https://www.subdere.gov.cl/programas/division-desarrollo-regional',
  },
];

export default function MaletinPage() {
  logger.info('Rendering Maletin page');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <Link
            href="/"
            className="text-sm text-[var(--iica-blue)] hover:underline inline-flex items-center gap-1 mb-6 min-h-[44px]"
          >
            ← Volver al Inicio
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-[var(--iica-blue)]" aria-hidden="true" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Recursos de Referencia
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            Portales oficiales con información técnica, bases de fondos y programas de apoyo
            para el sector agropecuario chileno.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESOURCES.map((resource) => (
              <article
                key={resource.url}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-[var(--iica-blue)] transition-colors"
              >
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    {resource.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--iica-blue)] hover:bg-[var(--iica-navy)] text-white text-sm font-bold rounded-lg transition-colors min-h-[44px] w-fit"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Visitar sitio →
                </a>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
