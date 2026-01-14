export interface Project {
    id: number;
    nombre: string;
    institucion: string;
    monto: number;
    fecha_cierre: string; // YYYY-MM-DD
    estado: string;
    categoria: string;
    url_bases: string;
}

const projectsData: Project[] = [
    { "id": 1, "nombre": "CNR: Concurso 01-2026 Tecnificación y Obras Civiles (Norte Chico y Centro)", "institucion": "CNR", "monto": 570000000, "fecha_cierre": "2026-01-23", "estado": "Abierto", "categoria": "Riego", "url_bases": "https://www.cnr.gob.cl/agricultores/concursos-de-riego/" },
    { "id": 2, "nombre": "INDAP: SIRSD-S Recuperación de Suelos (Op. Temprana Biobío)", "institucion": "INDAP", "monto": 8500000, "fecha_cierre": "2026-03-01", "estado": "Abierto", "categoria": "Suelos", "url_bases": "https://www.indap.gob.cl/concursos" },
    { "id": 3, "nombre": "CORFO: Activa Inversión Riego Eficiente", "institucion": "CORFO", "monto": 30000000, "fecha_cierre": "2026-04-10", "estado": "Abierto", "categoria": "Inversión", "url_bases": "https://www.corfo.cl/sites/cpp/convocatorias" },
    { "id": 4, "nombre": "FIA: Convocatoria Jóvenes Innovadores 2026", "institucion": "FIA", "monto": 15000000, "fecha_cierre": "2026-05-05", "estado": "Próxima Apertura", "categoria": "Innovación", "url_bases": "https://www.fia.cl/convocatorias/" },
    { "id": 5, "nombre": "Crédito Enlace Riego - Temporada 2026", "institucion": "INDAP", "monto": 0, "fecha_cierre": "2026-12-31", "estado": "Ventanilla Abierta", "categoria": "Crédito", "url_bases": "https://www.indap.gob.cl/concursos" },
    { "id": 6, "nombre": "Cooperación Sur-Sur: Proyectos de Desarrollo 2026", "institucion": "Fondo Chile (PNUD)", "monto": 85000, "fecha_cierre": "2026-02-20", "estado": "Abierto", "categoria": "Internacional", "url_bases": "https://www.undp.org/es/chile" },
    { "id": 7, "nombre": "Horizonte Europa: Innovación Climática (Cluster 6)", "institucion": "Unión Europea", "monto": 0, "fecha_cierre": "2026-02-28", "estado": "Abierto", "categoria": "Internacional", "url_bases": "https://www.horizonteeuropa.es" },
    { "id": 8, "nombre": "Programa de Pasantías y Jóvenes Talentos Agrícolas", "institucion": "FAO", "monto": 0, "fecha_cierre": "2026-02-15", "estado": "Abierto", "categoria": "Internacional", "url_bases": "https://www.fao.org/employment" }
];

export async function getProjects(): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return projectsData;
}
