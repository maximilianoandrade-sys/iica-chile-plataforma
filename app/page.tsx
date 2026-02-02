import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";
import Newsletter from "@/components/Newsletter";
import ProgramsSection from "@/components/ProgramsSection";
import CounterpartLinks from "@/components/CounterpartLinks";

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

        {/* 1. Header Minimalista */}
        <div id="inicio">
          <Header />
        </div>


        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-8 relative z-20">

          <div className="flex flex-col gap-8">

            {/* 2. RECURSOS: Recursos Adicionales (Ahora más visible) */}
            <div id="recursos" className="mb-8 scroll-mt-28">
              <h2 className="text-2xl font-bold text-[var(--iica-navy)] mb-6">Recursos Adicionales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="https://chile.iica.int/" target="_blank" rel="noopener noreferrer" className="bg-[var(--iica-navy)] text-white p-8 rounded-lg shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer block">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Recursos para Postulación</h3>
                    <p className="text-blue-100 mb-4 text-sm">Accede a guías, formatos tipo y tips para mejorar tus posibilidades de adjudicación en concursos públicos.</p>
                    <span className="inline-block text-sm font-bold underline decoration-2 decoration-[var(--iica-secondary)] underline-offset-4">Ver Recursos</span>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                </a>

                <a href="https://repositorio.iica.int/" target="_blank" rel="noopener noreferrer" className="bg-white border border-[var(--iica-border)] p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group cursor-pointer block">
                  <h3 className="text-xl font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-2">
                    <span>🌱</span> Buenas Prácticas Agrícolas
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">Biblioteca técnica del IICA con manuales sobre adaptación al cambio climático, eficiencia hídrica y más.</p>
                  <div className="flex items-center text-[var(--iica-cyan)] font-bold text-sm group-hover:gap-2 transition-all">
                    Ir a la Biblioteca <span>→</span>
                  </div>
                </a>

                <CounterpartLinks />
              </div>
            </div>

            {/* 3. PRIORIDAD: Buscador y Proyectos */}
            <section id="convocatorias" className="scroll-mt-28">
              <Suspense fallback={<SkeletonProjectList />}>
                <ProjectListContainer searchParams={resolvedSearchParams} />
              </Suspense>
            </section>

          </div>

        </main>

        {/* 4. Manual de Uso */}
        <section id="manual" className="container mx-auto max-w-[1200px] px-4 mb-16">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[var(--iica-navy)] mb-6 flex items-center gap-2">
              📘 Manual de Uso Rápido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2 text-[var(--iica-blue)]">¿Cómo buscar fondos?</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Usa la <strong>Barra de Búsqueda</strong> para escribir palabras clave (ej: "riego", "mujer").</li>
                  <li>Selecciona una <strong>Categoría</strong> (ej: Suelos, Inversión, Internacional) para filtrar la lista.</li>
                  <li>Los proyectos con punto <span className="text-green-600 font-bold">Verde</span> están abiertos.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-[var(--iica-blue)]">¿Cómo postular?</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Haz clic en <strong>Ver Bases Oficiales</strong> para ir al sitio de la institución.</li>
                  <li>Descarga las bases administrativas y técnicas desde la fuente oficial.</li>
                  <li>Prepara tu Carpeta Tributaria y Certificado de Vigencia con anticipación.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Newsletter */}
        <section className="container mx-auto max-w-[1200px] px-4">
          <Newsletter />
        </section>

        {/* 6. Programas Hemisféricos (Relleno institucional) */}
        <ProgramsSection />

        {/* 7. Quiénes Somos (Relleno institucional) */}
        <AboutSection />

        {/* 8. Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
