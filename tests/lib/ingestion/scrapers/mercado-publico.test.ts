import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";

global.fetch = jest.fn();

describe("fetchMercadoPublicoLive", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("filtra por keywords agrícolas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Listado: [
          { CodigoExterno: "1", Nombre: "Asistencia técnica agrícola", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "2", Nombre: "Compra de computadores", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "3", Nombre: "Capacitación rural", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result.length).toBe(2);
    expect(result.find((p) => p.title.includes("computadores"))).toBeUndefined();
  });

  it("excluye categorías médicas (mamografía, ecografía, etc.)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Listado: [
          { CodigoExterno: "1", Nombre: "ADQUISICIÓN DE MAMOGRAFIAS BILATERALES", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "2", Nombre: "Programa rural agroforestal", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("t", "");
    expect(result.length).toBe(1);
    expect(result[0].title).not.toContain("MAMOGRAF");
  });

  it("devuelve [] si la API falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result).toEqual([]);
  });

  it("devuelve [] si ticket vacío", async () => {
    const result = await fetchMercadoPublicoLive("", "cualquier query");
    expect(result).toEqual([]);
  });

  it("incluye query custom en keywords", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Listado: [
          { CodigoExterno: "1", Nombre: "Servicio de drones para zumbar", FechaCierre: "2026-12-31T00:00:00" },
          { CodigoExterno: "2", Nombre: "Evento de música pop", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("t", "drones");
    expect(result.length).toBe(1);
    expect(result[0].title).toContain("drones");
  });
});
