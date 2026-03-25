"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GripVertical, CheckCircle2, ChevronRight, Briefcase, Play, Inbox, Send, ChevronLeft } from 'lucide-react';
import projectsData from '@/data/projects.json';
import { Project } from '@/lib/data';
import Link from 'next/link';

type ColumnState = 'descubierto' | 'analisis' | 'borrador' | 'enviado';

interface KanbanTask {
  id: string;
  project: Project;
  column: ColumnState;
}

const COLUMNS: { id: ColumnState; name: string; icon: any; color: string; bgColor: string }[] = [
  { id: 'descubierto', name: 'Descubrimiento', icon: Inbox, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'analisis', name: 'Análisis IICA', icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'borrador', name: 'Redacción Propuesta', icon: Play, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'enviado', name: 'Enviados', icon: Send, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

export default function PipelinePage() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize tasks from localStorage or from the active JSON
    const saved = localStorage.getItem('iica-pipeline');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      // Pick top 10 as examples initially
      const initialTasks: KanbanTask[] = projectsData.slice(0, 8).map(p => ({
        id: p.id,
        project: p as Project,
        column: Math.random() > 0.7 ? 'analisis' : 'descubierto'
      }));
      setTasks(initialTasks);
      localStorage.setItem('iica-pipeline', JSON.stringify(initialTasks));
    }
  }, []);

  useEffect(() => {
    if (isClient && tasks.length > 0) {
      localStorage.setItem('iica-pipeline', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnState) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: colId } : t));
  };

  if (!isClient) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[var(--iica-blue)] border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Pipeline de Postulaciones</h1>
            <p className="text-xs text-slate-500 font-medium">Gestión Kanban para el desarrollo de proyectos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {tasks.filter(t => t.column === 'enviado').length} Propuestas Enviadas
            </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 h-full items-start min-w-[1200px]">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.column === col.id);
            return (
              <div 
                key={col.id} 
                className={`flex-1 min-w-[300px] flex flex-col max-h-[calc(100vh-120px)] rounded-2xl border border-slate-200 bg-slate-100/50 shadow-sm`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-slate-200 ${col.bgColor} rounded-t-2xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <col.icon className={`w-4 h-4 ${col.color}`} />
                    <h2 className={`font-bold text-sm ${col.color}`}>{col.name}</h2>
                  </div>
                  <span className="bg-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task List */}
                <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-indigo-400 transition-colors" />
                        <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                          {task.project.nombre}
                        </h3>
                      </div>
                      <div className="pl-6 space-y-2">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                          {task.project.institucion}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            Cierre: {task.project.cierre.split('-').reverse().join('-')}
                          </span>
                          {task.column === 'enviado' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400">
                      Arrastra proyectos aquí
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
