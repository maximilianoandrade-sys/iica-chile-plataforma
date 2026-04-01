export interface KanbanTask {
    id: string;
    project: any;
    column: string;
    priority: string;
    responsible: string;
    checklist: { id: string; text: string; completed: boolean }[];
    lastUpdate: string;
}

const STORAGE_KEY = 'iica-pipeline-v2';

export function getPipelineTasks(): KanbanTask[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Error al leer pipeline", e);
    }
    return [];
}

export function savePipelineTasks(tasks: KanbanTask[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Error al guardar pipeline", e);
    }
}

export function addPipelineTask(task: KanbanTask): boolean {
    const current = getPipelineTasks();
    if (current.some(t => t.id === task.id)) {
        return false; // Ya existe
    }
    savePipelineTasks([...current, task]);
    return true;
}
