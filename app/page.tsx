import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";
import Newsletter from "@/components/Newsletter";
import ProgramsSection from "@/components/ProgramsSection";
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
      <div className="min-h-screen flex flex-col bg-[#f4f7f9]">

        {/* 1. Header con Hero */}
        <div id="inicio">
          <Header />
        </div>

        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-8 relative z-20">
          <div className="flex flex-col gap-6">

            {/* Buscador y Proyectos — sección principal */}
            <section id="convocatorias" className="scroll-mt-28">
              <Suspense fallback={<SkeletonProjectList />}>
                <ProjectListContainer searchParams={resolvedSearchParams} />
              </Suspense>
            </section>

          </div>
        </main>

        {/* Fuentes Oficiales */}
        <div id="fuentes" className="scroll-mt-20">
          <FuentesOficiales />
        </div>

        {/* Newsletter */}
        <section className="container mx-auto max-w-[1200px] px-4 py-8">
          <Newsletter />
        </section>

        {/* Programas Hemisféricos */}
        <ProgramsSection />

        {/* Quiénes Somos */}
        <AboutSection />

        {/* Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
