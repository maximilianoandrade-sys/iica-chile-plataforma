import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import Newsletter from "@/components/Newsletter";
import FuentesOficiales from "@/components/FuentesOficiales";
import { getProjects } from "@/lib/data";

// Forzar renderizado dinámico: los proyectos vienen de la DB y cambian con scrapers.
// Sin esto, Vercel puede cachear la página estática con datos viejos.
export const dynamic = 'force-dynamic';

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
  let description = 'Encuentra fondos concursables, subsidios y créditos para el agro chileno. CNR, INDAP, FIA, CORFO, SAG y fuentes internacionales. Información actualizada 2026.';

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

  // Compute stats server-side to avoid shipping projects.json to the client
  const projects = await getProjects();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const internacionales = projects.filter((p) =>
    ['FONTAGRO', 'FAO', 'FIDA', 'BID', 'PNUD', 'GEF', 'GCF', 'UE', 'UE (EUROCLIMA+)', 'UE (AECID)', 'IICA Hemisférico'].includes(p.institucion)
  ).length;
  const abiertas = projects.filter((p) => new Date(p.fecha_cierre) >= today).length;
  const urgentes = projects.filter((p) => {
    const closing = new Date(p.fecha_cierre);
    const diff = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;
  const heroStats = { total: projects.length, internacionales, abiertas, urgentes };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#f4f7f9] selection:bg-blue-100 italic-none">

        {/* 1. Header con Hero */}
        <div id="inicio">
          <Header urgentCount={urgentes} />
          <HeroSection stats={heroStats} />
        </div>

        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-12 relative z-20">
          <div className="flex flex-col gap-10">

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
        <section id="newsletter" className="container mx-auto max-w-[1200px] px-4 py-8">
          <Newsletter />
        </section>

        {/* Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
