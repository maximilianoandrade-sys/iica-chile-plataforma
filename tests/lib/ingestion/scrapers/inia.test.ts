/**
 * @jest-environment node
 */
import { iniaScraper, parseIniaDate } from "../../../../lib/ingestion/scrapers/inia";

global.fetch = jest.fn() as jest.Mock;

describe("parseIniaDate", () => {
  it("parsea '25 de febrero 2026'", () => {
    const d = parseIniaDate("25 de febrero 2026");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2026);
    expect(d!.getUTCMonth()).toBe(1); // febrero = 1
    expect(d!.getUTCDate()).toBe(25);
  });

  it("parsea '07 de marzo de 2026'", () => {
    const d = parseIniaDate("07 de marzo de 2026");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCMonth()).toBe(2); // marzo = 2
  });

  it("retorna null para texto inválido", () => {
    expect(parseIniaDate("Adjudicada")).toBeNull();
    expect(parseIniaDate("")).toBeNull();
  });
});

describe("iniaScraper", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("parsea licitaciones abiertas desde tabla INIA", async () => {
    const html = `
      <html><body>
        <table>
          <tbody>
            <tr>
              <td>ID 10-1440-26 ADQUISICIÓN DE EQUIPOS LABORATORIO AGRÍCOLA</td>
              <td>01 de junio de 2026</td>
              <td>30 de junio de 2026</td>
              <td>Abierta</td>
              <td><a href="https://www.inia.cl/licitaciones/bases-10-1440-26.pdf">Bases</a></td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await iniaScraper.scrape();

    expect(result.sourceSlug).toBe("inia");
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].institution).toBe("INIA");
    expect(result.projects[0].opportunityType).toBe("Licitacion");
    expect(result.projects[0].title).toContain("[INIA Licitación]");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
    expect(result.projects[0].url).toContain("inia.cl");
  });

  it("omite licitaciones adjudicadas o desiertas", async () => {
    const html = `
      <html><body>
        <table>
          <tbody>
            <tr>
              <td>ID 01-1433-26 GIFTCARD BENEFICIO FUNCIONARIOS</td>
              <td>25 de febrero 2026</td>
              <td>07 de marzo 2026</td>
              <td>Adjudicada</td>
              <td></td>
            </tr>
            <tr>
              <td>ID 01-1434-26 MEZCLAS Y FERTILIZANTES 2026</td>
              <td>18 de febrero 2026</td>
              <td>23 de febrero 2026</td>
              <td>Desierta</td>
              <td></td>
            </tr>
            <tr>
              <td>ID 01-1441-26 SERVICIO DE ANÁLISIS DE SUELOS</td>
              <td>10 de junio de 2026</td>
              <td>30 de julio de 2026</td>
              <td>Abierta</td>
              <td><a href="https://www.inia.cl/licitaciones/bases-1441.pdf">Bases</a></td>
            </tr>
          </tbody>
        </table>
      </body></html>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await iniaScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toContain("ANÁLISIS DE SUELOS");
  });

  it("usa canonicalKey basado en ID de licitación", async () => {
    const html = `
      <html><body>
        <table><tbody>
          <tr>
            <td>ID 02-1450-26 CONSULTORIA TÉCNICA</td>
            <td>01 de julio de 2026</td>
            <td>31 de julio de 2026</td>
            <td>Abierta</td>
            <td></td>
          </tr>
        </tbody></table>
      </body></html>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await iniaScraper.scrape();
    expect(result.projects[0].canonicalKey).toContain("inia-ID-02-1450-26");
  });

  it("retorna vacío sin partialErrors si no hay licitaciones abiertas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html><body><table><tbody></tbody></table></body></html>"),
    });

    const result = await iniaScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reporta partialErrors si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    const result = await iniaScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 500");
  });
});
