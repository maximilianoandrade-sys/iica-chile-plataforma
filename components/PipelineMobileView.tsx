"use client";
import { ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Project } from "@/lib/data";

type ColumnState = "descubierto" | "analisis" | "borrador" | "enviado";
type Priority = "Baja" | "Media" | "Alta";

interface KanbanTask {
  id: string;
  project: Project;
  column: ColumnState;
  priority: Priority;
  responsible: string;
  checklist: { id: string; text: string; completed: boolean }[];
  lastUpdate: string;
}

const COLUMNS: { id: ColumnState; label: string; color: string }[] = [
  { id: "descubierto", label: "Oportunidad Identificada", color: "bg-slate-500" },
  { id: "analisis", label: "Validación Técnica IICA", color: "bg-amber-500" },
  { id: "borrador", label: "Formulación de Propuesta", color: "bg-purple-500" },
  { id: "enviado", label: "Presentado / En Revisión", color: "bg-emerald-500" },
];

interface PipelineMobileViewProps {
  tasks: KanbanTask[];
  onMoveTask: (taskId: string, newColumn: ColumnState) => void;
  onDeleteTask: (taskId: string) => void;
}

export function PipelineMobileView({ tasks, onMoveTask, onDeleteTask }: PipelineMobileViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(COLUMNS.map(c => [c.id, true]))
  );

  const toggleColumn = (colId: string) => {
    setExpanded(prev => ({ ...prev, [colId]: !prev[colId] }));
  };

  const getColumnIndex = (colId: string) => COLUMNS.findIndex(c => c.id === colId);

  return (
    <div className="space-y-4 px-4 py-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter(t => t.column === col.id);
        const colIndex = getColumnIndex(col.id);
        const isExpanded = expanded[col.id];

        return (
          <section key={col.id} className="bg-white rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleColumn(col.id)}
              className="w-full flex items-center gap-3 p-4 text-left min-h-[48px]"
              aria-expanded={isExpanded}
              aria-controls={`column-${col.id}`}
            >
              <span className={cn("w-3 h-3 rounded-full", col.color)} aria-hidden="true" />
              <span className="font-bold text-gray-900 flex-1">{col.label}</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </button>

            {isExpanded && (
              <div id={`column-${col.id}`} className="border-t divide-y" role="list" aria-label={col.label}>
                {colTasks.length === 0 && (
                  <p className="p-4 text-sm text-gray-400 italic">Sin proyectos en esta etapa</p>
                )}
                {colTasks.map((task) => (
                  <div key={task.id} className="p-4 space-y-2" role="listitem">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm text-gray-900">{task.project.nombre}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold shrink-0",
                        task.priority === "Alta" && "bg-red-100 text-red-700",
                        task.priority === "Media" && "bg-yellow-100 text-yellow-700",
                        task.priority === "Baja" && "bg-green-100 text-green-700",
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Vence: {task.project.fecha_cierre.split("-").reverse().slice(0, 2).join("/")}</p>
                    {task.checklist.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Checklist: {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {colIndex > 0 && (
                        <button
                          onClick={() => onMoveTask(task.id, COLUMNS[colIndex - 1].id)}
                          className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 flex items-center gap-1 min-h-[36px]"
                          aria-label={`Mover "${task.project.nombre}" a ${COLUMNS[colIndex - 1].label}`}
                        >
                          <ArrowLeft className="h-3 w-3" /> Anterior
                        </button>
                      )}
                      {colIndex < COLUMNS.length - 1 && (
                        <button
                          onClick={() => onMoveTask(task.id, COLUMNS[colIndex + 1].id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--iica-navy)] text-white hover:opacity-90 flex items-center gap-1 min-h-[36px]"
                          aria-label={`Mover "${task.project.nombre}" a ${COLUMNS[colIndex + 1].label}`}
                        >
                          Siguiente <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 ml-auto min-h-[36px] flex items-center gap-1"
                        aria-label={`Eliminar "${task.project.nombre}"`}
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
