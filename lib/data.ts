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

    // Campos de búsqueda
    regiones?: string[];
    beneficiarios?: string[];

    // Resumen ejecutivo
    resumen?: {
        cofinanciamiento?: string;
        requisitos_clave?: string[];
        plazo_ejecucion?: string;
        observaciones?: string;
    };
    checklist?: string[];

    // Campos técnicos Dashboard 2026
    monto_min?: number;
    monto_max?: number;
    plazo_meses?: number;
    requiere_cofinanciamiento?: boolean;
    idioma?: string;
    faq_disponible?: boolean;
    webinar_fecha?: string | null;
    permite_adendas?: boolean;
    bases_estado?: string;
    requiere_firma?: boolean;
    tipos_solicitante?: string[];

    // =========================================================
    // NUEVOS CAMPOS IICA — Ítem 18 (Fase 1)
    // =========================================================

    /** Ámbito geográfico de la oportunidad */
    ambito?: 'Nacional' | 'Internacional' | 'Regional';

    /** Estado actual de la postulación */
    estadoPostulacion?: 'Abierta' | 'Próxima' | 'Cerrada';

    /** Nivel de viabilidad para el IICA */
    viabilidadIICA?: 'Alta' | 'Media' | 'Baja';

    /** Porcentaje numérico de viabilidad (0–100) */
    porcentajeViabilidad?: number;

    /** Nombre del responsable IICA para esta oportunidad */
    responsableIICA?: string;

    /** Región geográfica de cobertura principal */
    region?: string;

    /** Objetivo estratégico de la oportunidad */
    objetivo?: string;

    /** Descripción del rol del IICA en esta oportunidad */
    descripcionIICA?: string;

    /** Requisitos de postulación detallados */
    requisitos?: string[];

    /** Fortalezas del IICA para esta oportunidad */
    fortalezas?: string[];

    /** Debilidades o riesgos del IICA */
    debilidades?: string[];

    /** Notas internas del equipo IICA */
    notasInternas?: string;

    /** Eje temático IICA alineado a estrategia institucional */
    ejeIICA?: string;

    /** Complejidad de postulación */
    complejidad?: 'Fácil' | 'Media' | 'Alta';
}

export async function getProjects(): Promise<Project[]> {
    return projectData as Project[];
}
