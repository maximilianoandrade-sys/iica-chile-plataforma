import projectData from '@/data/projects.json';

export interface Project {
    id: number;
    nombre: string;
    institucion: string;
    monto: number;
    fecha_cierre: string; // YYYY-MM-DD
    estado: string;
    categoria: string;
    url_bases: string;
    // Campos adicionales para búsqueda avanzada
    regiones?: string[];
    beneficiarios?: string[];
    // Resumen ejecutivo (información vital)
    resumen?: {
        cofinanciamiento?: string;
        requisitos_clave?: string[];
        plazo_ejecucion?: string;
        observaciones?: string;
    };
}

export async function getProjects(): Promise<Project[]> {
    // Aquí es donde conectaríamos con la DB real o la API
    // Por ahora, retornamos los datos del JSON "Base de Datos"
    return projectData;
}
