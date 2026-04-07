import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProjectData {
  id: number;
  nombre: string;
  institucion: string;
  monto: number;
  fecha_cierre: string;
  estado: string;
  categoria: string;
  url_bases: string;
  regiones?: string[];
  beneficiarios?: string[];
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
  checklist?: string[];
  ambito?: string;
  estadoPostulacion?: string;
  viabilidadIICA?: string;
  porcentajeViabilidad?: number;
  responsableIICA?: string;
  region?: string;
  objetivo?: string;
  descripcionIICA?: string;
  requisitos?: string[];
  fortalezas?: string[];
  debilidades?: string[];
  notasInternas?: string;
  ejeIICA?: string;
  complejidad?: string;
  rolIICA?: string;
}

async function main() {
  console.log('Iniciando seed de proyectos...');

  // Limpiar proyectos existentes
  await prisma.project.deleteMany({});

  // Cargar datos del JSON
  const projectsData: ProjectData[] = require('../data/projects.json');

  // Insertar proyectos
  for (const project of projectsData) {
    await prisma.project.create({
      data: {
        id: project.id,
        nombre: project.nombre,
        institucion: project.institucion,
        monto: project.monto,
        fecha_cierre: new Date(project.fecha_cierre),
        estado: project.estado,
        categoria: project.categoria,
        url_bases: project.url_bases,
        regiones: project.regiones || [],
        beneficiarios: project.beneficiarios || [],
        monto_min: project.monto_min,
        monto_max: project.monto_max,
        plazo_meses: project.plazo_meses,
        requiere_cofinanciamiento: project.requiere_cofinanciamiento || false,
        idioma: project.idioma || 'es',
        faq_disponible: project.faq_disponible || false,
        webinar_fecha: project.webinar_fecha ? new Date(project.webinar_fecha) : null,
        permite_adendas: project.permite_adendas || false,
        bases_estado: project.bases_estado || 'published',
        requiere_firma: project.requiere_firma || false,
        tipos_solicitante: project.tipos_solicitante || [],
        checklist: project.checklist || [],
        ambito: project.ambito || 'Nacional',
        estadoPostulacion: project.estadoPostulacion || 'Abierta',
        viabilidadIICA: project.viabilidadIICA || 'Media',
        porcentajeViabilidad: project.porcentajeViabilidad,
        responsableIICA: project.responsableIICA,
        region: project.region,
        objetivo: project.objetivo,
        descripcionIICA: project.descripcionIICA,
        requisitos: project.requisitos || [],
        fortalezas: project.fortalezas || [],
        debilidades: project.debilidades || [],
        notasInternas: project.notasInternas,
        ejeIICA: project.ejeIICA,
        complejidad: project.complejidad || 'Media',
        rolIICA: project.rolIICA || 'Indirecto',
      },
    });
  }

  console.log(`Seeded ${projectsData.length} proyectos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
