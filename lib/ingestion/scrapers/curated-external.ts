import type { RawProject, Scraper, ScraperResult } from "../types";

/**
 * Catálogo curado de oportunidades internacionales verificadas manualmente.
 *
 * Cada registro se incorpora solo cuando una fuente oficial permite establecer
 * una relación explícita con Chile o con entidades chilenas. Esta fuente se
 * reejecuta diariamente para mantener actualizado `lastSeenAt`; la capa de
 * persistencia cierra automáticamente los registros cuya fecha ya venció.
 *
 * Última verificación editorial: 12 de agosto de 2026.
 */
const VERIFIED_OPPORTUNITIES: RawProject[] = [
  {
    title: "AFCIA: Innovación en Adaptación Climática para América Latina y el Caribe",
    institution: "UN Climate Technology Centre and Network (CTCN)",
    url: "https://www.ctc-n.org/whats-happening/news/call-proposals-climate-adaptation-innovation-latin-america-and-caribbean",
    canonicalKey: "https://www.ctc-n.org/whats-happening/news/call-proposals-climate-adaptation-innovation-latin-america-and-caribbean",
    deadline: new Date("2026-08-18T23:59:59Z"),
    budget: "Hasta USD 150.000 en asistencia técnica por proyecto",
    description:
      "Convocatoria AFCIA abierta para todos los países de América Latina y el Caribe, incluido Chile. Seleccionará hasta 10 proyectos que piloten soluciones innovadoras, transformadoras y lideradas localmente para la adaptación climática. Pueden postular instituciones públicas, universidades, centros de investigación, ONG y entidades privadas de países con Entidad Nacional Designada (NDE) ante el Mecanismo Tecnológico de la CMNUCC. La postulación debe canalizarse mediante la NDE de Chile.",
    tags: ["Adaptación climática", "Innovación", "Asistencia técnica", "América Latina", "Chile"],
    opportunityType: "Convocatoria",
    ambito: "Internacional",
    idioma: "es",
    relevanciaChile: true,
  },
  {
    title: "Future For Nature Awards 2027",
    institution: "Future For Nature Foundation",
    url: "https://futurefornature.org/future-for-nature/apply-for-future-for-nature/apply/",
    canonicalKey: "https://futurefornature.org/future-for-nature/apply-for-future-for-nature/apply/",
    deadline: new Date("2026-08-23T21:00:00Z"),
    budget: "EUR 50.000 por persona ganadora",
    description:
      "Premio internacional abierto a personas jóvenes de 18 a 35 años dedicadas a la conservación de la naturaleza, incluidas personas conservacionistas de Chile. Se otorgarán tres premios de EUR 50.000. La postulación es individual, requiere referencias y no es elegible quien postuló al ciclo 2026. El formulario y las bases oficiales señalan cierre el 23 de agosto de 2026 a las 23:00 CEST.",
    tags: ["Conservación", "Biodiversidad", "Liderazgo joven", "Premio", "Chile"],
    opportunityType: "Convocatoria",
    ambito: "Internacional",
    idioma: "en",
    relevanciaChile: true,
  },
  {
    title: "Resilient Futures: Ideation Grants 2026",
    institution: "Better Politics Foundation",
    url: "https://www.betterpolitics.foundation/resilient-futures-call-2026",
    canonicalKey: "https://www.betterpolitics.foundation/resilient-futures-call-2026#ideation-grants",
    deadline: new Date("2026-09-04T21:59:59Z"),
    budget: "USD 10.000–20.000",
    description:
      "Convocatoria global abierta a organizaciones, redes, colectivos e individuos, incluidos postulantes de Chile, para ideas nuevas o pilotos tempranos que vinculen liderazgo político democrático y resiliencia climática. Financia iniciativas no partidistas en rutas de incidencia, desarrollo de liderazgo y liderazgo intersectorial. Chile no es país prioritario, pero las solicitudes de países no prioritarios siguen siendo admisibles si cumplen los criterios de la llamada.",
    tags: ["Resiliencia climática", "Gobernanza", "Liderazgo", "Democracia", "Chile"],
    opportunityType: "Convocatoria",
    ambito: "Internacional",
    idioma: "en",
    relevanciaChile: true,
  },
  {
    title: "Horizon Europe 2026: Biodiversidad y Servicios Ecosistémicos",
    institution: "European Research Executive Agency (REA)",
    url: "https://rea.ec.europa.eu/funding-and-grants/horizon-europe-cluster-6-food-bioeconomy-natural-resources-agriculture-and-environment/biodiversity-and-ecosystem-services_en",
    canonicalKey: "https://rea.ec.europa.eu/funding-and-grants/horizon-europe-cluster-6-food-bioeconomy-natural-resources-agriculture-and-environment/biodiversity-and-ecosystem-services_en#horizon-cl6-2026-01-biodiv",
    deadline: new Date("2026-09-17T21:00:00Z"),
    budget: "EUR 76 millones de presupuesto indicativo total",
    description:
      "Llamada HORIZON-CL6-2026-01-BIODIV de Horizon Europe con siete temas sobre declive de insectos, ecosistemas de aguas subterráneas y profundas, economía positiva para la naturaleza y agrobiodiversidad. Las instituciones chilenas pueden participar en la mayoría de las llamadas Horizon Europe dentro de consorcios que incluyan al menos una entidad de un Estado miembro de la UE y dos entidades adicionales de otros Estados miembros o países asociados. La fuente oficial de la Unión Europea en Chile confirma esta modalidad de participación.",
    tags: ["Biodiversidad", "Investigación", "Servicios ecosistémicos", "Consorcios", "Chile"],
    opportunityType: "Convocatoria",
    ambito: "Internacional",
    idioma: "en",
    relevanciaChile: true,
  },
  {
    title: "Rainforest Trust: Creación y Expansión de Áreas Protegidas",
    institution: "Rainforest Trust",
    url: "https://www.rainforesttrust.org/get-involved/apply-for-funding/",
    canonicalKey: "https://www.rainforesttrust.org/get-involved/apply-for-funding/",
    deadline: null,
    budget: "Financiamiento continuo; revisión previa para solicitudes superiores a USD 250.000",
    description:
      "Programa de postulación continua para ONG legalmente registradas y autorizadas a trabajar en el país del proyecto. Apoya la creación o expansión de áreas protegidas o conservadas en trópicos y subtrópicos que beneficien especies amenazadas, clima y comunidades. Las organizaciones de Chile deben comprobar que el sitio propuesto cumple el criterio geográfico y de conservación. Las notas conceptuales se revisan en 1–2 meses; para solicitudes superiores a USD 250.000 se recomienda presentar la nota cuatro meses antes de los cortes del 1 de marzo, 1 de julio o 1 de octubre.",
    tags: ["Áreas protegidas", "Conservación", "Biodiversidad", "Postulación continua", "Chile"],
    opportunityType: "Programa",
    ambito: "Internacional",
    idioma: "en",
    relevanciaChile: true,
  },
];

export const curatedExternalScraper: Scraper = {
  slug: "curated-external-2026",
  name: "Oportunidades Internacionales Verificadas 2026",
  homepageUrl: "https://github.com/maximilianoandrade-sys/iica-chile-plataforma",

  async scrape(): Promise<ScraperResult> {
    return {
      sourceSlug: this.slug,
      projects: VERIFIED_OPPORTUNITIES,
      partialErrors: [],
    };
  },
};

export { VERIFIED_OPPORTUNITIES };
