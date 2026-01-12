
'use client';

import React, { useState } from 'react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { FacetedFilter } from '@/components/search/FacetedFilter';
import { mockProjects } from '@/lib/mock-data';
import { LayoutGrid, List as ListIcon, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Navbar Minimalista */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">I</div>
            <span>IICA Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
              {/* User Avatar Placeholder */}
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Oportunidades de Financiamiento</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Encuentra fondos internaciones, nacionales y regionales.</p>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 border-l ml-1 pl-2"
              title="Vista Calendario (Próximamente)"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <FacetedFilter />

            {/* Favorites Preview Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Mis Favoritos</h3>
              <div className="space-y-3">
                <div className="text-sm text-slate-500 italic">No tienes favoritos guardados aún.</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
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

      </main>
    </div>
  );
}
