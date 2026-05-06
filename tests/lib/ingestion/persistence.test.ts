/**
 * @jest-environment node
 */
import { upsertProject, markStale, updateSourceStatus } from "@/lib/ingestion/persistence";
import prisma from "@/lib/prisma";
import type { RawProject } from "@/lib/ingestion/types";

jest.mock("@/lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn().mockResolvedValue({ ok: true }),
}));

describe("upsertProject", () => {
  beforeAll(async () => {
    await prisma.source.upsert({
      where: { slug: "test-source" },
      update: {},
      create: { slug: "test-source", name: "Test", type: "scraper" },
    });
  });
  beforeEach(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "test-fixture" } } });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "test-fixture" } } });
    await prisma.source.deleteMany({ where: { slug: "test-source" } });
    await prisma.$disconnect();
  });

  const sample: RawProject = {
    title: "Convocatoria Test",
    institution: "Test Institution",
    url: "https://test-fixture.com/conv/1",
    deadline: new Date("2026-12-31"),
  };

  it("inserta nuevo proyecto", async () => {
    const r = await upsertProject(sample, "test-source");
    expect(r.skipped).toBeFalsy();
    const found = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    expect(found).not.toBeNull();
    expect(found!.discoveredBy).toBe("scraper");
    expect(found!.nombre).toBe("Convocatoria Test");
  });

  it("actualiza lastSeenAt en re-upsert", async () => {
    await upsertProject(sample, "test-source");
    const before = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    await new Promise((r) => setTimeout(r, 50));
    await upsertProject(sample, "test-source");
    const after = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/1" },
    });
    expect(after!.lastSeenAt.getTime()).toBeGreaterThan(before!.lastSeenAt.getTime());
  });

  it("salta si validateUrl falla", async () => {
    const { validateUrl } = require("@/lib/ingestion/validateUrl");
    (validateUrl as jest.Mock).mockResolvedValueOnce({ ok: false, reason: "404" });
    const r = await upsertProject(
      { ...sample, url: "https://test-fixture.com/conv/dead" },
      "test-source"
    );
    expect(r.skipped).toBe(true);
    expect(r.reason).toContain("404");
    const found = await prisma.project.findUnique({
      where: { canonicalUrl: "https://test-fixture.com/conv/dead" },
    });
    expect(found).toBeNull();
  });
});

describe("markStale", () => {
  beforeEach(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "stale-fixture" } } });
  });
  afterAll(async () => {
    await prisma.project.deleteMany({ where: { canonicalUrl: { contains: "stale-fixture" } } });
    await prisma.$disconnect();
  });

  it("cierra proyectos con lastSeenAt > 7 días", async () => {
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await prisma.project.create({
      data: {
        canonicalUrl: "https://stale-fixture.com/old",
        url_bases: "https://stale-fixture.com/old",
        nombre: "Old", institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "scraper",
        lastSeenAt: old,
      },
    });
    await markStale();
    const r = await prisma.project.findUnique({ where: { canonicalUrl: "https://stale-fixture.com/old" } });
    expect(r!.estadoPostulacion).toBe("Cerrada");
  });

  it("cierra proyectos con fecha_cierre vencida", async () => {
    await prisma.project.create({
      data: {
        canonicalUrl: "https://stale-fixture.com/expired",
        url_bases: "https://stale-fixture.com/expired",
        nombre: "Expired", institucion: "X", monto: 0,
        fecha_cierre: new Date("2020-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
      },
    });
    await markStale();
    const r = await prisma.project.findUnique({ where: { canonicalUrl: "https://stale-fixture.com/expired" } });
    expect(r!.estadoPostulacion).toBe("Cerrada");
  });

  it("NO cierra proyectos manuales aunque tengan lastSeenAt viejo", async () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.project.create({
      data: {
        canonicalUrl: "https://stale-fixture.com/manual",
        url_bases: "https://stale-fixture.com/manual",
        nombre: "Manual", institucion: "X", monto: 0,
        fecha_cierre: new Date("2027-01-01"),
        estado: "Activo", categoria: "Test", estadoPostulacion: "Abierta",
        discoveredBy: "manual",
        lastSeenAt: old,
      },
    });
    await markStale();
    const r = await prisma.project.findUnique({ where: { canonicalUrl: "https://stale-fixture.com/manual" } });
    expect(r!.estadoPostulacion).toBe("Abierta");
  });
});

describe("updateSourceStatus", () => {
  beforeAll(async () => {
    await prisma.source.upsert({
      where: { slug: "test-status" },
      update: {},
      create: { slug: "test-status", name: "Test status", type: "scraper" },
    });
  });
  afterAll(async () => {
    await prisma.source.deleteMany({ where: { slug: "test-status" } });
    await prisma.$disconnect();
  });

  it("actualiza lastRunAt, lastRunStatus, projectsCount", async () => {
    await updateSourceStatus("test-status", "success", 42);
    const s = await prisma.source.findUnique({ where: { slug: "test-status" } });
    expect(s!.lastRunStatus).toBe("success");
    expect(s!.projectsCount).toBe(42);
    expect(s!.lastRunAt).not.toBeNull();
    expect(s!.lastRunError).toBeNull();
  });

  it("guarda error message cuando hay error", async () => {
    await updateSourceStatus("test-status", "error", 0, "HTTP 500");
    const s = await prisma.source.findUnique({ where: { slug: "test-status" } });
    expect(s!.lastRunStatus).toBe("error");
    expect(s!.lastRunError).toBe("HTTP 500");
  });
});
