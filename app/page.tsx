
'use client';

import React, { useState } from 'react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { FacetedFilter } from '@/components/search/FacetedFilter';
import { mockProjects } from '@/lib/mock-data';
import { Mic } from 'lucide-react';

export default function DashboardPage() {
  const [isListening, setIsListening] = useState(false);

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Mock interaction
    if (!isListening) {
      setTimeout(() => alert("🔊 (Mock) Escuchando..."), 100);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">

      {/* 1. HERO CON VOICE SEARCH (Legacy Style) */}
      <div className="hero-iica relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-[3rem] font-[900] mb-4 uppercase tracking-wider text-white drop-shadow-md">
            Cooperación Técnica y Financiamiento
          </h1>
          <p className="text-xl mb-8 font-light drop-shadow">Conectando el campo chileno con oportunidades de desarrollo sostenible.</p>

          <div className="inline-block bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
            <p className="mb-2 font-medium text-white">🎙️ Búsqueda por Voz (Español Chileno)</p>
            <button
              onClick={toggleVoice}
              className={`mic-btn ${isListening ? 'animate-pulse bg-red-500' : ''}`}
              title="Toca para hablar"
            >
              <span className="text-2xl">🎤</span>
            </button>
            <p className="mt-2 text-sm text-white/80">{isListening ? 'Escuchando...' : 'Toca para hablar...'}</p>
          </div>
        </div>
      </div>

      {/* 2. MÓDULOS AVANZADOS (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {/* AR SCANNER MOCK */}
        <div className="bg-white p-6 rounded shadow-sm border border-[var(--iica-border)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-5 border-b-2 border-[var(--iica-navy)] pb-3">
            <span className="text-[var(--iica-navy)] font-bold text-lg">📱 Scanner Predial AR</span>
            <span>👁️</span>
          </div>
          <div className="bg-black h-[150px] rounded relative overflow-hidden flex items-center justify-center text-white mb-3">
            <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,#111_10px,#111_20px)]"></div>
            <p className="z-10 text-center font-mono text-sm">[Cámara Virtual]<br />Escaneando cultivo...</p>
          </div>
          <button className="w-full btn-iica text-sm py-2">Iniciar Análisis AR</button>
        </div>

        {/* GIS MAP MOCK */}
        <div className="bg-white p-6 rounded shadow-sm border border-[var(--iica-border)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-5 border-b-2 border-[var(--iica-navy)] pb-3">
            <span className="text-[var(--iica-navy)] font-bold text-lg">🗺️ Mapa de Oportunidades</span>
            <span>📍</span>
          </div>
          <div className="bg-slate-100 h-[150px] rounded relative overflow-hidden flex items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_Chile_%28regions%29.svg/1200px-Map_of_Chile_%28regions%29.svg.png"
              className="h-full opacity-50 object-cover" alt="Mapa Chile" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/80 px-2 py-1 rounded text-xs font-bold text-slate-800">Ver Proyectos por Región</span>
            </div>
          </div>
          <button className="w-full btn-iica text-sm py-2 mt-3">Explorar Mapa</button>
        </div>

        {/* SMART SEARCH / FILTERS */}
        <div className="bg-white p-6 rounded shadow-sm border border-[var(--iica-border)] hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-center mb-5 border-b-2 border-[var(--iica-navy)] pb-3">
            <span className="text-[var(--iica-navy)] font-bold text-lg">🔍 Buscador Inteligente</span>
          </div>
          <div className="space-y-3">
            {/* Mini Faceted Filter Mock */}
            <select className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50">
              <option>Todas las fuentes (INDAP, CORFO...)</option>
            </select>
            <select className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50">
              <option>Todos los montos</option>
            </select>
            <button className="w-full btn-iica text-sm py-2">Buscar Fondos</button>
          </div>
        </div>

      </div>

      {/* 3. LISTADO DE FONDOS CON NUEVOS COMPONENTES REACT */}
      <h2 className="text-[var(--iica-secondary)] border-b-2 border-slate-100 pb-2 mb-6 text-xl flex items-center gap-2">
        <span>🌾</span> Convocatorias Vigentes 2026
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Full Desktop Filters */}
        <div className="hidden md:block col-span-1">
          <FacetedFilter />
        </div>

        {/* Projects Grid */}
        <div className="col-span-1 md:col-span-3">
          <div className="grid gap-4">
            {mockProjects.map(project => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                agency={project.agency}
                budget={project.budget}
                deadline={project.deadline}
                urgency={project.urgency as any}
                country={project.country}
                ods={project.ods}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
