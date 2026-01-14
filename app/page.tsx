import { Suspense } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProjectListContainer from "@/components/ProjectListContainer";
import SkeletonProjectList from "@/components/SkeletonProjectList";
import AboutSection from "@/components/AboutSection";

export default function DashboardPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#f4f7f9]">

        {/* 1. Header & Hero (Institutional) */}
        <div id="inicio">
          <Header />
        </div>

        <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-8 relative z-20">

          <div className="flex flex-col gap-8">

            {/* 2. Intro Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--iica-border)]">
              <h2 className="text-2xl font-bold text-[var(--iica-navy)] mb-4">
                Bienvenido a la Plataforma de Financiamiento IICA
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Esta herramienta centraliza las oportunidades de financiamiento vigentes de
                <span className="font-bold text-[var(--iica-secondary)]"> INDAP, CNR, CORFO, FIA y organismos internacionales</span>.
                Utiliza los filtros inteligentes para encontrar rápidamente los concursos que se ajustan a tu perfil.
              </p>
            </div>

            {/* 3. Smart Project Dashboard (Streaming) */}
            <section id="convocatorias" className="scroll-mt-28">
              <Suspense fallback={<SkeletonProjectList />}>
                <ProjectListContainer />
              </Suspense>
            </section>

          </div>

        </main>

        {/* 4. Additional Resources */}
        <div id="recursos" className="container mx-auto max-w-[1200px] px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        {/* 5. Quick Manual */}
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

        {/* 6. About Section (Institutional Identity) */}
        <AboutSection />

        {/* 7. Footer */}
        <div id="contacto">
          <Footer />
        </div>

      </div>
    </>
  );
}
