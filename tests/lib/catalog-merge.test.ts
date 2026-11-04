import {
  getCatalogIdentity,
  getCatalogRouteKey,
  mergeCatalogProjects,
  normalizeCatalogUrl,
} from "@/lib/catalog-merge";

const project = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  nombre: "Fondo de Riego",
  institucion: "CNR",
  fecha_cierre: "2026-12-31",
  url_bases: "https://example.com/fondo",
  objetivo: undefined as string | undefined,
  ...overrides,
});

describe("catalog merge", () => {
  it("keeps DB-only and static-only projects and gives DB precedence", () => {
    const result = mergeCatalogProjects(
      [project({ id: 2, nombre: "Solo BD", url_bases: "https://db.example/2" })],
      [project({ objetivo: "Detalle estático" }), project({ id: 3, nombre: "Solo JSON", url_bases: "https://json.example/3" })],
    );

    expect(result).toHaveLength(3);
    expect(result.find((item) => item.id === 1)?.objetivo).toBe("Detalle estático");
  });

  it("does not merge distinct opportunities with the same numeric id", () => {
    const result = mergeCatalogProjects(
      [project({ id: 7, nombre: "Convocatoria BD", url_bases: "https://db.example/7" })],
      [project({ id: 7, nombre: "Convocatoria JSON", url_bases: "https://json.example/7" })],
    );

    expect(result).toHaveLength(2);
    expect(getCatalogRouteKey(result[0])).not.toBe(getCatalogRouteKey(result[1]));
  });

  it("normalizes tracking parameters and trailing slashes", () => {
    expect(normalizeCatalogUrl("HTTPS://Example.com/fondo/?utm_source=iica#top"))
      .toBe("https://example.com/fondo");
    expect(getCatalogRouteKey(project())).toMatch(/^p-1-/);
    expect(getCatalogRouteKey(project())).not.toContain("%");
    expect(getCatalogIdentity(project({ canonicalUrl: "https://example.com/fondo" })))
      .toBe("url:https://example.com/fondo");
  });

  it("merges records when stable identity signals overlap", () => {
    const result = mergeCatalogProjects(
      [project({ id: 2, canonicalUrl: null, objetivo: "BD" })],
      [project({ canonicalUrl: "https://example.com/fondo", objetivo: "JSON" })],
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
    expect(result[0].objetivo).toBe("BD");
  });

  it("coalesces multiple records connected by different identity signals", () => {
    const result = mergeCatalogProjects(
      [
        project({ id: 2, canonicalUrl: "https://example.com/fondo", sourceId: null }),
        project({ id: 3, url_bases: "https://other.example/fondo", sourceId: "cnr:fondo-1" }),
      ],
      [
        project({
          id: 4,
          canonicalUrl: "https://example.com/fondo",
          url_bases: "https://other.example/fondo",
          sourceId: "cnr:fondo-1",
        }),
      ],
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("keeps source-specific calls apart when a listing URL is shared", () => {
    const result = mergeCatalogProjects(
      [project({ id: 2, sourceId: "cnr:24-2026" })],
      [project({ id: 3, sourceId: "cnr:25-2026" })],
    );

    expect(result).toHaveLength(2);
  });
});
