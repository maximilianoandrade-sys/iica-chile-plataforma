/**
 * @jest-environment node
 */

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: "## Resumen Ejecutivo\nPropuesta generada por IA.",
      }),
    },
  })),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findUnique: jest.fn(),
    },
  },
}));

import { POST, GET } from "@/app/api/generate-proposal/route";
import prisma from "@/lib/prisma";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/generate-proposal", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const MOCK_PROJECT = {
  id: 1,
  nombre: "Fondo Riego CNR",
  institucion: "CNR",
  objetivo: "Mejorar riego",
  descripcionIICA: null,
  categoria: "Nacional",
  ambito: "Nacional",
  monto: 5000000,
  region: "Atacama",
  fecha_cierre: "2026-06-30",
};

describe("/api/generate-proposal", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: "test-key" };
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(MOCK_PROJECT);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it("GET returns route description", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.route).toBe("/api/generate-proposal");
  });

  it("POST with valid projectId returns proposal", async () => {
    const res = await POST(makeRequest({ projectId: 1 }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.proposal).toContain("Resumen Ejecutivo");
    expect(json.data.projectName).toBe("Fondo Riego CNR");
    expect(json.data.generatedAt).toBeDefined();
  });

  it("POST with missing projectId returns 400", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("POST with non-existent projectId returns 404", async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({ projectId: 999 }));
    expect(res.status).toBe(404);
  });

  it("POST without GEMINI_API_KEY returns 503", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await POST(makeRequest({ projectId: 1 }));
    expect(res.status).toBe(503);
  });
});
