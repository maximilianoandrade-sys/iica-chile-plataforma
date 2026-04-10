import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";
import Newsletter from "@/components/Newsletter";
import ProgramsSection from "@/components/ProgramsSection";
import FuentesOficiales from "@/components/FuentesOficiales";
import ImpactSection from "@/components/ImpactSection";
import LiveFeedSection from "@/components/LiveFeedSection";

// Dynamic Metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const region = typeof resolvedParams.region === 'string' ? resolvedParams.region : null;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : null;

  let title = 'Plataforma de Financiamiento Agrícola | IICA Chile';
  let description = 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. CNR, INDAP, FIA, CORFO, Sercotec y GOREs. Información actualizada 2026.';

  if (region) {
    title = `Fondos Concursables en ${region} 2026 | IICA Chile`;
    description = `Busca financiamiento agrícola disponible en la región de ${region}. Subsidios INDAP, CORFO, CNR activos.`;
  }

  if (category) {
    title = `${category} - ${title}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    }
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#f4f7f9] selection:bg-blue-100 italic-none">

        {/* 1. Header con Hero */}
        <div id="inicio">
          <Header />
          <HeroSection />
        </div>

        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-12 relative z-20">
          <div className="flex flex-col gap-10">

            {/* Buscador y Proyectos — sección principal */}
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

            {/* Información Institucional (Incorporado de la rama secundaria) */}
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

        {/* Fuentes Oficiales */}
        <div id="fuentes" className="scroll-mt-20">
          <FuentesOficiales />
        </div>

        {/* Newsletter */}
        <section id="newsletter" className="container mx-auto max-w-[1200px] px-4 py-8">
          <Newsletter />
        </section>

        {/* Programas Hemisféricos */}
        <ProgramsSection />

        {/* Impacto IICA */}
        <div id="impacto" className="scroll-mt-20">
          <ImpactSection />
        </div>

        {/* Quiénes Somos */}
        <div id="about">
          <AboutSection />
        </div>

        {/* Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
