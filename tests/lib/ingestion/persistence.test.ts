/**
 * @jest-environment node
 */

// Mock prisma before importing persistence
jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    source: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock validateUrl to always return ok
jest.mock("../../../lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn().mockResolvedValue({ ok: true }),
}));

import { upsertProject, updateSourceStatus } from "../../../lib/ingestion/persistence";
const prisma = require("../../../lib/prisma").default;

describe("upsertProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.source.findUnique.mockResolvedValue({ id: 1 });
  });

  it("sets needsReview to true for new projects", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/project", title: "Test Project", institution: "Test" },
      "test-source"
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ needsReview: true }),
      })
    );
  });

  it("sets estado to 'Abierto' for new projects", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/project", title: "Test", institution: "Test" },
      "test-source"
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: "Abierto" }),
      })
    );
  });

  it("parses budget with parseAmount", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I", budget: "$10.000.000 CLP" },
      "test-source"
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monto: 10000000 }),
      })
    );
  });

  it("defaults monto to 0 when budget is empty", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monto: 0 }),
      })
    );
  });

  it("uses sourceRefId for FK to Source model", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sourceRefId: 1 }),
      })
    );
  });

  it("includes required array fields", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    prisma.project.create.mockResolvedValue({ id: 99 });

    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    const createData = prisma.project.create.mock.calls[0][0].data;
    expect(createData.regiones).toEqual([]);
    expect(createData.beneficiarios).toEqual([]);
    expect(createData.checklist).toEqual([]);
    expect(createData.tipos_solicitante).toEqual([]);
    expect(createData.requisitos).toEqual([]);
    expect(createData.fortalezas).toEqual([]);
    expect(createData.debilidades).toEqual([]);
  });

  it("updates lastSeenAt for existing projects", async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 42, canonicalUrl: "https://example.com/x" });
    prisma.project.update.mockResolvedValue({ id: 42 });

    await upsertProject(
      { url: "https://example.com/x", title: "T", institution: "I" },
      "test-source"
    );

    expect(prisma.project.update).toHaveBeenCalled();
    expect(prisma.project.create).not.toHaveBeenCalled();
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
