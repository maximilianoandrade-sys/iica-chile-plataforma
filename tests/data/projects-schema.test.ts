/**
 * @jest-environment node
 */
import projects from "../../data/projects.json";

describe("projects.json schema validation", () => {
  it("has at least 50 projects", () => {
    expect(projects.length).toBeGreaterThanOrEqual(50);
  });

  const requiredFields = ["id", "nombre", "institucion", "monto", "fecha_cierre", "estado", "categoria", "url_bases"];

  it("all projects have required fields", () => {
    for (const p of projects) {
      for (const field of requiredFields) {
        expect((p as any)[field]).toBeDefined();
      }
    }
  });

  it("all projects have unique ids", () => {
    const ids = (projects as any[]).map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all sourceIds are unique when present", () => {
    const sourceIds = (projects as any[]).map((p) => p.sourceId).filter(Boolean);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
  });

  it("all url_bases are valid URLs", () => {
    for (const p of projects) {
      expect((p as any).url_bases).toMatch(/^https?:\/\//);
    }
  });

  it("all fecha_cierre are valid YYYY-MM-DD dates", () => {
    for (const p of projects) {
      expect((p as any).fecha_cierre).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("no project has negative monto", () => {
    for (const p of projects) {
      expect((p as any).monto).toBeGreaterThanOrEqual(0);
    }
  });

  it("all estados are valid values", () => {
    const validEstados = ["Abierto", "Cerrado", "Próximo", "Permanente"];
    for (const p of projects) {
      expect(validEstados).toContain((p as any).estado);
    }
  });
});
