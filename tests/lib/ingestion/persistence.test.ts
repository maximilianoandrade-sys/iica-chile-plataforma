/**
 * @jest-environment node
 */

// Mock prisma before importing persistence
jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    source: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  },
}));

// Mock validateUrl to always return ok
jest.mock("../../../lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn().mockResolvedValue({ ok: true }),
}));

const mockEmbedText = jest.fn();
const mockProjectToEmbeddingText = jest.fn((_project: unknown) => "embedding text");
const mockToPgVector = jest.fn((embedding: number[]) => `[${embedding.join(",")}]`);

jest.mock("../../../lib/ingestion/embeddings", () => ({
  embedText: (text: string) => mockEmbedText(text),
  projectToEmbeddingText: (project: unknown) => mockProjectToEmbeddingText(project),
  toPgVector: (embedding: number[]) => mockToPgVector(embedding),
}));

import { markStale, upsertProject, updateSourceStatus } from "../../../lib/ingestion/persistence";
const prisma = require("../../../lib/prisma").default;
const embeddings = require("../../../lib/ingestion/embeddings");

describe("upsertProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
    mockEmbedText.mockResolvedValue(null);
    prisma.source.findUnique.mockResolvedValue({ id: 1 });
    prisma.project.findFirst.mockResolvedValue(null);
    prisma.project.upsert.mockResolvedValue({ id: 99 });
    prisma.$queryRawUnsafe.mockResolvedValue([]);
    prisma.$executeRawUnsafe.mockResolvedValue(undefined);
  });

  it("sets needsReview to true for new projects", async () => {
    await upsertProject(
      { url: "https://example.com/project", title: "Test Project", institution: "Test" },
      "test-source"
    );

    expect(prisma.project.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ needsReview: true }),
      })
    );
  });

  it("sets estado to 'Abierto' in update and create", async () => {
    await upsertProject(
      { url: "https://example.com/project", title: "Test", institution: "Test" },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.update.estado).toBe("Abierto");
    expect(call.create.estado).toBe("Abierto");
  });

  it("persists quality gate fields for eligible national opportunities", async () => {
    await upsertProject(
      {
        url: "https://example.com/eligible",
        title: "Convocatoria de riego para Chile",
        institution: "INDAP",
        ambito: "Nacional",
      },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.publishable).toBe(true);
    expect(call.update.publishable).toBe(true);
    expect(call.create.chileEligibility).toBe("eligible");
    expect(call.update.chileEligibility).toBe("eligible");
    expect(Array.isArray(call.create.qualityFlags)).toBe(true);
    expect(call.create.qualityUpdatedAt).toBeInstanceOf(Date);
  });

  it("marks non-relevant international opportunities as not publishable", async () => {
    await upsertProject(
      {
        url: "https://example.com/tanzania",
        title: "Audio devices tender Tanzania",
        institution: "UNGM",
        description: "Public procurement for audio equipment in Tanzania.",
        ambito: "Internacional",
      },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.publishable).toBe(false);
    expect(call.update.publishable).toBe(false);
    expect(call.create.chileEligibility).toBe("ineligible");
    expect(call.update.chileEligibility).toBe("ineligible");
    expect(call.create.qualityFlags).toContain("chile_relevance_ineligible");
  });

  it("parses budget with parseAmount", async () => {
    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I", budget: "$10.000.000 CLP" },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.monto).toBe(10000000);
    expect(call.update.monto).toBe(10000000);
  });

  it("uses opportunityType as categoria when provided", async () => {
    await upsertProject(
      {
        url: "https://example.com/lic",
        title: "Licitacion de servicios",
        institution: "Test",
        opportunityType: "Licitacion",
      },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.categoria).toBe("Licitacion");
    expect(call.update.categoria).toBe("Licitacion");
  });

  it("defaults monto to 0 when budget is empty", async () => {
    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.monto).toBe(0);
    expect(call.update.monto).toBe(0);
  });

  it("uses sourceRefId for FK to Source model", async () => {
    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    expect(prisma.project.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ sourceRefId: 1 }),
      })
    );
  });

  it("includes required array fields in create", async () => {
    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    const createData = prisma.project.upsert.mock.calls[0][0].create;
    expect(createData.regiones).toEqual([]);
    expect(createData.beneficiarios).toEqual([]);
    expect(createData.checklist).toEqual([]);
    expect(createData.tipos_solicitante).toEqual([]);
    expect(createData.requisitos).toEqual([]);
    expect(createData.fortalezas).toEqual([]);
    expect(createData.debilidades).toEqual([]);
    expect(createData.qualityFlags).toEqual(expect.any(Array));
    expect(createData.qualityReasons).toEqual(expect.any(Array));
  });

  it("upserts by canonicalUrl with lastSeenAt", async () => {
    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.where).toHaveProperty("canonicalUrl");
    expect(call.update.lastSeenAt).toBeInstanceOf(Date);
    expect(call.create.lastSeenAt).toBeInstanceOf(Date);
  });

  it("normalizes mojibake in title before upsert", async () => {
    await upsertProject(
      { url: "https://example.com/moji", title: "DISE�AR Y EJECUTAR", institution: "FIA" },
      "test-source"
    );

    const call = prisma.project.upsert.mock.calls[0][0];
    expect(call.create.nombre).toBe("DISEÑAR Y EJECUTAR");
    expect(call.update.nombre).toBe("DISEÑAR Y EJECUTAR");
  });

  it("skips if source not found", async () => {
    prisma.source.findUnique.mockResolvedValue(null);

    const result = await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "nonexistent"
    );

    expect(result.skipped).toBe(true);
    expect(result.reason).toContain("no existe");
    expect(prisma.project.upsert).not.toHaveBeenCalled();
  });

  it("merges textual duplicates from same source instead of creating a new row", async () => {
    prisma.project.findFirst.mockResolvedValue({
      id: 555,
      qualityFlags: ['existing_flag'],
      qualityReasons: ['Existing reason'],
    });

    const result = await upsertProject(
      {
        url: "https://example.com/duplicated-url",
        canonicalKey: "https://example.com/duplicated-url-key",
        title: "Convocatoria de riego para Chile",
        institution: "INDAP",
        ambito: "Nacional",
      },
      "test-source"
    );

    expect(result.skipped).toBe(true);
    expect(String(result.reason)).toContain('duplicate_textual');
    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 555 } })
    );
    expect(prisma.project.upsert).not.toHaveBeenCalled();
  });

  it("continues upsert when semantic duplicate embedding lookup fails", async () => {
    const previousGemini = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";
    mockEmbedText.mockRejectedValueOnce(new Error("RESOURCE_EXHAUSTED"));

    try {
      await expect(
        upsertProject(
          {
            url: "https://example.com/semantic",
            title: "Convocatoria de riego para Chile",
            institution: "INDAP",
            ambito: "Nacional",
          },
          "test-source"
        )
      ).resolves.toEqual({});

      expect(prisma.project.upsert).toHaveBeenCalled();
    } finally {
      if (previousGemini === undefined) {
        delete process.env.GEMINI_API_KEY;
      } else {
        process.env.GEMINI_API_KEY = previousGemini;
      }
    }
  });
});

describe("updateSourceStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates source with status and count", async () => {
    prisma.source.update.mockResolvedValue({});

    await updateSourceStatus("test-slug", "success", 5);

    expect(prisma.source.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "test-slug" },
        data: expect.objectContaining({
          lastRunStatus: "success",
          projectsCount: 5,
        }),
      })
    );
  });
});

describe("markStale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.project.updateMany
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 1 });
    prisma.source.findMany.mockResolvedValue([{ id: 7, slug: "fia" }]);
  });

  it("excludes failing source slugs from lastSeen stale closure", async () => {
    await markStale({ skipSourceSlugs: ["fia"] });

    expect(prisma.source.findMany).toHaveBeenCalledWith({
      where: { slug: { in: ["fia"] } },
      select: { id: true, slug: true },
    });

    expect(prisma.project.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ sourceRefId: null }, { sourceRefId: { notIn: [7] } }],
        }),
      })
    );
  });

  it("marks stale projects without source exclusions by default", async () => {
    await markStale();

    expect(prisma.source.findMany).not.toHaveBeenCalled();
    expect(prisma.project.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.not.objectContaining({ OR: expect.anything() }),
      })
    );
  });

  it("also closes abiertas y próximas con past deadlines", async () => {
    await markStale();

    expect(prisma.project.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          fecha_cierre: expect.objectContaining({ lt: expect.any(Date) }),
          estadoPostulacion: { in: ["Abierta", "Próxima"] },
        }),
        data: { estadoPostulacion: "Cerrada" },
      })
    );
  });
});

describe("findSemanticDuplicates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns numeric ids aligned with Prisma schema", async () => {
    mockEmbedText.mockResolvedValue([0.1, 0.2]);
    prisma.$queryRawUnsafe.mockResolvedValue([
      { id: 42, nombre: "Proyecto A", canonicalUrl: "https://example.com/a" },
    ]);

    const { findSemanticDuplicates } = await import("../../../lib/ingestion/persistence");
    const rows = await findSemanticDuplicates("riego por goteo");

    expect(rows).toEqual([
      { id: 42, nombre: "Proyecto A", canonicalUrl: "https://example.com/a" },
    ]);
    expect(typeof rows[0].id).toBe("number");
  });
});
