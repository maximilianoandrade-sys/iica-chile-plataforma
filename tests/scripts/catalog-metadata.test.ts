import { buildCatalogMetadata } from "@/lib/catalog-metadata";

describe("buildCatalogMetadata", () => {
  it("counts only publishable Chile-relevant opportunities in active states", () => {
    const metadata = buildCatalogMetadata(
      [
        { estadoPostulacion: "Abierta" },
        { estado: "Próximo", fecha_cierre: "2099-12-31" },
        { estadoPostulacion: "Cerrada" },
        { estadoPostulacion: "Abierta", publishable: false },
        { estadoPostulacion: "Abierta", relevanciaChile: false },
      ],
      "2026-11-04T12:00:00.000Z",
    );

    expect(metadata).toEqual({
      lastUpdatedAt: "2026-11-04T12:00:00.000Z",
      totalProjects: 5,
      activeProjects: 2,
    });
  });
});
