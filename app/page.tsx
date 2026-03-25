import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";

export const metadata: Metadata = {
  title: 'Radar de Oportunidades | IICA Chile',
  description: 'Plataforma inteligente de financiamiento agrícola para el IICA Chile. Encuentra fondos, convocatorias y proyectos activos 2026.',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9] selection:bg-blue-100 italic-none">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-6 md:py-10">
        <div className="flex flex-col gap-10">

          {/* Buscador y Proyectos — El corazón de la plataforma */}
          <section id="convocatorias" className="scroll-mt-28">
            <Suspense fallback={<SkeletonProjectList />}>
              <ProjectListContainer searchParams={resolvedSearchParams} />
            </Suspense>
          </section>

          {/* Información Institucional Secundaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--iica-blue)]"></span>
                    Misión Institucional
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    El IICA Chile trabaja para promover un desarrollo agropecuario competitivo e inclusivo, 
                    movilizando recursos técnicos y financieros mediante alianzas estratégicas regionales e internacionales.
                </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--iica-secondary)]"></span>
                    Soporte Técnico
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Si eres consultor o técnico del IICA y necesitas apoyo para la formulación de una propuesta basada en este radar, 
                    contacta a la unidad de proyectos de la oficina.
                </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

