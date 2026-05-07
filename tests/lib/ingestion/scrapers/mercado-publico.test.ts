import { fetchMercadoPublicoLive } from "../../../../lib/ingestion/scrapers/mercado-publico";

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
          { CodigoExterno: "3", Nombre: "Capacitación rural campesinos", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result.length).toBe(2);
    expect(result.find((p) => p.title.includes("computadores"))).toBeUndefined();
  });

  it("excluye keywords no relevantes", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Listado: [
          { CodigoExterno: "4", Nombre: "Construcción agrícola de galpones", FechaCierre: "2026-12-31T00:00:00" },
        ],
      }),
    });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result.length).toBe(0);
  });

  it("devuelve [] si la API falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    const result = await fetchMercadoPublicoLive("ticket-test", "");
    expect(result).toEqual([]);
  });

  it("devuelve [] sin ticket", async () => {
    const result = await fetchMercadoPublicoLive("", "");
    expect(result).toEqual([]);
  });
});
