import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";
import ProgramsSection from "@/components/ProgramsSection";
import FuentesOficiales from "@/components/FuentesOficiales";
import ImpactSection from "@/components/ImpactSection";
import LiveFeedSection from "@/components/LiveFeedSection";

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
      <HeroSection />
      
      <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-12 relative z-20">
        <div className="flex flex-col gap-10">

          {/* Buscador y Proyectos — El corazón de la plataforma */}
          <section id="convocatorias" className="scroll-mt-28">
            <Suspense fallback={<SkeletonProjectList />}>
              <ProjectListContainer searchParams={resolvedSearchParams} />
            </Suspense>
          </section>

          {/* Feed en vivo: fondos concursables abiertos ahora */}
          <section id="fondos-vivos" className="scroll-mt-20">
            <Suspense fallback={
              <div className="h-48 rounded-xl border border-gray-200 bg-gray-50 animate-pulse flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Cargando fondos en tiempo real...
                </div>
              </div>
            }>
              <LiveFeedSection />
            </Suspense>
          </section>

          {/* Información Institucional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-90">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[var(--iica-navy)] mb-4 flex items-center gap-2 text-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--iica-blue)]"></span>
                    Misión Institucional
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    El IICA Chile trabaja para promover un desarrollo agropecuario competitivo e inclusivo, 
                    movilizando recursos técnicos y financieros mediante alianzas estratégicas regionales e internacionales.
                </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[var(--iica-navy)] mb-4 flex items-center gap-2 text-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--iica-secondary)]"></span>
                    Soporte Técnico
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Si eres consultor o técnico del IICA y necesitas apoyo para la formulación de una propuesta basada en este radar, 
                    contacta a la unidad de proyectos de la oficina.
                </p>
            </div>
          </div>

        </div>
      </main>

      <FuentesOficiales />
      <ProgramsSection />
      <ImpactSection />
      <AboutSection />
      
      <Footer />
    </div>
  );
}

