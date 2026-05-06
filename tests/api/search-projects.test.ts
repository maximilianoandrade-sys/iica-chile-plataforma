/**
 * @jest-environment node
 */
import { POST } from "@/app/api/search-projects/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

jest.mock("@/lib/ingestion/scrapers/mercado-publico", () => ({
  fetchMercadoPublicoLive: jest.fn().mockResolvedValue([]),
}));

describe("POST /api/search-projects", () => {
  beforeAll(async () => {
    await prisma.source.upsert({
      where: { slug: "test-route" },
      update: {},
      create: { slug: "test-route", name: "test", type: "scraper" },
    });
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "search-test" } } });
    await prisma.project.create({
      data: {
        canonicalUrl: "https://search-test.com/verified",
        url_bases: "https://search-test.com/verified",
        nombre: "Convocatoria Verificada Test",
        institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "scraper", needsReview: false,
      },
    });
    await prisma.project.create({
      data: {
        canonicalUrl: "https://search-test.com/unverified",
        url_bases: "https://search-test.com/unverified",
        nombre: "Convocatoria Sin Verificar Test",
        institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "ai", needsReview: true,
      },
    });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "search-test" } } });
    await prisma.source.deleteMany({ where: { slug: "test-route" } });
    await prisma.$disconnect();
  });

  function mkRequest(body: any) {
    return new NextRequest("http://x/api/search-projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("devuelve verificados + sin-verificar cuando includeUnverified=true (default)", async () => {
    const res = await POST(mkRequest({ query: "Test" }));
    const data = await res.json();
    const titles = data.results.map((p: any) => p.nombre);
    expect(titles).toContain("Convocatoria Verificada Test");
    expect(titles).toContain("Convocatoria Sin Verificar Test");
  });

  it("filtra needsReview=true cuando includeUnverified=false", async () => {
    const res = await POST(mkRequest({ query: "Test", includeUnverified: false }));
    const data = await res.json();
    const titles = data.results.map((p: any) => p.nombre);
    expect(titles).toContain("Convocatoria Verificada Test");
    expect(titles).not.toContain("Convocatoria Sin Verificar Test");
  });

  it("respeta el filtro scope", async () => {
    const res = await POST(mkRequest({ scope: "Internacional" }));
    const data = await res.json();
    // ninguno de los test fixtures tiene ambito Internacional explícito (default es Nacional)
    const fixtures = data.results.filter((p: any) => p.canonicalUrl?.includes("search-test"));
    expect(fixtures.length).toBe(0);
  });

  it("incluye meta con total y db_count", async () => {
    const res = await POST(mkRequest({ query: "Test" }));
    const data = await res.json();
    expect(data.meta).toBeDefined();
    expect(typeof data.meta.total).toBe("number");
    expect(typeof data.meta.db_count).toBe("number");
  });
});
