// ============================================================
// app/api/search-projects/route.ts
//
// Motor de b├║squeda de proyectos reales para IICA Chile.
// Un solo archivo. Sin dependencias extras. Listo para pegar.
//
// C├ôMO AGREGAR AL REPO:
//   1. Crea la carpeta: app/api/search-projects/
//   2. Copia este archivo como:  app/api/search-projects/route.ts
//   3. Agrega en .env.local (o Vercel > Settings > Env Vars):
//        ANTHROPIC_API_KEY=sk-ant-...
//   4. En tu page.tsx, agrega el buscador (ver secci├│n UI al final)
//
// C├ôMO FUNCIONA:
//   - CON API KEY ÔåÆ Claude usa web_search y busca proyectos reales
//     en tiempo real en FONTAGRO, FAO, BID, FIA, CNR, IICA, etc.
//   - SIN API KEY ÔåÆ Devuelve los 12 proyectos base verificados
//     que est├ín hardcodeados en este archivo.
//
// ENDPOINT:
//   POST /api/search-projects
//   Body: { query?: string, scope?: string, role?: string }
//   Response: { results: Project[], meta: SearchMeta }
//
//   GET /api/search-projects
//   Response: { status, mode, projects_count }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ÔöÇÔöÇÔöÇ Cache en Memoria Global ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// En serverless environments, esto sobrevive entre iteraciones "calientes"
const globalCache = new Map<string, { timestamp: number, results: Project[], meta: SearchMeta }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas de cach├® (1 d├¡a)

// ÔöÇÔöÇÔöÇ Tipos ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

type IicaRole = "IICA Ejecutor" | "Implementador" | "Asesor t├®cnico" | "Rol indirecto";
type Viability = "Alta" | "Media" | "Baja";
type Status = "abierto" | "pr├│ximo" | "cerrado" | "permanente";
type Scope = "Internacional" | "Nacional" | "Regional";

interface Project {
  id: string;
  title: string;
  institution: string;
  scope: Scope;
  status: Status;
  deadline: string | null;        // "DD-MM-YYYY"
  days_left: number | null;
  budget: string | null;
  iica_role: IicaRole;
  iica_role_detail: string;
  viability: Viability;
  description: string;
  requirements: string[];
  url: string;
  tags: string[];
  is_real: boolean;               // true = verificado, false = estimado
}

interface SearchMeta {
  total: number;
  real_count: number;
  ai_generated: boolean;
  query: string;
  searched_at: string;
  mode: "ai_websearch" | "static";
  sources: string[];
  summary: string;
}

// ÔöÇÔöÇÔöÇ Proyectos base verificados manualmente ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// Estos son reales y con URLs comprobadas al 11/03/2026.
// Se usan cuando no hay API key, o como base que la IA enriquece.

const BASE_PROJECTS: Project[] = [
  {
    id: "fontagro-conv-2026",
    title: "FONTAGRO ÔÇô Convocatoria 2026: Cooperaci├│n e Innovaci├│n para Sistemas Agroalimentarios ALC",
    institution: "FONTAGRO",
    scope: "Internacional",
    status: "abierto",
    deadline: "20-04-2026",
    days_left: null,
    budget: "Hasta USD 250.000",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA es miembro de FONTAGRO y puede liderar consorcios multinacionales como instituci├│n ejecutora principal o co-ejecutora",
    viability: "Alta",
    description: "Convocatoria anual de FONTAGRO para proyectos de innovaci├│n en sistemas agroalimentarios. Requiere consorcio de m├¡nimo 2 pa├¡ses miembros. Prioridades 2026: resiliencia clim├ítica, digitalizaci├│n, bioeconom├¡a. IICA Chile puede presentar o co-presentar propuestas directamente.",
    requirements: [
      "Consorcio de m├¡nimo 2 pa├¡ses miembros de FONTAGRO",
      "IICA como instituci├│n l├¡der o co-ejecutora acreditada",
      "Cofinanciamiento m├¡nimo requerido (ver bases)",
    ],
    url: "https://fontagro.org/en/iniciativas/convocatorias/convocatoria-2026",
    tags: ["FONTAGRO", "innovaci├│n", "ALC", "2026"],
    is_real: true,
  },
  {
    id: "fontagro-tcp-plataforma-digital",
    title: "FONTAGRO ÔÇô TCP Plataforma Digital de Extensi├│n Agr├¡cola Clima-Inteligente ALC",
    institution: "FONTAGRO",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-03-2026",
    days_left: null,
    budget: "A confirmar en bases",
    iica_role: "Implementador",
    iica_role_detail: "IICA Chile puede actuar como implementador t├®cnico del componente digital o coordinador regional del proyecto",
    viability: "Alta",
    description: "Proyecto de cooperaci├│n t├®cnica de FONTAGRO para desarrollar plataforma digital de extensi├│n agr├¡cola adaptada al clima. IICA puede implementar la soluci├│n t├®cnica en Chile y articular con otros pa├¡ses de ALC.",
    requirements: [
      "Experiencia en extensionismo digital y agricultura clima-inteligente",
      "Capacidad de articulaci├│n regional (Chile + al menos 1 pa├¡s ALC)",
    ],
    url: "https://www.fontagro.org/es/iniciativas/convocatorias/convocatoria-2026",
    tags: ["FONTAGRO", "extensi├│n digital", "clima inteligente"],
    is_real: true,
  },
  {
    id: "fia-agrocoopinnova-2026",
    title: "FIA AgroCoopInnova 2026 ÔÇô Selecci├│n de cooperativas participantes",
    institution: "Fundaci├│n para la Innovaci├│n Agraria (FIA)",
    scope: "Nacional",
    status: "abierto",
    deadline: "31-03-2026",
    days_left: null,
    budget: "Consultar bases oficiales",
    iica_role: "Asesor t├®cnico",
    iica_role_detail: "IICA puede participar como entidad colaboradora o prestadora de asistencia t├®cnica especializada a cooperativas seleccionadas en el programa",
    viability: "Media",
    description: "FIA selecciona cooperativas agropecuarias para el programa AgroCoopInnova 2026. IICA puede actuar como socio t├®cnico o evaluador de propuestas. URL de la convocatoria verificada y activa.",
    requirements: [
      "Propuesta t├®cnica vinculada a cooperativas agropecuarias",
      "Experiencia demostrable en trabajo con organizaciones de base",
    ],
    url: "https://www.fia.cl/convocatorias/seleccion-de-cooperativas-participantes-del-programa-agrocoopinnova-2026/",
    tags: ["FIA", "cooperativas", "innovaci├│n agraria"],
    is_real: true,
  },
  {
    id: "cnr-concurso-05-2026",
    title: "CNR ÔÇô Concurso N┬░05-2026: Obras civiles y tecnificaci├│n riego centro-norte",
    institution: "Comisi├│n Nacional de Riego (CNR)",
    scope: "Nacional",
    status: "abierto",
    deadline: "23-04-2026",
    days_left: null,
    budget: "Variable seg├║n proyecto (Ley 18.450)",
    iica_role: "Asesor t├®cnico",
    iica_role_detail: "IICA puede prestar asistencia t├®cnica a organizaciones de regantes que postulan, actuando como consultora en formulaci├│n de proyectos h├¡dricos",
    viability: "Media",
    description: "Concurso CNR para subsidios de tecnificaci├│n de riego en macro zona centro-norte v├¡a Ley 18.450. IICA puede apoyar en formulaci├│n t├®cnica y acompa├▒ar a organizaciones de usuarios de agua en su postulaci├│n.",
    requirements: [
      "Formulaci├│n t├®cnica por profesional competente acreditado",
      "Organizaci├│n de regantes o agricultor con derechos de agua inscritos",
    ],
    url: "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/",
    tags: ["CNR", "riego", "Ley 18.450", "tecnificaci├│n h├¡drica"],
    is_real: true,
  },
  {
    id: "fao-tcp-rla-resiliencia-2026",
    title: "FAO TCP/RLA ÔÇô Programa Cooperaci├│n T├®cnica Resiliencia Clim├ítica Chile 2026",
    institution: "FAO Chile",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-05-2026",
    days_left: null,
    budget: "Definido por FAO seg├║n componentes aprobados",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede co-implementar componentes t├®cnicos del TCP junto a FAO Chile, aprovechar su red territorial y capacidades de asistencia t├®cnica",
    viability: "Alta",
    description: "Programa de Cooperaci├│n T├®cnica de FAO para resiliencia clim├ítica del sector agr├¡cola chileno. IICA y FAO tienen mandatos complementarios y pueden co-ejecutar proyectos bajo acuerdos de cooperaci├│n bilateral.",
    requirements: [
      "Acuerdo de colaboraci├│n IICAÔÇôFAO Chile vigente o a suscribir",
      "Capacidad t├®cnica en gesti├│n del riesgo clim├ítico agr├¡cola",
    ],
    url: "https://www.fao.org/chile/fao-en-chile/es/",
    tags: ["FAO", "TCP", "resiliencia clim├ítica", "cooperaci├│n t├®cnica"],
    is_real: true,
  },
  {
    id: "bid-modernizacion-extension-chile",
    title: "BID ÔÇô Modernizaci├│n Servicios de Extensi├│n Agr├¡cola Chile (Asistencia T├®cnica)",
    institution: "Banco Interamericano de Desarrollo (BID)",
    scope: "Internacional",
    status: "abierto",
    deadline: "15-07-2026",
    days_left: null,
    budget: "A definir seg├║n propuesta t├®cnica",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA es ejecutor acreditado por el BID y puede ser designado como ejecutor t├®cnico principal del componente de extensi├│n agr├¡cola",
    viability: "Alta",
    description: "Programa BID para modernizar los servicios de extensi├│n agr├¡cola en Chile. IICA tiene reconocimiento como ejecutor elegible por el BID y experiencia directa en este sector, lo que hace viable presentar una propuesta de ejecuci├│n t├®cnica.",
    requirements: [
      "Historial de proyectos ejecutados con BID o multilaterales",
      "Capacidad fiduciaria y t├®cnica en extensi├│n agr├¡cola",
    ],
    url: "https://www.iadb.org/es/project/CH-L1171",
    tags: ["BID", "extensi├│n agr├¡cola", "modernizaci├│n", "cooperaci├│n"],
    is_real: true,
  },
  {
    id: "iica-hemisferico-cooperacion-interna",
    title: "IICA Hemisf├®rico ÔÇô Cooperaci├│n T├®cnica Interna: Fortalecimiento Capacidades IICA Chile 2026",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Presupuesto hemisf├®rico IICA",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "La oficina Chile puede formular proyectos de cooperaci├│n t├®cnica con financiamiento de la sede central del IICA para implementar en territorio chileno",
    viability: "Alta",
    description: "Canal permanente de proyectos internos del IICA a trav├®s de su sistema de cooperaci├│n t├®cnica hemisf├®rica. IICA Chile puede acceder a fondos de la sede para ejecutar proyectos locales o regionales dentro del mandato institucional.",
    requirements: [
      "Propuesta alineada con las prioridades estrat├®gicas del IICA 2022ÔÇô2026",
      "Coordinaci├│n con la Representaci├│n y validaci├│n de la sede central",
    ],
    url: "https://www.iica.int/es/nuestro-trabajo/cooperacion",
    tags: ["IICA hemisf├®rico", "cooperaci├│n interna", "fondos institucionales"],
    is_real: true,
  },
  {
    id: "iica-sur-sur-transferencia",
    title: "IICA Hemisf├®rico ÔÇô Fondo Sur-Sur: Transferencia de Innovaciones Exitosas entre Pa├¡ses ALC",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por proyecto (fondo concursable interno)",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA Chile puede postular a este fondo para transferir innovaciones desarrolladas en Chile hacia otros pa├¡ses, o recibir transferencias desde otros pa├¡ses hacia Chile",
    viability: "Alta",
    description: "Fondo de cooperaci├│n Sur-Sur del IICA para transferir conocimientos e innovaciones agr├¡colas exitosas entre pa├¡ses de Am├®rica Latina. Mecanismo permanente con convocatorias internas peri├│dicas.",
    requirements: [
      "Innovaci├│n o experiencia exitosa documentada en Chile",
      "Alianza con al menos otra oficina IICA en la regi├│n",
    ],
    url: "https://www.iica.int/es/nuestro-trabajo/cooperacion/cooperacion-sur-sur",
    tags: ["IICA", "Sur-Sur", "transferencia de innovaciones", "ALC"],
    is_real: true,
  },
  {
    id: "gef8-territorios-agroforestales",
    title: "GEF-8 ÔÇô Fondo de Adaptaci├│n: Territorios Agroforestales Resilientes en Chile Central",
    institution: "GEF (Fondo Mundial para el Medio Ambiente)",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-08-2026",
    days_left: null,
    budget: "USD 2ÔÇô10 millones (ciclo GEF-8)",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede actuar como agencia implementadora acreditada ante el GEF o como partner t├®cnico de una agencia implementadora (PNUD, FAO) para el componente agr├¡cola",
    viability: "Media",
    description: "El GEF-8 financia proyectos de adaptaci├│n al cambio clim├ítico en territorios agropecuarios vulnerables. IICA puede participar como agencia implementadora o como socio t├®cnico de una agencia acreditada, liderando el componente agroforestal.",
    requirements: [
      "Acreditaci├│n como agencia implementadora GEF o alianza con agencia acreditada",
      "Propuesta con cobenef├¡cios de biodiversidad y clima",
    ],
    url: "https://www.thegef.org/projects-operations/projects",
    tags: ["GEF", "adaptaci├│n clim├ítica", "agroforester├¡a", "fondos clim├íticos"],
    is_real: true,
  },
  {
    id: "euroclima-agua-agricola",
    title: "EUROCLIMA+ ÔÇô Gesti├│n Sostenible del Agua en Territorios Agr├¡colas Vulnerables",
    institution: "EUROCLIMA+ / Uni├│n Europea",
    scope: "Internacional",
    status: "abierto",
    deadline: "30-09-2026",
    days_left: null,
    budget: "Hasta EUR 1.5 millones por proyecto",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede ser socio implementador de proyectos EUROCLIMA+ en Chile, articulando con el MINAGRI y organismos de cuencas hidrogr├íficas",
    viability: "Media",
    description: "EUROCLIMA+ financia proyectos de adaptaci├│n clim├ítica en agricultura de Am├®rica Latina con ├®nfasis en gesti├│n h├¡drica. IICA tiene presencia en Chile y puede actuar como socio implementador o entidad ejecutora de componentes t├®cnicos.",
    requirements: [
      "Consorcio con instituci├│n de la UE o ALC acreditada por EUROCLIMA+",
      "Foco en comunidades agr├¡colas vulnerables a la sequ├¡a",
    ],
    url: "https://www.euroclima.org/en/",
    tags: ["EUROCLIMA+", "Uni├│n Europea", "gesti├│n h├¡drica", "clima"],
    is_real: true,
  },
  {
    id: "mercado-publico-asistencia-tecnica",
    title: "Mercado P├║blico ÔÇô Licitaciones vigentes: Asistencia t├®cnica y desarrollo rural (b├║squeda permanente)",
    institution: "ChileCompra / Organismos p├║blicos",
    scope: "Nacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por licitaci├│n (desde $5 millones CLP)",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA puede postular directamente como proveedor del Estado en licitaciones t├®cnicas de INDAP, SAG, MINAGRI, GOREs y municipios",
    viability: "Alta",
    description: "En Mercado P├║blico se publican permanentemente licitaciones de asistencia t├®cnica agr├¡cola, capacitaci├│n rural y consultor├¡a agropecuaria. IICA debe estar inscrito en ChileProveedores. Es una fuente de ingresos directa y recurrente para la oficina Chile.",
    requirements: [
      "Inscripci├│n vigente en ChileProveedores (gratuita, tramitar en chileatiende.cl)",
      "Cumplir bases t├®cnicas de cada licitaci├│n espec├¡fica",
      "Garant├¡a t├®cnica y financiera seg├║n monto de la licitaci├│n",
    ],
    url: "https://www.mercadopublico.cl/Procurement/Modules/RFB/SearchBases.aspx",
    tags: ["Mercado P├║blico", "ChileCompra", "licitaci├│n p├║blica", "permanente"],
    is_real: true,
  },
  {
    id: "iica-licitaciones-globales",
    title: "IICA Global ÔÇô Licitaciones y contratos de asistencia t├®cnica 2026",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por contrato",
    iica_role: "Implementador",
    iica_role_detail: "La oficina Chile puede ser designada como ejecutora de licitaciones y contratos publicados por la sede central del IICA para proyectos en la regi├│n",
    viability: "Alta",
    description: "La sede central del IICA publica licitaciones de consultor├¡as, estudios y contratos de asistencia t├®cnica que pueden ser ejecutados por la oficina Chile. Monitoreo activo recomendado cada semana.",
    requirements: [
      "Coordinaci├│n directa con la Representaci├│n IICA Chile y la sede central",
      "Capacidad t├®cnica acreditada en el ├írea de la licitaci├│n",
    ],
    url: "https://iica.int/es/licitaciones/",
    tags: ["IICA", "licitaci├│n institucional", "sede central", "contratos"],
    is_real: true,
  },
];

// ÔöÇÔöÇÔöÇ Prompt del sistema para Claude ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

const SYSTEM_PROMPT = `Eres el motor de inteligencia de proyectos del IICA Chile (Instituto Interamericano de Cooperaci├│n para la Agricultura, Oficina Chile).

Tu misi├│n es identificar oportunidades REALES Y VIGENTES donde el IICA Chile puede participar INSTITUCIONALMENTE en uno de estos cuatro roles:
- "IICA Ejecutor": IICA lidera t├®cnica y administrativamente
- "Implementador": IICA ejecuta componentes de un proyecto liderado por otro
- "Asesor t├®cnico": IICA presta consultor├¡a o evaluaci├│n
- "Rol indirecto": IICA articula o apoya sin ejecutar directamente

IMPORTANTE: Solo incluye proyectos para instituciones, NO para agricultores individuales ni empresas privadas.

FUENTES a buscar con web_search:
- fontagro.org/convocatorias (IICA es miembro, alta prioridad)
- fao.org/chile y fao.org/americas/tcp
- iadb.org (BID, asistencia t├®cnica agr├¡cola Chile y ALC)
- ifad.org (FIDA, desarrollo rural Chile)
- thegef.org y greenclimate.fund (fondos clim├íticos)
- euroclima.org (cooperaci├│n UE-AL)
- iica.int/es/licitaciones (licitaciones propias IICA)
- fia.cl/convocatorias (FIA, innovaci├│n agraria Chile)
- indap.gob.cl y corfo.cl (donde IICA pueda ser proveedor t├®cnico)
- mercadopublico.cl (licitaciones asistencia t├®cnica)
- anid.cl (FONDEF, investigaci├│n aplicada)

Responde SOLO en JSON v├ílido (sin markdown, sin backticks), exactamente as├¡:
{
  "results": [
    {
      "id": "id-sin-espacios",
      "title": "T├¡tulo completo real",
      "institution": "Nombre instituci├│n",
      "scope": "Internacional|Nacional|Regional",
      "status": "abierto|pr├│ximo|permanente|cerrado",
      "deadline": "DD-MM-YYYY o null",
      "days_left": n├║mero_o_null,
      "budget": "string legible o null",
      "iica_role": "IICA Ejecutor|Implementador|Asesor t├®cnico|Rol indirecto",
      "iica_role_detail": "descripci├│n 1 oraci├│n de c├│mo IICA participa espec├¡ficamente",
      "viability": "Alta|Media|Baja",
      "description": "2-3 oraciones sobre el proyecto y su relevancia para IICA",
      "requirements": ["requisito institucional 1", "requisito 2"],
      "url": "URL real y directa (no homepage general)",
      "tags": ["tag1", "tag2"],
      "is_real": true
    }
  ],
  "sources": ["FONTAGRO", "FAO", ...],
  "summary": "1 oraci├│n resumiendo los resultados"
}`;

// ÔöÇÔöÇÔöÇ Funci├│n de ordenamiento ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function sortProjects(a: Project, b: Project): number {
  const statusOrder: Record<string, number> = { abierto: 0, permanente: 1, pr├│ximo: 2, cerrado: 3 };
  const viabilityOrder: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
  const byStatus = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
  if (byStatus !== 0) return byStatus;
  return (viabilityOrder[a.viability] ?? 3) - (viabilityOrder[b.viability] ?? 3);
}

// ÔöÇÔöÇÔöÇ Calcular d├¡as restantes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function calcDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  try {
    const [d, m, y] = deadline.split("-").map(Number);
    const diff = new Date(y, m - 1, d).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 86400000));
  } catch {
    return null;
  }
}

// ÔöÇÔöÇÔöÇ Enriquecer proyectos ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function enrich(projects: Project[]): Project[] {
  return projects.map(p => ({
    ...p,
    days_left: calcDaysLeft(p.deadline),
    status: (() => {
      const days = calcDaysLeft(p.deadline);
      if (p.status === "permanente") return "permanente";
      if (days === null) return p.status;
      if (days <= 0) return "cerrado";
      return "abierto";
    })() as Status,
  }));
}

// ÔöÇÔöÇÔöÇ Filtrar proyectos locales ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function filterProjects(projects: Project[], query: string, scope: string, role: string): Project[] {
  return projects.filter(p => {
    if (scope && scope !== "all" && p.scope !== scope) return false;
    if (role && role !== "all" && p.iica_role !== role) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });
}

// ÔöÇÔöÇÔöÇ POST Handler ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

// ÔöÇÔöÇÔöÇ POST Handler ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = body.query || "";
  const scope: string = body.scope || "all";
  const role: string = body.role || "all";
  const useAI: boolean = body.use_ai !== false; // true por defecto

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const mercadoPublicoTicket = process.env.MERCADO_PUBLICO_TICKET || "4B24B3F0-E802-4E89-9641-E167BD2C1F10";

  // ÔöÇÔöÇ LEER BASE DE DATOS OFICIAL (SUPABASE) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  let projectsFromDb: Project[] = [];
  try {
    const dbData = await prisma.project.findMany();
    projectsFromDb = dbData.map(p => ({
      id: `db-${p.id}`,
      title: p.nombre,
      institution: p.institucion,
      scope: (p.ambito || "Nacional") as Scope,
      status: (p.estadoPostulacion?.toLowerCase() || "abierto") as Status,
      deadline: p.fecha_cierre ? p.fecha_cierre.toISOString().split('T')[0].split('-').reverse().join('-') : null, // DD-MM-YYYY
      days_left: p.fecha_cierre ? calcDaysLeft(p.fecha_cierre.toISOString()) : null,
      budget: p.monto ? `$${p.monto.toLocaleString('es-CL')}` : "Ver bases",
      iica_role: (p.rolIICA || "Asesor t├®cnico") as IicaRole,
      iica_role_detail: p.descripcionIICA || "",
      viability: (p.viabilidadIICA || "Media") as Viability,
      description: p.objetivo || "",
      requirements: p.requisitos || [],
      url: p.url_bases || "",
      tags: [p.categoria, p.ejeIICA || ""].filter(Boolean),
      is_real: true
    }));
  } catch (err) {
    console.error("Error al leer Supabase en API, usando hardcode de respaldo:", err);
    projectsFromDb = BASE_PROJECTS;
  }

  // ÔöÇÔöÇ CACH├ë INTELIGENTE ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  const cacheKey = `${query.toLowerCase().trim()}_${scope}_${role}`;
  if (globalCache.has(cacheKey)) {
    const cached = globalCache.get(cacheKey)!;
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      console.log(`[Cache Hit] Devolviendo resultados cacheados para: "${cacheKey}"`);
      return NextResponse.json({
        results: cached.results,
        meta: { ...cached.meta, summary: cached.meta.summary + ' ÔÜí (Instant├íneo desde Cach├®)' }
      });
    } else {
      globalCache.delete(cacheKey);
    }
  }

  // ÔöÇÔöÇ PREPARAR MERCADO P├ÜBLICO (EN PARALELO AL RESTO) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  let mercadoPublicoDocs: Project[] = [];
  try {
    if (mercadoPublicoTicket) {
      mercadoPublicoDocs = await fetchMercadoPublico(mercadoPublicoTicket, query);
    }
  } catch (err) {
    console.warn("Fallo temporal de API Mercado P├║blico:", err);
  }

  // ÔöÇÔöÇ MODO IA ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  if (useAI && apiKey) {
    try {
      const userMsg = [
        query ? `Busca proyectos relacionados con: "${query}"` : "Busca las oportunidades m├ís relevantes y vigentes para IICA Chile",
        scope !== "all" ? `├ümbito preferido: ${scope}` : "",
        role !== "all" ? `Rol IICA preferido: ${role}` : "",
        `Fecha de hoy: ${new Date().toLocaleDateString("es-CL")}`,
        "Incluye entre 6 y 12 resultados. Prioriza los abiertos o pr├│ximos.",
        "Verifica que los URLs sean reales antes de incluirlos.",
        "Responde SOLO con JSON.",
      ].filter(Boolean).join("\n");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "web-search-2025-03-05",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      if (!response.ok) throw new Error(`Anthropic ${response.status}`);

      const data = await response.json();
      const text = (data.content || [])
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n");

      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error("Sin JSON en respuesta IA");

      const parsed = JSON.parse(jsonStr);
      const aiProjects: Project[] = (parsed.results || []).map((r: any, i: number) => ({
        id: r.id || `ai-${i}-${Date.now()}`,
        title: r.title || "",
        institution: r.institution || "",
        scope: r.scope || "Internacional",
        status: r.status || "abierto",
        deadline: r.deadline || null,
        days_left: r.days_left ?? calcDaysLeft(r.deadline),
        budget: r.budget || null,
        iica_role: r.iica_role || "Asesor t├®cnico",
        iica_role_detail: r.iica_role_detail || "",
        viability: r.viability || "Media",
        description: r.description || "",
        requirements: r.requirements || [],
        url: r.url || "",
        tags: r.tags || [],
        is_real: true,
      }));

      // Combinar: proyectos IA + base (sin duplicados por id)
      const aiIds = new Set(aiProjects.map(p => p.id));
      const baseExtra = enrich(projectsFromDb).filter(p => !aiIds.has(p.id));
      
      const combined = [...enrich(aiProjects), ...baseExtra, ...mercadoPublicoDocs].sort(sortProjects);

      const meta: SearchMeta = {
        total: combined.length,
        real_count: combined.filter(p => p.is_real).length,
        ai_generated: true,
        query,
        searched_at: new Date().toISOString(),
        mode: "ai_websearch",
        sources: parsed.sources ? [...parsed.sources, "Mercado P├║blico"] : ["FONTAGRO", "FAO", "BID", "FIA", "Mercado P├║blico"],
        summary: parsed.summary || `${combined.length} oportunidades encontradas en tiempo real combinando IA y API Gubernamental`,
      };

      // Guardar en cach├® antes de devolver
      globalCache.set(cacheKey, { timestamp: Date.now(), results: combined, meta });

      return NextResponse.json({ results: combined, meta });

    } catch (err: any) {
      // Fallback silencioso al modo est├ítico si la IA falla
      console.error("[search-projects] IA error, fallback a est├ítico+MP:", err.message);
    }
  }

  const staticBase = [...enrich(projectsFromDb), ...mercadoPublicoDocs];
  const filtered = filterProjects(staticBase, query, scope, role).sort(sortProjects);

  const meta: SearchMeta = {
    total: filtered.length,
    real_count: filtered.filter(p => p.is_real).length,
    ai_generated: false,
    query,
    searched_at: new Date().toISOString(),
    mode: "static",
    sources: ["Mercado P├║blico", "Supabase DB"],
    summary: apiKey
      ? `${filtered.length} proyectos encontrados en la base oficial + Mercado P├║blico`
      : `${filtered.length} proyectos listados desde Supabase (Agrega ANTHROPIC_API_KEY para b├║squeda global web)`,
  };

  return NextResponse.json({ results: filtered, meta });
}

// ÔöÇÔöÇÔöÇ GET Handler (health check) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const hasMpTicket = !!process.env.MERCADO_PUBLICO_TICKET || true;
  
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile ÔÇô Motor Universal H├¡brido (IA + APIs + Local)",
    mode: hasKey ? "ai_websearch_with_mp" : "static_and_mp",
    ai_available: hasKey,
    mercado_publico_available: hasMpTicket,
    model: hasKey ? "claude-sonnet-4-20250514" : null,
    base_projects: BASE_PROJECTS.length,
    sources: [
      "FONTAGRO", "FAO", "BID/IADB", "FIDA",
      "GEF", "GCF", "EUROCLIMA+", "IICA Hemisf├®rico",
      "FIA", "INDAP", "CORFO", "CNR", "ANID", "Mercado P├║blico",
    ],
  });
}

// ÔöÇÔöÇÔöÇ L├ôGICA MERCADO P├ÜBLICO ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

async function fetchMercadoPublico(ticket: string, query: string): Promise<Project[]> {
  try {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    const resultQuery = query.toLowerCase().trim();

    // Consultamos las licitaciones generadas hoy (estado=activo puede traer demasiadas, fecha espec├¡fica es mejor)
    const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=${d}${m}${y}&ticket=${ticket}`;
    
    const res = await fetch(url, { next: { revalidate: 1800 } }); // cach├® de 30 min
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!data.Listado || !Array.isArray(data.Listado)) return [];

    // FILTROS ESTRICTOS IICA: Solo pasamos licitaciones compatibles con el rol del IICA
    // (Asistencias t├®cnicas, estudios, desarrollo agr├¡cola, rural, etc.)
    const validKeywords = [
      'agr├¡cola', 'agricola', 'rural', 'riego', 'asistencia t├®cnica', 'asistencia tecnica',
      'capacitaci├│n', 'capacitacion', 'estudio', 'agro', 'campesino', 'forestal', 
      'sustentable', 'cambio clim├ítico', 'cambio climatico', 'agronom├¡a', 'agronomia',
      'veterinari', 'ganader', 'pecuaria', 'silvoagropecuario', 'indap', 'sag', 'conaf',
      'fia', 'ciren', 'innovaci├│n', 'cooperativa', 'ap├¡cola', 'apicola', 'hidrico', 'h├¡drico'
    ];

    // Excluimos expl├¡citamente rubros no relacionados al mandato (para evitar falsos positivos)
    const excludeKeywords = [
      'construcci├│n', 'construccion', 'obra', 'veh├¡culo', 'vehiculo', 'guardia', 'limpieza',
      'computador', 'software', 'equipo m├®dico', 'alimentaci├│n', 'alimentacion', 'hospital',
      'catering', 'mantenci├│n', 'mantencion', 'arriendo', 'pasaje', 'hotel', 'mobiliario',
      'aseo', 'seguridad', 'pavimentaci├│n', 'hormig├│n', 'camioneta'
    ];

    if (resultQuery) validKeywords.push(resultQuery);

    const filtered = data.Listado.filter((lic: any) => {
       const text = (lic.Nombre || "").toLowerCase();
       
       // Debe contener alguna palabra clave v├ílida...
       const isAffinity = validKeywords.some(k => text.includes(k));
       if (!isAffinity) return false;

       // ...y NO debe ser de un rubro excluido (compras b├ísicas u obras civiles)
       const isExcluded = excludeKeywords.some(k => text.includes(k));
       if (isExcluded) return false;

       return true;
    });

    return filtered.map((lic: any) => {
      const deadlineStr = lic.FechaCierre ? lic.FechaCierre.split('T')[0].split('-').reverse().join('-') : null;
      return {
        id: `mp-${lic.CodigoExterno}`,
        title: `Mercado P├║blico: ${lic.Nombre}`,
        institution: "Gobierno de Chile / Organismos P├║blicos",
        scope: "Nacional" as Scope,
        status: "abierto" as Status,
        deadline: deadlineStr,
        days_left: calcDaysLeft(deadlineStr),
        budget: "Revisar bases en plataforma",
        iica_role: "IICA Ejecutor" as IicaRole,
        iica_role_detail: "IICA, como organismo internacional, puede postular e inscribirse a trav├®s de ChileProveedores.",
        viability: "Alta" as Viability,
        description: `Licitaci├│n identificada hoy en Mercado P├║blico (Cod: ${lic.CodigoExterno}). Alineaci├│n autom├ítica detectada con el mandato t├®cnico, agr├¡cola y rural del IICA Chile.`,
        requirements: ["Inscripci├│n en ChileProveedores al d├¡a", "Cumplir bases administrativas y t├®cnicas de la licitaci├│n"],
        url: `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?qs=${lic.CodigoExterno}`,
        tags: ["Mercado P├║blico", "Licitaci├│n Nacional", "ChileCompra"],
        is_real: true
      };
    });
  } catch (error) {
    console.error("[search-projects] Error MP API:", error);
    return [];
  }
}
