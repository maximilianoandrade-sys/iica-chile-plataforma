/**
 * @jest-environment node
 */
import { fiaLicitacionesScraper } from "../../../../lib/ingestion/scrapers/fia-licitaciones";

global.fetch = jest.fn() as jest.Mock;

describe("fiaLicitacionesScraper", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("parsea licitaciones FIA desde feed de MercadoPublico", async () => {
    const html = `
      <table>
        <table>
          <tr>
            <td>
              <a class="Link" href="#">Id: 1147293-5-LE26 Nombre: DISEÑAR Y EJECUTAR DOS EVENTOS PARA EL PROGRAMA AG</a>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Fecha">Fecha de cierre: </span>
              <span class="Fecha">lunes, 1 de junio de 2026 17:00:00</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Descripcion">Comprador: Fundación para la Innovación Agraria - Área de servicios generales y Adquisiciones</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Descripcion">Descripcion: Objetivo de la Adquisición: Diseñar y Ejecutar dos eventos.</span>
            </td>
          </tr>
        </table>
      </table>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await fiaLicitacionesScraper.scrape();

    expect(result.sourceSlug).toBe("fia-licitaciones");
    expect(result.projects).toHaveLength(1);
    expect(result.partialErrors).toHaveLength(0);
    expect(result.projects[0].institution).toBe("FIA");
    expect(result.projects[0].opportunityType).toBe("Licitacion");
    expect(result.projects[0].url).toContain("1147293-5-LE26");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
  });

  it("setea canonicalKey con la URL de detalle", async () => {
    const html = `
      <table>
        <table>
          <tr>
            <td>
              <a class="Link" href="#">Id: 1147293-5-LE26 Nombre: TEST</a>
            </td>
          </tr>
        </table>
      </table>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await fiaLicitacionesScraper.scrape();
    expect(result.projects[0].canonicalKey).toBe(result.projects[0].url);
  });

  it("reporta partialErrors si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });

    const result = await fiaLicitacionesScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });
});
