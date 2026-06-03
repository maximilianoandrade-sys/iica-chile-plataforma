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
  { slug: "ai-discovery",     name: "AI Discovery (Gemini + Google Search)",  type: "ai_discovery",  homepageUrl: null },
  { slug: "world-bank",       name: "World Bank Procurement",                 type: "scraper",       homepageUrl: "https://projects.worldbank.org/en/projects-operations/procurement" },
  { slug: "ungm",             name: "UNGM — United Nations Global Marketplace", type: "scraper",     homepageUrl: "https://www.ungm.org/Public/Notice" },
  { slug: "gef",              name: "GEF — Global Environment Facility",       type: "scraper",       homepageUrl: "https://www.thegef.org/projects-operations/database" },
  { slug: "ifad-opportunities", name: "IFAD Project Procurement Opportunities", type: "scraper",      homepageUrl: "https://www.ifad.org/en/project-procurement/opportunities" },
  { slug: "ted-notices",      name: "TED Public Notices",                      type: "scraper",       homepageUrl: "https://ted.europa.eu/en/search/expert-search" },
];

async function main() {
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: { name: s.name, type: s.type, homepageUrl: s.homepageUrl },
      create: s,
    });
    console.log(`OK: ${s.slug}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
