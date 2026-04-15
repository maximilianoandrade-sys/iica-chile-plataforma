import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_PROJECTS = [
  {
    id: 201,
    nombre: "FIC-R Valparaíso 2026: Adaptación Hídrica para la Agricultura Familiar Campesina",
    institucion: "GORE Valparaíso",
    monto: 250000000,
    fecha_cierre: new Date("2026-05-30T00:00:00Z"),
    estado: "Próximo",
    categoria: "Regional",
    url_bases: "https://www.gorevalparaiso.cl/fondos/fic-r",
    regiones: ["Valparaíso"],
    beneficiarios: ["Pequeños agricultores", "Organizaciones de regantes"],
    monto_min: 50000000,
    monto_max: 250000000,
    plazo_meses: 24,
    requiere_cofinanciamiento: false,
    idioma: "es",
    faq_disponible: true,
    webinar_fecha: null,
    permite_adendas: true,
    bases_estado: "published",
    requiere_firma: true,
    tipos_solicitante: ["Organizacion"],
    checklist: ["Vigencia IICA", "Certificado contrapartes regionales"],
    ambito: "Regional",
    estadoPostulacion: "Próxima",
    viabilidadIICA: "Alta",
    porcentajeViabilidad: 90,
    responsableIICA: "Hernán Chiriboga",
    region: "Valparaíso",
    objetivo: "Implementar soluciones de eficiencia hídrica y digitalización en la provincia de Petorca y Quillota.",
    descripcionIICA: "Oportunidad CLAVE para IICA Chile. Somos ejecutores validados por el GORE Valparaíso. Permite financiar equipo técnico local y equipamiento en terreno.",
    requisitos: [
      "IICA Chile como ejecutor líder",
      "Alianza con al menos 2 municipios de la región",
      "Carta de apoyo de INDAP Regional"
    ],
    fortalezas: [
      "Historial exitoso de IICA con FIC anteriores",
      "Presencia técnica en la zona",
      "Alineación total con política hídrica regional"
    ],
    debilidades: [
      "Requiere formulación administrativa rigurosa bajo norma chilena",
      "Depende de tiempos de aprobación del Consejo Regional (CORE)"
    ],
    notasInternas: "NUEVO 2026. Priorizar contacto con Unidad de Fondos GORE Valparaíso. Hernán lidera.",
    ejeIICA: "Bioeconomía y cambio climático",
    complejidad: "Fácil",
    rolIICA: "Ejecutor"
  },
  {
    id: 202,
    nombre: "FIC-R Maule 2026: Economía Circular en el Sector Hortofrutícola",
    institucion: "GORE Maule",
    monto: 180000000,
    fecha_cierre: new Date("2026-06-15T00:00:00Z"),
    estado: "Próximo",
    categoria: "Regional",
    url_bases: "https://www.goremaule.cl",
    regiones: ["Maule"],
    beneficiarios: ["Pymes agrícolas", "Cooperativas"],
    monto_min: 40000000,
    monto_max: 180000000,
    plazo_meses: 18,
    requiere_cofinanciamiento: false,
    idioma: "es",
    faq_disponible: true,
    webinar_fecha: null,
    permite_adendas: false,
    bases_estado: "published",
    requiere_firma: true,
    tipos_solicitante: ["Organizacion"],
    checklist: [],
    ambito: "Regional",
    estadoPostulacion: "Próxima",
    viabilidadIICA: "Alta",
    porcentajeViabilidad: 85,
    responsableIICA: "Ana Lía Gutiérrez",
    region: "Maule",
    objetivo: "Reducir el desperdicio de alimentos y mejorar la valorización de residuos agrícolas en la zona central.",
    descripcionIICA: "IICA Chile puede liderar esta iniciativa enfocándose en transferencia tecnológica y capacitación a cooperativas del Maule.",
    requisitos: [
      "Propuesta de economía circular aplicada",
      "Impacto demostrable en pequeños productores",
      "Certificado de vigencia OIO (Organismo Internacional)"
    ],
    fortalezas: [
      "Relación fluida con el GORE Maule",
      "Mandato institucional de sostenibilidad",
      "Monto de subsidio accesible (no requiere cofinanciamiento monetario)"
    ],
    debilidades: [
      "Competencia con universidades regionales fuertes (U. de Talca)",
      "Logística de ejecución en zonas rurales apartadas"
    ],
    notasInternas: "Explorar alianza con Universidad del Maule para componente científico. Ana Lía.",
    ejeIICA: "Bioeconomía y cambio climático",
    complejidad: "Media",
    rolIICA: "Ejecutor"
  },
  {
    id: 203,
    nombre: "Licitación Mercado Público: Estudios de Línea Base Seguridad Alimentaria Chile 2026",
    institucion: "MINAGRI / ODEPA",
    monto: 85000000,
    fecha_cierre: new Date("2026-05-10T00:00:00Z"),
    estado: "Abierto",
    categoria: "Nacional",
    url_bases: "https://www.mercadopublico.cl",
    regiones: ["Todas"],
    beneficiarios: ["Estado de Chile"],
    monto_min: 50000000,
    monto_max: 85000000,
    plazo_meses: 6,
    requiere_cofinanciamiento: false,
    idioma: "es",
    faq_disponible: false,
    webinar_fecha: null,
    permite_adendas: true,
    bases_estado: "published",
    requiere_firma: true,
    tipos_solicitante: ["Organizacion"],
    checklist: ["Habilitación ChileProveedores"],
    ambito: "Nacional",
    estadoPostulacion: "Abierta",
    viabilidadIICA: "Alta",
    porcentajeViabilidad: 95,
    responsableIICA: "Carlos Guajardo",
    region: "Nacional",
    objetivo: "Diagnóstico nacional de brechas de seguridad alimentaria post-crisis climática para diseño de política pública.",
    descripcionIICA: "IICA es la entidad técnica por excelencia para estos estudios. El estatus de organismo internacional nos da una ventaja competitiva de neutralidad y expertise.",
    requisitos: [
      "RUT Nacional",
      "ChileProveedores al día",
      "Boleta de garantía bancaria"
    ],
    fortalezas: [
      "Neutralidad técnica reconocida",
      "Experiencia previa en ODEPA y MINAGRI",
      "Red de consultores especialistas disponible"
    ],
    debilidades: [
      "Requiere boleta de garantía (proceso administrativo interno IICA)",
      "Margen de utilidad ajustado por bases de licitación"
    ],
    notasInternas: "URGENTE. Comprobar vigencia en ChileProveedores. Carlos Guajardo lidera.",
    ejeIICA: "Políticas y sostenibilidad ambiental",
    complejidad: "Media",
    rolIICA: "Ejecutor"
  },
  {
    id: 204,
    nombre: "USAID / BHA: Resiliencia Climática y Seguridad Hídrica en el Cono Sur",
    institucion: "USAID",
    monto: 4500000000,
    fecha_cierre: new Date("2026-08-15T00:00:00Z"),
    estado: "Próximo",
    categoria: "Internacional",
    url_bases: "https://www.grants.gov",
    regiones: ["Todas"],
    beneficiarios: ["Comunidades rurales vulnerables"],
    monto_min: 1000000000,
    monto_max: 5000000000,
    plazo_meses: 48,
    requiere_cofinanciamiento: true,
    idioma: "en",
    faq_disponible: true,
    webinar_fecha: "2026-05-20T14:00:00Z",
    permite_adendas: true,
    bases_estado: "published",
    requiere_firma: true,
    tipos_solicitante: ["Organizacion"],
    checklist: ["Registro SAM.gov", "Dun & Bradstreet Number"],
    ambito: "Internacional",
    estadoPostulacion: "Próxima",
    viabilidadIICA: "Media",
    porcentajeViabilidad: 60,
    responsableIICA: "Hernán Chiriboga",
    region: "Chile y Cono Sur",
    objetivo: "Fortalecer la capacidad de respuesta de las comunidades rurales frente a eventos climáticos extremos y sequía prolongada.",
    descripcionIICA: "Proyecto de gran escala. IICA Chile lideraría el componente de implementación técnica en terreno. Requiere coordinación con la sede central para el registro SAM.gov.",
    requisitos: [
      "Registro SAM vigente",
      "Alianza con ONG internacional o centro de investigación",
      "Plan de monitoreo y evaluación bajo estándar USAID"
    ],
    fortalezas: [
      "Volumen de fondos muy alto",
      "Permite fortalecer la estructura institucional",
      "Impacto territorial masivo"
    ],
    debilidades: [
      "Muy alta complejidad administrativa (Reporting US government)",
      "Requiere preparación de 4-6 meses para la propuesta",
      "Requiere cofinanciamiento del 25% (valorizable)"
    ],
    notasInternas: "Estratégico a largo plazo. Informar a la Representación y a Sede Central para apoyo en registro SAM.gov.",
    ejeIICA: "Bioeconomía y cambio climático",
    complejidad: "Alta",
    rolIICA: "Ejecutor"
  },
  {
    id: 205,
    nombre: "Horizon Europe Cluster 6: Bioeconomía Forestal y Sostenibilidad Rural",
    institucion: "Unión Europea",
    monto: 9000000000,
    fecha_cierre: new Date("2026-09-22T00:00:00Z"),
    estado: "Próximo",
    categoria: "Internacional",
    url_bases: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home",
    regiones: ["Todas"],
    beneficiarios: ["Instituciones de investigación", "Organismos internacionales"],
    monto_min: 2000000000,
    monto_max: 10000000000,
    plazo_meses: 60,
    requiere_cofinanciamiento: false,
    idioma: "en",
    faq_disponible: true,
    webinar_fecha: "2026-06-10T10:00:00Z",
    permite_adendas: true,
    bases_estado: "published",
    requiere_firma: true,
    tipos_solicitante: ["Organizacion"],
    checklist: ["PIC Number IICA", "Audit report previa"],
    ambito: "Internacional",
    estadoPostulacion: "Próxima",
    viabilidadIICA: "Media",
    porcentajeViabilidad: 50,
    responsableIICA: "Ana Lía Gutiérrez",
    region: "América Latina y Europa",
    objetivo: "Desarrollar cadenas de valor de bioeconomía forestal compartidas entre Europa y América Latina.",
    descripcionIICA: "IICA Chile participa como socio regional estratégico (Partner). Un consorcio de universidades europeas lideraría la postulación. IICA valida la tecnología en Chile.",
    requisitos: [
      "Consorcio mínimo de 3 países europeos + IICA",
      "PIC Number habilitado",
      "Foco en innovación disruptiva"
    ],
    fortalezas: [
      "Fondo más prestigioso del mundo",
      "Financiamiento al 100% de costos directos",
      "Networking de primer nivel global"
    ],
    debilidades: [
      "Extrema competitividad (<10% éxito)",
      "IICA Chile no lidera el consorcio (socio)",
      "Requiere viajes y coordinación multinacional intensa"
    ],
    notasInternas: "Activar red de contactos con CSIC (España) o CIRAD (Francia) para entrar en consorcio. Ana Lía.",
    ejeIICA: "Innovación para la productividad",
    complejidad: "Alta",
    rolIICA: "Implementador"
  }
];

async function main() {
  console.log('Insertando nuevos proyectos específicos para IICA Chile...');
  
  for (const project of NEW_PROJECTS) {
    try {
      await prisma.project.upsert({
        where: { id: project.id },
        update: project,
        create: project
      });
      console.log(`✓ Proyecto ${project.id} insertado/actualizado: ${project.nombre}`);
    } catch (err) {
      console.error(`✗ Error en proyecto ${project.id}:`, err);
    }
  }

  console.log('Finalizado.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
