/**
 * @jest-environment node
 */
import { minagriFeedScraper } from "../../../../lib/ingestion/scrapers/minagri-licitaciones";

global.fetch = jest.fn() as jest.Mock;

describe("minagriFeedScraper", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("parsea licitaciones MINAGRI desde feed MercadoPublico", async () => {
    const html = `
      <table>
        <table>
          <tr>
            <td>
              <a class="Link" href="#">Id: 1234567-8-LE26 Nombre: SERVICIO DE CONSULTORIA TÉCNICA MINAGRI</a>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Fecha">Fecha de cierre: </span>
              <span class="Fecha">lunes, 30 de junio de 2026 17:00:00</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Descripcion">Comprador: Subsecretaría de Agricultura</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="Descripcion">Descripcion: Servicio de asistencia técnica para agricultores.</span>
            </td>
          </tr>
        </table>
      </table>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await minagriFeedScraper.scrape();

    expect(result.sourceSlug).toBe("minagri-licitaciones");
    expect(result.projects).toHaveLength(1);
    expect(result.partialErrors).toHaveLength(0);
    expect(result.projects[0].institution).toBe("MINAGRI");
    expect(result.projects[0].opportunityType).toBe("Licitacion");
    expect(result.projects[0].url).toContain("1234567-8-LE26");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
  });

  it("usa selector fallback cuando a.Link no existe", async () => {
    const html = `
      <div>
        <a href="#">Id: 9876543-1-LP26 Nombre: ASESORÍA TÉCNICA SECTOR SILVOAGROPECUARIO</a>
      </div>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await minagriFeedScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].url).toContain("9876543-1-LP26");
  });

  it("canonicalKey coincide con URL de detalle", async () => {
    const html = `
      <table><table><tr><td>
        <a class="Link" href="#">Id: 1111111-1-LE26 Nombre: TEST MINAGRI</a>
      </td></tr></table></table>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await minagriFeedScraper.scrape();
    expect(result.projects[0].canonicalKey).toBe(result.projects[0].url);
  });

  it("retorna vacío sin partialErrors si el feed está legítimamente vacío", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html><body><p>Sin licitaciones activas</p></body></html>"),
    });

    const result = await minagriFeedScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reporta partialErrors si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });

    const result = await minagriFeedScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });
});
