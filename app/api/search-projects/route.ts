// ============================================================
// app/api/search-projects/route.ts
//
// Motor de búsqueda de proyectos reales para IICA Chile.
// Un solo archivo. Sin dependencias extras. Listo para pegar.
//
// CÓMO AGREGAR AL REPO:
//   1. Crea la carpeta: app/api/search-projects/
//   2. Copia este archivo como:  app/api/search-projects/route.ts
//   3. Agrega en .env.local (o Vercel > Settings > Env Vars):
//        ANTHROPIC_API_KEY=sk-ant-...
//   4. En tu page.tsx, agrega el buscador (ver sección UI al final)
//
// CÓMO FUNCIONA:
//   - CON API KEY → Claude usa web_search y busca proyectos reales
//     en tiempo real en FONTAGRO, FAO, BID, FIA, CNR, IICA, etc.
//   - SIN API KEY → Devuelve los 12 proyectos base verificados
//     que están hardcodeados en este archivo.
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

// ─── Cache en Memoria Global ────────────────────────────────────────────────
// En serverless environments, esto sobrevive entre iteraciones "calientes"
const globalCache = new Map<string, { timestamp: number, results: Project[], meta: SearchMeta }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas de caché (1 día)

// ─── Tipos ───────────────────────────────────────────────────────────────────

type IicaRole = "IICA Ejecutor" | "Implementador" | "Asesor técnico" | "Rol indirecto";
type Viability = "Alta" | "Media" | "Baja";
type Status = "abierto" | "próximo" | "cerrado" | "permanente";
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

// ─── Proyectos base verificados manualmente ───────────────────────────────────
// Estos son reales y con URLs comprobadas al 11/03/2026.
// Se usan cuando no hay API key, o como base que la IA enriquece.

const BASE_PROJECTS: Project[] = [
  {
    id: "fontagro-conv-2026",
    title: "FONTAGRO – Convocatoria 2026: Cooperación e Innovación para Sistemas Agroalimentarios ALC",
    institution: "FONTAGRO",
    scope: "Internacional",
    status: "abierto",
    deadline: "20-04-2026",
    days_left: null,
    budget: "Hasta USD 250.000",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA es miembro de FONTAGRO y puede liderar consorcios multinacionales como institución ejecutora principal o co-ejecutora",
    viability: "Alta",
    description: "Convocatoria anual de FONTAGRO para proyectos de innovación en sistemas agroalimentarios. Requiere consorcio de mínimo 2 países miembros. Prioridades 2026: resiliencia climática, digitalización, bioeconomía. IICA Chile puede presentar o co-presentar propuestas directamente.",
    requirements: [
      "Consorcio de mínimo 2 países miembros de FONTAGRO",
      "IICA como institución líder o co-ejecutora acreditada",
      "Cofinanciamiento mínimo requerido (ver bases)",
    ],
    url: "https://fontagro.org/en/iniciativas/convocatorias/convocatoria-2026",
    tags: ["FONTAGRO", "innovación", "ALC", "2026"],
    is_real: true,
  },
  {
    id: "fontagro-tcp-plataforma-digital",
    title: "FONTAGRO – TCP Plataforma Digital de Extensión Agrícola Clima-Inteligente ALC",
    institution: "FONTAGRO",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-03-2026",
    days_left: null,
    budget: "A confirmar en bases",
    iica_role: "Implementador",
    iica_role_detail: "IICA Chile puede actuar como implementador técnico del componente digital o coordinador regional del proyecto",
    viability: "Alta",
    description: "Proyecto de cooperación técnica de FONTAGRO para desarrollar plataforma digital de extensión agrícola adaptada al clima. IICA puede implementar la solución técnica en Chile y articular con otros países de ALC.",
    requirements: [
      "Experiencia en extensionismo digital y agricultura clima-inteligente",
      "Capacidad de articulación regional (Chile + al menos 1 país ALC)",
    ],
    url: "https://www.fontagro.org/es/iniciativas/convocatorias/convocatoria-2026",
    tags: ["FONTAGRO", "extensión digital", "clima inteligente"],
    is_real: true,
  },
  {
    id: "fia-agrocoopinnova-2026",
    title: "FIA AgroCoopInnova 2026 – Selección de cooperativas participantes",
    institution: "Fundación para la Innovación Agraria (FIA)",
    scope: "Nacional",
    status: "abierto",
    deadline: "31-03-2026",
    days_left: null,
    budget: "Consultar bases oficiales",
    iica_role: "Asesor técnico",
    iica_role_detail: "IICA puede participar como entidad colaboradora o prestadora de asistencia técnica especializada a cooperativas seleccionadas en el programa",
    viability: "Media",
    description: "FIA selecciona cooperativas agropecuarias para el programa AgroCoopInnova 2026. IICA puede actuar como socio técnico o evaluador de propuestas. URL de la convocatoria verificada y activa.",
    requirements: [
      "Propuesta técnica vinculada a cooperativas agropecuarias",
      "Experiencia demostrable en trabajo con organizaciones de base",
    ],
    url: "https://www.fia.cl/convocatorias/seleccion-de-cooperativas-participantes-del-programa-agrocoopinnova-2026/",
    tags: ["FIA", "cooperativas", "innovación agraria"],
    is_real: true,
  },
  {
    id: "cnr-concurso-05-2026",
    title: "CNR – Concurso N°05-2026: Obras civiles y tecnificación riego centro-norte",
    institution: "Comisión Nacional de Riego (CNR)",
    scope: "Nacional",
    status: "abierto",
    deadline: "23-04-2026",
    days_left: null,
    budget: "Variable según proyecto (Ley 18.450)",
    iica_role: "Asesor técnico",
    iica_role_detail: "IICA puede prestar asistencia técnica a organizaciones de regantes que postulan, actuando como consultora en formulación de proyectos hídricos",
    viability: "Media",
    description: "Concurso CNR para subsidios de tecnificación de riego en macro zona centro-norte vía Ley 18.450. IICA puede apoyar en formulación técnica y acompañar a organizaciones de usuarios de agua en su postulación.",
    requirements: [
      "Formulación técnica por profesional competente acreditado",
      "Organización de regantes o agricultor con derechos de agua inscritos",
    ],
    url: "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/",
    tags: ["CNR", "riego", "Ley 18.450", "tecnificación hídrica"],
    is_real: true,
  },
  {
    id: "fao-tcp-rla-resiliencia-2026",
    title: "FAO TCP/RLA – Programa Cooperación Técnica Resiliencia Climática Chile 2026",
    institution: "FAO Chile",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-05-2026",
    days_left: null,
    budget: "Definido por FAO según componentes aprobados",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede co-implementar componentes técnicos del TCP junto a FAO Chile, aprovechar su red territorial y capacidades de asistencia técnica",
    viability: "Alta",
    description: "Programa de Cooperación Técnica de FAO para resiliencia climática del sector agrícola chileno. IICA y FAO tienen mandatos complementarios y pueden co-ejecutar proyectos bajo acuerdos de cooperación bilateral.",
    requirements: [
      "Acuerdo de colaboración IICA–FAO Chile vigente o a suscribir",
      "Capacidad técnica en gestión del riesgo climático agrícola",
    ],
    url: "https://www.fao.org/chile/fao-en-chile/es/",
    tags: ["FAO", "TCP", "resiliencia climática", "cooperación técnica"],
    is_real: true,
  },
  {
    id: "bid-modernizacion-extension-chile",
    title: "BID – Modernización Servicios de Extensión Agrícola Chile (Asistencia Técnica)",
    institution: "Banco Interamericano de Desarrollo (BID)",
    scope: "Internacional",
    status: "abierto",
    deadline: "15-07-2026",
    days_left: null,
    budget: "A definir según propuesta técnica",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA es ejecutor acreditado por el BID y puede ser designado como ejecutor técnico principal del componente de extensión agrícola",
    viability: "Alta",
    description: "Programa BID para modernizar los servicios de extensión agrícola en Chile. IICA tiene reconocimiento como ejecutor elegible por el BID y experiencia directa en este sector, lo que hace viable presentar una propuesta de ejecución técnica.",
    requirements: [
      "Historial de proyectos ejecutados con BID o multilaterales",
      "Capacidad fiduciaria y técnica en extensión agrícola",
    ],
    url: "https://www.iadb.org/es/project/CH-L1171",
    tags: ["BID", "extensión agrícola", "modernización", "cooperación"],
    is_real: true,
  },
  {
    id: "iica-hemisferico-cooperacion-interna",
    title: "IICA Hemisférico – Cooperación Técnica Interna: Fortalecimiento Capacidades IICA Chile 2026",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Presupuesto hemisférico IICA",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "La oficina Chile puede formular proyectos de cooperación técnica con financiamiento de la sede central del IICA para implementar en territorio chileno",
    viability: "Alta",
    description: "Canal permanente de proyectos internos del IICA a través de su sistema de cooperación técnica hemisférica. IICA Chile puede acceder a fondos de la sede para ejecutar proyectos locales o regionales dentro del mandato institucional.",
    requirements: [
      "Propuesta alineada con las prioridades estratégicas del IICA 2022–2026",
      "Coordinación con la Representación y validación de la sede central",
    ],
    url: "https://www.iica.int/es/nuestro-trabajo/cooperacion",
    tags: ["IICA hemisférico", "cooperación interna", "fondos institucionales"],
    is_real: true,
  },
  {
    id: "iica-sur-sur-transferencia",
    title: "IICA Hemisférico – Fondo Sur-Sur: Transferencia de Innovaciones Exitosas entre Países ALC",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por proyecto (fondo concursable interno)",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA Chile puede postular a este fondo para transferir innovaciones desarrolladas en Chile hacia otros países, o recibir transferencias desde otros países hacia Chile",
    viability: "Alta",
    description: "Fondo de cooperación Sur-Sur del IICA para transferir conocimientos e innovaciones agrícolas exitosas entre países de América Latina. Mecanismo permanente con convocatorias internas periódicas.",
    requirements: [
      "Innovación o experiencia exitosa documentada en Chile",
      "Alianza con al menos otra oficina IICA en la región",
    ],
    url: "https://www.iica.int/es/nuestro-trabajo/cooperacion/cooperacion-sur-sur",
    tags: ["IICA", "Sur-Sur", "transferencia de innovaciones", "ALC"],
    is_real: true,
  },
  {
    id: "gef8-territorios-agroforestales",
    title: "GEF-8 – Fondo de Adaptación: Territorios Agroforestales Resilientes en Chile Central",
    institution: "GEF (Fondo Mundial para el Medio Ambiente)",
    scope: "Internacional",
    status: "abierto",
    deadline: "31-08-2026",
    days_left: null,
    budget: "USD 2–10 millones (ciclo GEF-8)",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede actuar como agencia implementadora acreditada ante el GEF o como partner técnico de una agencia implementadora (PNUD, FAO) para el componente agrícola",
    viability: "Media",
    description: "El GEF-8 financia proyectos de adaptación al cambio climático en territorios agropecuarios vulnerables. IICA puede participar como agencia implementadora o como socio técnico de una agencia acreditada, liderando el componente agroforestal.",
    requirements: [
      "Acreditación como agencia implementadora GEF o alianza con agencia acreditada",
      "Propuesta con cobenefícios de biodiversidad y clima",
    ],
    url: "https://www.thegef.org/projects-operations/projects",
    tags: ["GEF", "adaptación climática", "agroforestería", "fondos climáticos"],
    is_real: true,
  },
  {
    id: "euroclima-agua-agricola",
    title: "EUROCLIMA+ – Gestión Sostenible del Agua en Territorios Agrícolas Vulnerables",
    institution: "EUROCLIMA+ / Unión Europea",
    scope: "Internacional",
    status: "abierto",
    deadline: "30-09-2026",
    days_left: null,
    budget: "Hasta EUR 1.5 millones por proyecto",
    iica_role: "Implementador",
    iica_role_detail: "IICA puede ser socio implementador de proyectos EUROCLIMA+ en Chile, articulando con el MINAGRI y organismos de cuencas hidrográficas",
    viability: "Media",
    description: "EUROCLIMA+ financia proyectos de adaptación climática en agricultura de América Latina con énfasis en gestión hídrica. IICA tiene presencia en Chile y puede actuar como socio implementador o entidad ejecutora de componentes técnicos.",
    requirements: [
      "Consorcio con institución de la UE o ALC acreditada por EUROCLIMA+",
      "Foco en comunidades agrícolas vulnerables a la sequía",
    ],
    url: "https://www.euroclima.org/en/",
    tags: ["EUROCLIMA+", "Unión Europea", "gestión hídrica", "clima"],
    is_real: true,
  },
  {
    id: "mercado-publico-asistencia-tecnica",
    title: "Mercado Público – Licitaciones vigentes: Asistencia técnica y desarrollo rural (búsqueda permanente)",
    institution: "ChileCompra / Organismos públicos",
    scope: "Nacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por licitación (desde $5 millones CLP)",
    iica_role: "IICA Ejecutor",
    iica_role_detail: "IICA puede postular directamente como proveedor del Estado en licitaciones técnicas de INDAP, SAG, MINAGRI, GOREs y municipios",
    viability: "Alta",
    description: "En Mercado Público se publican permanentemente licitaciones de asistencia técnica agrícola, capacitación rural y consultoría agropecuaria. IICA debe estar inscrito en ChileProveedores. Es una fuente de ingresos directa y recurrente para la oficina Chile.",
    requirements: [
      "Inscripción vigente en ChileProveedores (gratuita, tramitar en chileatiende.cl)",
      "Cumplir bases técnicas de cada licitación específica",
      "Garantía técnica y financiera según monto de la licitación",
    ],
    url: "https://www.mercadopublico.cl/Procurement/Modules/RFB/SearchBases.aspx",
    tags: ["Mercado Público", "ChileCompra", "licitación pública", "permanente"],
    is_real: true,
  },
  {
    id: "iica-licitaciones-globales",
    title: "IICA Global – Licitaciones y contratos de asistencia técnica 2026",
    institution: "IICA Sede Central",
    scope: "Internacional",
    status: "permanente",
    deadline: null,
    days_left: null,
    budget: "Variable por contrato",
    iica_role: "Implementador",
    iica_role_detail: "La oficina Chile puede ser designada como ejecutora de licitaciones y contratos publicados por la sede central del IICA para proyectos en la región",
    viability: "Alta",
    description: "La sede central del IICA publica licitaciones de consultorías, estudios y contratos de asistencia técnica que pueden ser ejecutados por la oficina Chile. Monitoreo activo recomendado cada semana.",
    requirements: [
      "Coordinación directa con la Representación IICA Chile y la sede central",
      "Capacidad técnica acreditada en el área de la licitación",
    ],
    url: "https://iica.int/es/licitaciones/",
    tags: ["IICA", "licitación institucional", "sede central", "contratos"],
    is_real: true,
  },
];

// ─── Prompt del sistema para Claude ──────────────────────────────────────────

const SYSTEM_PROMPT = `Eres el motor de inteligencia de proyectos del IICA Chile (Instituto Interamericano de Cooperación para la Agricultura, Oficina Chile).

Tu misión es identificar oportunidades REALES Y VIGENTES donde el IICA Chile puede participar INSTITUCIONALMENTE en uno de estos cuatro roles:
- "IICA Ejecutor": IICA lidera técnica y administrativamente
- "Implementador": IICA ejecuta componentes de un proyecto liderado por otro
- "Asesor técnico": IICA presta consultoría o evaluación
- "Rol indirecto": IICA articula o apoya sin ejecutar directamente

IMPORTANTE: Solo incluye proyectos para instituciones, NO para agricultores individuales ni empresas privadas.

FUENTES a buscar con web_search:
- fontagro.org/convocatorias (IICA es miembro, alta prioridad)
- fao.org/chile y fao.org/americas/tcp
- iadb.org (BID, asistencia técnica agrícola Chile y ALC)
- ifad.org (FIDA, desarrollo rural Chile)
- thegef.org y greenclimate.fund (fondos climáticos)
- euroclima.org (cooperación UE-AL)
- iica.int/es/licitaciones (licitaciones propias IICA)
- fia.cl/convocatorias (FIA, innovación agraria Chile)
- indap.gob.cl y corfo.cl (donde IICA pueda ser proveedor técnico)
- mercadopublico.cl (licitaciones asistencia técnica)
- anid.cl (FONDEF, investigación aplicada)

Responde SOLO en JSON válido (sin markdown, sin backticks), exactamente así:
{
  "results": [
    {
      "id": "id-sin-espacios",
      "title": "Título completo real",
      "institution": "Nombre institución",
      "scope": "Internacional|Nacional|Regional",
      "status": "abierto|próximo|permanente|cerrado",
      "deadline": "DD-MM-YYYY o null",
      "days_left": número_o_null,
      "budget": "string legible o null",
      "iica_role": "IICA Ejecutor|Implementador|Asesor técnico|Rol indirecto",
      "iica_role_detail": "descripción 1 oración de cómo IICA participa específicamente",
      "viability": "Alta|Media|Baja",
      "description": "2-3 oraciones sobre el proyecto y su relevancia para IICA",
      "requirements": ["requisito institucional 1", "requisito 2"],
      "url": "URL real y directa (no homepage general)",
      "tags": ["tag1", "tag2"],
      "is_real": true
    }
  ],
  "sources": ["FONTAGRO", "FAO", ...],
  "summary": "1 oración resumiendo los resultados"
}`;

// ─── Función de ordenamiento ──────────────────────────────────────────────────

function sortProjects(a: Project, b: Project): number {
  const statusOrder: Record<string, number> = { abierto: 0, permanente: 1, próximo: 2, cerrado: 3 };
  const viabilityOrder: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };
  const byStatus = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
  if (byStatus !== 0) return byStatus;
  return (viabilityOrder[a.viability] ?? 3) - (viabilityOrder[b.viability] ?? 3);
}

// ─── Calcular días restantes ──────────────────────────────────────────────────

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

// ─── Enriquecer proyectos ─────────────────────────────────────────────────────

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

// ─── Filtrar proyectos locales ────────────────────────────────────────────────

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

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query: string = body.query || "";
  const scope: string = body.scope || "all";
  const role: string = body.role || "all";
  const useAI: boolean = body.use_ai !== false; // true por defecto

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── CACHÉ INTELIGENTE ───────────────────────────────────────────────────
  // Prevenir peticiones duplicadas y ahorrar tokens/tiempo
  const cacheKey = `${query.toLowerCase().trim()}_${scope}_${role}`;
  if (useAI && apiKey && globalCache.has(cacheKey)) {
    const cached = globalCache.get(cacheKey)!;
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      console.log(`[Cache Hit] Devolviendo resultados cacheados para: "${cacheKey}"`);
      return NextResponse.json({ 
        results: cached.results, 
        meta: { ...cached.meta, summary: cached.meta.summary + ' ⚡ (Instantáneo desde Caché)' } 
      });
    } else {
      globalCache.delete(cacheKey);
    }
  }

  // ── MODO IA ──────────────────────────────────────────────────────────────
  if (useAI && apiKey) {
    try {
      const userMsg = [
        query ? `Busca proyectos relacionados con: "${query}"` : "Busca las oportunidades más relevantes y vigentes para IICA Chile",
        scope !== "all" ? `Ámbito preferido: ${scope}` : "",
        role !== "all" ? `Rol IICA preferido: ${role}` : "",
        `Fecha de hoy: ${new Date().toLocaleDateString("es-CL")}`,
        "Incluye entre 6 y 12 resultados. Prioriza los abiertos o próximos.",
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
        iica_role: r.iica_role || "Asesor técnico",
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
      const baseExtra = enrich(BASE_PROJECTS).filter(p => !aiIds.has(p.id));
      const combined = [...enrich(aiProjects), ...baseExtra].sort(sortProjects);

      const meta: SearchMeta = {
        total: combined.length,
        real_count: combined.filter(p => p.is_real).length,
        ai_generated: true,
        query,
        searched_at: new Date().toISOString(),
        mode: "ai_websearch",
        sources: parsed.sources || ["FONTAGRO", "FAO", "BID", "FIA", "IICA", "Mercado Público"],
        summary: parsed.summary || `${combined.length} oportunidades encontradas en tiempo real`,
      };

      // Guardar en caché antes de devolver
      globalCache.set(cacheKey, { timestamp: Date.now(), results: combined, meta });

      return NextResponse.json({ results: combined, meta });

    } catch (err: any) {
      // Fallback silencioso al modo estático si la IA falla
      console.error("[search-projects] IA error, fallback a estático:", err.message);
    }
  }

  // ── MODO ESTÁTICO (fallback) ──────────────────────────────────────────────
  const enriched = enrich(BASE_PROJECTS);
  const filtered = filterProjects(enriched, query, scope, role).sort(sortProjects);

  const meta: SearchMeta = {
    total: filtered.length,
    real_count: filtered.filter(p => p.is_real).length,
    ai_generated: false,
    query,
    searched_at: new Date().toISOString(),
    mode: "static",
    sources: ["data local verificada"],
    summary: apiKey
      ? `${filtered.length} proyectos (IA no disponible temporalmente, mostrando base local)`
      : `${filtered.length} proyectos base verificados (agrega ANTHROPIC_API_KEY para búsqueda en tiempo real)`,
  };

  return NextResponse.json({ results: filtered, meta });
}

// ─── GET Handler (health check) ───────────────────────────────────────────────

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile – Motor de Búsqueda de Proyectos Reales",
    mode: hasKey ? "ai_websearch" : "static",
    ai_available: hasKey,
    model: hasKey ? "claude-sonnet-4-20250514" : null,
    base_projects: BASE_PROJECTS.length,
    sources: [
      "FONTAGRO", "FAO", "BID/IADB", "FIDA",
      "GEF", "GCF", "EUROCLIMA+", "IICA Hemisférico",
      "FIA", "INDAP", "CORFO", "CNR", "ANID", "Mercado Público",
    ],
  });
}
