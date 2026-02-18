import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";
import Newsletter from "@/components/Newsletter";
import ProgramsSection from "@/components/ProgramsSection";
import ImpactDashboard from "@/components/ImpactDashboard";
import EligibilityCalculatorPro from "@/components/EligibilityCalculatorPro";
import FuentesOficiales from "@/components/FuentesOficiales";

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
  let description = 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. Información actualizada 2026.';

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
      <div className="min-h-screen flex flex-col bg-[#f4f7f9]">

        {/* 1. Header con Hero */}
        <div id="inicio">
          <Header />
        </div>

        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-8 relative z-20">
          <div className="flex flex-col gap-8">

            {/* PRIORIDAD: Buscador y Proyectos */}
            <section id="convocatorias" className="scroll-mt-28">
              <Suspense fallback={<SkeletonProjectList />}>
                <ProjectListContainer searchParams={resolvedSearchParams} />
              </Suspense>
            </section>

          </div>
        </main>

        {/* Calculadora de Elegibilidad Pro */}
        <section id="calculadora" className="container mx-auto max-w-[1200px] px-4 mb-12 scroll-mt-20">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-[var(--iica-blue)] px-4 py-2 rounded-full text-sm font-bold mb-3">
              🧮 Herramienta Exclusiva
            </div>
            <h2 className="text-2xl font-bold text-[var(--iica-navy)]">¿Para qué fondos califico?</h2>
            <p className="text-gray-600 mt-1">Sube tu Carpeta Tributaria y descubre tu elegibilidad en segundos.</p>
          </div>
          <EligibilityCalculatorPro />
        </section>

        {/* Dashboard de Impacto */}
        <ImpactDashboard />

        {/* Fuentes Oficiales */}
        <div id="fuentes" className="scroll-mt-20">
          <FuentesOficiales />
        </div>

        {/* Manual de Uso */}
        <section id="manual" className="container mx-auto max-w-[1200px] px-4 mb-16">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--iica-navy)] mb-6 flex items-center gap-2">
              📘 Manual de Uso Rápido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2 text-[var(--iica-blue)]">¿Cómo buscar fondos?</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Usa el <strong>Modo Simple</strong> (botón verde en el header) con solo 3 preguntas.</li>
                  <li>Escribe en lenguaje natural: <em>"se me secó el pozo"</em> y el sistema entiende tu necesidad.</li>
                  <li>Los proyectos con punto <span className="text-green-600 font-bold">Verde</span> están abiertos.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-[var(--iica-blue)]">¿Cómo postular?</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Haz clic en <strong>Ver Bases Oficiales</strong> para ir al sitio de la institución.</li>
                  <li>Usa la <strong>Calculadora de Elegibilidad</strong> para verificar si calificas antes de postular.</li>
                  <li>Busca un <strong>Consultor Certificado</strong> si necesitas ayuda para formular tu proyecto.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Newsletter */}
        <section className="container mx-auto max-w-[1200px] px-4">
          <Newsletter />
        </section>

        {/* 6. Programas Hemisféricos */}
        <ProgramsSection />

        {/* 7. Quiénes Somos */}
        <AboutSection />

        {/* 8. Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
