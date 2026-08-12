import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('Script');
import prisma from "../lib/prisma";

const SOURCES = [
  { slug: "indap",            name: "INDAP",                                  type: "scraper",       homepageUrl: "https://www.indap.gob.cl/" },
  { slug: "fia",              name: "FIA — Fundación para la Innovación Agraria", type: "scraper", homepageUrl: "https://www.fia.cl/convocatorias/" },
  { slug: "fia-licitaciones", name: "FIA — Licitaciones MercadoPublico",        type: "scraper", homepageUrl: "https://www.mercadopublico.cl/Portal/FeedOrg.aspx?qs=PxtfJ1QTPW/YcX8fnxQceA==" },
  { slug: "corfo",            name: "CORFO",                                  type: "scraper",       homepageUrl: "https://www.corfo.cl/" },
  { slug: "fontagro",         name: "FONTAGRO",                               type: "scraper",       homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/" },
  { slug: "iica-hemisferico", name: "IICA Hemisférico",                       type: "scraper",       homepageUrl: "https://iica.int/es/licitaciones/" },
  { slug: "iica-dashboard",   name: "IICA Dashboard Proyectos (Contrapartes)", type: "scraper_playwright", homepageUrl: "https://apps.iica.int/dashboardproyectos/" },
  { slug: "cnr",              name: "CNR — Comisión Nacional de Riego",       type: "scraper",       homepageUrl: "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/" },
  { slug: "fondos-gob",       name: "Portal Único Fondos Concursables (fondos.gob.cl)", type: "scraper", homepageUrl: "https://fondos.gob.cl/" },
  { slug: "ai-discovery",     name: "AI Discovery (Gemini + Google Search)",  type: "ai_discovery",  homepageUrl: null },
  { slug: "world-bank",       name: "World Bank Procurement",                 type: "scraper",       homepageUrl: "https://projects.worldbank.org/en/projects-operations/procurement" },
  { slug: "ungm",             name: "UNGM — United Nations Global Marketplace", type: "scraper",     homepageUrl: "https://www.ungm.org/Public/Notice" },
  { slug: "gef",              name: "GEF — Global Environment Facility",       type: "scraper",       homepageUrl: "https://www.thegef.org/projects-operations/database" },
  { slug: "ifad-opportunities", name: "IFAD Project Procurement Opportunities", type: "scraper",      homepageUrl: "https://www.ifad.org/en/project-procurement/opportunities" },
  { slug: "ted-notices",      name: "TED Public Notices",                      type: "scraper",       homepageUrl: "https://ted.europa.eu/en/search/expert-search" },
  { slug: "devex-funding",    name: "Devex Funding Search",                    type: "scraper",       homepageUrl: "https://www.devex.com/funding/r?filter%5Bplaces%5D%5B%5D=Chile&filter%5Bstatuses%5D%5B%5D=forecast&filter%5Bstatuses%5D%5B%5D=open&sorting%5Border%5D=desc&sorting%5Bfield%5D=updated_at" },
  { slug: "iki",              name: "IKI — International Climate Initiative",    type: "scraper",       homepageUrl: "https://www.international-climate-initiative.com/en/funding/" },
  { slug: "gafsp",            name: "GAFSP — Global Agriculture and Food Security Program", type: "scraper", homepageUrl: "https://www.gafspfund.org/" },
  { slug: "aecid",            name: "AECID — Cooperación Española",             type: "scraper",       homepageUrl: "https://www.aecid.es/en/tenders" },
  { slug: "gcf",              name: "GCF — Green Climate Fund",                  type: "scraper",       homepageUrl: "https://www.greenclimate.fund/news/announcements" },
  { slug: "afd",              name: "AFD — Agence Française de Développement",   type: "scraper",       homepageUrl: "https://www.afd.fr/fr/appels-a-projets" },
  { slug: "fundsforngos",     name: "FundsforNGOs (Aggregator)",                 type: "scraper",       homepageUrl: "https://www2.fundsforngos.org/" },
  { slug: "anid",             name: "ANID — Agencia Nacional de Investigación y Desarrollo", type: "scraper", homepageUrl: "https://anid.cl/concursos/" },
  { slug: "minagri-licitaciones", name: "MINAGRI — Licitaciones MercadoPublico", type: "scraper", homepageUrl: "https://www.mercadopublico.cl/Portal/FeedOrg.aspx?qs=Mer+eNmLUHn7TN5dx6I0Mg==" },
  { slug: "inia",             name: "INIA — Instituto de Investigaciones Agropecuarias", type: "scraper", homepageUrl: "https://www.inia.cl/licitaciones/" },
  { slug: "global-south-opportunities", name: "Global South Opportunities (Aggregator)", type: "scraper", homepageUrl: "https://www.globalsouthopportunities.com/" },
  { slug: "curated-external-2026", name: "Oportunidades Internacionales Verificadas 2026", type: "curated", homepageUrl: "https://github.com/maximilianoandrade-sys/iica-chile-plataforma" },
  { slug: "geda",             name: "GEDA — Gender and Environment Data Alliance", type: "scraper", homepageUrl: "https://genderenvironmentdata.org/" },
  { slug: "afcia",            name: "AFCIA — Climate Adaptation Innovation Accelerator", type: "scraper", homepageUrl: "https://www.ctc-n.org/adaptation-fund-climate-innovation-accelerator" },
  { slug: "future-for-nature", name: "Future for Nature Foundation",              type: "scraper", homepageUrl: "https://futurefornature.org/" },
  { slug: "generaccion-climatica", name: "Generacción Climática Juvenil",        type: "scraper", homepageUrl: "https://www.cartagena.gov.co/" },
  { slug: "resilient-futures", name: "Resilient Futures Fund (Global South)",     type: "scraper", homepageUrl: "https://www.betterpolitics.foundation/" },
  { slug: "horizon-europe",    name: "Horizon Europe — Cluster 6 (Biodiversity & Bioeconomy)", type: "scraper", homepageUrl: "https://rea.ec.europa.eu/funding-and-grants/" },
  { slug: "eu-life",           name: "EU LIFE Programme (CINEA)",                 type: "scraper", homepageUrl: "https://cinea.ec.europa.eu/programmes/life_en" },
  { slug: "cfc",              name: "CFC — Common Fund for Commodities",           type: "scraper", homepageUrl: "https://common-fund.org/" },
  { slug: "rainforest-trust", name: "Rainforest Trust — Protected Areas",        type: "scraper", homepageUrl: "https://www.rainforesttrust.org/" },
  { slug: "microsoft-ai-earth", name: "Microsoft AI for Earth & Climate Grants", type: "scraper", homepageUrl: "https://www.microsoft.com/en-us/ai/ai-for-earth" },
  { slug: "ifc-agritech",     name: "IFC World Bank — Agritech Modernization Fund", type: "scraper", homepageUrl: "https://www.ifc.org/" },
  { slug: "fao-digital-agri", name: "FAO — Digital Agriculture & Innovation Hub", type: "scraper", homepageUrl: "https://www.fao.org/digital-agriculture/" },
  { slug: "idrc-ai4d",        name: "IDRC Canada — AI for Development (AI4D)", type: "scraper", homepageUrl: "https://idrc-crdi.ca/" },
  { slug: "horizon-ai-agro",  name: "Horizon Europe — AI & Robotics in Agriculture", type: "scraper", homepageUrl: "https://rea.ec.europa.eu/" },
  { slug: "iica-agtech",      name: "IICA AgTech Accelerator & Semana Agricultura Digital", type: "scraper", homepageUrl: "https://iica.int/" },
  { slug: "nwo-kic-ai",       name: "NWO KIC — AI for Agriculture, Food & Water", type: "scraper", homepageUrl: "https://www.nwo.nl/" },
  { slug: "global-eba-fund",  name: "Global EbA Fund — Adaptación Basada en Ecosistemas", type: "scraper", homepageUrl: "https://globalebafund.org/" },
  { slug: "coalar-australia", name: "COALAR — Council on Australia-Latin America Relations", type: "scraper", homepageUrl: "https://www.dfat.gov.au/coalar" },
  { slug: "cnr-oua",          name: "CNR Chile — Fondo Concursable para OUA", type: "scraper", homepageUrl: "https://www.cnr.gob.cl/" },
  { slug: "fiie-chile",       name: "FIIE Chile — Fondo de Investigación e Innovación en Recursos Hídricos", type: "scraper", homepageUrl: "https://www.dga.mop.gob.cl/" },
];

async function main() {
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: { name: s.name, type: s.type, homepageUrl: s.homepageUrl },
      create: s,
    });
    logger.info(`OK: ${s.slug}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
