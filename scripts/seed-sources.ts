import prisma from "../lib/prisma";

const SOURCES = [
  { slug: "indap",            name: "INDAP",                                       type: "scraper",      homepageUrl: "https://www.indap.gob.cl/" },
  { slug: "fia",              name: "FIA — Fundación para la Innovación Agraria",  type: "scraper",      homepageUrl: "https://www.fia.cl/convocatorias/" },
  { slug: "corfo",            name: "CORFO",                                        type: "scraper",      homepageUrl: "https://www.corfo.cl/" },
  { slug: "fontagro",         name: "FONTAGRO",                                     type: "scraper",      homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/" },
  { slug: "iica-hemisferico", name: "IICA Hemisférico",                             type: "scraper",      homepageUrl: "https://iica.int/es/licitaciones/" },
  { slug: "ai-discovery",     name: "AI Discovery (Claude + web search)",           type: "ai_discovery", homepageUrl: null },
];

async function main() {
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: { name: s.name, type: s.type, homepageUrl: s.homepageUrl },
      create: s,
    });
    console.log(`✅ ${s.slug}`);
  }
  await prisma.$disconnect();
}

main();
