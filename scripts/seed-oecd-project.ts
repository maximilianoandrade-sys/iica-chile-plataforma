/**
 * One-shot script: inserta la beca OECD 2027 como proyecto manual.
 * Ejecutar una sola vez: npx tsx scripts/seed-oecd-project.ts
 */
import prisma from "../lib/prisma";

async function main() {
  const canonicalUrl =
    "https://www.oecd.org/en/about/programmes/co-operative-research-programme/crp-applications-for-fellowships.html";

  const existing = await prisma.project.findFirst({
    where: { canonicalUrl },
  });

  if (existing) {
    console.log(`Proyecto OECD ya existe (id=${existing.id}). Saltando.`);
    await prisma.$disconnect();
    return;
  }

  const project = await prisma.project.create({
    data: {
      nombre:
        "Becas de Investigación OCDE 2027 — Agricultura Sostenible, Silvicultura y Pesca",
      institucion: "OCDE",
      monto: 0,
      montoTexto: "6-26 semanas de investigación financiada en país miembro",
      fecha_cierre: new Date("2026-09-10T23:59:00Z"),
      estado: "Vigente",
      categoria: "Investigación",
      url_bases: canonicalUrl,
      canonicalUrl,
      ambito: "Internacional",
      estadoPostulacion: "Abierta",
      viabilidadIICA: "Alta",
      porcentajeViabilidad: 80,
      objetivo:
        "Becas de investigación de 6-26 semanas para científicos que trabajan en agricultura, silvicultura y pesca. Permite realizar proyectos de investigación en otro país miembro de la OCDE. Chile es elegible como país participante.",
      descripcionIICA:
        "Oportunidad relevante para investigadores chilenos en agricultura sostenible. La OCDE ofrece becas CRP anuales que financian estadías de investigación internacional. Áreas prioritarias: productividad sostenible, seguridad alimentaria, gestión de riesgo climático, secuestro de carbono, biodiversidad, agroecología y pesca sostenible.",
      requisitos: [
        "Ser residente de un país miembro del programa CRP de la OCDE (Chile incluido)",
        "Trabajar en agricultura, silvicultura, pesca o sistemas alimentarios",
        "Tener institución de acogida en otro país miembro",
      ],
      fortalezas: [
        "Chile es país elegible",
        "Cubre agricultura, silvicultura y pesca — ejes clave IICA",
        "Financiamiento completo de la estadía investigativa",
        "Red internacional de contactos para investigadores chilenos",
      ],
      debilidades: [
        "Deadline 10 septiembre 2026 — requiere preparación anticipada",
        "Idioma principal inglés",
        "Requiere carta de invitación de institución de acogida",
      ],
      regiones: ["Nacional"],
      beneficiarios: [
        "Investigadores",
        "Científicos",
        "Universidades",
        "Centros de Investigación",
      ],
      idioma: "en",
      discoveredBy: "manual",
      needsReview: false,
      publishable: true,
      chileEligibility: "eligible",
      relevanciaChile: true,
      ejeIICA: "Bioeconomía y desarrollo productivo",
      complejidad: "Media",
      rolIICA: "Difusión",
    },
  });

  console.log(`Proyecto OECD creado (id=${project.id})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
