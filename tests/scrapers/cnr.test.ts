/**
 * @jest-environment node
 */
import { cnrScraper } from "@/lib/ingestion/scrapers/cnr";

// Sample HTML mimicking the CNR calendario page
const makeCnrHtml = (rows: string) => `
<html><body><table>
<tr><th>Código</th><th>Concurso</th><th>Monto</th><th>Regiones</th><th>Apertura</th><th>Pub. Bases</th><th>Cierre</th></tr>
${rows}
</table></body></html>
`;

const VALID_ROW = `
<tr>
  <td>01-2026</td>
  <td><a href="https://ley18450.cnr.gob.cl/concurso/?concurso=01-2026">Primer concurso obras menores</a></td>
  <td>8.500</td>
  <td>Arica Antofagasta Atacama</td>
  <td>07-01-2026</td>
  <td>01-01-2020</td>
  <td>11-02-2026</td>
</tr>
`;

const FUTURE_ROW = `
<tr>
  <td>02-2030</td>
  <td><a href="https://ley18450.cnr.gob.cl/concurso/?concurso=02-2030">Segundo concurso futuro</a></td>
  <td>5.000</td>
  <td>Valparaíso</td>
  <td>01-06-2030</td>
  <td>01-06-2030</td>
  <td>30-06-2030</td>
</tr>
`;

function mockFetchOk(html: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(html),
  });
}

function mockFetchFail(status = 500) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve(""),
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("cnrScraper", () => {
  it("parses a valid row correctly", async () => {
    mockFetchOk(makeCnrHtml(VALID_ROW));

    const result = await cnrScraper.scrape();

    expect(result.sourceSlug).toBe("cnr");
    expect(result.projects).toHaveLength(1);

    const p = result.projects[0];
    expect(p.title).toContain("01-2026");
    expect(p.title).toContain("Primer concurso obras menores");
    expect(p.institution).toBe("Comisión Nacional de Riego (CNR)");
    expect(p.url).toContain("ley18450.cnr.gob.cl");
    expect(p.deadline).toBeInstanceOf(Date);
    expect(p.budget).toBe("8.500 UF");
    expect(p.tags).toContain("CNR");
  });

  it("uses homepage URL when bases are still future", async () => {
    mockFetchOk(makeCnrHtml(FUTURE_ROW));

    const result = await cnrScraper.scrape();

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].url).toBe(cnrScraper.homepageUrl);
  });

  it("returns partialErrors on HTTP failure", async () => {
    mockFetchFail(503);

    const result = await cnrScraper.scrape();

    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors.length).toBeGreaterThan(0);
  });

  it("handles empty HTML gracefully", async () => {
    mockFetchOk("<html><body></body></html>");

    const result = await cnrScraper.scrape();

    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toContain(
      "No matching <tr> with ley18450 link found — CNR may have changed structure"
    );
  });

  it("skips rows without ley18450 link", async () => {
    const noLinkRow = `<tr><td>X</td><td>No link here</td><td>100</td><td>RM</td><td>01-01-2026</td><td>01-01-2026</td><td>01-02-2026</td></tr>`;
    mockFetchOk(makeCnrHtml(noLinkRow));

    const result = await cnrScraper.scrape();

    expect(result.projects).toHaveLength(0);
  });
});
