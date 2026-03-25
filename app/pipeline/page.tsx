"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GripVertical, CheckCircle2, ChevronRight, Briefcase, Play, Inbox, Send, ChevronLeft, User, ListTodo, AlertCircle, Trash2, Plus } from 'lucide-react';
import projectsData from '@/data/projects.json';
import { Project } from '@/lib/data';
import Link from 'next/link';

type ColumnState = 'descubierto' | 'analisis' | 'borrador' | 'enviado';
type Priority = 'Baja' | 'Media' | 'Alta';

interface KanbanTask {
  id: string;
  project: Project;
  column: ColumnState;
  priority: Priority;
  responsible: string;
  checklist: { id: string; text: string; completed: boolean }[];
  lastUpdate: string;
}

const COLUMNS: { id: ColumnState; name: string; icon: any; color: string; bgColor: string }[] = [
  { id: 'descubierto', name: 'Oportunidad Identificada', icon: Inbox, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'analisis', name: 'Validación Técnica IICA', icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'borrador', name: 'Formulación de Propuesta', icon: Play, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'enviado', name: 'Presentado / En Revisión', icon: Send, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

const INITIAL_CHECKLIST = [
  { id: '1', text: 'Validación de bases legales', completed: false },
  { id: '2', text: 'Presupuesto preliminar', completed: false },
  { id: '3', text: 'Identificación de equipo técnico', completed: false },
  { id: '4', text: 'Carta de intención IICA', completed: false },
];

export default function PipelinePage() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('iica-pipeline-v2');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      const initialTasks: KanbanTask[] = projectsData.slice(0, 6).map((p, idx) => ({
        id: String(p.id),
        project: p as Project,
        column: idx === 0 ? 'borrador' : idx < 3 ? 'analisis' : 'descubierto',
        priority: idx % 3 === 0 ? 'Alta' : 'Media',
        responsible: idx % 2 === 0 ? 'Maximiliano Andrade' : 'Unidad Técnica IICA',
        checklist: [...INITIAL_CHECKLIST],
        lastUpdate: new Date().toISOString()
      }));
      setTasks(initialTasks);
      localStorage.setItem('iica-pipeline-v2', JSON.stringify(initialTasks));
    }
  }, []);

  useEffect(() => {
    if (isClient && tasks.length >= 0) {
      localStorage.setItem('iica-pipeline-v2', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
  };

  const handleDrop = (colId: ColumnState) => {
    if (!draggedTaskId) return;
    setTasks(prev => prev.map(t => 
      t.id === draggedTaskId ? { ...t, column: colId, lastUpdate: new Date().toISOString() } : t
    ));
    setDraggedTaskId(null);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        checklist: t.checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      };
    }));
  };

  const deleteTask = (id: string) => {
    if (confirm('¿Eliminar esta postulación del pipeline?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-slate-500 hover:text-[var(--iica-blue)] transition-colors">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Volver al Radar</span>
          </Link>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[var(--iica-navy)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">Gestión de Pipeline IICA</h1>
              <p className="text-xs text-slate-500 font-medium">Flujo institucional de formulación y postulación</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <User className="w-full h-full p-1.5 text-slate-400" />
                    </div>
                ))}
            </div>
            <button className="bg-[var(--iica-blue)] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuevo Proyecto
            </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-x-auto bg-[#f8fafc]">
        <div className="flex gap-8 h-full items-start min-w-[1400px]">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.column === col.id);
            return (
              <div 
                key={col.id} 
                className="flex-1 min-w-[340px] flex flex-col max-h-[calc(100vh-140px)] rounded-3xl border border-slate-200 bg-slate-200/40 backdrop-blur-sm"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column Header */}
                <div className={`p-5 border-b border-slate-200 ${col.bgColor} rounded-t-3xl flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                        <col.icon className={`w-4 h-4 ${col.color}`} />
                    </div>
                    <h2 className="font-black text-[13px] text-slate-700 uppercase tracking-wider">{col.name}</h2>
                  </div>
                  <span className="bg-white/80 backdrop-blur-md text-xs font-black px-2.5 py-1 rounded-full shadow-sm text-slate-600 border border-slate-200/50">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task List */}
                <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar lg:max-h-[calc(100vh-220px)]">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-400/30 hover:shadow-xl transition-all group relative overflow-hidden ${draggedTaskId === task.id ? 'opacity-40 animate-pulse' : ''}`}
                    >
                      {/* Priority indicator */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        task.priority === 'Alta' ? 'bg-red-500' : 
                        task.priority === 'Media' ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />

                      <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {task.project.institucion}
                            </span>
                            <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-md opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    task.priority === 'Alta' ? 'bg-red-50 text-red-600' : 
                                    task.priority === 'Media' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {task.priority}
                                </div>
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800 leading-snug mb-4 group-hover:text-[var(--iica-blue)] transition-colors">
                            {task.project.nombre}
                          </h3>

                          {/* Steps/Checklist */}
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ListTodo className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tareas de Formulación</span>
                            </div>
                            <div className="space-y-1.5">
                                {task.checklist.map(item => (
                                    <div 
                                      key={item.id} 
                                      className="flex items-center gap-2 cursor-pointer"
                                      onClick={() => toggleChecklistItem(task.id, item.id)}
                                    >
                                        <div className={`w-3 h-3 rounded border transition-colors flex items-center justify-center ${
                                            item.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                                        }`}>
                                            {item.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span className={`text-[11px] transition-all ${
                                            item.completed ? 'text-slate-400 line-through' : 'text-slate-600 font-medium'
                                        }`}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <User className="w-3 h-3 text-slate-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{task.responsible}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <AlertCircle className="w-3 h-3" />
                                <span className="text-[10px] font-bold">
                                    {task.project.fecha_cierre.split('-').reverse().slice(0,2).join('/')}
                                </span>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-300/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 grayscale group hover:grayscale-0 transition-all">
                      <Inbox className="w-6 h-6 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sin Proyectos</p>
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
