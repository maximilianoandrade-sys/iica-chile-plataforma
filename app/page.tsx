import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import StatsSection from "@/components/StatsSection";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import Newsletter from "@/components/Newsletter";
import FuentesOficiales from "@/components/FuentesOficiales";
import PipelineStatus from "@/components/PipelineStatus";
import { FilterChips } from "@/components/FilterChips";
import { getCachedProjectFilterSnapshot, getCachedProjects } from "@/lib/data";
import { buildFilterCounts } from "@/lib/search/filtering";
import { ALL_INSTITUTION_SIGLAS } from "@/lib/constants/institutions";
import prisma from "@/lib/prisma";

// Estrategia híbrida: home cacheada con ISR y búsqueda/filtros dinámicos por query.
// 15 min revalidation reduces stale "urgent" data window (was 1 hour).
export const revalidate = 900;

// Dynamic Metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const region = typeof resolvedParams.region === 'string' ? resolvedParams.region : null;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : null;

  let title = 'Radar de Oportunidades IICA Chile 2026';
  let description = 'Encuentre convocatorias agrícolas vigentes y verificadas por IICA Chile. Incluye fondos nacionales e internacionales con actualización continua.';

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  const [result, filterSnapshotResult] = await Promise.all([
    getCachedProjects(),
    getCachedProjectFilterSnapshot(),
  ]);
  const projects = result.ok ? result.projects : [];
  const filterSnapshot = filterSnapshotResult.ok ? filterSnapshotResult.projects : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const NATIONAL_INSTITUTION_KEYS = [
    'CNR',
    'INDAP',
    'FIA',
    'CORFO',
    'SAG',
    'SERCOTEC',
    'GORE',
    'SUBDERE',
    'MINAGRI',
  ];

  const INTERNATIONAL_INSTITUTION_KEYS = [
    'FONTAGRO',
    'FAO',
    'FIDA',
    'IFAD',
    'BID',
    'IADB',
    'PNUD',
    'GEF',
    'GCF',
    'WORLD BANK',
    'IICA',
    'UE',
    'EUROCLIMA',
    'UNGM',
    'OCDE',
    'OECD',
    'GSO',
    'GLOBAL SOUTH',
  ];

  const internacionales = projects.filter((p) => {
    if (p.ambito === 'Nacional') return false;
    if (p.ambito === 'Internacional') return true;

    const institution = (p.institucion || '').toUpperCase();
    if (NATIONAL_INSTITUTION_KEYS.some((key) => institution.includes(key))) return false;
    if (INTERNATIONAL_INSTITUTION_KEYS.some((key) => institution.includes(key))) return true;

    return false;
  }).length;
  const abiertas = projects.filter((p) => new Date(p.fecha_cierre) >= today).length;
  const urgentes = projects.filter((p) => {
    const closing = new Date(p.fecha_cierre);
    const diff = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;
  const heroStats = { total: projects.length, internacionales, abiertas, urgentes };

  // Compute institution counts for FuentesOficiales (avoids shipping 150KB JSON to client)
  // Match by sigla-contains to handle compound names like "SAG / MINAGRI" → counts for "SAG"
  const KNOWN_SIGLAS = ALL_INSTITUTION_SIGLAS;
  const institutionCounts: Record<string, number> = {};
  filterSnapshot.forEach(p => {
    const upper = (p.institucion || '').toUpperCase();
    for (const sigla of KNOWN_SIGLAS) {
      if (upper.includes(sigla)) {
        institutionCounts[sigla] = (institutionCounts[sigla] || 0) + 1;
      }
    }
    // Also keep the raw key for any institution not matching a known sigla
    if (!KNOWN_SIGLAS.some(s => upper.includes(s))) {
      institutionCounts[p.institucion] = (institutionCounts[p.institucion] || 0) + 1;
    }
  });

  const latestSourceRun = await prisma.source.findFirst({
    where: { lastRunAt: { not: null } },
    orderBy: { lastRunAt: 'desc' },
    select: { lastRunAt: true },
  });

  const lastUpdatedAt = latestSourceRun?.lastRunAt?.toISOString() ?? null;

  // Build filter facet counts for the search bar (rendered outside main for immediate sticky)
  const filterCounts = buildFilterCounts(filterSnapshot);

  return (
    <>
      <div id="inicio" className="min-h-screen flex flex-col bg-white dark:bg-gray-900 selection:bg-blue-100">

        {/* 1. Header — sticky top-0 (direct flex child for proper sticky) */}
        <Header urgentCount={urgentes} />

        {/* 2. Hero — primera impresión limpia, scroll normal */}
        <main>
        <HeroSection stats={heroStats} />

        {/* 3. Stats Section */}
        <StatsSection
          total={heroStats.total}
          abiertas={heroStats.abiertas}
          internacionales={heroStats.internacionales}
          urgentes={heroStats.urgentes}
        />

        {/* 4. Search/Filter bar — sticky below header, se pega solo al pasar el hero */}
        <Suspense fallback={<div className="h-16" />}>
          <FilterChips filterCounts={filterCounts} />
        </Suspense>

        <div id="convocatorias" className="flex-grow container mx-auto max-w-[1200px] px-4 pb-10 scroll-mt-40">
          <div className="flex flex-col gap-10">

            {/* Proyectos — sección principal */}
            <section>
              {lastUpdatedAt && <div className="mb-4"><PipelineStatus lastUpdated={lastUpdatedAt} /></div>}
              <Suspense fallback={<SkeletonProjectList />}>
                <ProjectListContainer searchParams={resolvedSearchParams} />
              </Suspense>
            </section>

          </div>
        </div>

        {/* Fuentes Oficiales */}
        <div className="scroll-mt-20">
          <FuentesOficiales institutionCounts={institutionCounts} lastUpdatedAt={lastUpdatedAt} totalActiveOpportunities={heroStats.total} />
        </div>

        {/* Newsletter */}
        <section id="newsletter" className="container mx-auto max-w-[1200px] px-4 py-8">
          <Newsletter />
        </section>
        </main>

        {/* Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
