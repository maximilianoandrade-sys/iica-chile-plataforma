
'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProjectList } from '@/components/ProjectList';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">

      {/* 1. Header & Hero (Institutional) */}
      <Header />

      <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 -mt-8 relative z-20">

        {/* 2. Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--iica-border)] p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--iica-navy)] mb-2">
              Convocatorias Vigentes
            </h2>
            <p className="text-gray-600">
              Explore los fondos concursables disponibles para riego, innovación, suelos y desarrollo productivo.
            </p>
          </div>

          {/* 3. Smart Project Dashboard */}
          <ProjectList />

        </div>

        {/* 4. Additional Resources / Institutional Links (Optional, matching 'Herramientas Técnicas' concept but cleaner) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[var(--iica-navy)] text-white p-8 rounded-lg shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Recursos para Postulación</h3>
              <p className="text-blue-100 mb-4 text-sm">Accede a guías, formatos tipo y tips para mejorar tus posibilidades de adjudicación en concursos públicos.</p>
              <span className="inline-block text-sm font-bold underline decoration-2 decoration-[var(--iica-secondary)] underline-offset-4">Ver Recursos</span>
            </div>
            {/* Decorative circle */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          </div>

          <div className="bg-white border border-[var(--iica-border)] p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <h3 className="text-xl font-bold text-[var(--iica-navy)] mb-2 flex items-center gap-2">
              <span>🌱</span> Buenas Prácticas Agrícolas
            </h3>
            <p className="text-gray-600 mb-4 text-sm">Biblioteca técnica del IICA con manuales sobre adaptación al cambio climático, eficiencia hídrica y más.</p>
            <div className="flex items-center text-[var(--iica-cyan)] font-bold text-sm group-hover:gap-2 transition-all">
              Ir a la Biblioteca <span>→</span>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}
