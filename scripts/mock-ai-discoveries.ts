/**
 * Mock data para probar la UI de AI Discovery sin gastar API key.
 *
 * Inserta 6 proyectos simulando lo que Gemini devolvería en un scan semanal,
 * con discoveredBy='ai' y needsReview=true. Los snippets son ejemplos de
 * lo que pondría el modelo (citas textuales de search results).
 *
 * Para borrarlos:
 *   DELETE FROM "Project" WHERE "canonicalUrl" LIKE 'https://mock-discovery%';
 *
 * Para reemplazar con discovery real: cargá GEMINI_API_KEY (gratis en
 * https://aistudio.google.com/) y corré `npm run discover`.
 */

import prisma from "../lib/prisma";

const MOCK_DISCOVERIES = [
  {
    title: "FONTAGRO Convocatoria 2026 — Cooperación e Innovación para Sistemas Agroalimentarios ALC",
    institution: "FONTAGRO",
    url: "https://www.fontagro.org/es/iniciativas/convocatorias/convocatoria-2026/",
    description: "Convocatoria anual del Fondo Regional de Tecnología Agropecuaria para proyectos de innovación en sistemas agroalimentarios. Requiere consorcio multinacional. IICA es miembro y puede liderar propuestas.",
    deadline: new Date("2026-09-30"),
    snippet: "FONTAGRO abre su convocatoria 2026 dirigida a proyectos de cooperación e innovación tecnológica para sistemas agroalimentarios sostenibles en América Latina y el Caribe, con financiamiento de hasta USD 250.000 por consorcio multinacional integrado por al menos dos países miembros.",
  },
  {
    title: "GEF-8 — Adaptación al Cambio Climático en Territorios Agroforestales (Chile y región)",
    institution: "Global Environment Facility (GEF)",
    url: "https://www.thegef.org/projects-operations/projects/agroforestry-chile",
    description: "El GEF-8 financia proyectos de adaptación al cambio climático en territorios agropecuarios. IICA puede actuar como agencia implementadora o socio técnico de PNUD/FAO.",
    deadline: new Date("2026-08-15"),
    snippet: "El Fondo para el Medio Ambiente Mundial lanza una nueva línea en su ciclo GEF-8 destinada a proyectos de adaptación climática en territorios agroforestales vulnerables, con presupuestos entre USD 2 y 10 millones por proyecto, gestionados a través de agencias implementadoras acreditadas.",
  },
  {
    title: "EUROCLIMA+ — Gestión Sostenible del Agua en Territorios Agrícolas Vulnerables",
    institution: "EUROCLIMA+ / Unión Europea",
    url: "https://www.euroclima.org/convocatorias-2026/agua-agricola-chile",
    description: "Programa de cooperación UE-AL para adaptación climática con foco en gestión hídrica agrícola. IICA puede ser socio implementador articulando con MINAGRI Chile.",
    deadline: new Date("2026-07-20"),
    snippet: "EUROCLIMA+ anuncia el cierre de su convocatoria sobre gestión sostenible del agua en territorios agrícolas vulnerables el 20 de julio de 2026, ofreciendo hasta EUR 1.5 millones por proyecto a consorcios entre instituciones de la UE y América Latina.",
  },
  {
    title: "FAO TCP/RLA 2026 — Programa de Cooperación Técnica para Resiliencia Climática Chile",
    institution: "FAO Chile",
    url: "https://www.fao.org/chile/tcp-rla-2026-resiliencia-climatica/",
    description: "Programa de Cooperación Técnica FAO con foco en resiliencia climática del sector agrícola chileno. IICA y FAO tienen mandatos complementarios para co-ejecutar componentes.",
    deadline: new Date("2026-06-30"),
    snippet: "La FAO en Chile anunció el lanzamiento del Programa de Cooperación Técnica TCP/RLA 2026 enfocado en resiliencia climática del sector silvoagropecuario, con asistencia técnica disponible para instituciones públicas y organismos internacionales como contraparte.",
  },
  {
    title: "BID — Modernización de Servicios de Extensión Agrícola Chile (CH-T1289)",
    institution: "Banco Interamericano de Desarrollo (BID)",
    url: "https://www.iadb.org/es/project/CH-T1289-extension-agricola",
    description: "Asistencia técnica BID para modernizar servicios de extensión rural. IICA es ejecutor acreditado y puede ser designado como ejecutor técnico principal.",
    deadline: new Date("2026-08-15"),
    snippet: "El BID aprobó una nueva operación de asistencia técnica para Chile destinada a modernizar los servicios de extensión agrícola, con un componente de cooperación técnica que IICA podría ejecutar dada su acreditación como agencia implementadora del Banco.",
  },
  {
    title: "GCF — Climate Resilient Agriculture Patagonia (Funding Proposal)",
    institution: "Green Climate Fund",
    url: "https://www.greenclimate.fund/projects/funding-proposals/chile-patagonia-2026",
    description: "Proyecto GCF de adaptación de la agricultura a cambio climático en zonas patagónicas. Requiere agencia implementadora acreditada (PNUD, BID, FAO, IICA).",
    deadline: new Date("2026-12-15"),
    snippet: "El Green Climate Fund publicó una funding proposal específica para agricultura climáticamente resiliente en la Patagonia chilena, abierta a entidades acreditadas como BID, PNUD, FAO o IICA en calidad de agencia implementadora del proyecto multianual.",
  },
];

async function main() {
  const aiSource = await prisma.source.findUnique({ where: { slug: "ai-discovery" } });
  if (!aiSource) {
    console.error("Source ai-discovery no existe. Corré scripts/seed-sources.ts primero.");
    process.exit(1);
  }

  let inserted = 0;
  for (const m of MOCK_DISCOVERIES) {
    const canonicalUrl = m.url.toLowerCase().replace(/\/$/, "");

    const existing = await prisma.project.findUnique({ where: { canonicalUrl } });
    if (existing) {
      console.log(`⏭️  ya existe: ${m.title.slice(0, 50)}`);
      continue;
    }

    await prisma.project.create({
      data: {
        canonicalUrl,
        url_bases: m.url,
        nombre: m.title,
        institucion: m.institution,
        objetivo: m.description,
        fecha_cierre: m.deadline,
        monto: 0,
        estado: "Abierto",
        categoria: "AI Discovery",
        notasInternas: `AI snippet (mock): "${m.snippet}"`,
        discoveredBy: "ai",
        needsReview: true,
        sourceRefId: aiSource.id,
        estadoPostulacion: "Abierta",
        ambito: "Internacional",
      },
    });
    inserted++;
    console.log(`✅ ${m.title.slice(0, 60)}`);
  }

  await prisma.source.update({
    where: { slug: "ai-discovery" },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: "success",
      lastRunError: null,
      projectsCount: inserted,
    },
  });

  console.log(`\n✅ ${inserted} mock discoveries insertados. Buscá en /admin/discoveries`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
